import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

/* =========================
   GET CURRENT USER
========================= */

export async function GET() {
  try {
    const auth = await requireAuth();

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: auth.message,
        },
        {
          status: auth.status,
        }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,

      user: {
        id: auth.user.id,
        name: auth.user.name,
        email: auth.user.email,
        phone: auth.user.phone,

        address: auth.user.address || "",
        city: auth.user.city || "",
        state: auth.user.state || "",
        pincode: auth.user.pincode || "",
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: "Invalid or expired session.",
      },
      {
        status: 401,
      }
    );
  }
}

/* =========================
   UPDATE USER PROFILE
========================= */

export async function PUT(request: Request) {
  try {
    // ---------------------------------
    // VERIFY CURRENT USER
    // ---------------------------------

    const auth = await requireAuth();

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          message: auth.message,
        },
        {
          status: auth.status,
        }
      );
    }

    // ---------------------------------
    // REQUEST BODY
    // ---------------------------------

    const body = await request.json();

    const {
      phone,
      address,
      city,
      state,
      pincode,
    } = body;

    // ---------------------------------
    // PHONE VALIDATION
    // ---------------------------------

    if (!phone?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !/^\+?[0-9\s-]{10,15}$/.test(
        phone.trim()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid phone number.",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------
    // ADDRESS VALIDATION
    // ---------------------------------

    if (!address?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Address is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!city?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "City is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!state?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "State is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------
    // PINCODE VALIDATION
    // ---------------------------------

    if (!/^\d{6}$/.test(pincode?.trim())) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid 6-digit PIN code.",
        },
        {
          status: 400,
        }
      );
    }

    // ---------------------------------
    // DATABASE
    // ---------------------------------

    await connectDB();

    const user = await User.findByIdAndUpdate(
      auth.user.id,
      {
        $set: {
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ---------------------------------
    // RESPONSE
    // ---------------------------------

    return NextResponse.json({
      success: true,

      message: "Profile updated successfully.",

      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,

        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
      },
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to update your profile.",
      },
      {
        status: 500,
      }
    );
  }
}