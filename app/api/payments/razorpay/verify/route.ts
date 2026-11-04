import { NextResponse } from "next/server";
import crypto from "crypto";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import Order from "@/models/Order";
import { getRazorpayClient } from "@/lib/razorpay";

export const runtime = "nodejs";

/**
 * POST /api/payments/razorpay/verify
 *
 * Verifies the Checkout signature using the Razorpay order ID stored in
 * MongoDB, then independently fetches the payment from Razorpay. An order
 * is marked paid only when the fetched payment is captured and its order,
 * amount and currency match the local order.
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAuth();

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            auth.status === 401
              ? "Please login to verify payment."
              : auth.message,
        },
        { status: auth.status }
      );
    }

    // requireAuth() declares user as optional; narrow it before using it.
    const authenticatedUser = auth.user;
    if (!authenticatedUser) {
      return NextResponse.json(
        { success: false, message: "Please login to verify payment." },
        { status: 401 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { success: false, message: "Razorpay is not configured on the server." },
        { status: 500 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, message: "Payment verification details are incomplete." },
        { status: 400 }
      );
    }

    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body as {
      orderId?: unknown;
      razorpayOrderId?: unknown;
      razorpayPaymentId?: unknown;
      razorpaySignature?: unknown;
    };

    if (
      typeof orderId !== "string" ||
      typeof razorpayOrderId !== "string" ||
      typeof razorpayPaymentId !== "string" ||
      typeof razorpaySignature !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "Payment verification details are incomplete." },
        { status: 400 }
      );
    }

    const cleanOrderId = orderId.trim();
    const cleanRazorpayOrderId = razorpayOrderId.trim();
    const cleanRazorpayPaymentId = razorpayPaymentId.trim();
    const cleanRazorpaySignature = razorpaySignature.trim();

    if (
      !mongoose.Types.ObjectId.isValid(cleanOrderId) ||
      !cleanRazorpayOrderId ||
      !cleanRazorpayPaymentId ||
      !/^[a-f0-9]{64}$/i.test(cleanRazorpaySignature)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid payment verification details." },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findOne({
      _id: cleanOrderId,
      userId: authenticatedUser.id,
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found." },
        { status: 404 }
      );
    }

    if (order.paymentMethod !== "online" || !order.razorpayOrderId) {
      return NextResponse.json(
        { success: false, message: "This order is not configured for Razorpay payment." },
        { status: 400 }
      );
    }

    // Compare the callback order ID against the trusted value stored in MongoDB.
    if (order.razorpayOrderId !== cleanRazorpayOrderId) {
      return NextResponse.json(
        { success: false, message: "Razorpay order ID does not match." },
        { status: 400 }
      );
    }

    // Safe idempotency: only the same already-recorded payment can be retried.
    if (order.paymentStatus === "paid") {
      if (order.razorpayPaymentId !== cleanRazorpayPaymentId) {
        return NextResponse.json(
          { success: false, message: "This order has already been paid using another payment." },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Payment has already been verified.",
        order: {
          id: order._id.toString(),
          total: order.total,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          razorpayOrderId: order.razorpayOrderId,
          razorpayPaymentId: order.razorpayPaymentId,
        },
      });
    }

    // HMAC payload must use the Razorpay order ID stored in our database.
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${order.razorpayOrderId}|${cleanRazorpayPaymentId}`)
      .digest();

    const receivedSignature = Buffer.from(cleanRazorpaySignature, "hex");

    if (
      expectedSignature.length !== receivedSignature.length ||
      !crypto.timingSafeEqual(expectedSignature, receivedSignature)
    ) {
      // Do not mark the order failed on an invalid callback. A forged request
      // must not be able to change a legitimate pending order's state.
      return NextResponse.json(
        { success: false, message: "Payment signature verification failed." },
        { status: 400 }
      );
    }

    // A valid signature alone is not enough: confirm payment with Razorpay.
    const payment = await getRazorpayClient().payments.fetch(cleanRazorpayPaymentId);
    const expectedAmountPaise = Math.round(Number(order.total) * 100);

    if (
      String(payment.order_id || "") !== order.razorpayOrderId ||
      Number(payment.amount) !== expectedAmountPaise ||
      String(payment.currency || "") !== "INR"
    ) {
      return NextResponse.json(
        { success: false, message: "Payment details do not match this order." },
        { status: 400 }
      );
    }

    if (payment.status !== "captured" && payment.captured !== true) {
      return NextResponse.json(
        {
          success: false,
          paymentPending: true,
          message:
            payment.status === "authorized"
              ? "Payment is authorised but not captured yet. Please do not retry the payment; contact support if the amount was debited."
              : "Payment has not been captured by Razorpay yet. Please check the payment status before retrying.",
        },
        { status: 409 }
      );
    }

    const nextOrderStatus =
      order.orderStatus === "pending" ? "confirmed" : order.orderStatus;

    // Conditional update prevents two different payment attempts from both
    // attaching themselves to the same local order.
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: cleanOrderId,
        userId: authenticatedUser.id,
        paymentMethod: "online",
        paymentStatus: { $ne: "paid" },
        razorpayOrderId: order.razorpayOrderId,
      },
      {
        $set: {
          paymentStatus: "paid",
          razorpayPaymentId: cleanRazorpayPaymentId,
          razorpaySignature: cleanRazorpaySignature,
          orderStatus: nextOrderStatus,
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      const latestOrder = await Order.findOne({
        _id: cleanOrderId,
        userId: authenticatedUser.id,
      });

      if (
        latestOrder?.paymentStatus === "paid" &&
        latestOrder.razorpayPaymentId === cleanRazorpayPaymentId
      ) {
        return NextResponse.json({
          success: true,
          message: "Payment has already been verified.",
          order: {
            id: latestOrder._id.toString(),
            total: latestOrder.total,
            paymentStatus: latestOrder.paymentStatus,
            orderStatus: latestOrder.orderStatus,
            razorpayOrderId: latestOrder.razorpayOrderId,
            razorpayPaymentId: latestOrder.razorpayPaymentId,
          },
        });
      }

      return NextResponse.json(
        { success: false, message: "This order has already been updated. Please refresh your orders." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and captured successfully.",
      order: {
        id: updatedOrder._id.toString(),
        total: updatedOrder.total,
        paymentMethod: updatedOrder.paymentMethod,
        paymentStatus: updatedOrder.paymentStatus,
        orderStatus: updatedOrder.orderStatus,
        razorpayOrderId: updatedOrder.razorpayOrderId,
        razorpayPaymentId: updatedOrder.razorpayPaymentId,
      },
    });
  } catch (error) {
    console.error("Razorpay payment verification error:", error);

    if (
      error instanceof Error &&
      (error.message === "AUTH_CONFIG_MISSING" ||
        error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError")
    ) {
      return NextResponse.json(
        { success: false, message: "Your session has expired. Please login again." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "RAZORPAY_CONFIG_MISSING") {
      return NextResponse.json(
        { success: false, message: "Razorpay is not configured on the server." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to verify payment. Please check the payment status in your Razorpay dashboard before trying again." },
      { status: 500 }
    );
  }
}
