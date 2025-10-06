import { NextResponse } from "next/server";
import { z } from "zod";
import { addMinutes, isBefore, setHours, setMinutes, startOfDay, addDays, isWeekend } from "date-fns";
import { suggestMinimal } from "@/lib/suggest/engine";
import { scoringConfig } from "@/lib/scoring/config";

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

    const windowStart = addDays(startOfDay(now), 0);
    const windowEnd = addDays(startOfDay(now), params.windowDays);
    const suggestions = suggestMinimal({
      organizerTz: "UTC",
      participantTz: "UTC",
      windowStart,
      windowEnd,
      durationMinutes: params.durationMinutes,
      stepMinutes: params.stepMinutes,
      fallbackStartHour: params.fallbackStartHour,
      fallbackEndHour: params.fallbackEndHour,
      excludeWeekends: params.excludeWeekends,
      minNoticeHours: params.minNoticeHours,
    }).map((s) => ({ start: s.startUtc, end: s.endUtc, score: Math.round(s.score) }));

    return NextResponse.json({ suggestions, scoring: scoringConfig });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
