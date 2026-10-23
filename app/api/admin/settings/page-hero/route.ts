
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import PageHeroSettings, {
  PAGE_HERO_SLUGS,
  type PageHeroSlug,
} from "@/models/PageHeroSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isValidPage(value: string): value is PageHeroSlug {
  return (PAGE_HERO_SLUGS as readonly string[]).includes(value);
}

function isValidImageUrl(value: string) {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      url.pathname.includes("/image/upload/")
    );
  } catch {
    return false;
  }
}

function isValidPublicId(value: string) {
  return (
    value === "" ||
    value.startsWith("house-of-orive/page-heroes/")
  );
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

// GET /api/admin/settings/page-hero?page=products
export async function GET(request: NextRequest) {
  try {
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

    const page = request.nextUrl.searchParams.get("page") || "";

    if (!isValidPage(page)) {
      return NextResponse.json(
        { success: false, message: "Invalid page selected." },
        { status: 400 }
      );
    }

    await connectDB();

    const settings = await PageHeroSettings.findOne({
      page,
    }).lean();

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
    console.error("Admin page hero GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load page hero settings." },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings/page-hero
export async function PUT(request: NextRequest) {
  try {
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

    const body = await request.json();

    const page = typeof body.page === "string" ? body.page : "";

    if (!isValidPage(page)) {
      return NextResponse.json(
        { success: false, message: "Invalid page selected." },
        { status: 400 }
      );
    }

    const imageUrl = cleanText(body.imageUrl, 2000);
    const publicId = cleanText(body.publicId, 300);

    if (
      (imageUrl && !isValidImageUrl(imageUrl)) ||
      !isValidPublicId(publicId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Cloudinary image details.",
        },
        { status: 400 }
      );
    }

    if (Boolean(imageUrl) !== Boolean(publicId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Image URL and public ID must both be provided.",
        },
        { status: 400 }
      );
    }

    const fields = {
      imageUrl,
      publicId,
      altText:
        cleanText(body.altText, 200) ||
        "House Of Orive collection",
      eyebrow: cleanText(body.eyebrow, 100),
      heading: cleanText(body.heading, 150),
      description: cleanText(body.description, 500),
      buttonText: cleanText(body.buttonText, 80),
      buttonLink: cleanText(body.buttonLink, 300),
    };

    if (fields.buttonText && !fields.buttonLink) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a link for the hero button.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await PageHeroSettings.findOne({ page });

    const previousPublicId = existing?.publicId || "";

    const saved = await PageHeroSettings.findOneAndUpdate(
      { page },
      {
        $set: {
          page,
          ...fields,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    // Delete the old image only after the new settings have been saved.
    if (
      previousPublicId &&
      previousPublicId !== publicId &&
      previousPublicId.startsWith("house-of-orive/page-heroes/")
    ) {
      try {
        await cloudinary.uploader.destroy(previousPublicId);
      } catch (cleanupError) {
        console.error(
          "Old page hero image cleanup error:",
          cleanupError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Page hero settings saved successfully.",
      hero: saved,
    });
  } catch (error) {
    console.error("Admin page hero PUT error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to save page hero settings." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/settings/page-hero?page=products
export async function DELETE(request: NextRequest) {
  try {
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

    const page = request.nextUrl.searchParams.get("page") || "";

    if (!isValidPage(page)) {
      return NextResponse.json(
        { success: false, message: "Invalid page selected." },
        { status: 400 }
      );
    }

    await connectDB();

    const settings = await PageHeroSettings.findOneAndDelete({ page });

    if (
      settings?.publicId &&
      settings.publicId.startsWith("house-of-orive/page-heroes/")
    ) {
      try {
        await cloudinary.uploader.destroy(settings.publicId);
      } catch (cleanupError) {
        console.error("Page hero image deletion error:", cleanupError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Page hero settings reset successfully.",
    });
  } catch (error) {
    console.error("Admin page hero DELETE error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to reset page hero settings." },
      { status: 500 }
    );
  }
}
