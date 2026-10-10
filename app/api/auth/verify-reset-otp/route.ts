
import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PasswordResetOTP from "@/models/PasswordResetOTP";

export const runtime = "nodejs";

const MAX_ATTEMPTS = 5;

function hashOTP(otp: string) {
  return createHash("sha256").update(otp).digest("hex");
}

function hashesMatch(a: string, b: string) {
  const first = Buffer.from(a, "hex");
  const second = Buffer.from(b, "hex");

  return (
    first.length === second.length &&
    timingSafeEqual(first, second)
  );
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

    const { email, otp } = body as {
      email?: unknown;
      otp?: unknown;
    };

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      !/^\d{6}$/.test(otp)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid email and six-digit OTP.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    await connectDB();

    const user = await User.findOne({
      email: normalizedEmail,
      accountStatus: { $ne: "disabled" },
    }).select("_id email role");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP." },
        { status: 400 }
      );
    }

    const resetRequest = await PasswordResetOTP.findOne({
      userId: user._id,
      email: normalizedEmail,
      role: user.role,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).select("+otpHash");

    if (!resetRequest) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP." },
        { status: 400 }
      );
    }

    if (resetRequest.attempts >= MAX_ATTEMPTS) {
      await PasswordResetOTP.deleteOne({
        _id: resetRequest._id,
      });

      return NextResponse.json(
        {
          success: false,
          message: "Too many attempts. Request a new OTP.",
        },
        { status: 429 }
      );
    }

    resetRequest.attempts += 1;

    if (!hashesMatch(resetRequest.otpHash, hashOTP(otp))) {
      if (resetRequest.attempts >= MAX_ATTEMPTS) {
        await PasswordResetOTP.deleteOne({
          _id: resetRequest._id,
        });
      } else {
        await resetRequest.save();
      }

      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP." },
        { status: 400 }
      );
    }

    resetRequest.verified = true;
    await resetRequest.save();

    return NextResponse.json(
      {
        success: true,
        message: "OTP verified successfully.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("OTP verification error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to verify OTP. Please try again.",
      },
      { status: 500 }
    );
  }
}
