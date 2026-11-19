
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import AdminNotification from "@/models/AdminNotification";

const CANCELLABLE_ORDER_STATUSES = ["pending", "confirmed"] as const;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const auth = await requireAuth();

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          message: auth.status === 401 ? "Please login first." : auth.message,
        },
        { status: auth.status }
      );
    }

    const authenticatedUser = auth.user;

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({
      _id: id,
      userId: authenticatedUser.id,
    }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          ...order,
          _id: order._id.toString(),
          userId: order.userId.toString(),
          createdAt: order.createdAt.toISOString(),
          updatedAt: order.updatedAt.toISOString(),
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Get single order error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load order." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  let session: mongoose.ClientSession | null = null;
  let committed = false;

  try {
    const auth = await requireAuth();

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          message: auth.status === 401 ? "Please login first." : auth.message,
        },
        { status: auth.status }
      );
    }

    const authenticatedUser = auth.user;

    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID." },
        { status: 400 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid cancellation request." },
        { status: 400 }
      );
    }

    const input = body as Record<string, unknown>;

    if (
      input.reason !== undefined &&
      typeof input.reason !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Cancellation reason must be text." },
        { status: 400 }
      );
    }

    const cancellationReason =
      typeof input.reason === "string" ? input.reason.trim() : "";

    if (cancellationReason.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message: "Cancellation reason cannot exceed 500 characters.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    session = await mongoose.startSession();
    session.startTransaction();

    const order = await Order.findOne({
      _id: id,
      userId: authenticatedUser.id,
    }).session(session);

    if (!order) {
      await session.abortTransaction();

      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    if (order.orderStatus === "cancelled") {
      await session.abortTransaction();

      return NextResponse.json(
        { success: false, message: "This order is already cancelled." },
        { status: 409 }
      );
    }

    if (
      !CANCELLABLE_ORDER_STATUSES.includes(
        order.orderStatus as (typeof CANCELLABLE_ORDER_STATUSES)[number]
      )
    ) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message:
            "This order can only be cancelled before preparation begins.",
        },
        { status: 409 }
      );
    }

    /*
     * If Shiprocket shipment creation is actively running,
     * block cancellation to avoid a race condition.
     *
     * If a shipment already exists, cancellation is allowed.
     * The shipment will NOT be cancelled automatically.
     */

    if (order.shiprocketCreateInProgress) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message:
            "Your shipment is currently being created. Please wait and contact support if you still need to cancel your order.",
        },
        { status: 409 }
      );
    }

    if (order.stockRestoredAt) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message: "Stock has already been restored for this order.",
        },
        { status: 409 }
      );
    }

    const shipmentNeedsManualCancellation = Boolean(
      order.shiprocketOrderId ||
      order.shiprocketShipmentId ||
      order.awbCode?.trim()
    );

    const cancelledAt = new Date();

    /*
     * Conditional update prevents duplicate cancellation
     * and duplicate stock restoration.
     *
     * Existing Shiprocket IDs are intentionally NOT
     * restricted here. The store order can be cancelled
     * without automatically cancelling the shipment.
     */

    const updated = await Order.updateOne(
      {
        _id: order._id,
        userId: authenticatedUser.id,
        orderStatus: { $in: [...CANCELLABLE_ORDER_STATUSES] },
        stockRestoredAt: null,
        shiprocketCreateInProgress: { $ne: true },
      },
      {
        $set: {
          orderStatus: "cancelled",
          cancellationReason,
          cancelledAt,
          cancelledBy: "customer",
          stockRestoredAt: cancelledAt,
        },
      },
      { session }
    );

    if (updated.modifiedCount !== 1) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message:
            "Order status changed while cancellation was being processed. Please refresh and try again.",
        },
        { status: 409 }
      );
    }

    /*
     * Restore product stock inside the same transaction.
     */

    for (const item of order.items) {
      const productId = String(item.productId || "").trim();
      const quantity = Number(item.quantity);

      if (
        !mongoose.Types.ObjectId.isValid(productId) ||
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message: `Invalid product or quantity for "${item.name}".`,
          },
          { status: 400 }
        );
      }

      const product = await Product.findByIdAndUpdate(
        productId,
        { $inc: { stock: quantity } },
        { new: true, session }
      );

      if (!product) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              `Product "${item.name}" could not be found. Cancellation was not completed.`,
          },
          { status: 409 }
        );
      }
    }

    /*
     * Commit order cancellation and stock restoration together.
     */

    await session.commitTransaction();
    committed = true;

    /*
     * Notify admin after successful transaction.
     */

    try {
      await AdminNotification.create({
        type: "customer_cancellation",
        title: "Customer Cancelled Order",
        message:
          `${order.customer.name} (${order.customer.email}) cancelled order #${order._id.toString()} for ₹${Number(order.total).toLocaleString("en-IN")}.`,
        orderId: order._id,
        isRead: false,
      });
    } catch (notificationError) {
      console.error(
        "CUSTOMER CANCELLATION NOTIFICATION ERROR:",
        notificationError
      );
    }

    /*
     * Build an honest customer response.
     * No Shiprocket cancellation or Razorpay refund
     * is initiated by this endpoint.
     */

    let message =
      "Order cancelled successfully. Product stock has been restored.";

    if (shipmentNeedsManualCancellation) {
      message +=
        " Your Shiprocket shipment has not been cancelled automatically. Our team needs to handle it manually.";
    }

    if (
      order.paymentMethod === "online" &&
      order.paymentStatus === "paid"
    ) {
      message +=
        " Your online payment has not been refunded automatically. Please contact our team regarding your refund.";
    }

    return NextResponse.json({
      success: true,
      message,
      shipmentNeedsManualCancellation,
      refundRequiresManualHandling:
        order.paymentMethod === "online" &&
        order.paymentStatus === "paid",
      order: {
        id: order._id.toString(),
        orderStatus: "cancelled",
        cancellationReason,
        cancelledAt,
        cancelledBy: "customer",
        stockRestoredAt: cancelledAt,
      },
    });
  } catch (error) {
    console.error("Customer cancel order error:", error);

    if (!committed && session?.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (rollbackError) {
        console.error("Cancellation rollback error:", rollbackError);
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to cancel order.",
      },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
