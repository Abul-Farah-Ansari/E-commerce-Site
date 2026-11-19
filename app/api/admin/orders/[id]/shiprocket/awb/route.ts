
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
  let orderId = "";
  let lockAcquired = false;
  let shiprocketRequestStarted = false;

  try {
    // 1. Admin authentication
    const admin = await requireAdmin();

    if (!admin.success) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message || "Unauthorized",
        },
        { status: admin.status || 401 }
      );
    }

    // 2. Validate order ID
    const { id } = await context.params;
    orderId = id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID." },
        { status: 400 }
      );
    }

    // 3. Validate request body
    let body: { courierId?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const courierId = Number(body.courierId);

    if (!Number.isInteger(courierId) || courierId <= 0) {
      return NextResponse.json(
        { success: false, message: "Select a valid courier." },
        { status: 400 }
      );
    }

    // 4. Connect database
    await connectDB();

    // 5. Find order
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    // 6. Validate order status
    const orderStatus = String(order.orderStatus || "").toLowerCase();

    if (!["confirmed", "processing"].includes(orderStatus)) {
      return NextResponse.json(
        {
          success: false,
          message: `AWB cannot be assigned while the order status is "${orderStatus || "unknown"}".`,
        },
        { status: 409 }
      );
    }

    // 7. Prevent concurrent Shiprocket operations
    if (order.shiprocketCreateInProgress === true) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Shiprocket order creation is currently in progress. Please try again shortly.",
        },
        { status: 409 }
      );
    }

    if (order.shiprocketAwbAssignInProgress === true) {
      return NextResponse.json(
        {
          success: false,
          message:
            "AWB assignment is already in progress for this order.",
        },
        { status: 409 }
      );
    }

    // 8. Prevent duplicate AWB assignment
    if (order.awbCode) {
      return NextResponse.json(
        {
          success: false,
          message: "An AWB is already assigned to this order.",
          awbCode: order.awbCode,
        },
        { status: 409 }
      );
    }

    // 9. Test mode
    if (getShiprocketMode() === "test") {
      // No Shiprocket API call and no database write in test mode.
      if (order.shiprocketShipmentId) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This order has a saved shipment. Test AWB simulation will not be used for it.",
          },
          { status: 409 }
        );
      }

      const selectedCourier = TEST_SHIPROCKET_COURIERS.find(
        (courier) => courier.courierId === courierId
      );

      if (!selectedCourier) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Select one of the demo couriers shown in Test Mode.",
          },
          { status: 400 }
        );
      }

      const now = new Date();

      const awbCode = `TEST-AWB-${order._id
        .toString()
        .slice(-8)
        .toUpperCase()}`;

      const simulatedOrder = {
        _id: order._id.toString(),
        awbCode,
        courierCompanyId: selectedCourier.courierId,
        courierName: selectedCourier.courierName,
        trackingUrl: "",
        shipmentStatus: "TEST AWB ASSIGNED",
        shipmentStatusCode: "TEST",
        shipmentEvents: [
          {
            status: "TEST AWB ASSIGNED",
            statusCode: "TEST",
            description:
              "Local simulation only. No real courier or AWB was assigned.",
            eventDate: now.toISOString(),
          },
        ],
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
        {
          status: 200,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    // 10. Live mode requires a real Shiprocket shipment
    if (!order.shiprocketShipmentId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Create the real Shiprocket order before assigning a courier.",
        },
        { status: 409 }
      );
    }

    // 11. Atomically acquire AWB assignment lock
    const lockResult = await Order.updateOne(
      {
        _id: order._id,
        orderStatus: { $in: ["confirmed", "processing"] },
        shiprocketShipmentId: order.shiprocketShipmentId,
        awbCode: { $in: [null, ""] },
        shiprocketCreateInProgress: { $ne: true },
        shiprocketAwbAssignInProgress: { $ne: true },
      },
      {
        $set: {
          shiprocketAwbAssignInProgress: true,
        },
      }
    );

    if (lockResult.modifiedCount !== 1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "AWB assignment could not be started. The order may have changed or another operation is in progress.",
        },
        { status: 409 }
      );
    }

    lockAcquired = true;

    // 12. Request AWB from Shiprocket
    shiprocketRequestStarted = true;

    const result = await shiprocketRequest<{
      awb_assign_status?: number;
      response?: {
        data?: {
          courier_company_id?: number;
          awb_code?: string;
          courier_name?: string;
          pickup_scheduled_date?: string;
        };
      };
      message?: string;
    }>("/courier/assign/awb", {
      method: "POST",
      body: {
        shipment_id: order.shiprocketShipmentId,
        courier_id: courierId,
      },
    });

    // 13. Extract Shiprocket response
    const assigned = result.response?.data;

    const awbCode = String(assigned?.awb_code || "").trim();

    if (!awbCode) {
      // Shiprocket may have processed the request despite returning
      // an unexpected response. Keep the lock to prevent duplicate calls.
      return NextResponse.json(
        {
          success: false,
          message:
            result.message ||
            "Shiprocket did not return an AWB number. The result may be uncertain. The assignment lock has been retained. Verify the shipment in Shiprocket before retrying.",
        },
        { status: 502 }
      );
    }

    const assignedCourierCompanyId = Number(
      assigned?.courier_company_id || courierId
    );

    const courierName = String(
      assigned?.courier_name || "Assigned courier"
    );

    const trackingUrl = `https://shiprocket.co/tracking/${encodeURIComponent(
      awbCode
    )}`;

    const now = new Date();

    // 14. Save AWB details and release lock atomically
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: order._id,
        shiprocketShipmentId: order.shiprocketShipmentId,
        shiprocketAwbAssignInProgress: true,
        awbCode: { $in: [null, ""] },
      },
      {
        $set: {
          awbCode,
          courierCompanyId: assignedCourierCompanyId,
          courierName,
          trackingUrl,
          shipmentStatus: "AWB Assigned",
          shipmentStatusCode: "1",
          shiprocketAwbAssignInProgress: false,
        },
        $push: {
          shipmentEvents: {
            status: "AWB Assigned",
            statusCode: "1",
            description: `AWB ${awbCode} assigned to ${courierName}. Pickup has not been requested yet.`,
            eventDate: now,
          },
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedOrder) {
      // Shiprocket has returned an AWB but the database update failed.
      // Retain the lock so another request cannot assign a second AWB.
      return NextResponse.json(
        {
          success: false,
          message:
            "Shiprocket assigned the AWB, but the order could not be updated in the database. The assignment lock has been retained. Verify the shipment in Shiprocket before retrying.",
          awbCode,
        },
        { status: 500 }
      );
    }

    lockAcquired = false;

    // 15. Success response
    return NextResponse.json(
      {
        success: true,
        mode: "live",
        isTestMode: false,
        message: `AWB ${updatedOrder.awbCode} assigned to ${updatedOrder.courierName}. You can now request pickup.`,
        order: {
          _id: updatedOrder._id.toString(),
          awbCode: updatedOrder.awbCode,
          courierCompanyId: updatedOrder.courierCompanyId,
          courierName: updatedOrder.courierName,
          trackingUrl: updatedOrder.trackingUrl,
          shipmentStatus: updatedOrder.shipmentStatus,
          shipmentStatusCode: updatedOrder.shipmentStatusCode,
          shipmentEvents: updatedOrder.shipmentEvents,
          updatedAt: updatedOrder.updatedAt,
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
        : "Unable to assign courier and generate AWB.";

    console.error("SHIPROCKET AWB ASSIGNMENT ERROR:", message);

    // Release the lock only if the external Shiprocket request
    // has not started. Once started, its outcome may be uncertain.
    if (lockAcquired && !shiprocketRequestStarted && orderId) {
      try {
        await Order.updateOne(
          {
            _id: orderId,
            shiprocketAwbAssignInProgress: true,
          },
          {
            $set: {
              shiprocketAwbAssignInProgress: false,
            },
          }
        );
      } catch (lockError) {
        console.error(
          "FAILED TO RELEASE SHIPROCKET AWB LOCK:",
          lockError
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
