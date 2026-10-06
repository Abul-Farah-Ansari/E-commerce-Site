import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const AUTH_SECRET = process.env.AUTH_SECRET;

export async function requireAdmin() {
  try {
    // =================================
    // CHECK AUTH CONFIGURATION
    // =================================

    if (!AUTH_SECRET) {
      return {
        success: false,
        status: 500,
        message: "Authentication configuration is missing.",
      };
    }

    // =================================
    // GET AUTH COOKIE
    // =================================

    const cookieStore = await cookies();

    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return {
        success: false,
        status: 401,
        message: "Authentication required.",
      };
    }

    // =================================
    // VERIFY JWT
    // =================================

    let decoded: {
      userId: string;
      email: string;
      role?: "customer" | "admin";
    };

    try {
      decoded = jwt.verify(
        token,
        AUTH_SECRET
      ) as {
        userId: string;
        email: string;
        role?: "customer" | "admin";
      };
    } catch {
      return {
        success: false,
        status: 401,
        message: "Invalid or expired session.",
      };
    }

    // =================================
    // CONNECT DATABASE
    // =================================

    await connectDB();

    // =================================
    // GET CURRENT USER
    // =================================

    const user = await User.findById(decoded.userId).select(
      "_id name email phone role"
    );

    if (!user) {
      return {
        success: false,
        status: 401,
        message: "User not found.",
      };
    }

    // =================================
    // CHECK ADMIN ROLE
    // =================================

    if (user.role !== "admin") {
      return {
        success: false,
        status: 403,
        message: "Admin access required.",
      };
    }

    // =================================
    // ADMIN VERIFIED
    // =================================

    return {
      success: true,
      status: 200,

      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Admin authorization error:", error);

    return {
      success: false,
      status: 500,
      message: "Unable to verify admin access.",
    };
  }
}