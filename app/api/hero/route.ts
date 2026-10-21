
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import HeroSettings from "@/models/HeroSettings";

export const runtime = "nodejs";

const DEFAULT_ALT = "House of Orive fashion collection";

type HeroImage = {
  imageUrl: string;
  publicId?: string;
  altText?: string;
  sortOrder?: number;
};

export async function GET() {
  try {
    await connectDB();

    const settings = await HeroSettings.findOne()
      .select("images imageUrl publicId altText")
      .lean();

    let images: HeroImage[] = [];

    if (settings && Array.isArray(settings.images) && settings.images.length > 0) {
      images = settings.images
        .map((image: HeroImage, index: number) => ({
          imageUrl: image.imageUrl,
          altText: image.altText || DEFAULT_ALT,
          sortOrder: image.sortOrder ?? index,
        }))
        .filter((image) => Boolean(image.imageUrl))
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    } else if (settings?.imageUrl) {
      // Backward compatibility with the previous single-image format.
      images = [
        {
          imageUrl: settings.imageUrl,
          altText: settings.altText || DEFAULT_ALT,
          sortOrder: 0,
        },
      ];
    }

    return NextResponse.json(
      {
        success: true,
        hero: images.length > 0 ? { images } : null,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Public hero API error:", error);

    return NextResponse.json(
      { success: false, hero: null },
      { status: 500 }
    );
  }
}
