
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import HomeVideo from "@/models/HomeVideo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();

    const videos = await HomeVideo.find({
      isPublished: true,
    })
      .select("title description videoUrl sortOrder createdAt")
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        videos: videos.map((video) => ({
          ...video,
          _id: video._id.toString(),
        })),
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Public videos GET error:", error);

    return NextResponse.json(
      {
        success: false,
        videos: [],
        message: "Unable to load videos.",
      },
      { status: 500 }
    );
  }
}
