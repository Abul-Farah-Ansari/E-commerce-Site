
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import AdminNotification from "@/models/AdminNotification";

const CANCELLABLE_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
] as const;

/* =========================================================
   GET SINGLE ORDER
========================================================= */

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
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
      userId: auth.user.id,
    }).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        _id: order._id.toString(),
        userId: order.userId.toString(),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Get single order error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load order." },
      { status: 500 }
    );
  }
}

/* =========================================================
   CUSTOMER CANCEL ORDER
   PATCH /api/orders/[id]
========================================================= */

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let session: mongoose.ClientSession | null = null;

  try {
    // 1. Authenticate customer
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

    // 2. Validate order ID
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID." },
        { status: 400 }
      );
    }

    // 3. Connect and start transaction
    await connectDB();

    session = await mongoose.startSession();
    session.startTransaction();

    // 4. Find only this customer's order
    const order = await Order.findOne({
      _id: id,
      userId: auth.user.id,
    }).session(session);

    if (!order) {
      await session.abortTransaction();

      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    // 5. Check whether cancellation is allowed
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
            "This order can no longer be cancelled because it has been shipped or delivered.",
        },
        { status: 400 }
      );
    }

    // 6. Restore stock within the same transaction
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

    // 7. Cancel order in the same transaction
    order.orderStatus = "cancelled";

    await order.save({ session });
    await session.commitTransaction();

    // 8. Notify admin only after successful cancellation
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

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully. Product stock has been restored.",
      order: {
        id: order._id.toString(),
        orderStatus: order.orderStatus,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Customer cancel order error:", error);

    if (session?.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (rollbackError) {
        console.error("Cancellation rollback error:", rollbackError);
      }
    }

    return NextResponse.json(
      { success: false, message: "Unable to cancel order." },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}
