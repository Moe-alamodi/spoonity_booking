import { addMinutes, differenceInMinutes, isAfter, isBefore, setHours, setMinutes, getHours, getMinutes, isWeekend, startOfDay } from "date-fns";
import { scoringConfig } from "@/lib/scoring/config";
import { getBusyTimes, getUserTimezone } from "@/lib/google";
import type { OAuth2Client } from "google-auth-library";

export type SuggestParams = {
  organizerTz: string;
  participantTz: string;
  windowStart: Date;
  windowEnd: Date;
  durationMinutes: number;
  stepMinutes: number;
  // Working hours fallback (local to each person)
  fallbackStartHour: number; // 8
  fallbackEndHour: number;   // 17
  excludeWeekends: boolean;
  minNoticeHours: number; // 2
  // Google Calendar integration
  organizerEmail?: string;
  participantEmail?: string;
  organizerAuth?: OAuth2Client;
  participantAuth?: OAuth2Client;
};

export type Suggestion = {
  startUtc: string;
  endUtc: string;
  score: number;
  provisional: boolean;
};

export async function suggestMinimal(params: SuggestParams): Promise<Suggestion[]> {
  const { windowStart, windowEnd, durationMinutes, stepMinutes, fallbackStartHour, fallbackEndHour } = params;
  const suggestions: Suggestion[] = [];
  const now = new Date();

  // Try to get real calendar data if auth is available
  let busyTimes: Record<string, any> = {};
  let organizerTz = params.organizerTz;
  let participantTz = params.participantTz;
  let hasRealData = false;

  if (params.organizerAuth && params.organizerEmail) {
    try {
      // Get organizer's timezone
      organizerTz = await getUserTimezone(params.organizerAuth, params.organizerEmail);
      
      // Get busy times for organizer
      const emails = [params.organizerEmail];
      if (params.participantEmail && params.participantAuth) {
        emails.push(params.participantEmail);
        participantTz = await getUserTimezone(params.participantAuth, params.participantEmail);
      }
      
      busyTimes = await getBusyTimes(params.organizerAuth, emails, windowStart, windowEnd);
      hasRealData = true;
    } catch (error) {
      console.warn("Failed to fetch calendar data, using fallback:", error);
    }
  }

  // Generate time slots within working hours
  // Start from today and go through the window
  const today = startOfDay(now);
  
  console.log("Generating suggestions:", {
    now: now.toISOString(),
    today: today.toISOString(),
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    fallbackStartHour,
    fallbackEndHour,
    minNoticeHours: params.minNoticeHours,
  });
  
  for (let dayOffset = 0; dayOffset < Math.ceil((windowEnd.getTime() - windowStart.getTime()) / (24 * 60 * 60 * 1000)); dayOffset++) {
    const day = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    
    // Skip weekends if requested
    if (params.excludeWeekends && isWeekend(day)) continue;
    
    // Skip if day is before window start
    if (isBefore(day, windowStart)) continue;
    
    // Skip if day is after window end
    if (isAfter(day, windowEnd)) continue;

    // Generate slots for this day within working hours
    const dayStart = setMinutes(setHours(day, fallbackStartHour), 0);
    const dayEnd = setMinutes(setHours(day, fallbackEndHour), 0);

    for (let slot = new Date(dayStart); isBefore(slot, dayEnd); slot = addMinutes(slot, stepMinutes)) {
      const slotEnd = addMinutes(slot, durationMinutes);
      
      // Skip if slot extends beyond working hours
      if (isAfter(slotEnd, dayEnd)) continue;
      
      // Skip if slot is too soon (min notice)
      if (differenceInMinutes(slot, now) < params.minNoticeHours * 60) continue;

      // Check for conflicts with real calendar data
      let hasConflict = false;
      if (hasRealData) {
        hasConflict = checkForConflicts(slot, slotEnd, busyTimes);
      }

      // Calculate score based on multiple factors
      let score = scoringConfig.scoring.aggregation.maxScore;
      
      // Heavy penalty for conflicts
      if (hasConflict) {
        score += scoringConfig.scoring.weights.busyOverlapPenaltyPerMinute * durationMinutes;
      }
      
      // Penalty for being far in the future (earlier is better)
      const daysFromNow = differenceInMinutes(slot, now) / (60 * 24);
      score += daysFromNow * scoringConfig.scoring.weights.earlierIsBetterPenaltyPerDay;
      
      // Bonus for being closer to middle of working hours
      const slotHour = getHours(slot);
      const workingHoursMidpoint = (fallbackStartHour + fallbackEndHour) / 2;
      const distanceFromMidpoint = Math.abs(slotHour - workingHoursMidpoint);
      score += distanceFromMidpoint * scoringConfig.scoring.weights.distanceFromHoursMidpointPenaltyPerHour;
      
      // Bonus for being in the morning (preferred)
      if (slotHour < 12) {
        score += 10;
      }
      
      // Ensure minimum score
      score = Math.max(score, scoringConfig.scoring.aggregation.minScoreToSuggest);

      suggestions.push({
        startUtc: slot.toISOString(),
        endUtc: slotEnd.toISOString(),
        score: Math.round(score),
        provisional: !hasRealData // Only provisional if we don't have real data
      });
    }
  }

  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, scoringConfig.scoring.slot.defaultTopSuggestions);
}

function checkForConflicts(slotStart: Date, slotEnd: Date, busyTimes: Record<string, any>): boolean {
  for (const email in busyTimes) {
    const busy = busyTimes[email]?.busy || [];
    
    for (const busyPeriod of busy) {
      const busyStart = new Date(busyPeriod.start);
      const busyEnd = new Date(busyPeriod.end);
      
      // Check if there's any overlap
      if (slotStart < busyEnd && slotEnd > busyStart) {
        return true;
      }
    }
  }
  
  return false;
}

