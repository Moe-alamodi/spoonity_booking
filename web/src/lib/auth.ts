import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

const GOOGLE_ALLOWED_DOMAIN = process.env.GOOGLE_ALLOWED_DOMAIN || "spoonity.com";

export const authOptions: NextAuthOptions = {
  // No adapter needed for JWT strategy
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/calendar.settings.readonly",
            "https://www.googleapis.com/auth/admin.directory.user.readonly",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      // Restrict domain
      const hd = (profile as Record<string, unknown> | null | undefined)?.hd as string | undefined;
      if (hd && hd.toLowerCase() !== GOOGLE_ALLOWED_DOMAIN) return false;
      // Some Google profiles may not include hd when account is not a Workspace user
      if (!hd && (profile as Record<string, unknown> | null | undefined)?.email) {
        const email = (profile as { email?: string }).email as string;
        const domain = email.split("@")[1]?.toLowerCase();
        if (domain !== GOOGLE_ALLOWED_DOMAIN) return false;
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      // Debug logging
      console.log("JWT callback - account:", account ? {
        provider: account.provider,
        type: account.type,
        hasAccessToken: !!account.access_token,
        hasRefreshToken: !!account.refresh_token,
        expiresAt: account.expires_at,
        scope: account.scope
      } : "No account");
      
      // Persist the OAuth access_token and refresh_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at;
        console.log("JWT callback - stored tokens:", {
          hasAccessToken: !!token.accessToken,
          hasRefreshToken: !!token.refreshToken,
          expiresAt: token.accessTokenExpires
        });
      }
      return token;
    },
    async session({ session, token }) {
      // Debug logging
      console.log("Session callback - token:", {
        hasAccessToken: !!token.accessToken,
        hasRefreshToken: !!token.refreshToken,
        expiresAt: token.accessTokenExpires
      });
      
      // Send properties to the client
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.accessTokenExpires = token.accessTokenExpires;
      
      console.log("Session callback - final session:", {
        user: session.user?.email,
        hasAccessToken: !!session.accessToken,
        hasRefreshToken: !!session.refreshToken,
        expiresAt: session.accessTokenExpires
      });
      
      return session;
    },
  },
};

