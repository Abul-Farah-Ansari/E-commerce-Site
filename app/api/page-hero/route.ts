import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import PageHeroSettings, {
  PAGE_HERO_SLUGS,
} from "@/models/PageHeroSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_ALT = "House Of Orive collection";

export async function GET(request: NextRequest) {
  try {
    const page =
      request.nextUrl.searchParams.get("page") || "";

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

    const settings = await PageHeroSettings.findOne({
      page,
    })
      .select(
        [
          "page",
          "desktopImageUrl",
          "desktopPublicId",
          "mobileImageUrl",
          "mobilePublicId",
          "imageUrl",
          "publicId",
          "altText",
          "eyebrow",
          "heading",
          "description",
          "buttonText",
          "buttonLink",
          "updatedAt",
        ].join(" ")
      )
      .lean();

    if (!settings) {
      return NextResponse.json(
        {
          success: true,
          hero: null,
        },
        {
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    // Support older records that only contain imageUrl.
    const desktopImageUrl =
      settings.desktopImageUrl ||
      settings.imageUrl ||
      "";

    const desktopPublicId =
      settings.desktopPublicId ||
      settings.publicId ||
      "";

    const mobileImageUrl =
      settings.mobileImageUrl || "";

    const mobilePublicId =
      settings.mobilePublicId || "";

    const hero = {
      page: settings.page,

      // New responsive image fields
      desktopImageUrl,
      desktopPublicId,
      mobileImageUrl,
      mobilePublicId,

      // Legacy desktop aliases
      imageUrl: desktopImageUrl,
      publicId: desktopPublicId,

      // Existing page content
      altText:
        settings.altText || DEFAULT_ALT,

      eyebrow:
        settings.eyebrow || "",

      heading:
        settings.heading || "",

      description:
        settings.description || "",

      buttonText:
        settings.buttonText || "",

      buttonLink:
        settings.buttonLink || "",

      updatedAt: settings.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        hero,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      }
    );

  } catch (error) {
    console.error(
      "Public page hero API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load page hero settings.",
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