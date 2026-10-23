
import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import PageHeroSettings, {
  PAGE_HERO_SLUGS,
} from "@/models/PageHeroSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const page = request.nextUrl.searchParams.get("page") || "";

    if (
      !(PAGE_HERO_SLUGS as readonly string[]).includes(page)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid page selected.",
          hero: null,
        },
        { status: 400 }
      );
    }

    await connectDB();

    const settings = await PageHeroSettings.findOne({ page })
      .select(
        "page imageUrl altText eyebrow heading description buttonText buttonLink updatedAt"
      )
      .lean();

    return NextResponse.json(
      {
        success: true,
        hero: settings || null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Public page hero API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load page hero settings.",
        hero: null,
      },
      { status: 500 }
    );
  }
}
