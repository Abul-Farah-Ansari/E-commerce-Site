
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import User from "@/models/User";
import {
  decryptTotpSecret,
  encryptTotpSecret,
  generateTotpQrCode,
  generateTotpSecret,
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

    const password =
      typeof body?.password === "string" ? body.password : "";

    const currentCode =
      typeof body?.currentCode === "string"
        ? body.currentCode
        : "";

    if (!password || password.length > 200) {
      return NextResponse.json(
        { success: false, message: "Enter your current password." },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(auth.user.id).select(
      "+password +totpSecretEncrypted +totpPendingSecretEncrypted"
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

    if (
      typeof user.password !== "string" ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return NextResponse.json(
        { success: false, message: "Incorrect password." },
        { status: 401 }
      );
    }

    // If 2FA is already enabled, verify the existing authenticator.
    if (user.totpEnabled) {
      if (
        !user.totpSecretEncrypted ||
        !/^\d{6}$/.test(currentCode)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Enter your current six-digit authenticator code.",
          },
          { status: 400 }
        );
      }

      let oldSecret: string;

      try {
        oldSecret = decryptTotpSecret(user.totpSecretEncrypted);
      } catch {
        return NextResponse.json(
          { success: false, message: "Unable to verify current authenticator." },
          { status: 500 }
        );
      }

      if (!verifyTotpCode(oldSecret, currentCode)) {
        return NextResponse.json(
          { success: false, message: "Incorrect current authenticator code." },
          { status: 401 }
        );
      }
    }

    const newSecret = generateTotpSecret();
    const encryptedSecret = encryptTotpSecret(newSecret);
    const qrCode = await generateTotpQrCode(
      newSecret,
      user.email
    );

    // Keep the current active secret unchanged.
    user.totpPendingSecretEncrypted = encryptedSecret;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Scan the new QR code and verify it to complete setup.",
        qrCode,
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Admin 2FA setup error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to start 2FA setup." },
      { status: 500 }
    );
  }
}
