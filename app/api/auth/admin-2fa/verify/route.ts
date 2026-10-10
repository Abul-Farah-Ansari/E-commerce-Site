
import { NextRequest, NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import {
  decryptTotpSecret,
  verifyTotpCode,
} from "@/lib/totp";

const AUTH_SECRET = process.env.AUTH_SECRET;

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    if (!AUTH_SECRET) {
      return NextResponse.json(
        { success: false, message: "Authentication configuration is missing." },
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

    const { challengeToken, code } = body as {
      challengeToken?: unknown;
      code?: unknown;
    };

    if (
      typeof challengeToken !== "string" ||
      typeof code !== "string" ||
      !/^\d{6}$/.test(code)
    ) {
      return NextResponse.json(
        { success: false, message: "A valid challenge and six-digit code are required." },
        { status: 400 }
      );
    }

    let payload: string | JwtPayload;

    try {
      payload = jwt.verify(challengeToken, AUTH_SECRET);
    } catch {
      return NextResponse.json(
        { success: false, message: "Your login challenge has expired. Please log in again." },
        { status: 401 }
      );
    }

    if (
      typeof payload === "string" ||
      payload.purpose !== "admin-2fa" ||
      payload.role !== "admin" ||
      typeof payload.userId !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid login challenge." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(payload.userId).select(
      "+totpSecretEncrypted"
    );

    if (
      !user ||
      user.role !== "admin" ||
      user.accountStatus === "disabled" ||
      !user.totpEnabled ||
      !user.totpSecretEncrypted
    ) {
      return NextResponse.json(
        { success: false, message: "Admin authentication could not be completed." },
        { status: 403 }
      );
    }

    let secret: string;

    try {
      secret = decryptTotpSecret(user.totpSecretEncrypted);
    } catch {
      console.error("Unable to decrypt the admin TOTP secret.");

      return NextResponse.json(
        { success: false, message: "Unable to verify the authenticator code." },
        { status: 500 }
      );
    }

    if (!verifyTotpCode(secret, code)) {
      return NextResponse.json(
        { success: false, message: "Incorrect or expired authenticator code." },
        { status: 401 }
      );
    }

    // Issue the regular authenticated session only after successful TOTP.
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      AUTH_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      {
        success: true,
        message: "Admin login successful.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          accountStatus: user.accountStatus || "active",
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );

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
    console.error("Admin 2FA login verification error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to complete admin login. Please try again." },
      { status: 500 }
    );
  }
}
