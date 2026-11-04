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
import Product from "@/models/Product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const toNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
};

function getNameParts(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts.shift() || "Customer",
    lastName: parts.join(" "),
  };
}

function getShiprocketOrderDate(value: Date | string) {
  const date = new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "00";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}`;
}

function normalizeCouriers(payload: unknown) {
  const root = payload as {
    data?: { available_courier_companies?: unknown[] };
    available_courier_companies?: unknown[];
  };
  const rows = root?.data?.available_courier_companies || root?.available_courier_companies || [];

  return rows.map((raw) => {
    const courier = raw as Record<string, unknown>;
    return {
      courierId: Number(courier.courier_company_id || courier.courier_id || 0),
      courierName: String(courier.courier_name || courier.name || "Courier"),
      freightCharge: Number.isFinite(Number(courier.freight_charge)) ? Number(courier.freight_charge) : undefined,
      estimatedDeliveryDays: courier.estimated_delivery_days != null ? String(courier.estimated_delivery_days) : undefined,
      rating: Number.isFinite(Number(courier.rating)) ? Number(courier.rating) : undefined,
      etd: courier.etd != null ? String(courier.etd) : undefined,
    };
  }).filter((courier) => courier.courierId > 0);
}

async function getCourierOptions(order: {
  shippingAddress: { pincode: string };
  paymentMethod: "cod" | "online";
  parcelDetails?: { weight: number };
}) {
  const pickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE?.trim();
  if (!pickupPostcode || !/^\d{6}$/.test(pickupPostcode)) {
    throw new Error("Set SHIPROCKET_PICKUP_POSTCODE in .env.local to the 6-digit pincode of your selected Shiprocket pickup address.");
  }
  if (!order.parcelDetails?.weight) {
    throw new Error("Parcel weight is missing from this order.");
  }

  const query = new URLSearchParams({
    pickup_postcode: pickupPostcode,
    delivery_postcode: String(order.shippingAddress.pincode).trim(),
    weight: String(order.parcelDetails.weight),
    cod: order.paymentMethod === "cod" ? "1" : "0",
  });
  const result = await shiprocketRequest<unknown>(`/courier/serviceability/?${query.toString()}`);
  return normalizeCouriers(result);
}

export async function GET(
  _request: Request,
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

    await connectDB();
    const order = await Order.findById(id).lean();
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    if (getShiprocketMode() === "test") {
      if (order.shiprocketShipmentId) {
        return NextResponse.json(
          { success: false, message: "This order already has a saved shipment. Test courier simulation will not be used for an existing shipment." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: true, mode: "test", couriers: TEST_SHIPROCKET_COURIERS },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!order.shiprocketShipmentId || !order.parcelDetails) {
      return NextResponse.json({ success: false, message: "Create the Shiprocket order first." }, { status: 409 });
    }

    const couriers = await getCourierOptions(order as never);
    return NextResponse.json(
      { success: true, mode: "live", couriers },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load Shiprocket couriers.";
    console.error("SHIPROCKET COURIER SERVICEABILITY ERROR:", message);
    return NextResponse.json({ success: false, message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}

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

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON request body." }, { status: 400 });
    }

    const parcelDetails = {
      length: toNumber(body.length),
      breadth: toNumber(body.breadth),
      height: toNumber(body.height),
      weight: toNumber(body.weight),
    };

    if (
      parcelDetails.length <= 0.5 ||
      parcelDetails.breadth <= 0.5 ||
      parcelDetails.height <= 0.5 ||
      parcelDetails.weight <= 0 ||
      !Object.values(parcelDetails).every(Number.isFinite)
    ) {
      return NextResponse.json(
        { success: false, message: "Package dimensions must be greater than 0.5 cm and weight must be greater than 0 kg." },
        { status: 400 }
      );
    }

    await connectDB();
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found." }, { status: 404 });
    }

    if (order.orderStatus === "cancelled" || order.orderStatus === "delivered" || order.orderStatus === "shipped") {
      return NextResponse.json({ success: false, message: `A ${order.orderStatus} order cannot have a new shipment created.` }, { status: 409 });
    }
    if (order.orderStatus !== "confirmed" && order.orderStatus !== "processing") {
      return NextResponse.json({ success: false, message: "Confirm the order or move it to Processing before creating its Shiprocket order." }, { status: 409 });
    }
    if (order.paymentMethod === "online" && order.paymentStatus !== "paid") {
      return NextResponse.json({ success: false, message: "Online payment must be paid before creating a shipment." }, { status: 409 });
    }
    if (order.shiprocketShipmentId) {
      return NextResponse.json({ success: false, message: "A shipment is already saved for this order." }, { status: 409 });
    }
    if (order.shiprocketCreateInProgress) {
      return NextResponse.json({ success: false, message: "Shiprocket order creation is already in progress. Refresh the order before retrying." }, { status: 409 });
    }

    const phoneDigits = String(order.customer.phone || "").replace(/\D/g, "").slice(-10);
    if (phoneDigits.length !== 10) {
      return NextResponse.json({ success: false, message: "Customer phone number must contain a valid 10-digit Indian mobile number." }, { status: 400 });
    }
    if (!/^\d{6}$/.test(String(order.shippingAddress.pincode || ""))) {
      return NextResponse.json({ success: false, message: "Customer delivery pincode must be a valid 6-digit pincode." }, { status: 400 });
    }
    if (!order.customer.email || !order.customer.email.includes("@")) {
      return NextResponse.json({ success: false, message: "A valid customer email is required by Shiprocket." }, { status: 400 });
    }

    if (getShiprocketMode() === "test") {
      // Deliberately do not save anything to MongoDB and do not call Shiprocket.
      const now = new Date();
      const seed = Date.now() + Number.parseInt(order._id.toString().slice(-6), 16);
      const simulatedOrderId = 900000000000 + (seed % 100000000);
      const simulatedShipmentId = 800000000000 + (seed % 100000000);
      const testOrderReference = `TEST-${order._id.toString().slice(-8).toUpperCase()}`;

      return NextResponse.json(
        {
          success: true,
          mode: "test",
          isTestMode: true,
          message: "TEST MODE: shipment order simulated successfully. Nothing was sent to Shiprocket or saved to your order.",
          order: {
            _id: order._id.toString(),
            parcelDetails,
            shiprocketOrderReference: testOrderReference,
            shiprocketOrderId: simulatedOrderId,
            shiprocketShipmentId: simulatedShipmentId,
            shipmentStatus: "TEST ORDER CREATED",
            shipmentStatusCode: "TEST",
            shipmentCreatedAt: now.toISOString(),
            pickupScheduledAt: undefined,
            pickupTokenNumber: "",
            shipmentEvents: [{
              status: "TEST ORDER CREATED",
              statusCode: "TEST",
              description: "Local simulation only. This is not a real Shiprocket shipment.",
              eventDate: now.toISOString(),
            }],
            updatedAt: now.toISOString(),
          },
          couriers: TEST_SHIPROCKET_COURIERS,
        },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }

    const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION?.trim();
    const pickupPostcode = process.env.SHIPROCKET_PICKUP_POSTCODE?.trim();
    if (!pickupLocation) {
      return NextResponse.json(
        { success: false, message: "Add SHIPROCKET_PICKUP_LOCATION to .env.local. It must exactly match a pickup location already saved in your Shiprocket account." },
        { status: 500 }
      );
    }
    if (!pickupPostcode || !/^\d{6}$/.test(pickupPostcode)) {
      return NextResponse.json(
        { success: false, message: "Add SHIPROCKET_PICKUP_POSTCODE to .env.local using the 6-digit pincode of that pickup location." },
        { status: 500 }
      );
    }

    // Live mode begins here. This request creates a real order in Shiprocket.
    const externalOrderReference = order.shiprocketOrderReference || BigInt(`0x${order._id.toString()}`).toString();
    order.parcelDetails = parcelDetails;
    order.shiprocketOrderReference = externalOrderReference;
    order.shiprocketCreateInProgress = true;
    await order.save();

    try {
      const name = getNameParts(order.customer.name || "Customer");
      const products = await Product.find({
        _id: { $in: order.items.map((item) => item.productId).filter((value) => mongoose.Types.ObjectId.isValid(value)) },
      }).select("_id sku").lean();
      const skuMap = new Map<string, string>(
        products.map((product) => [product._id.toString(), String(product.sku)] as [string, string])
      );

      const shiprocketOrder = await shiprocketRequest<{
        order_id?: number | string;
        shipment_id?: number | string;
        status?: string;
        status_code?: number | string;
        awb_code?: string;
        courier_company_id?: number | string;
        courier_name?: string;
      }>("/orders/create/adhoc", {
        method: "POST",
        body: {
          order_id: externalOrderReference,
          order_date: getShiprocketOrderDate(order.createdAt),
          pickup_location: pickupLocation,
          comment: `House Of Orive order ${order._id.toString()}`,
          billing_customer_name: name.firstName,
          billing_last_name: name.lastName,
          billing_address: order.shippingAddress.address,
          billing_city: order.shippingAddress.city,
          billing_pincode: Number(order.shippingAddress.pincode),
          billing_state: order.shippingAddress.state,
          billing_country: "India",
          billing_email: order.customer.email,
          billing_phone: Number(phoneDigits),
          shipping_is_billing: true,
          order_items: order.items.map((item) => ({
            name: item.name,
            sku: skuMap.get(item.productId) || item.productId,
            units: item.quantity,
            selling_price: Number(item.price),
            discount: 0,
          })),
          payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
          shipping_charges: Number(order.shipping || 0),
          giftwrap_charges: 0,
          transaction_charges: 0,
          total_discount: 0,
          sub_total: Number(order.subtotal),
          length: parcelDetails.length,
          breadth: parcelDetails.breadth,
          height: parcelDetails.height,
          weight: parcelDetails.weight,
        },
      });

      const shiprocketOrderId = Number(shiprocketOrder.order_id);
      const shiprocketShipmentId = Number(shiprocketOrder.shipment_id);
      if (!Number.isFinite(shiprocketOrderId) || shiprocketOrderId <= 0 || !Number.isFinite(shiprocketShipmentId) || shiprocketShipmentId <= 0) {
        throw new Error("Shiprocket did not return a valid order ID and shipment ID. Check the Shiprocket dashboard before trying again to avoid duplicate orders.");
      }

      order.shiprocketOrderId = shiprocketOrderId;
      order.shiprocketShipmentId = shiprocketShipmentId;
      order.shipmentStatus = String(shiprocketOrder.status || "NEW");
      order.shipmentStatusCode = String(shiprocketOrder.status_code ?? "1");
      order.shipmentCreatedAt = new Date();
      order.shiprocketCreateInProgress = false;
      if (shiprocketOrder.awb_code) order.awbCode = shiprocketOrder.awb_code;
      if (shiprocketOrder.courier_company_id) order.courierCompanyId = Number(shiprocketOrder.courier_company_id);
      if (shiprocketOrder.courier_name) order.courierName = shiprocketOrder.courier_name;
      order.shipmentEvents = order.shipmentEvents || [];
      order.shipmentEvents.push({
        status: String(shiprocketOrder.status || "NEW"),
        statusCode: String(shiprocketOrder.status_code ?? "1"),
        description: "Order created in Shiprocket. Courier assignment is pending.",
        eventDate: new Date(),
      });
      await order.save();

      let couriers: ReturnType<typeof normalizeCouriers> = [];
      let courierWarning = "";
      try {
        couriers = await getCourierOptions(order as never);
        if (couriers.length === 0) courierWarning = "Shiprocket created the order, but no courier is currently serviceable for this route and package.";
      } catch (error) {
        courierWarning = error instanceof Error ? error.message : "Courier serviceability could not be checked.";
      }

      return NextResponse.json(
        {
          success: true,
          mode: "live",
          isTestMode: false,
          message: "Shiprocket order created. Choose a courier to generate the AWB.",
          order: {
            _id: order._id.toString(),
            parcelDetails: order.parcelDetails,
            shiprocketOrderReference: order.shiprocketOrderReference,
            shiprocketOrderId: order.shiprocketOrderId,
            shiprocketShipmentId: order.shiprocketShipmentId,
            awbCode: order.awbCode,
            courierCompanyId: order.courierCompanyId,
            courierName: order.courierName,
            trackingUrl: order.trackingUrl,
            shipmentStatus: order.shipmentStatus,
            shipmentStatusCode: order.shipmentStatusCode,
            shipmentCreatedAt: order.shipmentCreatedAt,
            pickupScheduledAt: order.pickupScheduledAt,
            pickupTokenNumber: order.pickupTokenNumber,
            shipmentEvents: order.shipmentEvents,
            updatedAt: order.updatedAt,
          },
          couriers,
          courierWarning,
        },
        { status: 201, headers: { "Cache-Control": "no-store" } }
      );
    } catch (error) {
      order.shiprocketCreateInProgress = false;
      await order.save().catch((saveError) => console.error("SHIPROCKET LOCK RESET ERROR:", saveError));
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create Shiprocket order.";
    console.error("SHIPROCKET ORDER CREATION ERROR:", message);
    return NextResponse.json({ success: false, message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
