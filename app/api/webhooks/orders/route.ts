
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { connectDB } from "@/lib/mongodb";
import Order from "@/models/Order";

export const dynamic = "force-dynamic";

type RecordData = Record<string, unknown>;

interface ShipmentEvent {
  status: string;
  statusCode?: string;
  location?: string;
  description?: string;
  eventDate?: Date;
}

function asRecord(value: unknown): RecordData {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordData)
    : {};
}

function asString(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  return "";
}

function parseDate(value: unknown): Date | undefined {
  if (!value) return undefined;

  const raw = String(value).trim();

  // Shiprocket example: 23 05 2023 11:43:52
  const shiprocketDate = raw.match(
    /^(\d{2}) (\d{2}) (\d{4}) (\d{2}):(\d{2}):(\d{2})$/
  );

  let date: Date;

  if (shiprocketDate) {
    const [, day, month, year, hours, minutes, seconds] =
      shiprocketDate;

    date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds)
    );
  } else {
    date = new Date(raw);
  }

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function getEventKey(event: ShipmentEvent): string {
  return [
    event.status.toLowerCase(),
    (event.statusCode || "").toLowerCase(),
    (event.location || "").toLowerCase(),
    event.eventDate?.toISOString() || "",
  ].join("|");
}

function normalizeScans(scans: unknown): ShipmentEvent[] {
  if (!Array.isArray(scans)) return [];

  return scans
    .map((item): ShipmentEvent | null => {
      const scan = asRecord(item);

      const status =
        asString(scan["sr-status-label"]) ||
        asString(scan.status) ||
        asString(scan.activity);

      if (!status) return null;

      return {
        status,
        statusCode:
          asString(scan["sr-status"]) ||
          asString(scan.sr_status) ||
          undefined,
        location: asString(scan.location) || undefined,
        description: asString(scan.activity) || undefined,
        eventDate: parseDate(scan.date),
      };
    })
    .filter((event): event is ShipmentEvent => event !== null);
}

function verifyWebhookToken(receivedToken: string, expectedToken: string) {
  const received = Buffer.from(receivedToken);
  const expected = Buffer.from(expectedToken);

  if (received.length !== expected.length) return false;

  return timingSafeEqual(received, expected);
}

function getNextOrderStatus(
  currentStatus: string,
  shipmentStatus: string,
  shipmentStatusId: string
): string | null {
  // Never downgrade a delivered order.
  if (currentStatus === "delivered") return null;

  const status = shipmentStatus.toLowerCase();
  const code = shipmentStatusId.trim();

  // Shiprocket shipment status ID 7 = Delivered.
  if (
    code === "7" ||
    status.includes("delivered")
  ) {
    return "delivered";
  }

  // Forward shipment movement statuses.
  // Do not map RTO, cancellation, lost or exception statuses to shipped.
  const isForwardMovement =
    ["6", "17", "18", "42", "50", "51", "54"].includes(code) ||
    status.includes("in transit") ||
    status.includes("out for delivery") ||
    status.includes("picked up") ||
    status.includes("shipped") ||
    status.includes("reached destination");

  if (
    isForwardMovement &&
    currentStatus !== "shipped" &&
    currentStatus !== "delivered"
  ) {
    return "shipped";
  }

  return null;
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Order tracking webhook endpoint is active.",
  });
}

export async function POST(request: Request) {
  try {
    // 1. Verify webhook secret.
    const expectedToken = process.env.SHIPROCKET_WEBHOOK_TOKEN?.trim();
    const receivedToken = request.headers.get("x-api-key")?.trim() || "";

    if (!expectedToken) {
      console.error("SHIPROCKET_WEBHOOK_TOKEN is not configured.");

      return NextResponse.json(
        { success: false, message: "Webhook is not configured." },
        { status: 500 }
      );
    }

    if (!verifyWebhookToken(receivedToken, expectedToken)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized webhook request." },
        { status: 401 }
      );
    }

    // 2. Parse webhook payload.
    const payload = asRecord(await request.json());

    const awb = asString(payload.awb);

    if (!awb) {
      return NextResponse.json(
        { success: false, message: "AWB is missing." },
        { status: 400 }
      );
    }

    // 3. Ignore return shipments.
    if (
      payload.is_return === 1 ||
      payload.is_return === "1" ||
      payload.is_return === true
    ) {
      return NextResponse.json({
        success: true,
        message: "Return shipment notification ignored.",
      });
    }

    await connectDB();

    // 4. Find the matching House of Orive order.
    const order = await Order.findOne({
      awbCode: awb,
    });

    if (!order) {
      console.warn("Webhook received for an unknown AWB:", awb);

      // Return 200 so Shiprocket does not repeatedly send an
      // event that does not belong to an existing local order.
      return NextResponse.json({
        success: true,
        message: "No matching order found. Notification acknowledged.",
      });
    }

    // 5. Read current shipment information.
    const shipmentStatus =
      asString(payload.shipment_status) ||
      asString(payload.current_status);

    const shipmentStatusCode =
      asString(payload.shipment_status_id) ||
      asString(payload.current_status_id);

    const courierName = asString(payload.courier_name);

    // 6. Normalize tracking scans.
    const incomingEvents = normalizeScans(payload.scans);

    // Add current status as an event if scans are missing.
    if (incomingEvents.length === 0 && shipmentStatus) {
      incomingEvents.push({
        status: shipmentStatus,
        statusCode: shipmentStatusCode || undefined,
        description: shipmentStatus,
        eventDate: parseDate(payload.current_timestamp),
      });
    }

    // 7. Merge old and new events without duplicates.
    const eventMap = new Map<string, ShipmentEvent>();

    for (const event of order.shipmentEvents || []) {
      eventMap.set(getEventKey(event), {
        status: event.status,
        statusCode: event.statusCode,
        location: event.location,
        description: event.description,
        eventDate: event.eventDate,
      });
    }

    for (const event of incomingEvents) {
      eventMap.set(getEventKey(event), event);
    }

    order.shipmentEvents = Array.from(eventMap.values())
      .sort(
        (a, b) =>
          (a.eventDate?.getTime() || 0) -
          (b.eventDate?.getTime() || 0)
      )
      .slice(-100) as typeof order.shipmentEvents;

    // 8. Update latest shipment status.
    if (shipmentStatus) {
      order.shipmentStatus = shipmentStatus;
    }

    if (shipmentStatusCode) {
      order.shipmentStatusCode = shipmentStatusCode;
    }

    if (courierName) {
      order.courierName = courierName;
    }

    // 9. Update store order status where appropriate.
    // Courier cancellation/RTO events do not automatically
    // cancel the customer's store order.
    const nextOrderStatus = getNextOrderStatus(
      order.orderStatus,
      shipmentStatus,
      shipmentStatusCode
    );

    if (nextOrderStatus) {
      order.orderStatus =
        nextOrderStatus as typeof order.orderStatus;
    }

    await order.save();

    console.log("Order tracking webhook processed:", {
      orderId: order._id.toString(),
      awb,
      shipmentStatus,
      shipmentStatusCode,
    });

    // 10. Acknowledge successful processing.
    return NextResponse.json({
      success: true,
      message: "Tracking information synchronized successfully.",
    });
  } catch (error) {
    console.error("Order tracking webhook error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process tracking notification.",
      },
      { status: 500 }
    );
  }
}
