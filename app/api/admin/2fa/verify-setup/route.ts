
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

    const body = await request.json().catch(() => null);
    const code = body?.code;

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

    if (
      !user ||
      user.role !== "admin" ||
      user.accountStatus !== "active"
    ) {
      return NextResponse.json(
        { success: false, message: "Active admin account not found." },
        { status: 403 }
      );
    }

    if (!user.totpPendingSecretEncrypted) {
      return NextResponse.json(
        { success: false, message: "Start authenticator setup first." },
        { status: 400 }
      );
    }

    let newSecret: string;

    try {
      newSecret = decryptTotpSecret(
        user.totpPendingSecretEncrypted
      );
    } catch {
      return NextResponse.json(
        { success: false, message: "Unable to read pending authenticator." },
        { status: 500 }
      );
    }

    if (!verifyTotpCode(newSecret, code)) {
      return NextResponse.json(
        { success: false, message: "Incorrect or expired new authenticator code." },
        { status: 401 }
      );
    }

    // Activate the new secret only after successful verification.
    user.totpSecretEncrypted = user.totpPendingSecretEncrypted;
    user.totpPendingSecretEncrypted = undefined;
    user.totpEnabled = true;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "New authenticator successfully activated.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Admin 2FA verification error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to verify the new authenticator." },
      { status: 500 }
    );
  }
}
