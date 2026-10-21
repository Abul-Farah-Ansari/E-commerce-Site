
import { NextResponse } from "next/server";
import crypto from "crypto";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

const appUrl = (
  process.env.APP_URL || "http://localhost:3000"
).replace(/\/+$/, "");

  const redirect = (status: string) =>
    NextResponse.redirect(
      new URL(`/verify-email?status=${status}`, appUrl)
    );

  if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
    return redirect("invalid");
  }

  try {
    await connectDB();

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: { $gt: new Date() },
      emailVerified: false,
      role: "customer",
    }).select("+emailVerificationTokenHash +emailVerificationExpires");

    if (!user) {
      return redirect("invalid");
    }

    user.emailVerified = true;
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return redirect("success");
  } catch (error) {
    console.error("EMAIL VERIFICATION ERROR:", error);
    return redirect("error");
  }
}
