import { NextRequest } from "next/server";

export async function POST(_req: NextRequest) {
  // TODO: Start OAuth for super admin to grant Directory.readonly.
  return new Response(
    JSON.stringify({ ok: true, next: "/api/auth/signin?provider=google" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
