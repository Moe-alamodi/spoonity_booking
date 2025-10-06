import { NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({ q: z.string().min(1) });

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  try {
    querySchema.parse({ q });
    // TODO: implement Google Admin Directory search using stored super admin token
    return NextResponse.json({ users: [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
