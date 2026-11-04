import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import { getShiprocketMode, shiprocketRequest } from "@/lib/shiprocket";
import Order from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin.success) {
      return NextResponse.json({ success: false, message: admin.message || "Unauthorized" }, { status: admin.status || 401 });
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid order ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({})) as { awbCode?: unknown };

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    if (getShiprocketMode() === "test") {
      // Simulated pickup is never saved and never sent to Shiprocket.
      if (order.shiprocketShipmentId) {
        return NextResponse.json({ success: false, message: "This order has a saved shipment. Test pickup simulation will not be used for it." }, { status: 409 });
      }
      const awbCode = String(body.awbCode || "").trim();
      const expectedAwb = `TEST-AWB-${order._id.toString().slice(-8).toUpperCase()}`;
      if (awbCode !== expectedAwb) {
        return NextResponse.json({ success: false, message: "Complete the simulated AWB step before simulating pickup." }, { status: 409 });
      }

      const now = new Date();
      const pickupTokenNumber = `TEST-PICKUP-${order._id.toString().slice(-6).toUpperCase()}`;
      return NextResponse.json(
        {
          success: true,
          mode: "test",
          isTestMode: true,
          message: "TEST MODE: pickup request simulated. No courier pickup has been booked.",
          order: {
            _id: order._id.toString(),
            pickupScheduledAt: now.toISOString(),
            pickupTokenNumber,
            shipmentStatus: "TEST PICKUP SIMULATED",
            shipmentStatusCode: "TEST",
            shipmentEvents: [{
              status: "TEST PICKUP SIMULATED",
              statusCode: "TEST",
              description: "Local simulation only. No real pickup was requested.",
              eventDate: now.toISOString(),
            }],
            updatedAt: now.toISOString(),
          },
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!order.shiprocketShipmentId || !order.awbCode) {
      return NextResponse.json({ success: false, message: "Generate a real AWB before requesting pickup." }, { status: 409 });
    }
    if (order.pickupScheduledAt) {
      return NextResponse.json({ success: false, message: "Pickup has already been requested for this shipment." }, { status: 409 });
    }

    const result = await shiprocketRequest<{
      pickup_status?: number;
      response?: {
        pickup_scheduled_date?: string;
        pickup_token_number?: string;
        pickup_token?: string;
        data?: string;
      };
      message?: string;
    }>("/courier/generate/pickup", {
      method: "POST",
      body: { shipment_id: [order.shiprocketShipmentId] },
    });

    if (Number(result.pickup_status) !== 1) {
      throw new Error(result.message || result.response?.data || "Shiprocket did not confirm the pickup request.");
    }

    const scheduledDate = result.response?.pickup_scheduled_date
      ? new Date(result.response.pickup_scheduled_date)
      : new Date();
    order.pickupScheduledAt = Number.isNaN(scheduledDate.getTime()) ? new Date() : scheduledDate;
    order.pickupTokenNumber = String(result.response?.pickup_token_number || result.response?.pickup_token || "");
    order.shipmentStatus = "Pickup Scheduled";
    order.shipmentStatusCode = "3";
    order.shipmentEvents = order.shipmentEvents || [];
    order.shipmentEvents.push({
      status: "Pickup Scheduled",
      statusCode: "3",
      description: result.response?.data || "Pickup request successfully submitted to Shiprocket.",
      eventDate: new Date(),
    });
    await order.save();

    return NextResponse.json(
      {
        success: true,
        mode: "live",
        isTestMode: false,
        message: "Pickup request submitted successfully to Shiprocket.",
        order: {
          _id: order._id.toString(),
          pickupScheduledAt: order.pickupScheduledAt,
          pickupTokenNumber: order.pickupTokenNumber,
          shipmentStatus: order.shipmentStatus,
          shipmentStatusCode: order.shipmentStatusCode,
          shipmentEvents: order.shipmentEvents,
          updatedAt: order.updatedAt,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to request Shiprocket pickup.";
    console.error("SHIPROCKET PICKUP REQUEST ERROR:", message);
    return NextResponse.json({ success: false, message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
