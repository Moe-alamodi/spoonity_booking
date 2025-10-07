import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserAuthClient } from "@/lib/auth-service";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Check what's in the database
    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        accounts: true,
      },
    });

    const debugInfo = {
      session: {
        user: session.user,
        expires: session.expires,
        accessToken: session.accessToken ? `${session.accessToken.substring(0, 20)}...` : null,
        refreshToken: session.refreshToken ? `${session.refreshToken.substring(0, 20)}...` : null,
        accessTokenExpires: session.accessTokenExpires,
        hasAccessToken: !!session.accessToken,
        hasRefreshToken: !!session.refreshToken,
      },
      database: {
        user: user ? {
          id: user.id,
          email: user.email,
          accounts: user.accounts.map(acc => ({
            id: acc.id,
            provider: acc.provider,
            hasAccessToken: !!acc.access_token,
            hasRefreshToken: !!acc.refresh_token,
            expiresAt: acc.expires_at,
            scope: acc.scope,
          })),
        } : null,
      },
    };

    // Try to get auth client
    let authClient = null;
    try {
      authClient = await getUserAuthClient(session.user.email);
      debugInfo.authClient = "Successfully created";
    } catch (error) {
      debugInfo.authClient = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
