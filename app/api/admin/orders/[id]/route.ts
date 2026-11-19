import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireAdmin } from "@/lib/adminAuth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import AdminNotification from "@/models/AdminNotification";

/* =========================================================
   VALID STATUSES
========================================================= */

const VALID_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const VALID_PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
] as const;

const CANCELLABLE_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
] as const;

type OrderStatus = (typeof VALID_ORDER_STATUSES)[number];
type PaymentStatus = (typeof VALID_PAYMENT_STATUSES)[number];

type RouteContext = {
  params: Promise<{ id: string }>;
};

/* =========================================================
   UPDATE ORDER / PAYMENT STATUS
   PUT /api/admin/orders/[id]
========================================================= */

export async function PUT(
  request: Request,
  context: RouteContext
) {
  let session: mongoose.ClientSession | null = null;
  let committed = false;

  try {
    /* =====================================================
       1. ADMIN AUTHENTICATION
    ===================================================== */

    const admin = await requireAdmin();

    if (!admin.success) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message || "Unauthorized",
        },
        {
          status: admin.status || 401,
        }
      );
    }

    /* =====================================================
       2. VALIDATE ORDER ID
    ===================================================== */

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

    /* =====================================================
       3. READ REQUEST BODY
    ===================================================== */

    let body: {
      orderStatus?: unknown;
      paymentStatus?: unknown;
      cancellationReason?: unknown;
      reason?: unknown;
    };

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

    const hasOrderStatus = body.orderStatus !== undefined;
    const hasPaymentStatus = body.paymentStatus !== undefined;

    if (!hasOrderStatus && !hasPaymentStatus) {
      return NextResponse.json(
        {
          success: false,
          message: "Provide orderStatus or paymentStatus.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       4. VALIDATE REQUESTED STATUSES
    ===================================================== */

    let requestedOrderStatus: OrderStatus | undefined;
    let requestedPaymentStatus: PaymentStatus | undefined;

    if (hasOrderStatus) {
      const value = String(body.orderStatus || "").trim();

      if (
        !VALID_ORDER_STATUSES.includes(value as OrderStatus)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid order status.",
          },
          { status: 400 }
        );
      }

      requestedOrderStatus = value as OrderStatus;
    }

    if (hasPaymentStatus) {
      const value = String(body.paymentStatus || "").trim();

      if (
        !VALID_PAYMENT_STATUSES.includes(value as PaymentStatus)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid payment status.",
          },
          { status: 400 }
        );
      }

      requestedPaymentStatus = value as PaymentStatus;
    }

    /* =====================================================
       5. VALIDATE CANCELLATION REASON
    ===================================================== */

    const cancellationRequested =
      requestedOrderStatus === "cancelled";

    const rawReason =
      body.cancellationReason !== undefined
        ? body.cancellationReason
        : body.reason;

    if (
      cancellationRequested &&
      rawReason !== undefined &&
      typeof rawReason !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Cancellation reason must be text.",
        },
        { status: 400 }
      );
    }

    const cancellationReason =
      typeof rawReason === "string" ? rawReason.trim() : "";

    if (cancellationReason.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message: "Cancellation reason cannot exceed 500 characters.",
        },
        { status: 400 }
      );
    }

    /* =====================================================
       6. START DATABASE TRANSACTION
    ===================================================== */

    session = await mongoose.startSession();
    session.startTransaction();

    /* =====================================================
       7. FIND ORDER
    ===================================================== */

    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    const previousOrderStatus = order.orderStatus;
    const previousPaymentStatus = order.paymentStatus;

    let orderStatusChanged = false;
    let paymentStatusChanged = false;

    /* =====================================================
       8. VALIDATE ORDER STATUS TRANSITION
    ===================================================== */

    if (requestedOrderStatus) {
      if (order.orderStatus === "delivered") {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message: "A delivered order cannot be changed.",
          },
          { status: 400 }
        );
      }

      if (order.orderStatus === "cancelled") {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message: "A cancelled order cannot be changed.",
          },
          { status: 400 }
        );
      }

      if (requestedOrderStatus !== order.orderStatus) {
        if (cancellationRequested) {
          const canCancel = CANCELLABLE_ORDER_STATUSES.includes(
            order.orderStatus as
              (typeof CANCELLABLE_ORDER_STATUSES)[number]
          );

          if (!canCancel) {
            await session.abortTransaction();

            return NextResponse.json(
              {
                success: false,
                message: `A ${order.orderStatus} order cannot be cancelled.`,
              },
              { status: 400 }
            );
          }

          /*
           * IMPORTANT:
           * Do not cancel while Shiprocket order creation
           * is running. This prevents a race condition
           * between shipment creation and cancellation.
           */
          if (order.shiprocketCreateInProgress === true) {
            await session.abortTransaction();

            return NextResponse.json(
              {
                success: false,
                message:
                  "Shiprocket shipment creation is currently in progress. Please wait for it to finish before cancelling this order.",
              },
              { status: 409 }
            );
          }

          if (order.stockRestoredAt) {
            await session.abortTransaction();

            return NextResponse.json(
              {
                success: false,
                message: "Product stock has already been restored.",
              },
              { status: 409 }
            );
          }

          orderStatusChanged = true;
        } else {
          order.orderStatus = requestedOrderStatus;
          orderStatusChanged = true;
        }
      }
    }

    /* =====================================================
       9. VALIDATE PAYMENT STATUS
    ===================================================== */

    if (requestedPaymentStatus) {
      if (order.paymentStatus !== requestedPaymentStatus) {
        order.paymentStatus = requestedPaymentStatus;
        paymentStatusChanged = true;
      }
    }

    /* =====================================================
       10. HANDLE ADMIN CANCELLATION
    ===================================================== */

    let cancelledAt: Date | undefined;
    let shipmentNeedsManualCancellation = false;

    if (cancellationRequested && orderStatusChanged) {
      const currentStatus = order.orderStatus;

      // Shiprocket is NOT called automatically.
      // The admin must handle an existing shipment manually.
      shipmentNeedsManualCancellation = Boolean(
        order.shiprocketCreateInProgress ||
        order.shiprocketOrderId ||
        order.shiprocketShipmentId ||
        order.awbCode?.trim()
      );

      cancelledAt = new Date();

      /*
       * Atomically claim cancellation.
       *
       * IMPORTANT:
       * shiprocketCreateInProgress must not be true.
       *
       * This database condition protects against a
       * concurrent Shiprocket creation request that
       * starts after the order was initially read.
       *
       * Stock restoration and cancellation happen
       * inside the same transaction.
       */

      const updateResult = await Order.updateOne(
        {
          _id: order._id,
          orderStatus: currentStatus,

          // Critical Shiprocket race-condition protection.
          shiprocketCreateInProgress: { $ne: true },

          stockRestoredAt: null,
        },
        {
          $set: {
            orderStatus: "cancelled",
            cancellationReason,
            cancelledAt,
            cancelledBy: "admin",
            stockRestoredAt: cancelledAt,

            ...(paymentStatusChanged
              ? { paymentStatus: order.paymentStatus }
              : {}),
          },
        },
        { session }
      );

      if (updateResult.modifiedCount !== 1) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              "Order was modified by another request or Shiprocket shipment creation is in progress. Refresh the order and try again.",
          },
          { status: 409 }
        );
      }

      /* -----------------------------------------------
         Restore product stock inside the transaction
      ----------------------------------------------- */

      for (const item of order.items) {
        const productId = String(item.productId || "").trim();
        const quantity = Number(item.quantity);

        if (!mongoose.Types.ObjectId.isValid(productId)) {
          await session.abortTransaction();

          return NextResponse.json(
            {
              success: false,
              message: `Invalid product ID for "${item.name}".`,
            },
            { status: 400 }
          );
        }

        if (!Number.isInteger(quantity) || quantity < 1) {
          await session.abortTransaction();

          return NextResponse.json(
            {
              success: false,
              message: `Invalid quantity for "${item.name}".`,
            },
            { status: 400 }
          );
        }

        const product = await Product.findByIdAndUpdate(
          productId,
          {
            $inc: {
              stock: quantity,
            },
          },
          {
            new: true,
            session,
          }
        );

        if (!product) {
          await session.abortTransaction();

          return NextResponse.json(
            {
              success: false,
              message:
                `Product "${item.name}" no longer exists. Cancellation was not completed.`,
            },
            { status: 409 }
          );
        }
      }

      order.orderStatus = "cancelled";
      order.cancellationReason = cancellationReason;
      order.cancelledAt = cancelledAt;
      order.cancelledBy = "admin";
      order.stockRestoredAt = cancelledAt;
    }
        /* =====================================================
       11. HANDLE NORMAL ORDER / PAYMENT UPDATES
    ===================================================== */

    if (!cancellationRequested || !orderStatusChanged) {
      if (!orderStatusChanged && !paymentStatusChanged) {
        await session.commitTransaction();
        committed = true;

        return NextResponse.json(
          {
            success: true,
            message: "No changes were made.",
            order: {
              id: order._id.toString(),
              orderStatus: order.orderStatus,
              paymentStatus: order.paymentStatus,
              updatedAt: order.updatedAt,
            },
          },
          { status: 200 }
        );
      }

      await order.save({ session });
    }

    /* =====================================================
       12. COMMIT TRANSACTION
    ===================================================== */

    await session.commitTransaction();
    committed = true;

    /* =====================================================
       13. CREATE ADMIN NOTIFICATIONS
    ===================================================== */

    try {
      const notificationPromises: Promise<unknown>[] = [];

      if (orderStatusChanged) {
        notificationPromises.push(
          AdminNotification.create({
            type: cancellationRequested
              ? "admin_cancellation"
              : "order_status",
            title: cancellationRequested
              ? "Order Cancelled by Admin"
              : "Order Status Updated",
            message: cancellationRequested
              ? `Admin cancelled order #${order._id.toString()}. Reason: ${cancellationReason || "Not provided"}.`
              : `Order #${order._id.toString()} status changed from ${previousOrderStatus} to ${order.orderStatus}.`,
            orderId: order._id,
            isRead: false,
          })
        );
      }

      if (paymentStatusChanged) {
        notificationPromises.push(
          AdminNotification.create({
            type: "payment_status",
            title: "Payment Status Updated",
            message:
              `Order #${order._id.toString()} payment status changed from ${previousPaymentStatus} to ${order.paymentStatus}.`,
            orderId: order._id,
            isRead: false,
          })
        );
      }

      if (notificationPromises.length > 0) {
        await Promise.all(notificationPromises);
      }
    } catch (notificationError) {
      console.error(
        "ADMIN ORDER NOTIFICATION ERROR:",
        notificationError
      );
    }

    /* =====================================================
       14. SUCCESS RESPONSE
    ===================================================== */

    let message = "Order updated successfully.";

    if (cancellationRequested) {
      message =
        "Order cancelled successfully. Product stock has been restored.";

      if (shipmentNeedsManualCancellation) {
        message +=
          " IMPORTANT: A Shiprocket shipment may already exist. It was NOT cancelled automatically. Please handle it manually in Shiprocket.";
      }

      if (paymentStatusChanged) {
        message += " Payment status was also updated.";
      }
    } else if (orderStatusChanged && paymentStatusChanged) {
      message = "Order status and payment status updated successfully.";
    } else if (orderStatusChanged) {
      message = "Order status updated successfully.";
    } else if (paymentStatusChanged) {
      message = "Payment status updated successfully.";
    }

    return NextResponse.json(
      {
        success: true,
        message,
        warning: shipmentNeedsManualCancellation
          ? "Shiprocket shipment was not cancelled automatically. Manual action may be required."
          : null,
        order: {
          id: order._id.toString(),
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          cancellationReason: order.cancellationReason || "",
          cancelledAt: order.cancelledAt || null,
          cancelledBy: order.cancelledBy || null,
          stockRestoredAt: order.stockRestoredAt || null,
          updatedAt: order.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("ADMIN ORDER UPDATE ERROR:", error);

    if (!committed && session?.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (rollbackError) {
        console.error(
          "Order transaction rollback error:",
          rollbackError
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update order.",
      },
      { status: 500 }
    );
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}