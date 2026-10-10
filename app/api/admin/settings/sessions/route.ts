
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const user = await User.findById(auth.user.id).select(
      "role accountStatus"
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

    // Session tracking has not been implemented yet.
    return NextResponse.json(
      {
        success: true,
        sessions: [],
        message: "Session tracking has not been configured yet.",
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Admin sessions fetch error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load active sessions." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Session revocation is not configured yet. No session was revoked.",
    },
    { status: 501 }
  );
}
