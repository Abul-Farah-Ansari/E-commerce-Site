
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth } from "@/lib/auth";

/* =========================================================
   GET CURRENT USER
========================================================= */

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

    // Explicitly verify authenticated user exists.
    const authenticatedUser = auth.user;

    if (!authenticatedUser) {
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

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: {
          id: authenticatedUser.id,
          name: authenticatedUser.name,
          email: authenticatedUser.email,
          phone: authenticatedUser.phone,
          address: authenticatedUser.address || "",
          city: authenticatedUser.city || "",
          state: authenticatedUser.state || "",
          pincode: authenticatedUser.pincode || "",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
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

/* =========================================================
   UPDATE USER PROFILE
========================================================= */

export async function PUT(request: Request) {
  try {
    // 1. Verify current user.
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

    // 2. Explicitly verify authenticated user exists.
    const authenticatedUser = auth.user;

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired session.",
        },
        {
          status: 401,
        }
      );
    }

    // 3. Read request body safely.
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

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
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

    const profile = body as Record<string, unknown>;

    const phone =
      typeof profile.phone === "string"
        ? profile.phone.trim()
        : "";

    const address =
      typeof profile.address === "string"
        ? profile.address.trim()
        : "";

    const city =
      typeof profile.city === "string"
        ? profile.city.trim()
        : "";

    const state =
      typeof profile.state === "string"
        ? profile.state.trim()
        : "";

    const pincode =
      typeof profile.pincode === "string"
        ? profile.pincode.trim()
        : "";

    // 4. Phone validation.
    if (!phone) {
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

    if (!/^\+?[0-9\s-]{10,15}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid phone number.",
        },
        {
          status: 400,
        }
      );
    }

    // 5. Address validation.
    if (!address) {
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

    if (!city) {
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

    if (!state) {
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

    // 6. PIN code validation.
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid 6-digit PIN code.",
        },
        {
          status: 400,
        }
      );
    }

    // 7. Update database.
    await connectDB();

    const user = await User.findByIdAndUpdate(
      authenticatedUser.id,
      {
        $set: {
          phone,
          address,
          city,
          state,
          pincode,
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

    // 8. Return updated profile.
    return NextResponse.json(
      {
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
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Update profile error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update your profile.",
      },
      {
        status: 500,
      }
    );
  }
}
