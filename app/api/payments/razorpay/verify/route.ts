import { NextResponse } from "next/server";

import crypto from "crypto";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import Order from "@/models/Order";


// ============================================================
// POST /api/payments/razorpay/verify
// ============================================================
//
// Verifies a Razorpay payment securely.
//
// Security:
// 1. Requires authenticated user.
// 2. Disabled accounts are rejected through requireAuth().
// 3. Order must belong to the authenticated user.
// 4. Order must use online payment.
// 5. Razorpay order ID must match local order.
// 6. Razorpay signature is verified using HMAC SHA256.
// 7. Signature comparison uses timingSafeEqual.
// 8. Already-paid orders are handled idempotently.
// ============================================================

export async function POST(request: Request) {
  try {
    // ========================================================
    // AUTHENTICATION
    // ========================================================

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
        {
          status: auth.status,
        }
      );
    }


    // ========================================================
    // RAZORPAY CONFIGURATION
    // ========================================================

    const RAZORPAY_KEY_SECRET =
      process.env.RAZORPAY_KEY_SECRET;

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay is not configured on the server.",
        },
        {
          status: 500,
        }
      );
    }


    // ========================================================
    // REQUEST BODY
    // ========================================================

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================================
    // VALIDATE REQUEST BODY
    // ========================================================

    if (
      typeof body !== "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment verification details are incomplete.",
        },
        {
          status: 400,
        }
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


    // ========================================================
    // BASIC VALIDATION
    // ========================================================

    if (
      typeof orderId !== "string" ||
      typeof razorpayOrderId !== "string" ||
      typeof razorpayPaymentId !== "string" ||
      typeof razorpaySignature !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment verification details are incomplete.",
        },
        {
          status: 400,
        }
      );
    }


    const cleanOrderId = orderId.trim();
    const cleanRazorpayOrderId =
      razorpayOrderId.trim();
    const cleanRazorpayPaymentId =
      razorpayPaymentId.trim();
    const cleanRazorpaySignature =
      razorpaySignature.trim();


    if (
      !cleanOrderId ||
      !cleanRazorpayOrderId ||
      !cleanRazorpayPaymentId ||
      !cleanRazorpaySignature
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment verification details are incomplete.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================================
    // VALIDATE LOCAL ORDER ID
    // ========================================================

    if (
      !mongoose.Types.ObjectId.isValid(
        cleanOrderId
      )
    ) {
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


    // ========================================================
    // DATABASE
    // ========================================================

    await connectDB();


    // ========================================================
    // FIND ORDER
    // ========================================================
    //
    // IMPORTANT:
    // The order must belong to the currently
    // authenticated customer.
    //
    // This prevents one customer from attempting
    // to verify another customer's order.
    // ========================================================

    const order = await Order.findOne({
      _id: cleanOrderId,
      userId: auth.user.id,
    });


    if (!order) {
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


    // ========================================================
    // PAYMENT METHOD CHECK
    // ========================================================

    if (
      order.paymentMethod !== "online"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order does not use online payment.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================================
    // RAZORPAY ORDER ID CHECK
    // ========================================================

    if (
      !order.razorpayOrderId ||
      order.razorpayOrderId !==
        cleanRazorpayOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay order ID does not match.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================================
    // ALREADY PAID CHECK
    // ========================================================
    //
    // Makes the endpoint idempotent.
    //
    // If the frontend retries the verification request
    // after a successful payment, we don't verify/save
    // the payment again.
    // ========================================================

    if (order.paymentStatus === "paid") {
      return NextResponse.json({
        success: true,
        message:
          "Payment has already been verified.",
        order: {
          id: order._id.toString(),
          total: order.total,
          paymentMethod:
            order.paymentMethod,
          paymentStatus:
            order.paymentStatus,
          orderStatus:
            order.orderStatus,
          razorpayOrderId:
            order.razorpayOrderId,
          razorpayPaymentId:
            order.razorpayPaymentId || "",
        },
      });
    }


    // ========================================================
    // CREATE RAZORPAY SIGNATURE
    // ========================================================
    //
    // Razorpay verification:
    //
    // HMAC SHA256
    //
    // message:
    // razorpayOrderId + "|" + razorpayPaymentId
    // ========================================================

    const signaturePayload =
      `${cleanRazorpayOrderId}|${cleanRazorpayPaymentId}`;


    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          RAZORPAY_KEY_SECRET
        )
        .update(signaturePayload)
        .digest("hex");


    // ========================================================
    // SAFE SIGNATURE COMPARISON
    // ========================================================

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    const receivedBuffer =
      Buffer.from(
        cleanRazorpaySignature,
        "utf8"
      );


    // ========================================================
    // LENGTH CHECK
    // ========================================================
    //
    // timingSafeEqual throws if the two buffers
    // have different lengths.
    // ========================================================

    if (
      expectedBuffer.length !==
      receivedBuffer.length
    ) {
      order.paymentStatus = "failed";

      await order.save();

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment verification failed.",
        },
        {
          status: 400,
        }
      );
    }


    const signatureValid =
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );


    // ========================================================
    // INVALID SIGNATURE
    // ========================================================

    if (!signatureValid) {
      order.paymentStatus = "failed";

      await order.save();

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment verification failed.",
        },
        {
          status: 400,
        }
      );
    }


    // ========================================================
    // PAYMENT VERIFIED
    // ========================================================

    order.paymentStatus = "paid";

    order.razorpayPaymentId =
      cleanRazorpayPaymentId;

    order.razorpaySignature =
      cleanRazorpaySignature;


    // ========================================================
    // CONFIRM ORDER
    // ========================================================
    //
    // Once online payment is verified,
    // move pending order to confirmed.
    // ========================================================

    if (
      order.orderStatus === "pending"
    ) {
      order.orderStatus = "confirmed";
    }


    await order.save();


    // ========================================================
    // SUCCESS RESPONSE
    // ========================================================

    return NextResponse.json({
      success: true,
      message:
        "Payment verified successfully.",

      order: {
        id: order._id.toString(),

        total: order.total,

        paymentMethod:
          order.paymentMethod,

        paymentStatus:
          order.paymentStatus,

        orderStatus:
          order.orderStatus,

        razorpayOrderId:
          order.razorpayOrderId,

        razorpayPaymentId:
          order.razorpayPaymentId,

        razorpaySignature:
          order.razorpaySignature,
      },
    });
  } catch (error) {
    console.error(
      "Razorpay payment verification error:",
      error
    );


    // ========================================================
    // AUTHENTICATION ERROR
    // ========================================================

    if (
      error instanceof Error &&
      (
        error.message ===
          "AUTH_CONFIG_MISSING" ||
        error.name ===
          "JsonWebTokenError" ||
        error.name ===
          "TokenExpiredError"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your session has expired. Please login again.",
        },
        {
          status: 401,
        }
      );
    }


    // ========================================================
    // SERVER ERROR
    // ========================================================

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to verify payment.",
      },
      {
        status: 500,
      }
    );
  }
}