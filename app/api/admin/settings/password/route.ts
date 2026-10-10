
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();

    if (!auth?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in again." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);

    const currentPassword =
      typeof body?.currentPassword === "string"
        ? body.currentPassword
        : "";

    const newPassword =
      typeof body?.newPassword === "string"
        ? body.newPassword
        : "";

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter your current and new passwords.",
        },
        { status: 400 }
      );
    }

    if (
      currentPassword.length > 128 ||
      newPassword.length > 128
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Passwords must not exceed 128 characters.",
        },
        { status: 400 }
      );
    }

    if (
      newPassword.length < 8 ||
      !/[A-Z]/.test(newPassword) ||
      !/[a-z]/.test(newPassword) ||
      !/\d/.test(newPassword)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Use at least 8 characters, including an uppercase letter, a lowercase letter, and a number.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(auth.user.id).select("+password");

    if (
      !user ||
      user.role !== "admin" ||
      user.accountStatus !== "active"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Active admin account not found.",
        },
        { status: 403 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Your current password is incorrect.",
        },
        { status: 400 }
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Your new password must differ from your current password.",
        },
        { status: 400 }
      );
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Your password has been updated successfully.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Admin password update error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update your password right now.",
      },
      { status: 500 }
    );
  }
}
