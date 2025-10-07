# Gumloop Integration Guide

## 🚀 Quick Setup

### 1. Environment Variables
Add this to your `.env.local` file:
```bash
GUMLOOP_WEBHOOK_URL="https://your-gumloop-webhook-url.com/webhook/spoonity-meetings"
```

### 2. Webhook Payload Structure
When a meeting is booked, Spoonity sends this data to Gumloop:

```json
{
  "organizer_email": "mohammed@spoonity.com",
  "participant_name": "John Smith",
  "participant_email": "john.smith@company.com",
  "meeting_time": "2025-10-08T08:00:00.000Z",
  "meeting_duration_minutes": "30",
  "meeting_title": "Meeting: mohammed@spoonity.com + John Smith",
  "meeting_timezone": "Asia/Riyadh",
  "meet_link": "https://meet.google.com/abc-def-ghi",
  "event_link": "https://calendar.google.com/event?eid=...",
  "event_id": "google-calendar-event-id"
}
```

## 🔧 Gumloop Workflow Examples

### Example 1: Simple Notification
```
Webhook Trigger → 
  Send Slack Message → 
  Send Email Notification
```

### Example 2: Meeting Preparation
```
Webhook Trigger → 
  Research Participants (Apollo) → 
  Generate AI Meeting Brief → 
  Create Google Doc → 
  Send Preparation Email
```

### Example 3: CRM Integration
```
Webhook Trigger → 
  Lookup Contact (Salesforce) → 
  Create Meeting Task → 
  Update Opportunity Stage → 
  Notify Sales Manager
```

## 🎯 Next Steps

1. **Sign up for Gumloop** at https://www.gumloop.com/
2. **Create a webhook trigger** in your Gumloop workflow
3. **Add the webhook URL** to your environment variables
4. **Test the integration** by booking a meeting
5. **Build your automation workflows**

## 📊 Available Data Fields

- `organizer_email`: Meeting organizer's email address
- `participant_name`: Participant's name (extracted from email)
- `participant_email`: Meeting participant's email address
- `meeting_time`: Meeting start time (ISO string)
- `meeting_duration_minutes`: Meeting duration in minutes (string)
- `meeting_title`: Meeting title
- `meeting_timezone`: Meeting timezone
- `meet_link`: Google Meet link (if available)
- `event_link`: Google Calendar event link
- `event_id`: Google Calendar event ID
