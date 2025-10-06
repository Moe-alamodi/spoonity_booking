import { sendAuthInviteEmail as sendViaSendgrid } from "@/lib/email/sendgrid";

export async function sendAuthInviteEmail(to: string, signInUrl: string) {
  return sendViaSendgrid({ to, signInUrl });
}

