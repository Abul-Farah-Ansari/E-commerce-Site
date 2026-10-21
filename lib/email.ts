
import nodemailer from "nodemailer";
import crypto from "crypto";

const APP_URL = (
  process.env.APP_URL || "http://localhost:3000"
).replace(/\/+$/, "");

function getTransporter() {
  const host = process.env.BREVO_SMTP_HOST;
  const port = Number(process.env.BREVO_SMTP_PORT || 587);
  const user = process.env.BREVO_SMTP_USER;
  const pass = process.env.BREVO_SMTP_KEY;

  if (!host || !user || !pass) {
    throw new Error("Brevo SMTP environment variables are missing.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export function createEmailVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  return { token, tokenHash };
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const sender = process.env.EMAIL_FROM;

  if (!sender) {
    throw new Error("EMAIL_FROM environment variable is missing.");
  }

  const verificationUrl =
    `${APP_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  const transporter = getTransporter();

  await transporter.sendMail({
    from: sender,
    to: email,
    subject: "Verify your House of Orive email",
    text: [
      `Hello ${name},`,
      "",
      "Thank you for creating a House of Orive account.",
      "Please verify your email address using the link below:",
      "",
      verificationUrl,
      "",
      "This link expires in 30 minutes.",
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;color:#111;max-width:560px;margin:auto;padding:24px">
        <h2>House of Orive</h2>
        <p>Hello ${escapeHtml(name)},</p>
        <p>Thank you for creating an account. Please verify your email address to finish registration.</p>
        <p style="margin:28px 0">
          <a href="${verificationUrl}"
             style="background:#111;color:#fff;padding:14px 24px;text-decoration:none;border-radius:24px;display:inline-block">
            Verify Email
          </a>
        </p>
        <p>This link expires in 30 minutes.</p>
        <p style="color:#777;font-size:12px">
          If you did not create this account, you can ignore this email.
        </p>
      </div>
    `,
  });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}
