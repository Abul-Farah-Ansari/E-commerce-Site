import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import Order from "@/models/Order";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

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
        {
          status: auth.status,
        }
      );
    }

    const { id } = await context.params;

    /*
    |--------------------------------------------------------------------------
    | Validate order ID
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Database
    |--------------------------------------------------------------------------
    */

    await connectDB();

    /*
    |--------------------------------------------------------------------------
    | Find order
    |--------------------------------------------------------------------------
    |
    | Important:
    | We filter by BOTH order ID and authenticated user ID.
    |
    | This prevents one customer from accessing another customer's
    | order even if they know the order ID.
    |
    */

    const order = await Order.findOne({
      _id: id,
      userId: auth.user.id,
    }).lean();

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

    /*
    |--------------------------------------------------------------------------
    | Format response
    |--------------------------------------------------------------------------
    */

    const formattedOrder = {
      ...order,

      _id: order._id.toString(),

      userId: order.userId.toString(),

      createdAt:
        order.createdAt.toISOString(),

      updatedAt:
        order.updatedAt.toISOString(),
    };

    return NextResponse.json({
      success: true,
      order: formattedOrder,
    });
  } catch (error) {
    console.error(
      "Get single order error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load order.",
      },
      {
        status: 500,
      }
    );
  }
}