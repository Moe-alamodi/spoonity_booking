import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Copy the Google refresh token from the user's Account into AdminDirectoryAuth.
  // Note: This assumes the signed-in user is a super admin and has granted the Directory scope.
  const account = await prisma.account.findFirst({
    where: { user: { email: session.user.email }, provider: "google" },
  });
  if (!account?.refresh_token) {
    return NextResponse.json({ error: "No refresh token found. Re-consent with Google." }, { status: 400 });
  }
  await prisma.adminDirectoryAuth.upsert({
    where: { adminEmail: session.user.email },
    create: {
      adminEmail: session.user.email,
      refreshToken: account.refresh_token,
    },
    update: {
      refreshToken: account.refresh_token,
    },
  });
  return NextResponse.json({ ok: true });
}
