import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { webhookUrl, testEvent } = body;
    
    if (!webhookUrl) {
      return NextResponse.json({ error: "Webhook URL is required" }, { status: 400 });
    }
    
    // Test payloads for different Gumloop events
    const testPayloads = {
      workflow_completed: {
        event: 'workflow_completed',
        timestamp: new Date().toISOString(),
        workflowId: 'wf_123456',
        workflowName: 'Meeting Preparation Automation',
        status: 'success',
        data: {
          meetingId: 'meeting_123',
          organizerEmail: 'mohammed@spoonity.com',
          preparationDocUrl: 'https://docs.google.com/document/d/123',
          tasksCreated: 3,
          emailsSent: 2
        }
      },
      workflow_failed: {
        event: 'workflow_failed',
        timestamp: new Date().toISOString(),
        workflowId: 'wf_123456',
        workflowName: 'Meeting Preparation Automation',
        status: 'error',
        message: 'Failed to create Google Doc',
        data: {
          meetingId: 'meeting_123',
          error: 'Google API quota exceeded'
        }
      },
      meeting_preparation_ready: {
        event: 'meeting_preparation_ready',
        timestamp: new Date().toISOString(),
        workflowId: 'wf_789012',
        workflowName: 'AI Meeting Brief Generator',
        data: {
          meetingId: 'meeting_123',
          organizerEmail: 'mohammed@spoonity.com',
          participantEmail: 'client@example.com',
          briefUrl: 'https://docs.google.com/document/d/456',
          agendaGenerated: true,
          participantResearch: {
            company: 'Example Corp',
            role: 'CTO',
            linkedinUrl: 'https://linkedin.com/in/example'
          }
        }
      },
      follow_up_scheduled: {
        event: 'follow_up_scheduled',
        timestamp: new Date().toISOString(),
        workflowId: 'wf_345678',
        workflowName: 'Follow-up Meeting Scheduler',
        data: {
          originalMeetingId: 'meeting_123',
          followUpMeetingId: 'meeting_124',
          scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
          organizerEmail: 'mohammed@spoonity.com',
          participantEmail: 'client@example.com'
        }
      },
      crm_updated: {
        event: 'crm_updated',
        timestamp: new Date().toISOString(),
        workflowId: 'wf_901234',
        workflowName: 'Salesforce Integration',
        data: {
          contactId: 'contact_123',
          meetingId: 'meeting_123',
          updates: {
            lastMeetingDate: new Date().toISOString(),
            meetingOutcome: 'positive',
            nextSteps: 'Follow up in 1 week',
            leadScore: 85
          }
        }
      }
    };
    
    const payload = testPayloads[testEvent as keyof typeof testPayloads] || testPayloads.workflow_completed;
    
    console.log('🧪 Testing Gumloop webhook:', webhookUrl);
    console.log('📤 Sending test payload:', payload);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Spoonity-Test/1.0',
        'X-Gumloop-Source': 'spoonity-test'
      },
      body: JSON.stringify(payload)
    });
    
    const responseText = await response.text();
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: responseText,
      webhookUrl,
      testEvent,
      payload
    });
    
  } catch (error) {
    console.error('❌ Test webhook error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Gumloop Webhook Test Endpoint',
    usage: 'POST with { webhookUrl: "your-webhook-url", testEvent: "workflow_completed" }',
    availableEvents: [
      'workflow_completed',
      'workflow_failed', 
      'meeting_preparation_ready',
      'follow_up_scheduled',
      'crm_updated'
    ]
  });
}
