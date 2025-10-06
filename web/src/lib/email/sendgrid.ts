import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

export async function sendAuthInviteEmail(params: {
  to: string;
  fromName?: string;
  fromEmail?: string;
  signInUrl: string;
}) {
  const fromName = params.fromName ?? process.env.SEND_FROM_NAME ?? "Spoonity Meeting Planner";
  const fromEmail = params.fromEmail ?? process.env.SEND_FROM_EMAIL ?? "mohammed+meetings@spoonity.com";

  const html = `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5;">
    <h1 style="margin:0 0 16px;">Authorize your calendar</h1>
    <p style="margin:0 0 16px;">Please click the button below to sign in with Google and authorize access to your calendar for meeting suggestions.</p>
    <p style="margin:24px 0;">
      <a href="${params.signInUrl}" style="background:#000;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">Authorize with Google</a>
    </p>
    <p style="color:#666;margin-top:24px;font-size:12px;">Scheduled via Spoonity Meeting Planner</p>
  </div>`;

  const msg = {
    to: params.to,
    from: { name: fromName, email: fromEmail },
    subject: "Authorize Google Calendar access",
    html,
  } as sgMail.MailDataRequired;

  if (!apiKey) {
    // In development or missing API key, no-op
    return { skipped: true } as const;
  }

  await sgMail.send(msg);
  return { ok: true } as const;
}
