import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import { getShiprocketMode, shiprocketRequest } from "@/lib/shiprocket";
import Order from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ManifestResponse = {
  manifest_id?: number | string;
  manifest_url?: string;
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

function findPositiveId(value: unknown, candidateKeys: string[], depth = 0): number | undefined {
  if (!value || typeof value !== "object" || depth > 5) return undefined;
  const record = value as Record<string, unknown>;

  for (const key of candidateKeys) {
    const candidate = Number(record[key]);
    if (Number.isSafeInteger(candidate) && candidate > 0) return candidate;
  }

  for (const child of Object.values(record)) {
    if (child && typeof child === "object") {
      const found = findPositiveId(child, candidateKeys, depth + 1);
      if (found) return found;
    }
  }

  return undefined;
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
      pickupScheduledAt?: unknown;
    };

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    if (getShiprocketMode() === "test") {
      // The simulated shipment and pickup exist only in the browser state.
      if (order.shiprocketShipmentId || order.awbCode || order.pickupScheduledAt) {
        return NextResponse.json(
          { success: false, message: "This order has a real saved shipment or pickup. Test manifest simulation is disabled for it." },
          { status: 409 }
        );
      }

      const shipmentId = Number(body.shipmentId);
      const awbCode = String(body.awbCode || "").trim();
      const pickupDate = new Date(String(body.pickupScheduledAt || ""));
      if (!Number.isSafeInteger(shipmentId) || shipmentId <= 0 || !awbCode.startsWith("TEST-AWB-") || Number.isNaN(pickupDate.getTime())) {
        return NextResponse.json({ success: false, message: "Complete the simulated AWB and pickup steps before simulating a manifest." }, { status: 409 });
      }

      const now = new Date();
      return NextResponse.json(
        {
          success: true,
          mode: "test",
          isTestMode: true,
          message: "TEST MODE: manifest generation simulated. No PDF was created and no request was sent to Shiprocket.",
          order: {
            shiprocketManifestId: undefined,
            manifestUrl: "",
            manifestGeneratedAt: now.toISOString(),
            manifestSimulated: true,
          },
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!order.shiprocketShipmentId || !order.awbCode || !order.pickupScheduledAt || !order.shiprocketOrderId) {
      return NextResponse.json({ success: false, message: "A real AWB, Shiprocket order ID and successful pickup request are required before generating the manifest." }, { status: 409 });
    }

    if (order.manifestUrl) {
      return NextResponse.json(
        {
          success: true,
          mode: "live",
          message: "A manifest has already been generated for this shipment.",
          order: {
            shiprocketManifestId: order.shiprocketManifestId,
            manifestUrl: order.manifestUrl,
            manifestGeneratedAt: order.manifestGeneratedAt,
          },
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    let manifestUrl = "";
    let manifestId = order.shiprocketManifestId;

    // Reuse a manifest ID from an earlier attempt instead of creating duplicates.
    if (!manifestId) {
      const generated = await shiprocketRequest<ManifestResponse>("/manifests/generate", {
        method: "POST",
        body: { shipment_id: [order.shiprocketShipmentId] },
      });

      manifestId = findPositiveId(generated, ["manifest_id"]);
      manifestUrl = findHttpsUrl(generated, ["manifest_url", "manifest_download_url", "url"]);

      if (manifestId) {
        order.shiprocketManifestId = manifestId;
        await order.save();
      }
    }

    // Newer Shiprocket docs print by manifest `ids`; older accounts/docs may still expose `order_ids`.
    if (!manifestUrl) {
      const printBody = manifestId
        ? { ids: [manifestId] }
        : { order_ids: [order.shiprocketOrderId] };
      const printed = await shiprocketRequest<ManifestResponse>("/manifests/print", {
        method: "POST",
        body: printBody,
      });
      manifestUrl = findHttpsUrl(printed, ["manifest_url", "manifest_download_url", "url", "print_url"]);
    }

    if (!manifestUrl) {
      throw new Error("Shiprocket created or located the manifest, but did not return a PDF URL. Check the Shiprocket dashboard before retrying.");
    }

    const now = new Date();
    order.shiprocketManifestId = manifestId;
    order.manifestUrl = manifestUrl;
    order.manifestGeneratedAt = now;

    const currentStatusCode = Number(order.shipmentStatusCode || 0);
    if (!currentStatusCode || currentStatusCode < 5) {
      order.shipmentStatus = "Manifest Generated";
      order.shipmentStatusCode = "5";
    }
    order.shipmentEvents = order.shipmentEvents || [];
    order.shipmentEvents.push({
      status: "Manifest Generated",
      statusCode: "5",
      description: "Pickup manifest PDF generated in Shiprocket.",
      eventDate: now,
    });
    await order.save();

    return NextResponse.json(
      {
        success: true,
        mode: "live",
        isTestMode: false,
        message: "Pickup manifest generated successfully.",
        order: {
          shiprocketManifestId: order.shiprocketManifestId,
          manifestUrl: order.manifestUrl,
          manifestGeneratedAt: order.manifestGeneratedAt,
          shipmentStatus: order.shipmentStatus,
          shipmentStatusCode: order.shipmentStatusCode,
          shipmentEvents: order.shipmentEvents,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate Shiprocket manifest.";
    console.error("SHIPROCKET MANIFEST GENERATION ERROR:", message);
    return NextResponse.json({ success: false, message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
