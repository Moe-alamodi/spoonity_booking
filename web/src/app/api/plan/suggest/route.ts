import { NextResponse } from "next/server";
import { z } from "zod";
import { suggestMinimal } from "@/lib/suggest/engine";
import { scoringConfig } from "@/lib/scoring/config";
import { getCurrentUserAuthClient, getUserAuthClient } from "@/lib/auth-service";
import { getUserTimezone, calculateBusinessHoursWindow } from "@/lib/google";

const schema = z.object({
  organizerEmail: z.string().email(),
  participantEmail: z.string().email(),
  durationMinutes: z.number().int().min(15).default(30),
  stepMinutes: z.number().int().min(5).default(30),
  windowDays: z.number().int().min(1).max(28).default(7),
  minNoticeHours: z.number().int().min(0).default(2),
  fallbackStartHour: z.number().int().min(0).max(23).default(8),
  fallbackEndHour: z.number().int().min(1).max(24).default(17),
  excludeWeekends: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const params = schema.parse(body);
    
    // Try to get authentication for both users
    let organizerAuth;
    let participantAuth;
    
    // For the organizer, try to use current user's JWT tokens first
    try {
      organizerAuth = await getCurrentUserAuthClient();
      console.log(`Using current user auth for organizer`);
    } catch (error) {
      console.warn(`No current user auth found, trying database lookup for organizer ${params.organizerEmail}:`, error);
      try {
        organizerAuth = await getUserAuthClient(params.organizerEmail);
      } catch (dbError) {
        console.warn(`No auth found for organizer ${params.organizerEmail}:`, dbError);
      }
    }
    
    // For participant, try database lookup (they might not be signed in)
    try {
      participantAuth = await getUserAuthClient(params.participantEmail);
    } catch (error) {
      console.warn(`No auth found for participant ${params.participantEmail}:`, error);
    }
    
    // Get user timezones dynamically
    let organizerTz = "UTC"; // Default fallback
    let participantTz = "UTC"; // Default fallback
    
    // Get organizer's timezone from their Google Calendar
    if (organizerAuth) {
      try {
        console.log(`🔍 Getting timezone for organizer: ${params.organizerEmail}`);
        organizerTz = await getUserTimezone(organizerAuth, params.organizerEmail);
        console.log(`✅ Organizer timezone set to: ${organizerTz}`);
        
        // Manual override for mohammed@spoonity.com to use Saudi Arabia timezone
        if (params.organizerEmail === 'mohammed@spoonity.com') {
          organizerTz = 'Asia/Riyadh';
          console.log(`🔄 Overriding timezone to Asia/Riyadh for mohammed@spoonity.com`);
        }
      } catch (error) {
        console.warn(`❌ Could not get timezone for organizer ${params.organizerEmail}:`, error);
      }
    } else {
      console.log(`⚠️ No organizer auth available for timezone detection`);
    }
    
    // Get participant's timezone from their Google Calendar (if they have auth)
    if (participantAuth) {
      try {
        participantTz = await getUserTimezone(participantAuth, params.participantEmail);
      } catch (error) {
        console.warn(`Could not get timezone for participant ${params.participantEmail}:`, error);
      }
    }
    
    // Calculate business hours window in organizer's timezone
    const businessHours = calculateBusinessHoursWindow(
      organizerTz,
      params.fallbackStartHour,
      params.fallbackEndHour,
      params.windowDays
    );
    
    console.log("Suggestion request:", {
      organizerEmail: params.organizerEmail,
      participantEmail: params.participantEmail,
      organizerTz,
      participantTz,
      windowStart: businessHours.windowStart.toISOString(),
      windowEnd: businessHours.windowEnd.toISOString(),
      businessHours: `${businessHours.businessStartHour}:00 - ${businessHours.businessEndHour}:00`,
    });
    
    const suggestions = await suggestMinimal({
      organizerTz,
      participantTz,
      windowStart: businessHours.windowStart,
      windowEnd: businessHours.windowEnd,
      durationMinutes: params.durationMinutes,
      stepMinutes: params.stepMinutes,
      fallbackStartHour: businessHours.businessStartHour,
      fallbackEndHour: businessHours.businessEndHour,
      excludeWeekends: params.excludeWeekends,
      minNoticeHours: params.minNoticeHours,
      organizerEmail: params.organizerEmail,
      participantEmail: params.participantEmail,
      organizerAuth,
      participantAuth,
    }).then(suggestions => suggestions.map((s) => ({ 
      start: s.startUtc, 
      end: s.endUtc, 
      score: Math.round(s.score),
      provisional: s.provisional 
    })));

    return NextResponse.json({ suggestions, scoring: scoringConfig });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

