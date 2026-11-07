
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import Order from "@/models/Order";
import {
  getShiprocketMode,
  shiprocketRequest,
} from "@/lib/shiprocket";

export const dynamic = "force-dynamic";

type ShiprocketRecord = Record<string, unknown>;

interface NormalizedShipmentEvent {
  status: string;
  statusCode?: string;
  location?: string;
  description?: string;
  eventDate?: Date;
}

function asRecord(value: unknown): ShiprocketRecord {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as ShiprocketRecord;
  }

  return {};
}

function asString(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

  return "";
}

function parseDate(value: unknown): Date | undefined {
  if (!value) return undefined;

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function normalizeEvents(
  activities: unknown
): NormalizedShipmentEvent[] {
  if (!Array.isArray(activities)) return [];

  return activities
    .map((item): NormalizedShipmentEvent | null => {
      const activity = asRecord(item);

      const status =
        asString(activity.status) ||
        asString(activity.activity);

      if (!status) return null;

      const eventDate = parseDate(activity.date);

      return {
        status,
        statusCode:
          asString(activity["sr-status"]) ||
          asString(activity.status_code) ||
          undefined,
        location: asString(activity.location) || undefined,
        description: asString(activity.activity) || undefined,
        eventDate,
      };
    })
    .filter(
      (event): event is NormalizedShipmentEvent => event !== null
    );
}

function eventKey(event: {
  status: string;
  location?: string;
  eventDate?: Date;
}) {
  return [
    event.status.toLowerCase(),
    (event.location || "").toLowerCase(),
    event.eventDate?.toISOString() || "",
  ].join("|");
}

function updateOrderStatus(
  currentStatus: string,
  shipmentStatus: string
): string | null {
  const status = shipmentStatus.toLowerCase();

  if (currentStatus === "cancelled" || currentStatus === "delivered") {
    return null;
  }

  if (
    status.includes("delivered") ||
    status.includes("delivery complete")
  ) {
    return "delivered";
  }

  if (
    status.includes("picked up") ||
    status.includes("in transit") ||
    status.includes("dispatched") ||
    status.includes("out for delivery") ||
    status.includes("reached destination") ||
    status.includes("shipped")
  ) {
    return "shipped";
  }

  return null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate customer.
    const auth = await requireAuth();

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            auth.status === 401
              ? "Please login first."
              : auth.message,
        },
        { status: auth.status }
      );
    }

    const authenticatedUser = auth.user;

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        { status: 401 }
      );
    }

    // 2. Validate order ID.
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // 3. Only find orders belonging to the logged-in customer.
    const order = await Order.findOne({
      _id: id,
      userId: authenticatedUser.id,
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    // 4. Tracking requires a real Shiprocket shipment and AWB.
    if (!order.awbCode?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Shipment tracking is not available yet. Your courier AWB number has not been assigned.",
        },
        { status: 409 }
      );
    }

    // 5. Never call the real Shiprocket tracking API in test mode.
    if (getShiprocketMode() !== "live") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Live Shiprocket tracking is disabled. Configure SHIPROCKET_MODE=live on the server after verifying your production setup.",
        },
        { status: 409 }
      );
    }

    // 6. Fetch tracking by AWB from Shiprocket.
    const awbCode = order.awbCode.trim();

    const response = await shiprocketRequest<unknown>(
      `/courier/track/awb/${encodeURIComponent(awbCode)}`
    );

    const root = asRecord(response);
    const trackingData = asRecord(root.tracking_data);

    if (!Object.keys(trackingData).length) {
      return NextResponse.json(
        {
          success: false,
          message:
            asString(root.message) ||
            "Shiprocket did not return tracking information.",
        },
        { status: 502 }
      );
    }

    if (
      trackingData.error &&
      asString(trackingData.error)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: asString(trackingData.error),
        },
        { status: 502 }
      );
    }

    // 7. Read the latest tracking status.
    const shipmentTracks = Array.isArray(
      trackingData.shipment_track
    )
      ? trackingData.shipment_track
      : [];

    const latestTrack = asRecord(shipmentTracks[0]);

    const latestStatus =
      asString(trackingData.shipment_status) ||
      asString(latestTrack.current_status) ||
      asString(trackingData.current_status);

    const latestStatusCode =
      asString(trackingData.shipment_status_id) ||
      asString(latestTrack.status_code);

    // 8. Normalize shipment activities.
    const incomingEvents = normalizeEvents(
      trackingData.shipment_track_activities
    );

    // Avoid overwriting useful stored information with empty responses.
    if (!latestStatus && incomingEvents.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Shiprocket has not published any tracking updates for this AWB yet.",
        },
        { status: 502 }
      );
    }

    // 9. Merge events without creating duplicates.
    const existingEvents = order.shipmentEvents || [];

    const eventMap = new Map<string, NormalizedShipmentEvent>();

    for (const event of existingEvents) {
      eventMap.set(eventKey(event), {
        status: event.status,
        statusCode: event.statusCode,
        location: event.location,
        description: event.description,
        eventDate: event.eventDate,
      });
    }

    for (const event of incomingEvents) {
      eventMap.set(eventKey(event), event);
    }

    order.shipmentEvents = Array.from(eventMap.values())
      .sort(
        (a, b) =>
          (a.eventDate?.getTime() || 0) -
          (b.eventDate?.getTime() || 0)
      )
      .slice(-100) as typeof order.shipmentEvents;

    // 10. Update current shipment information.
    if (latestStatus) {
      order.shipmentStatus = latestStatus;
    }

    if (latestStatusCode) {
      order.shipmentStatusCode = latestStatusCode;
    }

    const trackingUrl = asString(trackingData.track_url);

    if (trackingUrl) {
      order.trackingUrl = trackingUrl;
    }

    const courierName = asString(latestTrack.courier_name);

    if (courierName) {
      order.courierName = courierName;
    }

    // 11. Update the store order status without downgrading it.
    if (latestStatus) {
      const nextOrderStatus = updateOrderStatus(
        order.orderStatus,
        latestStatus
      );

      if (nextOrderStatus) {
        order.orderStatus = nextOrderStatus as typeof order.orderStatus;
      }
    }

    await order.save();

    // 12. Return only the tracking information needed by the customer.
    return NextResponse.json(
      {
        success: true,
        message: "Tracking information updated successfully.",
        tracking: {
          awbCode: order.awbCode,
          courierName: order.courierName,
          trackingUrl: order.trackingUrl,
          shipmentStatus: order.shipmentStatus,
          shipmentStatusCode: order.shipmentStatusCode,
          orderStatus: order.orderStatus,
          shipmentEvents: order.shipmentEvents,
          updatedAt: order.updatedAt,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Customer Shiprocket tracking error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to retrieve shipment tracking.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 502 }
    );
  }
}
