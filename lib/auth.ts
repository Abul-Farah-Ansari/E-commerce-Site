import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const AUTH_SECRET = process.env.AUTH_SECRET;

type UserRole = "customer" | "admin";

export async function requireAuth() {
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
      role?: UserRole;
    };

    try {
      decoded = jwt.verify(
        token,
        AUTH_SECRET
      ) as {
        userId: string;
        email: string;
        role?: UserRole;
      };
    } catch {
      return {
        success: false,
        status: 401,
        message: "Invalid or expired session.",
      };
    }

    // =================================
    // VALIDATE USER ID
    // =================================

    if (!decoded.userId) {
      return {
        success: false,
        status: 401,
        message: "Invalid authentication session.",
      };
    }

    // =================================
    // CONNECT DATABASE
    // =================================

    await connectDB();

    // =================================
    // GET CURRENT USER
    // =================================

    const user = await User.findById(
      decoded.userId
    ).select(
      "_id name email phone role accountStatus address city state pincode"
    );

    if (!user) {
      return {
        success: false,
        status: 401,
        message: "User not found.",
      };
    }

    // =================================
    // CHECK ACCOUNT STATUS
    // =================================
    //
    // Existing users created before
    // accountStatus was added are treated
    // as active.
    //

    const accountStatus =
      user.accountStatus || "active";

    if (accountStatus === "disabled") {
      return {
        success: false,
        status: 403,
        message:
          "Your account has been disabled. Please contact customer support.",
      };
    }

    // =================================
    // AUTHENTICATED USER
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
        accountStatus,
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
      },
    };
  } catch (error) {
    console.error(
      "User authorization error:",
      error
    );

    return {
      success: false,
      status: 500,
      message:
        "Unable to verify authentication.",
    };
  }
}