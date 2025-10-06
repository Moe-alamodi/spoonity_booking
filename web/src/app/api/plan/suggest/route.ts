import { NextResponse } from "next/server";
import { z } from "zod";
import { addMinutes, isBefore, setHours, setMinutes, startOfDay, addDays, isWeekend } from "date-fns";

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
    const now = new Date();
    const earliest = addMinutes(now, params.minNoticeHours * 60);

    const suggestions: { start: string; end: string; score: number }[] = [];
    // Minimal placeholder: iterate next N days within working hours, step by stepMinutes
    outer: for (let dayOffset = 0; dayOffset < params.windowDays; dayOffset++) {
      const day = addDays(startOfDay(now), dayOffset);
      if (params.excludeWeekends && isWeekend(day)) continue;
      let slot = setMinutes(setHours(day, params.fallbackStartHour), 0);
      const dayEnd = setMinutes(setHours(day, params.fallbackEndHour), 0);
      while (!isBefore(dayEnd, addMinutes(slot, params.durationMinutes))) {
        if (isBefore(earliest, slot)) {
          // naive score: earlier is better
          const score = Math.max(20, 100 - dayOffset * 5);
          suggestions.push({ start: slot.toISOString(), end: addMinutes(slot, params.durationMinutes).toISOString(), score });
          if (suggestions.length >= 5) break outer;
        }
        slot = addMinutes(slot, params.stepMinutes);
      }
    }

    return NextResponse.json({ suggestions });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid request" }, { status: 400 });
  }
}
