import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/adminAuth";
import Order from "@/models/Order";

export async function GET() {
  try {
    // =================================
    // ADMIN AUTHENTICATION
    // =================================

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

    // =================================
    // GET ALL ORDERS
    // =================================

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .lean();

    // =================================
    // NORMALIZE MONGODB DATA
    // =================================

    const formattedOrders = orders.map(
      (order: any) => ({
        ...order,

        // MongoDB IDs
        _id: order._id.toString(),

        userId:
          order.userId?.toString?.() ??
          String(order.userId),

        // Dates
        createdAt:
          order.createdAt?.toISOString?.() ??
          order.createdAt,

        updatedAt:
          order.updatedAt?.toISOString?.() ??
          order.updatedAt,

        // =================================
        // PAYMENT INFORMATION
        // =================================

        paymentMethod:
          order.paymentMethod,

        paymentStatus:
          order.paymentStatus,

        razorpayOrderId:
          order.razorpayOrderId || "",

        razorpayPaymentId:
          order.razorpayPaymentId || "",

        razorpaySignature:
          order.razorpaySignature || "",

        // =================================
        // ORDER ITEMS
        // =================================

        items: Array.isArray(order.items)
          ? order.items.map(
              (item: any) => ({
                ...item,

                productId:
                  item.productId
                    ?.toString?.() ??
                  String(item.productId),
              })
            )
          : [],
      })
    );

    // =================================
    // RESPONSE
    // =================================

    return NextResponse.json({
      success: true,

      orders: formattedOrders,

      total: formattedOrders.length,
    });
  } catch (error) {
    console.error(
      "Admin orders GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to fetch admin orders.",
      },
      {
        status: 500,
      }
    );
  }
}