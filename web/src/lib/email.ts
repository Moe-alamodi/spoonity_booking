import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

export async function sendAuthInviteEmail(toEmail: string, authLink: string) {
  if (!apiKey) throw new Error("SENDGRID_API_KEY not configured");
  const fromName = process.env.SEND_FROM_NAME || "Spoonity Meeting Planner";
  const fromEmail = process.env.SEND_FROM_EMAIL || "mohammed+meetings@spoonity.com";
  const from = { name: fromName, email: fromEmail };

  const msg = {
    to: toEmail,
    from,
    subject: "Authorize your calendar",
    text: `Please authorize your Google Calendar to enable availability checks. Link: ${authLink}`,
    html: `<p>Please authorize your Google Calendar to enable availability checks.</p><p><a href="${authLink}">Authorize now</a></p>`
  } as sgMail.MailDataRequired;

  await sgMail.send(msg);
}

