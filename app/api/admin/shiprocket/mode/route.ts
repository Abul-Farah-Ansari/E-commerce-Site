import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/adminAuth";
import { getShiprocketMode } from "@/lib/shiprocket";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin.success) {
    return NextResponse.json(
      { success: false, message: admin.message || "Unauthorized" },
      { status: admin.status || 401 }
    );
  }

  const mode = getShiprocketMode();

  return NextResponse.json({
    success: true,
    mode,
    message:
      mode === "test"
        ? "TEST MODE: shipment actions are simulated locally."
        : "LIVE MODE: shipment actions are sent to Shiprocket.",
  });
}