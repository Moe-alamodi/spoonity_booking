import { db } from "@/lib/db";
import { getGoogleAuthClient, refreshAccessToken } from "@/lib/google";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getUserAuthClient(userEmail: string) {
  // Get user's account from database
  const account = await db.account.findFirst({
    where: {
      user: {
        email: userEmail,
      },
      provider: "google",
    },
  });

  console.log(`Looking for auth for user: ${userEmail}`);
  console.log(`Found account:`, account ? {
    id: account.id,
    hasAccessToken: !!account.access_token,
    hasRefreshToken: !!account.refresh_token,
    expiresAt: account.expires_at,
    scope: account.scope,
  } : 'No account found');

  if (!account?.access_token) {
    throw new Error(`No Google access token found for user: ${userEmail}`);
  }

  // Check if token is expired and refresh if needed
  const now = Math.floor(Date.now() / 1000);
  if (account.expires_at && account.expires_at <= now && account.refresh_token) {
    console.log(`Token expired for ${userEmail}, refreshing...`);
    
    try {
      const refreshedTokens = await refreshAccessToken(account.refresh_token);
      
      // Update the account with new tokens
      await db.account.update({
        where: { id: account.id },
        data: {
          access_token: refreshedTokens.access_token,
          expires_at: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
        },
      });
      
      console.log(`Successfully refreshed token for ${userEmail}`);
      
      // Use the new access token
      const authClient = getGoogleAuthClient(refreshedTokens.access_token, account.refresh_token);
      return authClient;
      
    } catch (error) {
      console.error(`Failed to refresh token for ${userEmail}:`, error);
      throw new Error(`Failed to refresh expired token for user: ${userEmail}`);
    }
  }

  const authClient = getGoogleAuthClient(account.access_token, account.refresh_token);
  
  return authClient;
}

export async function getCurrentUserAuthClient() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error("No authenticated user found");
  }

  // For JWT strategy, we need to get tokens from the session
  if (session.accessToken) {
    console.log(`Using JWT tokens for ${session.user.email}`);
    return getGoogleAuthClient(session.accessToken, session.refreshToken);
  }

  // Fallback to database lookup
  return getUserAuthClient(session.user.email);
}

