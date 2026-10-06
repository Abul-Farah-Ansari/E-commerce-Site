import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, phone, password } = body;

    // =================================
    // VALIDATE REQUIRED FIELDS
    // =================================

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required.",
        },
        { status: 400 }
      );
    }

    // =================================
    // PASSWORD VALIDATION
    // =================================

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    // =================================
    // NORMALIZE EMAIL
    // =================================

    const normalizedEmail = email.trim().toLowerCase();

    // =================================
    // CONNECT MONGODB
    // =================================

    await connectDB();

    // =================================
    // CHECK EXISTING USER
    // =================================

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // =================================
    // HASH PASSWORD
    // =================================

    const hashedPassword = await bcrypt.hash(password, 12);

    // =================================
    // CREATE CUSTOMER
    // =================================

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,

      // IMPORTANT:
      // Every normal registration is a customer.
      role: "customer",
    });

    // =================================
    // RESPONSE
    // =================================

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
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}