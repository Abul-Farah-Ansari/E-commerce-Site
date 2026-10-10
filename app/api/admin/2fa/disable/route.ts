
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import User from "@/models/User";
import { requireAdmin } from "@/lib/adminAuth";
import { decryptTotpSecret, verifyTotpCode } from "@/lib/totp";
import { connectDB } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();

    if (!auth?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const password =
      typeof body?.password === "string" ? body.password : "";
    const code = typeof body?.code === "string" ? body.code : "";

    if (!password || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: "Enter your password and six-digit authenticator code." },
        { status: 400 }
      );
    }

    if (password.length > 200) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials." },
        { status: 400 }
      );
    }

    // Use your project's existing named MongoDB connection export.
   
    await connectDB();

    const user = await User.findById(auth.user.id).select(
      "+password +totpSecretEncrypted"
    );

    if (
      !user ||
      user.role !== "admin" ||
      user.accountStatus !== "active"
    ) {
      return NextResponse.json(
        { success: false, message: "Admin account not found or inactive." },
        { status: 403 }
      );
    }

    if (!user.totpEnabled || !user.totpSecretEncrypted) {
      return NextResponse.json(
        { success: false, message: "Two-factor authentication is not enabled." },
        { status: 400 }
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Incorrect password or authenticator code." },
        { status: 401 }
      );
    }

    let secret: string;

    try {
      secret = decryptTotpSecret(user.totpSecretEncrypted);
    } catch {
      console.error("Unable to decrypt the admin TOTP secret.");
      return NextResponse.json(
        { success: false, message: "Unable to verify authenticator. Contact support." },
        { status: 500 }
      );
    }

    if (!verifyTotpCode(secret, code)) {
      return NextResponse.json(
        { success: false, message: "Incorrect password or authenticator code." },
        { status: 401 }
      );
    }

    user.totpEnabled = false;
    user.totpSecretEncrypted = undefined;
    user.totpPendingSecretEncrypted = undefined;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Two-factor authentication has been disabled.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Disable admin 2FA error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to disable two-factor authentication." },
      { status: 500 }
    );
  }
}
