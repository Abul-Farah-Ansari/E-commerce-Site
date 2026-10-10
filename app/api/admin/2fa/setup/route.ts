
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import User from "@/models/User";
import {
  encryptTotpSecret,
  generateTotpQrCode,
  generateTotpSecret,
} from "@/lib/totp";

export const runtime = "nodejs";

export async function POST(_request: NextRequest) {
  try {
    const auth = await requireAdmin();

    if (!auth?.user) {
      return NextResponse.json(
        { success: false, message: "Admin authentication required." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(auth.user.id)
      .select("+totpSecretEncrypted +totpPendingSecretEncrypted");

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

    const secret = generateTotpSecret();
    const encryptedSecret = encryptTotpSecret(secret);
    const qrCode = await generateTotpQrCode(secret, user.email);

    user.totpPendingSecretEncrypted = encryptedSecret;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Scan the QR code with your authenticator app, then verify a code.",
        qrCode,
        // The raw secret is not returned; the QR code contains the enrollment URI.
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Admin 2FA setup error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to start two-factor setup." },
      { status: 500 }
    );
  }
}
