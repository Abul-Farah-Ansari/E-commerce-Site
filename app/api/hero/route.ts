import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import HeroSettings from "@/models/HeroSettings";

export const runtime = "nodejs";

const DEFAULT_ALT = "House of Orive fashion collection";

type HeroImageRecord = {
  desktopImageUrl?: string;
  mobileImageUrl?: string;

  // Legacy fields
  imageUrl?: string;

  altText?: string;
  sortOrder?: number;
};

type HeroSettingsRecord = {
  images?: HeroImageRecord[];
  imageUrl?: string;
  altText?: string;
};

export async function GET() {
  try {
    await connectDB();

    const settings = await HeroSettings.findOne()
      .select("images imageUrl altText")
      .lean();

    const savedSettings =
      settings as HeroSettingsRecord | null;

    let images = [];

    if (
      savedSettings &&
      Array.isArray(savedSettings.images) &&
      savedSettings.images.length > 0
    ) {
      images = savedSettings.images
        .map((image, index) => {
          const desktopImageUrl =
            image.desktopImageUrl ||
            image.imageUrl ||
            "";

          return {
            desktopImageUrl,
            mobileImageUrl:
              image.mobileImageUrl || undefined,

            // Legacy alias for any older frontend code.
            imageUrl: desktopImageUrl,

            altText:
              image.altText || DEFAULT_ALT,

            sortOrder:
              image.sortOrder ?? index,
          };
        })
        .filter((image) => Boolean(image.desktopImageUrl))
        .sort(
          (a, b) =>
            (a.sortOrder ?? 0) -
            (b.sortOrder ?? 0)
        );
    } else if (savedSettings?.imageUrl) {
      // Compatibility with the original single-image format.
      images = [
        {
          desktopImageUrl: savedSettings.imageUrl,
          mobileImageUrl: undefined,
          imageUrl: savedSettings.imageUrl,
          altText:
            savedSettings.altText || DEFAULT_ALT,
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
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Public hero API error:", error);

    return NextResponse.json(
      {
        success: false,
        hero: null,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}