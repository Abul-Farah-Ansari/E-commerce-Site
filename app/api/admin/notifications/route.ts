
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { connectDB } from "@/lib/mongodb";
import AdminNotification from "@/models/AdminNotification";

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin.success) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message || "Unauthorized",
        },
        { status: admin.status || 401 }
      );
    }

    await connectDB();

    const notifications = await AdminNotification.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const unreadCount = await AdminNotification.countDocuments({
      isRead: false,
    });

    console.log(
      "Admin notification types:",
      notifications.map((notification) => ({
        type: notification.type,
        title: notification.title,
        createdAt: notification.createdAt,
      }))
    );

    return NextResponse.json({
      success: true,
      notifications: notifications.map((notification) => ({
        ...notification,
        _id: notification._id.toString(),
        orderId: notification.orderId?.toString(),
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (error) {
    console.error("Admin notifications fetch error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load notifications.",
      },
      { status: 500 }
    );
  }
}
