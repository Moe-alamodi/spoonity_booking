# Gumloop Webhook Integration

## 🔗 Webhook Endpoint

**URL:** `https://your-domain.com/api/webhooks/gumloop`

**Method:** `POST`

**Content-Type:** `application/json`

## 📋 Webhook Events

### 1. Workflow Completed
```json
{
  "event": "workflow_completed",
  "timestamp": "2025-10-07T15:30:00.000Z",
  "workflowId": "wf_123456",
  "workflowName": "Meeting Preparation Automation",
  "status": "success",
  "data": {
    "meetingId": "meeting_123",
    "organizerEmail": "mohammed@spoonity.com",
    "preparationDocUrl": "https://docs.google.com/document/d/123",
    "tasksCreated": 3,
    "emailsSent": 2
  }
}
```

### 2. Workflow Failed
```json
{
  "event": "workflow_failed",
  "timestamp": "2025-10-07T15:30:00.000Z",
  "workflowId": "wf_123456",
  "workflowName": "Meeting Preparation Automation",
  "status": "error",
  "message": "Failed to create Google Doc",
  "data": {
    "meetingId": "meeting_123",
    "error": "Google API quota exceeded"
  }
}
```

### 3. Meeting Preparation Ready
```json
{
  "event": "meeting_preparation_ready",
  "timestamp": "2025-10-07T15:30:00.000Z",
  "workflowId": "wf_789012",
  "workflowName": "AI Meeting Brief Generator",
  "data": {
    "meetingId": "meeting_123",
    "organizerEmail": "mohammed@spoonity.com",
    "participantEmail": "client@example.com",
    "briefUrl": "https://docs.google.com/document/d/456",
    "agendaGenerated": true,
    "participantResearch": {
      "company": "Example Corp",
      "role": "CTO",
      "linkedinUrl": "https://linkedin.com/in/example"
    }
  }
}
```

### 4. Follow-up Scheduled
```json
{
  "event": "follow_up_scheduled",
  "timestamp": "2025-10-07T15:30:00.000Z",
  "workflowId": "wf_345678",
  "workflowName": "Follow-up Meeting Scheduler",
  "data": {
    "originalMeetingId": "meeting_123",
    "followUpMeetingId": "meeting_124",
    "scheduledFor": "2025-10-14T15:30:00.000Z",
    "organizerEmail": "mohammed@spoonity.com",
    "participantEmail": "client@example.com"
  }
}
```

### 5. CRM Updated
```json
{
  "event": "crm_updated",
  "timestamp": "2025-10-07T15:30:00.000Z",
  "workflowId": "wf_901234",
  "workflowName": "Salesforce Integration",
  "data": {
    "contactId": "contact_123",
    "meetingId": "meeting_123",
    "updates": {
      "lastMeetingDate": "2025-10-07T15:30:00.000Z",
      "meetingOutcome": "positive",
      "nextSteps": "Follow up in 1 week",
      "leadScore": 85
    }
  }
}
```

## 🧪 Testing

### Test Endpoint
**URL:** `https://your-domain.com/api/test/gumloop-webhook`

**Method:** `POST`

**Body:**
```json
{
  "webhookUrl": "https://your-domain.com/api/webhooks/gumloop",
  "testEvent": "workflow_completed"
}
```

### Available Test Events
- `workflow_completed`
- `workflow_failed`
- `meeting_preparation_ready`
- `follow_up_scheduled`
- `crm_updated`

## 🔧 Setup Instructions

### 1. In Gumloop
1. Create a new workflow
2. Add a "Webhook" trigger node
3. Set the webhook URL to: `https://your-domain.com/api/webhooks/gumloop`
4. Configure the webhook to send the appropriate event data

### 2. In Your Spoonity App
1. The webhook endpoint is already created at `/api/webhooks/gumloop`
2. Test the endpoint using the test URL above
3. Monitor logs for incoming webhook events

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Webhook received successfully",
  "event": "workflow_completed",
  "timestamp": "2025-10-07T15:30:00.000Z"
}
```

### Error Response
```json
{
  "error": "Invalid webhook data format",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["event"]
    }
  ]
}
```

## 🔍 Monitoring

The webhook endpoint includes comprehensive logging:
- `🔗 Received Gumloop webhook:` - Shows incoming data
- `✅ Workflow completed:` - Confirms successful processing
- `❌ Workflow failed:` - Shows error details
- `📋 Meeting preparation ready:` - Shows preparation status
- `📅 Follow-up scheduled:` - Shows follow-up details
- `💼 CRM updated:` - Shows CRM update status

## 🚀 Next Steps

1. **Deploy your app** with the webhook endpoint
2. **Test the webhook** using the test endpoint
3. **Create Gumloop workflows** that send data to your webhook
4. **Monitor the logs** to ensure webhooks are being received
5. **Build custom logic** in the webhook handlers for your specific needs

## 💡 Customization

You can extend the webhook handlers in `/api/webhooks/gumloop/route.ts` to:
- Update your database with workflow results
- Send notifications to your team
- Trigger additional automations
- Log analytics data
- Sync data between systems
