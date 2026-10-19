
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import AdminNotification from "@/models/AdminNotification";

/* =========================================================
   REGISTER CUSTOMER
========================================================= */

export async function POST(request: Request) {
  try {
    /* =================================
       READ REQUEST BODY
    ================================= */

    const body = await request.json();

    const { name, email, phone, password } = body;

    /* =================================
       VALIDATE REQUIRED FIELDS
    ================================= */

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =================================
       VALIDATE FIELD TYPES
    ================================= */

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid registration details.",
        },
        {
          status: 400,
        }
      );
    }

    /* =================================
       PASSWORD VALIDATION
    ================================= */

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /* =================================
       NORMALIZE CUSTOMER DETAILS
    ================================= */

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    if (!normalizedName || !normalizedEmail || !normalizedPhone) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        {
          status: 400,
        }
      );
    }

    /* =================================
       CONNECT TO MONGODB
    ================================= */

    await connectDB();

    /* =================================
       CHECK EXISTING CUSTOMER
    ================================= */

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        {
          status: 409,
        }
      );
    }

    /* =================================
       HASH PASSWORD
    ================================= */

    const hashedPassword = await bcrypt.hash(password, 12);

    /* =================================
       CREATE CUSTOMER ACCOUNT
    ================================= */

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,

      // Every normal registration is a customer.
      role: "customer",
    });

    /* =================================
       CREATE ADMIN NOTIFICATION

       Create this only after the customer
       account has been successfully saved.

       A notification failure must not cause
       a successful registration to fail.
    ================================= */

    try {
      await AdminNotification.create({
        type: "new_customer",
        title: "New Customer Registered",
        message: `${user.name} created a new account (${user.email}).`,
        isRead: false,
      });
    } catch (notificationError) {
      console.error(
        "NEW CUSTOMER NOTIFICATION ERROR:",
        notificationError
      );
    }

    /* =================================
       RETURN SUCCESS RESPONSE
    ================================= */

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    /* =================================
       HANDLE REGISTRATION ERRORS
    ================================= */

    console.error("Register error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}
