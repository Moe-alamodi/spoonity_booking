import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  title: z.string().optional(),
  organizerEmail: z.string().email(),
  participantEmail: z.string().email(),
  start: z.string(), // ISO
  durationMinutes: z.number().int().min(15).default(30),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const params = schema.parse(body);
    // TODO: implement Google Calendar insert with Meet link using organizer's credentials
    return NextResponse.json({ ok: false, error: "Not implemented yet" }, { status: 501 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Invalid request" }, { status: 400 });
  }
}
