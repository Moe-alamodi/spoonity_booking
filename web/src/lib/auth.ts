import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/lib/prisma";

const GOOGLE_ALLOWED_DOMAIN = process.env.GOOGLE_ALLOWED_DOMAIN || "spoonity.com";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
      const hd = (profile as any)?.hd as string | undefined;
      if (hd && hd.toLowerCase() !== GOOGLE_ALLOWED_DOMAIN) return false;
      // Some Google profiles may not include hd when account is not a Workspace user
      if (!hd && (profile as any)?.email) {
        const email = (profile as any).email as string;
        const domain = email.split("@")[1]?.toLowerCase();
        if (domain !== GOOGLE_ALLOWED_DOMAIN) return false;
      }
      return true;
    },
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.provider = account.provider;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).provider = (token as any).provider;
      return session;
    },
  },
};
