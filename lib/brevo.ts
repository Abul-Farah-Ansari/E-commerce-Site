
import "server-only";
import { BrevoClient } from "@getbrevo/brevo";

const apiKey = process.env.BREVO_API_KEY;
const fromEmail = process.env.BREVO_FROM_EMAIL;
const fromName =
  process.env.BREVO_FROM_NAME || "House of Orive";

export async function sendPasswordResetOTP(
  email: string,
  otp: string
): Promise<void> {
  if (!apiKey || !fromEmail) {
    throw new Error(
      "Brevo configuration is missing. Check BREVO_API_KEY and BREVO_FROM_EMAIL."
    );
  }

  const brevo = new BrevoClient({ apiKey });

  await brevo.transactionalEmails.sendTransacEmail({
    sender: {
      name: fromName,
      email: fromEmail,
    },
    to: [{ email }],
    subject: "Your House of Orive password reset code",
    textContent: [
      `Your House of Orive verification code is: ${otp}`,
      "",
      "This code expires in 10 minutes.",
      "If you did not request a password reset, you can ignore this email.",
    ].join("\n"),
    htmlContent: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#28231f;background:#faf8f5">
        <h1 style="font-family:Georgia,serif;font-weight:400;text-align:center">House of Orive</h1>
        <p>We received a request to reset your password.</p>
        <p>Your verification code is:</p>
        <div style="background:#ffffff;border:1px solid #e7dfd6;padding:20px;text-align:center;font-size:32px;letter-spacing:8px;font-weight:bold">
          ${otp}
        </div>
        <p>This code expires in <strong>10 minutes</strong>.</p>
        <p style="font-size:13px;color:#777">
          If you did not request a password reset, please ignore this email.
        </p>
      </div>
    `,
  });
}
