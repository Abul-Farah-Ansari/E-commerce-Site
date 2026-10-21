
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { decryptTotpSecret, verifyTotpCode } from "@/lib/totp";

const AUTH_SECRET = process.env.AUTH_SECRET;

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!AUTH_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication configuration is missing.",
        },
        { status: 500 }
      );
    }

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

    const { email: rawEmail, password } = body as {
      email?: unknown;
      password?: unknown;
    };

    const email =
      typeof rawEmail === "string"
        ? rawEmail.trim().toLowerCase()
        : "";

    if (!email || typeof password !== "string" || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email }).select(
      "+password +totpSecretEncrypted"
    );

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const accountStatus = user.accountStatus || "active";

    if (accountStatus === "disabled") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account has been disabled. Please contact customer support.",
        },
        { status: 403 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Require verification for new customer accounts explicitly
    // marked unverified. Do not change existing admin 2FA behavior.
    if (
      user.role === "customer" &&
      user.emailVerified === false
    ) {
      return NextResponse.json(
        {
          success: false,
          requiresEmailVerification: true,
          message:
            "Please verify your email address before logging in. Check your inbox for the verification link.",
        },
        {
          status: 403,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    // Admins with enabled TOTP must complete the second factor first.
    if (user.role === "admin" && user.totpEnabled) {
      if (!user.totpSecretEncrypted) {
        console.error(
          "Admin 2FA is enabled but its secret is missing."
        );

        return NextResponse.json(
          {
            success: false,
            message:
              "Admin two-factor authentication needs to be repaired. Contact support.",
          },
          { status: 500 }
        );
      }

      const challengeToken = jwt.sign(
        {
          purpose: "admin-2fa",
          userId: user._id.toString(),
          role: "admin",
        },
        AUTH_SECRET,
        { expiresIn: "5m" }
      );

      return NextResponse.json(
        {
          success: true,
          requiresTwoFactor: true,
          challengeToken,
          message: "Enter the code from your authenticator app.",
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    // Standard login for customers and admins who have not
    // enrolled in TOTP.
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      AUTH_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus,
      },
    });

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to login. Please try again.",
      },
      { status: 500 }
    );
  }
}
