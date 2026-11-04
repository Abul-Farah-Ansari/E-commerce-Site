import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { getShiprocketAuth } from "@/lib/shiprocket";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/shiprocket/test
 * Admin-only, read-only connection test. It authenticates with Shiprocket
 * but does not create an order, shipment, AWB, or pickup request.
 */
export async function GET() {
      console.log("SHIPROCKET GET ROUTE REACHED");
    
  try {
    const admin = await requireAdmin();

    if (!admin.success) {
      return NextResponse.json(
        { success: false, message: admin.message },
        { status: admin.status }
      );
    }

    const auth = await getShiprocketAuth();

    return NextResponse.json(
      {
        success: true,
        message: "Shiprocket authentication successful.",
        account: {
          id: auth.id ?? null,
          firstName: auth.firstName ?? null,
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to authenticate with Shiprocket.";

    console.error("Shiprocket connection test failed:", message);

    return NextResponse.json(
      { success: false, message },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
