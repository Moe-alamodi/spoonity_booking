import { addMinutes, differenceInMinutes, isAfter, isBefore } from "date-fns";
import { scoringConfig } from "@/lib/scoring/config";

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
};

export type Suggestion = {
  startUtc: string;
  endUtc: string;
  score: number;
  provisional: boolean;
};

export function suggestMinimal(params: SuggestParams): Suggestion[] {
  const { windowStart, windowEnd, durationMinutes, stepMinutes } = params;
  const suggestions: Suggestion[] = [];

  const now = new Date();
  for (let t = new Date(windowStart); isBefore(t, windowEnd); t = addMinutes(t, stepMinutes)) {
    const end = addMinutes(t, durationMinutes);
    if (isBefore(end, windowStart) || isAfter(t, windowEnd)) continue;
    if (differenceInMinutes(t, now) < params.minNoticeHours * 60) continue;

    // Hard filters: weekend & holidays skipped at higher layers (TODO)
    if (params.excludeWeekends) {
      const day = t.getUTCDay();
      if (day === 0 || day === 6) continue;
    }

    // Simple score placeholder (all provisional)
    const base = scoringConfig.scoring.aggregation.maxScore;
    const score = base - (differenceInMinutes(t, now) / (60 * 24)) * Math.abs(scoringConfig.scoring.weights.earlierIsBetterPenaltyPerDay);
    suggestions.push({ startUtc: t.toISOString(), endUtc: end.toISOString(), score, provisional: true });
  }

  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, scoringConfig.scoring.slot.defaultTopSuggestions);
}

