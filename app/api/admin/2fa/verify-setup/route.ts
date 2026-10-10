
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import User from "@/models/User";
import {
  decryptTotpSecret,
  verifyTotpCode,
} from "@/lib/totp";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (!auth?.user) {
      return NextResponse.json(
        { success: false, message: "Admin authentication required." },
        { status: 401 }
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

    const { code } = body as { code?: unknown };

    if (typeof code !== "string" || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid six-digit code." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(auth.user.id).select(
      "+totpSecretEncrypted +totpPendingSecretEncrypted"
    );

    if (!user || user.role !== "admin" || user.accountStatus !== "active") {
      return NextResponse.json(
        { success: false, message: "Active admin account not found." },
        { status: 403 }
      );
    }

    if (user.totpEnabled) {
      return NextResponse.json(
        { success: false, message: "Two-factor authentication is already enabled." },
        { status: 409 }
      );
    }

    if (!user.totpPendingSecretEncrypted) {
      return NextResponse.json(
        { success: false, message: "Start the 2FA setup process first." },
        { status: 400 }
      );
    }

    let secret: string;

    try {
      secret = decryptTotpSecret(user.totpPendingSecretEncrypted);
    } catch {
      console.error("Unable to decrypt the pending admin TOTP secret.");

      return NextResponse.json(
        { success: false, message: "Unable to verify setup. Please restart the setup process." },
        { status: 500 }
      );
    }

    if (!verifyTotpCode(secret, code)) {
      return NextResponse.json(
        { success: false, message: "Incorrect or expired code. Please try again." },
        { status: 400 }
      );
    }

    user.totpSecretEncrypted = user.totpPendingSecretEncrypted;
    user.totpPendingSecretEncrypted = undefined;
    user.totpEnabled = true;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Two-factor authentication enabled successfully.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Admin 2FA verification error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to verify the authenticator code." },
      { status: 500 }
    );
  }
}
