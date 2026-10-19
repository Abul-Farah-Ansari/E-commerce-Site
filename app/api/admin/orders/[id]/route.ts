
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { requireAdmin } from "@/lib/adminAuth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import AdminNotification from "@/models/AdminNotification";

/* =========================================================
   VALID ORDER STATUSES
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

type OrderStatus = (typeof VALID_ORDER_STATUSES)[number];
type PaymentStatus = (typeof VALID_PAYMENT_STATUSES)[number];

/* =========================================================
   CANCELLABLE ORDER STATUSES
========================================================= */

const CANCELLABLE_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
] as const;

/* =========================================================
   UPDATE ORDER / PAYMENT STATUS
   PUT /api/admin/orders/[id]
========================================================= */

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  let session: mongoose.ClientSession | null = null;

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
       2. GET AND VALIDATE ORDER ID
    ===================================================== */

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID.",
        },
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       3. READ REQUEST BODY
    ===================================================== */

    let body: {
      orderStatus?: unknown;
      paymentStatus?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON request body.",
        },
        {
          status: 400,
        }
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
        {
          status: 400,
        }
      );
    }

    /* =====================================================
       4. START DATABASE TRANSACTION
    ===================================================== */

    session = await mongoose.startSession();
    session.startTransaction();

    /* =====================================================
       5. FIND ORDER
    ===================================================== */

    const order = await Order.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        {
          status: 404,
        }
      );
    }

    /* =====================================================
       6. SAVE PREVIOUS STATUSES FOR NOTIFICATIONS

       IMPORTANT:
       Read these only after confirming that the order exists.
    ===================================================== */

    const previousOrderStatus = order.orderStatus;
    const previousPaymentStatus = order.paymentStatus;

    /* =====================================================
       7. TRACK STATUS CHANGES
    ===================================================== */

    let orderStatusChanged = false;
    let paymentStatusChanged = false;
    let cancellationRequested = false;

    /* =====================================================
       8. VALIDATE AND UPDATE ORDER STATUS
    ===================================================== */

    if (hasOrderStatus) {
      const orderStatus = String(body.orderStatus || "").trim() as OrderStatus;

      if (!VALID_ORDER_STATUSES.includes(orderStatus)) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message: "Invalid order status.",
          },
          {
            status: 400,
          }
        );
      }

      const currentStatus = order.orderStatus;

      if (currentStatus === orderStatus) {
        orderStatusChanged = false;
      } else {
        /* -----------------------------------------------
           Delivered orders cannot be changed
        ----------------------------------------------- */

        if (currentStatus === "delivered") {
          await session.abortTransaction();

          return NextResponse.json(
            {
              success: false,
              message: "A delivered order cannot be changed.",
            },
            {
              status: 400,
            }
          );
        }

        /* -----------------------------------------------
           Cancelled orders cannot be changed
        ----------------------------------------------- */

        if (currentStatus === "cancelled") {
          await session.abortTransaction();

          return NextResponse.json(
            {
              success: false,
              message: "A cancelled order cannot be changed.",
            },
            {
              status: 400,
            }
          );
        }

        /* -----------------------------------------------
           Handle order cancellation
        ----------------------------------------------- */

        if (orderStatus === "cancelled") {
          const canCancel = CANCELLABLE_ORDER_STATUSES.includes(
            currentStatus as (typeof CANCELLABLE_ORDER_STATUSES)[number]
          );

          if (!canCancel) {
            await session.abortTransaction();

            return NextResponse.json(
              {
                success: false,
                message: `A ${currentStatus} order cannot be cancelled.`,
              },
              {
                status: 400,
              }
            );
          }

          cancellationRequested = true;
          order.orderStatus = "cancelled";
          orderStatusChanged = true;
        } else {
          order.orderStatus = orderStatus;
          orderStatusChanged = true;
        }
      }
    }

    /* =====================================================
       9. VALIDATE AND UPDATE PAYMENT STATUS
    ===================================================== */

    if (hasPaymentStatus) {
      const paymentStatus = String(body.paymentStatus || "").trim() as PaymentStatus;

      if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message: "Invalid payment status.",
          },
          {
            status: 400,
          }
        );
      }

      const currentPaymentStatus = order.paymentStatus;

      if (currentPaymentStatus === paymentStatus) {
        paymentStatusChanged = false;
      } else {
        order.paymentStatus = paymentStatus;
        paymentStatusChanged = true;
      }
    }

    /* =====================================================
       10. RESTORE PRODUCT STOCK ON CANCELLATION

       Stock restoration and the order update are performed
       in the same transaction.
    ===================================================== */

    if (cancellationRequested) {
      for (const item of order.items) {
        const productId = String(item.productId || "").trim();

        if (!mongoose.Types.ObjectId.isValid(productId)) {
          await session.abortTransaction();

          return NextResponse.json(
            {
              success: false,
              message: `Invalid product ID found in order for "${item.name}".`,
            },
            {
              status: 400,
            }
          );
        }

        const quantity = Number(item.quantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
          await session.abortTransaction();

          return NextResponse.json(
            {
              success: false,
              message: `Invalid quantity found for "${item.name}".`,
            },
            {
              status: 400,
            }
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
              message: `Product "${item.name}" no longer exists. Order cancellation was not completed.`,
            },
            {
              status: 409,
            }
          );
        }
      }
    }

    /* =====================================================
       11. HANDLE REQUESTS WITH NO ACTUAL CHANGES
    ===================================================== */

    if (!orderStatusChanged && !paymentStatusChanged) {
      await session.commitTransaction();

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
        {
          status: 200,
        }
      );
    }

    /* =====================================================
       12. SAVE ORDER AND COMMIT TRANSACTION
    ===================================================== */

    await order.save({
      session,
    });

    await session.commitTransaction();

    /* =====================================================
       13. CREATE ADMIN NOTIFICATIONS

       IMPORTANT:
       Notifications are created only after the order
       transaction has committed successfully.

       A notification failure must not turn a successful
       order update into a failed API response.
    ===================================================== */

    try {
      const notificationPromises: Promise<unknown>[] = [];

      /* -----------------------------------------------
         Order status notification
      ----------------------------------------------- */

      if (orderStatusChanged) {
        notificationPromises.push(
          AdminNotification.create({
            type: "order_status",
            title: "Order Status Updated",
            message: `Order #${order._id.toString()} status changed from ${previousOrderStatus} to ${order.orderStatus}.`,
            orderId: order._id,
            isRead: false,
          })
        );
      }

      /* -----------------------------------------------
         Payment status notification
      ----------------------------------------------- */

      if (paymentStatusChanged) {
        notificationPromises.push(
          AdminNotification.create({
            type: "payment_status",
            title: "Payment Status Updated",
            message: `Order #${order._id.toString()} payment status changed from ${previousPaymentStatus} to ${order.paymentStatus}.`,
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
       14. BUILD SUCCESS MESSAGE
    ===================================================== */

    let message = "Order updated successfully.";

    if (cancellationRequested && paymentStatusChanged) {
      message =
        "Order cancelled, stock restored, and payment status updated successfully.";
    } else if (cancellationRequested) {
      message = "Order cancelled and stock restored successfully.";
    } else if (orderStatusChanged && paymentStatusChanged) {
      message = "Order status and payment status updated successfully.";
    } else if (orderStatusChanged) {
      message = "Order status updated successfully.";
    } else if (paymentStatusChanged) {
      message = "Payment status updated successfully.";
    }

    /* =====================================================
       15. RETURN SUCCESS RESPONSE
    ===================================================== */

    return NextResponse.json(
      {
        success: true,
        message,
        order: {
          id: order._id.toString(),
          orderStatus: order.orderStatus,
          paymentStatus: order.paymentStatus,
          updatedAt: order.updatedAt,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    /* =====================================================
       16. HANDLE ERRORS AND ROLLBACK
    ===================================================== */

    console.error("ADMIN ORDER UPDATE ERROR:", error);

    if (session && session.inTransaction()) {
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
      {
        status: 500,
      }
    );
  } finally {
    /* =====================================================
       17. END DATABASE SESSION
    ===================================================== */

    if (session) {
      await session.endSession();
    }
  }
}
