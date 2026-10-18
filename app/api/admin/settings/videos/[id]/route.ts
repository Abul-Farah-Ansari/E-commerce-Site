
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import HomeVideo from "@/models/HomeVideo";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type Context = {
  params: Promise<{ id: string }>;
};

async function authorize() {
  const admin = await requireAdmin();

  if (!admin.success) {
    return NextResponse.json(
      { success: false, message: admin.message || "Unauthorized" },
      { status: admin.status || 401 }
    );
  }

  return null;
}

export async function PATCH(
  request: NextRequest,
  context: Context
) {
  try {
    const denied = await authorize();
    if (denied) return denied;

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid video ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (typeof body.isPublished === "boolean") {
      update.isPublished = body.isPublished;
    }

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        !body.title.trim() ||
        body.title.trim().length > 100
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid title." },
          { status: 400 }
        );
      }

      update.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (
        typeof body.description !== "string" ||
        body.description.trim().length > 300
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid description." },
          { status: 400 }
        );
      }

      update.description = body.description.trim();
    }

    if (body.sortOrder !== undefined) {
      const order = Number(body.sortOrder);

      if (!Number.isFinite(order) || order < 0 || order > 9999) {
        return NextResponse.json(
          { success: false, message: "Invalid display order." },
          { status: 400 }
        );
      }

      update.sortOrder = order;
    }

    if (!Object.keys(update).length) {
      return NextResponse.json(
        { success: false, message: "No changes supplied." },
        { status: 400 }
      );
    }

    await connectDB();

    const video = await HomeVideo.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!video) {
      return NextResponse.json(
        { success: false, message: "Video not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      video: { ...video, _id: video._id.toString() },
    });
  } catch (error) {
    console.error("Admin video PATCH error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update video." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: Context
) {
  try {
    const denied = await authorize();
    if (denied) return denied;

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid video ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const video = await HomeVideo.findById(id);

    if (!video) {
      return NextResponse.json(
        { success: false, message: "Video not found." },
        { status: 404 }
      );
    }

    try {
      await cloudinary.uploader.destroy(video.publicId, {
        resource_type: "video",
        invalidate: true,
      });
    } catch (error) {
      console.error("Cloudinary deletion failed:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Could not delete the Cloudinary file. The database record was kept.",
        },
        { status: 502 }
      );
    }

    await video.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Video deleted.",
    });
  } catch (error) {
    console.error("Admin video DELETE error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete video." },
      { status: 500 }
    );
  }
}
