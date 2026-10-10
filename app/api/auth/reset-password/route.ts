
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import PasswordResetOTP from "@/models/PasswordResetOTP";

export const runtime = "nodejs";

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

    const { email, newPassword } = body as {
      email?: unknown;
      newPassword?: unknown;
    };

    if (
      typeof email !== "string" ||
      typeof newPassword !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      newPassword.length < 8 ||
      newPassword.length > 128
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Enter a valid email and a password between 8 and 128 characters.",
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
        {
          success: false,
          message: "Invalid or expired password reset request.",
        },
        { status: 400 }
      );
    }

    // Only a verified, unexpired OTP for this exact account
    // can authorize a password change.
    const resetRequest = await PasswordResetOTP.findOne({
      userId: user._id,
      email: normalizedEmail,
      role: user.role,
      verified: true,
      expiresAt: { $gt: new Date() },
    }).select("_id");

    if (!resetRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "Verify a valid OTP before resetting your password.",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Claim the reset record once. A second request cannot reuse it.
    const claimedRequest = await PasswordResetOTP.findOneAndDelete({
      _id: resetRequest._id,
      userId: user._id,
      email: normalizedEmail,
      role: user.role,
      verified: true,
      expiresAt: { $gt: new Date() },
    });

    if (!claimedRequest) {
      return NextResponse.json(
        {
          success: false,
          message: "This reset request has expired or was already used. Request a new OTP.",
        },
        { status: 400 }
      );
    }

    const updateResult = await User.updateOne(
      {
        _id: user._id,
        email: normalizedEmail,
        role: user.role,
        accountStatus: { $ne: "disabled" },
      },
      { $set: { password: hashedPassword } }
    );

    if (updateResult.modifiedCount !== 1) {
      console.error("Password reset update did not modify the user.");
      return NextResponse.json(
        {
          success: false,
          message: "Unable to update the password. Request a new OTP.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully. Please log in with your new password.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Reset-password error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to reset your password. Please try again.",
      },
      { status: 500 }
    );
  }
}
