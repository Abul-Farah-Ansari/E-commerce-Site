
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getAdminUser() {
  const auth = await requireAdmin();

  if (!auth?.user) {
    return {
      error: NextResponse.json(
        { success: false, message: "Unauthorized. Please log in again." },
        { status: 401 }
      ),
    };
  }

  await connectDB();

  const user = await User.findById(auth.user.id).select(
    "name email phone role accountStatus"
  );

  if (
    !user ||
    user.role !== "admin" ||
    user.accountStatus !== "active"
  ) {
    return {
      error: NextResponse.json(
        { success: false, message: "Active admin account not found." },
        { status: 403 }
      ),
    };
  }

  return { user };
}

export async function GET() {
  try {
    const result = await getAdminUser();

    if (result.error) {
      return result.error;
    }

    const { user } = result;

    return NextResponse.json(
      {
        success: true,
        profile: {
          name: user.name ?? "",
          email: user.email ?? "",
          phone: user.phone ?? "",
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Admin profile fetch error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load admin profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const result = await getAdminUser();

    if (result.error) {
      return result.error;
    }

    const { user } = result;
    const body = await request.json().catch(() => null);

    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const phone =
      typeof body?.phone === "string" ? body.phone.trim() : "";

    if (!name || name.length > 100) {
      return NextResponse.json(
        { success: false, message: "Enter a name of up to 100 characters." },
        { status: 400 }
      );
    }

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { success: false, message: "Enter a valid email address." },
        { status: 400 }
      );
    }

    if (phone.length > 20) {
      return NextResponse.json(
        { success: false, message: "Phone number must not exceed 20 characters." },
        { status: 400 }
      );
    }

    if (email !== user.email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: user._id },
      }).select("_id");

      if (existingUser) {
        return NextResponse.json(
          {
            success: false,
            message: "This email address is already associated with another account.",
          },
          { status: 409 }
        );
      }
    }

    user.name = name;
    user.email = email;
    user.phone = phone;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Admin profile updated successfully.",
        profile: {
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Admin profile update error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update admin profile." },
      { status: 500 }
    );
  }
}
