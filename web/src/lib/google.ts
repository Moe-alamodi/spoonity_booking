import { google } from "googleapis";

export function getGoogleAuthClient(accessToken?: string, refreshToken?: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL
  );
  if (accessToken) {
    (oauth2Client as any).credentials = {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  return oauth2Client;
}

export function calendar(auth: any) {
  return google.calendar({ version: "v3", auth });
}
