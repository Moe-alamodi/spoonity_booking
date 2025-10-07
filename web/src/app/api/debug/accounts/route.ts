import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Get all accounts with user info
    const accounts = await db.account.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Format the data for easier reading
    const formattedAccounts = accounts.map(account => ({
      id: account.id,
      provider: account.provider,
      userEmail: account.user.email,
      userName: account.user.name,
      hasAccessToken: !!account.access_token,
      hasRefreshToken: !!account.refresh_token,
      expiresAt: account.expires_at,
      scope: account.scope,
    }));

    return NextResponse.json({
      totalAccounts: accounts.length,
      accounts: formattedAccounts,
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
