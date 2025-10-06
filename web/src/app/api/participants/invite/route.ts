import { NextResponse } from "next/server";
import { z } from "zod";
import { sendAuthInviteEmail } from "@/lib/email";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { email } = bodySchema.parse(json);
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const authLink = `${baseUrl}/participant/authorize`;
    await sendAuthInviteEmail(email, authLink);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to send invite" },
      { status: 400 }
    );
  }
}
