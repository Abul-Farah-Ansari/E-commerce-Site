import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import { getShiprocketMode, shiprocketRequest } from "@/lib/shiprocket";
import Order from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LabelResponse = {
  label_created?: number | boolean;
  label_url?: string;
  response?: unknown;
  message?: string;
};

function findHttpsUrl(value: unknown, candidateKeys: string[], depth = 0): string {
  if (!value || typeof value !== "object" || depth > 5) return "";
  const record = value as Record<string, unknown>;

  for (const key of candidateKeys) {
    const candidate = record[key];
    if (typeof candidate === "string" && /^https:\/\//i.test(candidate.trim())) {
      return candidate.trim();
    }
  }

  for (const child of Object.values(record)) {
    if (child && typeof child === "object") {
      const found = findHttpsUrl(child, candidateKeys, depth + 1);
      if (found) return found;
    }
  }

  return "";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    if (!admin.success) {
      return NextResponse.json(
        { success: false, message: admin.message || "Unauthorized" },
        { status: admin.status || 401 }
      );
    }

    const { id } = await context.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid order ID." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({})) as {
      shipmentId?: unknown;
      awbCode?: unknown;
    };

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    if (getShiprocketMode() === "test") {
      // The simulated shipment exists only in this admin page's browser state.
      // Never create or save fake document URLs or document records.
      if (order.shiprocketShipmentId || order.awbCode) {
        return NextResponse.json(
          { success: false, message: "This order has a real saved shipment. Test document simulation is disabled for it." },
          { status: 409 }
        );
      }

      const shipmentId = Number(body.shipmentId);
      const awbCode = String(body.awbCode || "").trim();
      if (!Number.isSafeInteger(shipmentId) || shipmentId <= 0 || !awbCode.startsWith("TEST-AWB-")) {
        return NextResponse.json({ success: false, message: "Complete the simulated shipment and AWB steps first." }, { status: 409 });
      }

      const now = new Date();
      return NextResponse.json(
        {
          success: true,
          mode: "test",
          isTestMode: true,
          message: "TEST MODE: shipping-label generation simulated. No PDF was created and no request was sent to Shiprocket.",
          order: {
            shippingLabelUrl: "",
            shippingLabelGeneratedAt: now.toISOString(),
            shippingLabelSimulated: true,
          },
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!order.shiprocketShipmentId || !order.awbCode) {
      return NextResponse.json({ success: false, message: "Assign the courier and generate an AWB before generating the shipping label." }, { status: 409 });
    }

    if (order.shippingLabelUrl) {
      return NextResponse.json(
        {
          success: true,
          mode: "live",
          message: "A shipping label has already been generated for this shipment.",
          order: {
            shippingLabelUrl: order.shippingLabelUrl,
            shippingLabelGeneratedAt: order.shippingLabelGeneratedAt,
          },
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    const result = await shiprocketRequest<LabelResponse>("/courier/generate/label", {
      method: "POST",
      body: { shipment_id: [order.shiprocketShipmentId] },
    });

    const labelUrl = findHttpsUrl(result, ["label_url", "label_download_url", "url"]);
    if (!labelUrl || result.label_created === 0 || result.label_created === false) {
      const detail = typeof result.response === "string" ? result.response : result.message;
      throw new Error(detail || "Shiprocket did not return a valid shipping-label PDF URL.");
    }

    const now = new Date();
    order.shippingLabelUrl = labelUrl;
    order.shippingLabelGeneratedAt = now;

    const currentStatusCode = Number(order.shipmentStatusCode || 0);
    if (!currentStatusCode || currentStatusCode < 2) {
      order.shipmentStatus = "Label Generated";
      order.shipmentStatusCode = "2";
    }
    order.shipmentEvents = order.shipmentEvents || [];
    order.shipmentEvents.push({
      status: "Label Generated",
      statusCode: "2",
      description: "Shipping label PDF generated in Shiprocket.",
      eventDate: now,
    });
    await order.save();

    return NextResponse.json(
      {
        success: true,
        mode: "live",
        isTestMode: false,
        message: "Shipping label generated successfully.",
        order: {
          shippingLabelUrl: order.shippingLabelUrl,
          shippingLabelGeneratedAt: order.shippingLabelGeneratedAt,
          shipmentStatus: order.shipmentStatus,
          shipmentStatusCode: order.shipmentStatusCode,
          shipmentEvents: order.shipmentEvents,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate Shiprocket shipping label.";
    console.error("SHIPROCKET LABEL GENERATION ERROR:", message);
    return NextResponse.json({ success: false, message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
