#!/usr/bin/env node

// Test script to send meeting data to Gumloop webhook
// Usage: node test-gumloop-webhook.js <webhook-url>

const webhookUrl = process.argv[2] || 'http://localhost:3001/api/webhooks/gumloop';

console.log('🎯 Testing Spoonity webhook endpoint for Gumloop integration');

// Test payload for the webhook endpoint (data FROM Gumloop TO Spoonity)
const testPayload = {
  event: 'workflow_completed',
  timestamp: new Date().toISOString(),
  workflowId: 'wf_123456',
  workflowName: 'Meeting Preparation Automation',
  status: 'success',
  data: {
    meetingId: 'test-event-123',
    organizerEmail: 'mohammed@spoonity.com',
    preparationDocUrl: 'https://docs.google.com/document/d/123',
    tasksCreated: 3,
    emailsSent: 2
  }
};

async function testWebhook() {
  try {
    console.log('🧪 Testing Gumloop webhook...');
    console.log('📤 Webhook URL:', webhookUrl);
    console.log('📋 Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Spoonity-Test/1.0'
      },
      body: JSON.stringify(testPayload)
    });
    
    const responseText = await response.text();
    
    console.log('\n📊 Response:');
    console.log('Status:', response.status, response.statusText);
    console.log('Body:', responseText);
    
    if (response.ok) {
      console.log('\n✅ Webhook test successful!');
    } else {
      console.log('\n❌ Webhook test failed!');
    }
    
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
  }
}

testWebhook();
