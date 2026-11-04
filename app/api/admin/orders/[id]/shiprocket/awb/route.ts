import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import {
  getShiprocketMode,
  shiprocketRequest,
  TEST_SHIPROCKET_COURIERS,
} from "@/lib/shiprocket";
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

    let body: { courierId?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON request body." }, { status: 400 });
    }

    const courierId = Number(body.courierId);
    if (!Number.isInteger(courierId) || courierId <= 0) {
      return NextResponse.json({ success: false, message: "Select a valid courier." }, { status: 400 });
    }

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    if (getShiprocketMode() === "test") {
      // Simulated AWB is returned to the browser only. No Shiprocket API call or DB write.
      if (order.shiprocketShipmentId) {
        return NextResponse.json({ success: false, message: "This order has a saved shipment. Test AWB simulation will not be used for it." }, { status: 409 });
      }
      const selectedCourier = TEST_SHIPROCKET_COURIERS.find((courier) => courier.courierId === courierId);
      if (!selectedCourier) {
        return NextResponse.json({ success: false, message: "Select one of the demo couriers shown in Test Mode." }, { status: 400 });
      }

      const now = new Date();
      const awbCode = `TEST-AWB-${order._id.toString().slice(-8).toUpperCase()}`;
      const simulatedOrder = {
        _id: order._id.toString(),
        awbCode,
        courierCompanyId: selectedCourier.courierId,
        courierName: selectedCourier.courierName,
        trackingUrl: "",
        shipmentStatus: "TEST AWB ASSIGNED",
        shipmentStatusCode: "TEST",
        shipmentEvents: [{
          status: "TEST AWB ASSIGNED",
          statusCode: "TEST",
          description: "Local simulation only. No real courier or AWB was assigned.",
          eventDate: now.toISOString(),
        }],
        updatedAt: now.toISOString(),
      };

      return NextResponse.json(
        {
          success: true,
          mode: "test",
          isTestMode: true,
          message: `TEST MODE: simulated AWB ${awbCode} for ${selectedCourier.courierName}. No request was sent to Shiprocket.`,
          order: simulatedOrder,
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!order.shiprocketShipmentId) {
      return NextResponse.json({ success: false, message: "Create the real Shiprocket order before assigning a courier." }, { status: 409 });
    }
    if (order.awbCode) {
      return NextResponse.json({ success: false, message: "An AWB is already assigned to this order." }, { status: 409 });
    }

    const result = await shiprocketRequest<{
      awb_assign_status?: number;
      response?: { data?: {
        courier_company_id?: number;
        awb_code?: string;
        courier_name?: string;
        pickup_scheduled_date?: string;
      } };
      message?: string;
    }>("/courier/assign/awb", {
      method: "POST",
      body: {
        shipment_id: order.shiprocketShipmentId,
        courier_id: courierId,
      },
    });

    const assigned = result.response?.data;
    const awbCode = String(assigned?.awb_code || "").trim();
    if (!awbCode) {
      throw new Error(result.message || "Shiprocket did not return an AWB number.");
    }

    order.awbCode = awbCode;
    order.courierCompanyId = Number(assigned?.courier_company_id || courierId);
    order.courierName = String(assigned?.courier_name || "Assigned courier");
    order.trackingUrl = `https://shiprocket.co/tracking/${encodeURIComponent(awbCode)}`;
    order.shipmentStatus = "AWB Assigned";
    order.shipmentStatusCode = "1";
    order.shipmentEvents = order.shipmentEvents || [];
    order.shipmentEvents.push({
      status: "AWB Assigned",
      statusCode: "1",
      description: `AWB ${awbCode} assigned to ${order.courierName}. Pickup has not been requested yet.`,
      eventDate: new Date(),
    });
    await order.save();

    return NextResponse.json(
      {
        success: true,
        mode: "live",
        isTestMode: false,
        message: `AWB ${awbCode} assigned to ${order.courierName}. You can now request pickup.`,
        order: {
          _id: order._id.toString(),
          awbCode: order.awbCode,
          courierCompanyId: order.courierCompanyId,
          courierName: order.courierName,
          trackingUrl: order.trackingUrl,
          shipmentStatus: order.shipmentStatus,
          shipmentStatusCode: order.shipmentStatusCode,
          shipmentEvents: order.shipmentEvents,
          updatedAt: order.updatedAt,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to assign courier and generate AWB.";
    console.error("SHIPROCKET AWB ASSIGNMENT ERROR:", message);
    return NextResponse.json({ success: false, message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
