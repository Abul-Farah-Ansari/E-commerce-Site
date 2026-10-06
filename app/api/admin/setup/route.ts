import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const ADMIN_SETUP_SECRET =
  process.env.ADMIN_SETUP_SECRET;

export async function POST(request: Request) {
  try {
    // =================================
    // PRODUCTION SAFETY CHECK
    // =================================
    //
    // This endpoint is only intended for
    // initial development/admin setup.
    //
    // It must not be usable after the
    // application is deployed to production.
    // =================================

    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin setup is disabled in production.",
        },
        { status: 403 }
      );
    }

    // =================================
    // CHECK SETUP SECRET
    // =================================

    if (!ADMIN_SETUP_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin setup is not configured.",
        },
        { status: 500 }
      );
    }

    // =================================
    // READ REQUEST BODY
    // =================================

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    // =================================
    // VALIDATE BODY
    // =================================

    if (
      typeof body !== "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const {
      setupSecret,
      name,
      email,
      phone,
      password,
    } = body as {
      setupSecret?: unknown;
      name?: unknown;
      email?: unknown;
      phone?: unknown;
      password?: unknown;
    };

    // =================================
    // VERIFY SETUP SECRET
    // =================================

    if (
      typeof setupSecret !== "string" ||
      !setupSecret ||
      setupSecret !== ADMIN_SETUP_SECRET
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid setup secret.",
        },
        { status: 403 }
      );
    }

    // =================================
    // VALIDATE FIELDS
    // =================================

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, email, phone and password are required.",
        },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanEmail = email
      .trim()
      .toLowerCase();
    const cleanPhone = phone.trim();

    // =================================
    // EMPTY FIELD VALIDATION
    // =================================

    if (
      !cleanName ||
      !cleanEmail ||
      !cleanPhone ||
      !password
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, email, phone and password are required.",
        },
        { status: 400 }
      );
    }

    // =================================
    // NAME VALIDATION
    // =================================

    if (cleanName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin name must be at least 2 characters.",
        },
        { status: 400 }
      );
    }

    // =================================
    // EMAIL VALIDATION
    // =================================

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // =================================
    // PASSWORD VALIDATION
    // =================================

    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Admin password must be at least 8 characters.",
        },
        { status: 400 }
      );
    }

    // =================================
    // CONNECT DATABASE
    // =================================

    await connectDB();

    // =================================
    // CHECK IF ADMIN ALREADY EXISTS
    // =================================
    //
    // Only one admin can be created through
    // this initial setup endpoint.
    // =================================

    const existingAdmin =
      await User.findOne({
        role: "admin",
      });

    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "An admin account already exists.",
        },
        { status: 409 }
      );
    }

    // =================================
    // CHECK EMAIL
    // =================================

    const existingUser =
      await User.findOne({
        email: cleanEmail,
      });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A user with this email already exists.",
        },
        { status: 409 }
      );
    }

    // =================================
    // HASH PASSWORD
    // =================================

    const hashedPassword =
      await bcrypt.hash(password, 12);

    // =================================
    // CREATE ADMIN
    // =================================

    const admin = await User.create({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      password: hashedPassword,
      role: "admin",

      // Explicitly activate the account.
      accountStatus: "active",
    });

    // =================================
    // RESPONSE
    // =================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Admin account created successfully.",

        admin: {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
          accountStatus:
            admin.accountStatus,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Admin setup error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while creating the admin.",
      },
      { status: 500 }
    );
  }
}