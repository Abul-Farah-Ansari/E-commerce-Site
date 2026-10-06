import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const AUTH_SECRET = process.env.AUTH_SECRET;

export async function POST(request: NextRequest) {
  try {
    // -----------------------------------------
    // AUTH CONFIGURATION
    // -----------------------------------------
    if (!AUTH_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication configuration is missing.",
        },
        {
          status: 500,
        }
      );
    }

    // -----------------------------------------
    // REQUEST BODY
    // -----------------------------------------
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------
    // DATABASE
    // -----------------------------------------
    await connectDB();

    const user = await User.findOne({
      email,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    // -----------------------------------------
    // ACCOUNT STATUS
    // -----------------------------------------
    //
    // Existing users created before accountStatus
    // was added may not have the field.
    //
    // Treat an undefined status as ACTIVE so
    // existing customers are not accidentally
    // locked out.
    //
    const accountStatus =
      user.accountStatus || "active";

    if (accountStatus === "disabled") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your account has been disabled. Please contact customer support.",
        },
        {
          status: 403,
        }
      );
    }

    // -----------------------------------------
    // PASSWORD VERIFICATION
    // -----------------------------------------
    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    // -----------------------------------------
    // JWT
    // -----------------------------------------
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      AUTH_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // -----------------------------------------
    // RESPONSE
    // -----------------------------------------
    const response = NextResponse.json({
      success: true,

      message: "Login successful.",

      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus,
      },
    });

    // -----------------------------------------
    // AUTH COOKIE
    // -----------------------------------------
    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to login. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}