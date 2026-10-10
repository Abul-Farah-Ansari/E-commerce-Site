
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await requireAdmin();

    if (!auth?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findById(auth.user.id)
      .select("role accountStatus totpEnabled")
      .lean();

    if (!user || user.role !== "admin" || user.accountStatus !== "active") {
      return NextResponse.json(
        { success: false, message: "Admin account not found or inactive." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        enabled: user.totpEnabled === true,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("Admin 2FA status error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load 2FA status." },
      { status: 500 }
    );
  }
}
