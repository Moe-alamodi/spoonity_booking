import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for incoming webhook data from Gumloop
const gumloopWebhookSchema = z.object({
  event: z.string(),
  timestamp: z.string().optional(),
  workflowId: z.string().optional(),
  workflowName: z.string().optional(),
  data: z.record(z.any()).optional(),
  status: z.enum(['success', 'error', 'in_progress']).optional(),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('🔗 Received Gumloop webhook:', body);
    
    // Basic validation - check if required fields exist
    if (!body.event) {
      return NextResponse.json({ 
        error: 'Missing required field: event' 
      }, { status: 400 });
    }
    
    // Handle different types of events from Gumloop
    switch (body.event) {
      case 'workflow_completed':
        await handleWorkflowCompleted(body);
        break;
      case 'workflow_failed':
        await handleWorkflowFailed(body);
        break;
      case 'meeting_preparation_ready':
        await handleMeetingPreparationReady(body);
        break;
      case 'follow_up_scheduled':
        await handleFollowUpScheduled(body);
        break;
      case 'crm_updated':
        await handleCrmUpdated(body);
        break;
      default:
        console.log(`ℹ️ Unknown event type: ${body.event}`);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received successfully',
      event: body.event,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error processing Gumloop webhook:', error);
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Handle workflow completion events
async function handleWorkflowCompleted(data: any) {
  console.log('✅ Workflow completed:', {
    workflowId: data.workflowId,
    workflowName: data.workflowName,
    data: data.data
  });
  
  // You can add custom logic here, such as:
  // - Updating database records
  // - Sending notifications
  // - Triggering other workflows
  // - Logging analytics
}

// Handle workflow failure events
async function handleWorkflowFailed(data: any) {
  console.error('❌ Workflow failed:', {
    workflowId: data.workflowId,
    workflowName: data.workflowName,
    error: data.message,
    data: data.data
  });
  
  // You can add error handling logic here, such as:
  // - Sending alerts to administrators
  // - Retrying failed operations
  // - Logging errors for debugging
}

// Handle meeting preparation completion
async function handleMeetingPreparationReady(data: any) {
  console.log('📋 Meeting preparation ready:', data.data);
  
  // Example: Send preparation email to organizer
  // Example: Update meeting record with preparation status
  // Example: Create calendar reminder
}

// Handle follow-up scheduling
async function handleFollowUpScheduled(data: any) {
  console.log('📅 Follow-up scheduled:', data.data);
  
  // Example: Create follow-up meeting in calendar
  // Example: Set reminder for follow-up
  // Example: Update CRM with follow-up status
}

// Handle CRM updates
async function handleCrmUpdated(data: any) {
  console.log('💼 CRM updated:', data.data);
  
  // Example: Sync CRM data back to your system
  // Example: Update contact information
  // Example: Track meeting outcomes
}

// GET endpoint for webhook verification (optional)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const challenge = url.searchParams.get('challenge');
  
  if (challenge) {
    // Gumloop webhook verification
    return NextResponse.json({ challenge });
  }
  
  return NextResponse.json({ 
    message: 'Spoonity Gumloop Webhook Endpoint',
    status: 'active',
    timestamp: new Date().toISOString()
  });
}
