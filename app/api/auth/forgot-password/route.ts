
import { NextRequest, NextResponse } from "next/server";
import { createHash, randomInt } from "node:crypto";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PasswordResetOTP from "@/models/PasswordResetOTP";
import { sendPasswordResetOTP } from "@/lib/brevo";

export const runtime = "nodejs";

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

const GENERIC_RESPONSE = {
  success: true,
  message:
    "If an eligible account exists, a verification code will be sent to its registered email.",
};

function hashOTP(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    const { email } = body as { email?: unknown };

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    await connectDB();

    // Email is unique in the User model, so this identifies
    // the account and its role without asking the user.
    const user = await User.findOne({
      email: normalizedEmail,
      accountStatus: { $ne: "disabled" },
    }).select("_id email role");

    if (!user) {
      return NextResponse.json(GENERIC_RESPONSE, {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const now = Date.now();

    const recentRequest = await PasswordResetOTP.findOne({
      userId: user._id,
      role: user.role,
      createdAt: {
        $gt: new Date(now - RESEND_COOLDOWN_MS),
      },
    }).select("_id");

    if (recentRequest) {
      return NextResponse.json(GENERIC_RESPONSE, {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      });
    }

    await PasswordResetOTP.deleteMany({
      userId: user._id,
      role: user.role,
    });

    const otp = randomInt(100000, 1000000).toString();

    await PasswordResetOTP.create({
      userId: user._id,
      email: user.email,
      role: user.role,
      otpHash: hashOTP(otp),
      expiresAt: new Date(now + OTP_EXPIRY_MS),
      attempts: 0,
      verified: false,
    });

    try {
      await sendPasswordResetOTP(user.email, otp);
    } catch (error) {
      await PasswordResetOTP.deleteMany({
        userId: user._id,
        role: user.role,
      });

      console.error("Password reset email delivery failed:", error);

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to send the verification email right now. Please try again later.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(GENERIC_RESPONSE, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Forgot-password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process your request. Please try again.",
      },
      { status: 500 }
    );
  }
}
