import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { webhookUrl, testData } = body;
    
    if (!webhookUrl) {
      return NextResponse.json({ error: "Webhook URL is required" }, { status: 400 });
    }
    
    // Sample test payload matching Gumloop's expected format
    const testPayload = testData || {
      organizer_email: 'mohammed@spoonity.com',
      participant_name: 'John Smith',
      participant_email: 'john.smith@company.com',
      meeting_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      meeting_duration_minutes: '30',
      meeting_title: 'Test Meeting with John Smith',
      meeting_timezone: 'Asia/Riyadh',
      meet_link: 'https://meet.google.com/test-link',
      event_link: 'https://calendar.google.com/test-event',
      event_id: 'test-event-123'
    };
    
    console.log('🧪 Testing Gumloop webhook:', webhookUrl);
    console.log('📤 Sending payload:', testPayload);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Spoonity-Test/1.0'
      },
      body: JSON.stringify(testPayload)
    });
    
    const responseText = await response.text();
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: responseText,
      webhookUrl,
      payload: testPayload
    });
    
  } catch (error) {
    console.error('❌ Test webhook error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 });
  }
}
