
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import HomeVideo from "@/models/HomeVideo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorize() {
  const admin = await requireAdmin();

  if (!admin.success) {
    return NextResponse.json(
      {
        success: false,
        message: admin.message || "Unauthorized",
      },
      { status: admin.status || 401 }
    );
  }

  return null;
}

export async function GET() {
  try {
    const denied = await authorize();
    if (denied) return denied;

    await connectDB();

    const videos = await HomeVideo.find({})
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      videos: videos.map((video) => ({
        ...video,
        _id: video._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Admin videos GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load videos." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const denied = await authorize();
    if (denied) return denied;

    const body = await request.json();

    const title =
      typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";
    const videoUrl =
      typeof body.videoUrl === "string" ? body.videoUrl.trim() : "";
    const publicId =
      typeof body.publicId === "string" ? body.publicId.trim() : "";
    const sortOrder = Number(body.sortOrder ?? 0);

    if (!title || title.length > 100) {
      return NextResponse.json(
        { success: false, message: "Enter a title of up to 100 characters." },
        { status: 400 }
      );
    }

    if (
      !videoUrl.startsWith("https://res.cloudinary.com/") ||
      !videoUrl.includes("/video/upload/")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid Cloudinary video URL." },
        { status: 400 }
      );
    }

    if (!publicId.startsWith("house-of-orive/home-videos/")) {
      return NextResponse.json(
        { success: false, message: "Invalid video storage reference." },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(sortOrder) ||
      sortOrder < 0 ||
      sortOrder > 9999
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid display order." },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await HomeVideo.findOne({ publicId });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "This video is already added." },
        { status: 409 }
      );
    }

    const video = await HomeVideo.create({
      title,
      description,
      videoUrl,
      publicId,
      sortOrder,
      isPublished: false,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Video added as unpublished.",
        video: {
          _id: video._id.toString(),
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          publicId: video.publicId,
          isPublished: video.isPublished,
          sortOrder: video.sortOrder,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin videos POST error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to save video." },
      { status: 500 }
    );
  }
}
