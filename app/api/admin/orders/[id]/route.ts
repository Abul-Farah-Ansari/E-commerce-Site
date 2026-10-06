import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdmin } from "@/lib/adminAuth";
import Order from "@/models/Order";
import Product from "@/models/Product";

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

type OrderStatus =
  (typeof VALID_ORDER_STATUSES)[number];

type PaymentStatus =
  (typeof VALID_PAYMENT_STATUSES)[number];

const CANCELLABLE_ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
] as const;

export async function PUT(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  let session:
    | mongoose.ClientSession
    | null = null;

  try {
    // ==========================================
    // ADMIN AUTHENTICATION
    // ==========================================

    const admin = await requireAdmin();

    if (!admin.success) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        {
          status: admin.status,
        }
      );
    }

    // ==========================================
    // GET ORDER ID
    // ==========================================

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

    // ==========================================
    // READ REQUEST BODY
    // ==========================================

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

    const hasOrderStatus =
      body.orderStatus !== undefined;

    const hasPaymentStatus =
      body.paymentStatus !== undefined;

    if (
      !hasOrderStatus &&
      !hasPaymentStatus
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Provide orderStatus or paymentStatus.",
        },
        {
          status: 400,
        }
      );
    }

    // ==========================================
    // CONNECT DATABASE
    // ==========================================

    // requireAdmin() already connects to DB,
    // but starting a transaction requires
    // an active MongoDB session.

    session =
      await mongoose.startSession();

    session.startTransaction();

    // ==========================================
    // FIND ORDER
    // ==========================================

    const order =
      await Order.findById(id).session(
        session
      );

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

    // ==========================================
    // TRACK CHANGES
    // ==========================================

    let orderStatusChanged = false;
    let paymentStatusChanged = false;
    let cancellationRequested = false;

    // ==========================================
    // ORDER STATUS UPDATE
    // ==========================================

    if (hasOrderStatus) {
      const orderStatus = String(
        body.orderStatus || ""
      ).trim() as OrderStatus;

      if (
        !VALID_ORDER_STATUSES.includes(
          orderStatus
        )
      ) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid order status.",
          },
          {
            status: 400,
          }
        );
      }

      const currentStatus =
        order.orderStatus;

      // ----------------------------------------
      // SAME STATUS
      // ----------------------------------------

      if (
        currentStatus === orderStatus
      ) {
        orderStatusChanged = false;
      } else {
        // --------------------------------------
        // DELIVERED
        // --------------------------------------

        if (
          currentStatus ===
          "delivered"
        ) {
          await session.abortTransaction();

          return NextResponse.json(
            {
              success: false,
              message:
                "A delivered order cannot be changed.",
            },
            {
              status: 400,
            }
          );
        }

        // --------------------------------------
        // ALREADY CANCELLED
        // --------------------------------------

        if (
          currentStatus ===
          "cancelled"
        ) {
          await session.abortTransaction();

          return NextResponse.json(
            {
              success: false,
              message:
                "A cancelled order cannot be changed.",
            },
            {
              status: 400,
            }
          );
        }

        // --------------------------------------
        // CANCELLATION
        // --------------------------------------

        if (
          orderStatus ===
          "cancelled"
        ) {
          const canCancel =
            CANCELLABLE_ORDER_STATUSES.includes(
              currentStatus as
                (typeof CANCELLABLE_ORDER_STATUSES)[number]
            );

          if (!canCancel) {
            await session.abortTransaction();

            return NextResponse.json(
              {
                success: false,
                message:
                  `A ${currentStatus} order cannot be cancelled.`,
              },
              {
                status: 400,
              }
            );
          }

          cancellationRequested =
            true;

          order.orderStatus =
            "cancelled";

          orderStatusChanged = true;
        } else {
          // ------------------------------------
          // NORMAL STATUS UPDATE
          // ------------------------------------

          order.orderStatus =
            orderStatus;

          orderStatusChanged = true;
        }
      }
    }

    // ==========================================
    // PAYMENT STATUS UPDATE
    // ==========================================

    if (hasPaymentStatus) {
      const paymentStatus =
        String(
          body.paymentStatus || ""
        ).trim() as PaymentStatus;

      if (
        !VALID_PAYMENT_STATUSES.includes(
          paymentStatus
        )
      ) {
        await session.abortTransaction();

        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid payment status.",
          },
          {
            status: 400,
          }
        );
      }

      const currentPaymentStatus =
        order.paymentStatus;

      if (
        currentPaymentStatus ===
        paymentStatus
      ) {
        paymentStatusChanged = false;
      } else {
        order.paymentStatus =
          paymentStatus;

        paymentStatusChanged = true;
      }
    }

    // ==========================================
    // RESTORE STOCK ON CANCELLATION
    // ==========================================

    if (cancellationRequested) {
      for (const item of order.items) {
        const productId = String(
          item.productId || ""
        ).trim();

        if (
          !mongoose.Types.ObjectId.isValid(
            productId
          )
        ) {
          await session.abortTransaction();

          return NextResponse.json(
            {
              success: false,
              message:
                `Invalid product ID found in order for "${item.name}".`,
            },
            {
              status: 400,
            }
          );
        }

        const quantity =
          Number(item.quantity);

        if (
          !Number.isInteger(quantity) ||
          quantity < 1
        ) {
          await session.abortTransaction();

          return NextResponse.json(
            {
              success: false,
              message:
                `Invalid quantity found for "${item.name}".`,
            },
            {
              status: 400,
            }
          );
        }

        // --------------------------------------
        // RESTORE PRODUCT STOCK
        // --------------------------------------

        const product =
          await Product.findByIdAndUpdate(
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
                `Product "${item.name}" no longer exists. Order cancellation was not completed.`,
            },
            {
              status: 409,
            }
          );
        }
      }
    }

    // ==========================================
    // NOTHING CHANGED
    // ==========================================

    if (
      !orderStatusChanged &&
      !paymentStatusChanged
    ) {
      await session.commitTransaction();

      return NextResponse.json(
        {
          success: true,
          message:
            "No changes were made.",
          order: {
            id: order._id.toString(),
            orderStatus:
              order.orderStatus,
            paymentStatus:
              order.paymentStatus,
            updatedAt:
              order.updatedAt,
          },
        },
        {
          status: 200,
        }
      );
    }

    // ==========================================
    // SAVE ORDER
    // ==========================================

    await order.save({
      session,
    });

    // ==========================================
    // COMMIT TRANSACTION
    // ==========================================

    await session.commitTransaction();

    // ==========================================
    // RESPONSE MESSAGE
    // ==========================================

    let message =
      "Order updated successfully.";

    if (
      cancellationRequested &&
      paymentStatusChanged
    ) {
      message =
        "Order cancelled, stock restored, and payment status updated successfully.";
    } else if (
      cancellationRequested
    ) {
      message =
        "Order cancelled and stock restored successfully.";
    } else if (
      orderStatusChanged &&
      paymentStatusChanged
    ) {
      message =
        "Order status and payment status updated successfully.";
    } else if (
      orderStatusChanged
    ) {
      message =
        "Order status updated successfully.";
    } else if (
      paymentStatusChanged
    ) {
      message =
        "Payment status updated successfully.";
    }

    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return NextResponse.json(
      {
        success: true,
        message,
        order: {
          id: order._id.toString(),
          orderStatus:
            order.orderStatus,
          paymentStatus:
            order.paymentStatus,
          updatedAt:
            order.updatedAt,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ADMIN ORDER UPDATE ERROR:",
      error
    );

    // ==========================================
    // ROLLBACK
    // ==========================================

    if (session) {
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
        message:
          "Unable to update order.",
      },
      {
        status: 500,
      }
    );
  } finally {
    // ==========================================
    // END SESSION
    // ==========================================

    if (session) {
      await session.endSession();
    }
  }
}