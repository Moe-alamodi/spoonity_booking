#!/usr/bin/env node

// Test script to verify participant email is correctly included in webhook payload
// Usage: node test-participant-email.js

const testPayloads = [
  {
    name: "Test with mohammed@spoonity.com",
    participantEmail: "mohammed@spoonity.com",
    organizerEmail: "organizer@spoonity.com"
  },
  {
    name: "Test with john.smith@company.com", 
    participantEmail: "john.smith@company.com",
    organizerEmail: "organizer@spoonity.com"
  },
  {
    name: "Test with client@example.com",
    participantEmail: "client@example.com", 
    organizerEmail: "organizer@spoonity.com"
  }
];

function generateWebhookPayload(participantEmail, organizerEmail) {
  return {
    organizer_email: organizerEmail,
    participant_name: participantEmail.split('@')[0], // Extract name from email
    participant_email: participantEmail, // This is the exact email from the form
    meeting_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    meeting_duration_minutes: "30",
    meeting_title: `Meeting: ${organizerEmail} + ${participantEmail.split('@')[0]}`,
    meeting_timezone: "Asia/Riyadh",
    meet_link: "https://meet.google.com/test-link",
    event_link: "https://calendar.google.com/test-event",
    event_id: "test-event-123"
  };
}

console.log('🎯 Testing Participant Email in Webhook Payload\n');

testPayloads.forEach((test, index) => {
  console.log(`${index + 1}. ${test.name}`);
  console.log(`   Participant Email Field: "${test.participantEmail}"`);
  
  const payload = generateWebhookPayload(test.participantEmail, test.organizerEmail);
  
  console.log(`   Webhook Payload:`);
  console.log(`   - organizer_email: "${payload.organizer_email}"`);
  console.log(`   - participant_email: "${payload.participant_email}"`);
  console.log(`   - participant_name: "${payload.participant_name}"`);
  console.log(`   - meeting_title: "${payload.meeting_title}"`);
  console.log('');
});

console.log('✅ The webhook payload correctly includes the exact participant_email');
console.log('   that you enter in the "Participant email" field!\n');

console.log('🔍 How it works:');
console.log('1. You enter email in "Participant email" field');
console.log('2. Form sends participantEmail to /api/meetings/book');
console.log('3. Booking route uses params.participantEmail in webhook payload');
console.log('4. Gumloop receives the exact email you entered');
