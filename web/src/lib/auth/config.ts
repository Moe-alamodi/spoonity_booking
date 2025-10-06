import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { db } from "@/src/lib/db";

const allowedDomain = process.env.GOOGLE_ALLOWED_DOMAIN;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
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
          ].join(" "),
        },
      },
      checks: ["none"],
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!allowedDomain) return true;
      const email = (profile?.email as string | undefined) ?? "";
      return email.endsWith("@" + allowedDomain);
    },
  },
};
