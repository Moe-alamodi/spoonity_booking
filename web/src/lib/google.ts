import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

export function getGoogleAuthClient(accessToken?: string, refreshToken?: string): OAuth2Client {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL
  );
  if (accessToken) {
    (oauth2Client as OAuth2Client).credentials = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  return oauth2Client;
}

export function calendar(auth: OAuth2Client) {
  return google.calendar({ version: "v3", auth });
}
