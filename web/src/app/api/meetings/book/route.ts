import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserAuthClient, getUserAuthClient } from "@/lib/auth-service";
import { calendar, getUserTimezone } from "@/lib/google";
import { addMinutes } from "date-fns";

const schema = z.object({
  title: z.string().optional(),
  organizerEmail: z.string().email(),
  participantEmail: z.string().email(),
  start: z.string(), // ISO
  durationMinutes: z.number().int().min(15).default(30),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const params = schema.parse(body);
    
    // Get organizer's auth client - try JWT tokens first, fallback to database
    let organizerAuth;
    try {
      organizerAuth = await getCurrentUserAuthClient();
      console.log(`Using current user auth for booking organizer`);
    } catch (error) {
      console.warn(`No current user auth found, trying database lookup for organizer ${params.organizerEmail}:`, error);
      organizerAuth = await getUserAuthClient(params.organizerEmail);
    }
    
    // Get organizer's timezone for the event
    let organizerTimezone = "UTC"; // Default fallback
    try {
      organizerTimezone = await getUserTimezone(organizerAuth, params.organizerEmail);
      console.log(`📅 Using timezone ${organizerTimezone} for booking`);
      
      // Manual override for mohammed@spoonity.com to use Saudi Arabia timezone
      if (params.organizerEmail === 'mohammed@spoonity.com') {
        organizerTimezone = 'Asia/Riyadh';
        console.log(`🔄 Overriding booking timezone to Asia/Riyadh for mohammed@spoonity.com`);
      }
    } catch (error) {
      console.warn(`Could not get timezone for organizer, using UTC:`, error);
    }
    
    const calendarService = calendar(organizerAuth);
    
    const startTime = new Date(params.start);
    const endTime = addMinutes(startTime, params.durationMinutes);
    
    // Create the meeting event
    const event = {
      summary: params.title || `Meeting: ${params.organizerEmail} + ${params.participantEmail.split('@')[0]}`,
      description: "Scheduled via Spoonity Meeting Planner",
      start: {
        dateTime: startTime.toISOString(),
        timeZone: organizerTimezone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: organizerTimezone,
      },
      attendees: [
        { email: params.organizerEmail },
        { email: params.participantEmail },
      ],
      conferenceData: {
        createRequest: {
          requestId: `meeting-${Date.now()}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 }, // 1 day before
          { method: "popup", minutes: 10 }, // 10 minutes before
        ],
      },
    };
    
    // Insert the event
    const response = await calendarService.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1, // Enable Meet link generation
    });
    
    const createdEvent = response.data;
    
    // Send webhook to Gumloop for automation
    if (process.env.GUMLOOP_WEBHOOK_URL) {
      try {
        const gumloopPayload = {
          organizer_email: params.organizerEmail,
          participant_name: params.participantEmail.split('@')[0], // Extract name from email
          participant_email: params.participantEmail,
          meeting_time: startTime.toISOString(),
          meeting_duration_minutes: params.durationMinutes.toString(),
          meeting_title: params.title || `Meeting: ${params.organizerEmail} + ${params.participantEmail.split('@')[0]}`,
          meeting_timezone: organizerTimezone,
          meet_link: createdEvent.conferenceData?.entryPoints?.[0]?.uri,
          event_link: createdEvent.htmlLink,
          event_id: createdEvent.id
        };
        
        console.log('🚀 Sending webhook to Gumloop:', gumloopPayload);
        
        const webhookResponse = await fetch(process.env.GUMLOOP_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Spoonity-Booking/1.0'
          },
          body: JSON.stringify(gumloopPayload)
        });
        
        if (webhookResponse.ok) {
          console.log('✅ Gumloop webhook sent successfully');
        } else {
          console.warn('⚠️ Gumloop webhook failed:', webhookResponse.status, webhookResponse.statusText);
        }
      } catch (error) {
        console.error('❌ Error sending Gumloop webhook:', error);
        // Don't fail the booking if webhook fails
      }
    } else {
      console.log('ℹ️ No Gumloop webhook URL configured');
    }
    
    return NextResponse.json({ 
      success: true,
      eventId: createdEvent.id,
      meetLink: createdEvent.conferenceData?.entryPoints?.[0]?.uri,
      eventLink: createdEvent.htmlLink,
      gumloopWebhookSent: !!process.env.GUMLOOP_WEBHOOK_URL
    });
    
  } catch (err) {
    console.error("Error booking meeting:", err);
    const message = err instanceof Error ? err.message : "Failed to book meeting";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

