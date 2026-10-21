
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import AdminNotification from "@/models/AdminNotification";
import { sendVerificationEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    if (!normalizedName || !normalizedEmail || !normalizedPhone) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    if (normalizedName.length > 100 || normalizedEmail.length > 254) {
      return NextResponse.json(
        { success: false, message: "Please check your registration details." },
        { status: 400 }
      );
    }

    if (password.length < 6 || password.length > 128) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be between 6 and 128 characters.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    await connectDB();

    let user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    let isNewUser = false;

    if (user) {
      // Never change or link an existing admin or Google account.
      if (
        user.role !== "customer" ||
        user.googleId ||
        user.authProvider === "google"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "An account with this email already exists. Please use its existing sign-in method.",
          },
          { status: 409 }
        );
      }

      // Legacy accounts without this field are not automatically
      // forced through a new verification process.
      if (user.emailVerified !== false) {
        return NextResponse.json(
          {
            success: false,
            message: "An account with this email already exists. Please log in.",
          },
          { status: 409 }
        );
      }

      // Require the existing password before resending verification.
      if (
        !user.password ||
        !(await bcrypt.compare(password, user.password))
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "An account with this email is awaiting verification. Check your details or use the existing sign-in method.",
          },
          { status: 409 }
        );
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);

      user = new User({
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        role: "customer",
        authProvider: "local",
        emailVerified: false,
      });

      isNewUser = true;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.emailVerificationTokenHash = tokenHash;
    user.emailVerificationExpires = new Date(
      Date.now() + 30 * 60 * 1000
    );

    await user.save();

    try {
      await sendVerificationEmail(
        normalizedEmail,
        user.name,
        rawToken
      );
    } catch (emailError) {
      console.error("VERIFICATION EMAIL ERROR:", emailError);

      return NextResponse.json(
        {
          success: false,
          message:
            "We couldn't send the verification email. Please try again shortly.",
        },
        { status: 502 }
      );
    }

    if (isNewUser) {
      try {
        await AdminNotification.create({
          type: "new_customer",
          title: "New Customer Registered",
          message: `${user.name} created an account (${user.email}) awaiting email verification.`,
          isRead: false,
        });
      } catch (notificationError) {
        console.error(
          "NEW CUSTOMER NOTIFICATION ERROR:",
          notificationError
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Registration started. Please check your email and click the verification link before logging in.",
      },
      { status: isNewUser ? 201 : 200 }
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
