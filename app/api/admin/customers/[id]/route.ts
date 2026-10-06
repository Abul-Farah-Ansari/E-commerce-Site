import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import User from "@/models/User";
import Order from "@/models/Order";

type AccountStatus = "active" | "disabled";

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // -----------------------------------------
    // ADMIN AUTHENTICATION
    // -----------------------------------------
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

    // -----------------------------------------
    // CUSTOMER ID
    // -----------------------------------------
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid customer ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    // -----------------------------------------
    // FIND CUSTOMER
    // -----------------------------------------
    const customer = await User.findOne({
      _id: id,
      role: "customer",
    })
      .select("-password")
      .lean();

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found.",
        },
        {
          status: 404,
        }
      );
    }

    // -----------------------------------------
    // CUSTOMER ORDERS
    // -----------------------------------------
    const orders = await Order.find({
      userId: id,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    // -----------------------------------------
    // ORDER STATISTICS
    // -----------------------------------------
    const totalOrders = orders.length;

    const activeOrders = orders.filter(
      (order) => order.orderStatus !== "cancelled"
    );

    const cancelledOrders = orders.filter(
      (order) => order.orderStatus === "cancelled"
    );

    const totalSpent = activeOrders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const latestOrder =
      orders.length > 0 ? orders[0] : null;

    // -----------------------------------------
    // FORMAT ORDERS
    // -----------------------------------------
    const formattedOrders = orders.map((order) => ({
      id: order._id.toString(),

      userId: order.userId.toString(),

      items: order.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image,
        size: item.size || "",
        color: item.color || "",
      })),

      customer: order.customer,

      shippingAddress: order.shippingAddress,

      deliveryMethod: order.deliveryMethod,

      paymentMethod: order.paymentMethod,

      paymentStatus: order.paymentStatus,

      orderStatus: order.orderStatus,

      subtotal: Number(order.subtotal || 0),

      shipping: Number(order.shipping || 0),

      total: Number(order.total || 0),

      createdAt: order.createdAt
        ? new Date(order.createdAt).toISOString()
        : null,

      updatedAt: order.updatedAt
        ? new Date(order.updatedAt).toISOString()
        : null,
    }));

    // -----------------------------------------
    // FORMAT CUSTOMER
    // -----------------------------------------
    const formattedCustomer = {
      id: customer._id.toString(),

      name: customer.name,

      email: customer.email,

      phone: customer.phone,

      role: customer.role,

      accountStatus:
        customer.accountStatus || "active",

      address: customer.address || "",

      city: customer.city || "",

      state: customer.state || "",

      pincode: customer.pincode || "",

      createdAt: customer.createdAt
        ? new Date(customer.createdAt).toISOString()
        : null,

      updatedAt: customer.updatedAt
        ? new Date(customer.updatedAt).toISOString()
        : null,

      statistics: {
        totalOrders,

        activeOrders: activeOrders.length,

        cancelledOrders: cancelledOrders.length,

        totalSpent,

        latestOrderDate: latestOrder?.createdAt
          ? new Date(
              latestOrder.createdAt
            ).toISOString()
          : null,
      },
    };

    // -----------------------------------------
    // RESPONSE
    // -----------------------------------------
    return NextResponse.json({
      success: true,
      customer: formattedCustomer,
      orders: formattedOrders,
    });
  } catch (error) {
    console.error(
      "Admin customer details error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to fetch customer details.",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// UPDATE CUSTOMER ACCOUNT STATUS
// =====================================================

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // -----------------------------------------
    // ADMIN AUTHENTICATION
    // -----------------------------------------
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

    // -----------------------------------------
    // CUSTOMER ID
    // -----------------------------------------
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid customer ID.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------
    // REQUEST BODY
    // -----------------------------------------
    const body = await request.json();

    const accountStatus =
      body.accountStatus as AccountStatus;

    // -----------------------------------------
    // VALIDATE STATUS
    // -----------------------------------------
    if (
      accountStatus !== "active" &&
      accountStatus !== "disabled"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid account status. Use active or disabled.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    // -----------------------------------------
    // FIND CUSTOMER
    // -----------------------------------------
    const customer = await User.findById(id);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found.",
        },
        {
          status: 404,
        }
      );
    }

    // -----------------------------------------
    // PROTECT ADMIN ACCOUNTS
    // -----------------------------------------
    if (customer.role === "admin") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin accounts cannot be disabled from customer management.",
        },
        {
          status: 403,
        }
      );
    }

    // -----------------------------------------
    // UPDATE ACCOUNT STATUS
    // -----------------------------------------
    customer.accountStatus = accountStatus;

    await customer.save();

    // -----------------------------------------
    // RESPONSE
    // -----------------------------------------
    return NextResponse.json({
      success: true,

      message:
        accountStatus === "disabled"
          ? "Customer account disabled successfully."
          : "Customer account enabled successfully.",

      customer: {
        id: customer._id.toString(),

        name: customer.name,

        email: customer.email,

        phone: customer.phone,

        role: customer.role,

        accountStatus:
          customer.accountStatus || "active",
      },
    });
  } catch (error) {
    console.error(
      "Update customer account status error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update customer account status.",
      },
      {
        status: 500,
      }
    );
  }
}