import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

export function getGoogleAuthClient(accessToken?: string, refreshToken?: string): OAuth2Client {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL
  );
  
  if (accessToken) {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }
  
  return oauth2Client;
}

// Helper function to refresh expired tokens
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in: number;
  token_type: string;
}> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL
  );
  
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });
  
  const { credentials } = await oauth2Client.refreshAccessToken();
  
  return {
    access_token: credentials.access_token!,
    expires_in: credentials.expiry_date ? Math.floor((credentials.expiry_date - Date.now()) / 1000) : 3600,
    token_type: credentials.token_type || 'Bearer',
  };
}

export function calendar(auth: OAuth2Client) {
  return google.calendar({ version: "v3", auth });
}

export function adminDirectory(auth: OAuth2Client) {
  return google.admin({ version: "directory_v1", auth });
}

// Helper function to get user's calendar busy times
export async function getBusyTimes(
  auth: OAuth2Client,
  emails: string[],
  timeMin: Date,
  timeMax: Date
) {
  const calendar = google.calendar({ version: "v3", auth });
  
  try {
    console.log(`Fetching busy times for emails: ${emails.join(', ')}`);
    console.log(`Time range: ${timeMin.toISOString()} to ${timeMax.toISOString()}`);
    
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: emails.map(email => ({ id: email })),
      },
    });
    
    console.log(`Freebusy response:`, response.data);
    
    // Log detailed busy times for each calendar
    if (response.data.calendars) {
      Object.entries(response.data.calendars).forEach(([email, calendarData]) => {
        console.log(`📅 Calendar ${email}:`, {
          busy: calendarData.busy || [],
          busyCount: calendarData.busy?.length || 0,
          busyDetails: calendarData.busy?.map(busy => ({
            start: busy.start,
            end: busy.end,
            duration: new Date(busy.end || 0).getTime() - new Date(busy.start || 0).getTime()
          })) || []
        });
      });
    }
    
    return response.data.calendars || {};
  } catch (error) {
    console.error("Error fetching busy times:", error);
    throw error;
  }
}

// Helper function to get user's timezone
export async function getUserTimezone(auth: OAuth2Client, email: string) {
  const calendar = google.calendar({ version: "v3", auth });
  
  try {
    console.log(`🔍 Fetching timezone for ${email}...`);
    const response = await calendar.settings.get({
      setting: "timezone",
    });
    
    const timezone = response.data.value || "UTC";
    console.log(`🌍 User ${email} timezone:`, timezone);
    return timezone;
  } catch (error) {
    console.error(`❌ Error fetching timezone for ${email}:`, error);
    console.log(`🔄 Falling back to UTC for ${email}`);
    return "UTC"; // Fallback to UTC
  }
}

// Helper function to calculate business hours window in user's timezone
export function calculateBusinessHoursWindow(
  timezone: string,
  startHour: number = 8,
  endHour: number = 17,
  windowDays: number = 7
) {
  const now = new Date();
  
  // Create a date in the user's timezone
  const userDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  
  // Set to start of day in user's timezone
  const windowStart = new Date(userDate);
  windowStart.setHours(0, 0, 0, 0);
  
  // Calculate window end
  const windowEnd = new Date(windowStart);
  windowEnd.setDate(windowEnd.getDate() + windowDays);
  
  console.log(`🕐 Business hours calculation for ${timezone}:`, {
    userDate: userDate.toISOString(),
    windowStart: windowStart.toISOString(),
    windowEnd: windowEnd.toISOString(),
    businessHours: `${startHour}:00 - ${endHour}:00`,
    timezone: timezone
  });
  
  return {
    windowStart,
    windowEnd,
    businessStartHour: startHour,
    businessEndHour: endHour,
    timezone
  };
}

