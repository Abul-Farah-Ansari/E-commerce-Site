
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";
import HeroSettings from "@/models/HeroSettings";

export const runtime = "nodejs";

const DEFAULT_ALT = "House of Orive fashion collection";
const MAX_IMAGES = 10;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type HeroImageInput = {
  imageUrl: string;
  publicId: string;
  altText?: string;
  sortOrder?: number;
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

function validImageUrl(url: unknown): url is string {
  return (
    typeof url === "string" &&
    url.startsWith("https://res.cloudinary.com/") &&
    url.includes("/image/upload/")
  );
}

function validPublicId(publicId: unknown): publicId is string {
  return (
    typeof publicId === "string" &&
    publicId.startsWith("house-of-orive/hero/") &&
    publicId.length <= 255
  );
}

function getImageList(settings: {
  images?: HeroImageInput[];
  imageUrl?: string;
  publicId?: string;
  altText?: string;
}): HeroImageInput[] {
  if (Array.isArray(settings.images) && settings.images.length > 0) {
    return settings.images
      .map((image, index) => ({
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        altText: image.altText || DEFAULT_ALT,
        sortOrder: image.sortOrder ?? index,
      }))
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }

  // Backward compatibility for the previous single-image schema.
  if (settings.imageUrl && settings.publicId) {
    return [
      {
        imageUrl: settings.imageUrl,
        publicId: settings.publicId,
        altText: settings.altText || DEFAULT_ALT,
        sortOrder: 0,
      },
    ];
  }

  return [];
}

async function destroyCloudinaryImages(publicIds: string[]) {
  for (const publicId of [...new Set(publicIds)]) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      });

      if (result.result !== "ok" && result.result !== "not found") {
        console.error("Hero image cleanup failed:", publicId, result);
      }
    } catch (error) {
      console.error("Hero image cleanup failed:", publicId, error);
    }
  }
}

export async function GET() {
  try {
    const denied = await authorize();
    if (denied) return denied;

    await connectDB();

    const settings = await HeroSettings.findOne().lean();

    return NextResponse.json({
      success: true,
      hero: settings
        ? {
            images: getImageList(
              settings as unknown as {
                images?: HeroImageInput[];
                imageUrl?: string;
                publicId?: string;
                altText?: string;
              }
            ),
          }
        : null,
    });
  } catch (error) {
    console.error("Hero settings GET error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to load hero settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const denied = await authorize();
    if (denied) return denied;

    const body = await request.json();

    if (!Array.isArray(body.images)) {
      return NextResponse.json(
        { success: false, message: "Please provide an images array." },
        { status: 400 }
      );
    }

    const inputImages = body.images as HeroImageInput[];

    if (inputImages.length < 1 || inputImages.length > MAX_IMAGES) {
      return NextResponse.json(
        {
          success: false,
          message: `Select between 1 and ${MAX_IMAGES} hero images.`,
        },
        { status: 400 }
      );
    }

    const images: HeroImageInput[] = [];

    for (let index = 0; index < inputImages.length; index++) {
      const image = inputImages[index];

      if (
        !image ||
        !validImageUrl(image.imageUrl) ||
        !validPublicId(image.publicId)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid Cloudinary details for image ${index + 1}.`,
          },
          { status: 400 }
        );
      }

      if (
        image.altText !== undefined &&
        (typeof image.altText !== "string" ||
          image.altText.trim().length > 200)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid alternative text for image ${index + 1}.`,
          },
          { status: 400 }
        );
      }

      images.push({
        imageUrl: image.imageUrl,
        publicId: image.publicId,
        altText: image.altText?.trim() || DEFAULT_ALT,
        sortOrder: index,
      });
    }

    // Prevent accidental duplicates in the carousel.
    const publicIds = images.map((image) => image.publicId);

    if (new Set(publicIds).size !== publicIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "The same image cannot be added more than once.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const previous = await HeroSettings.findOne();
    const previousImages = previous
      ? getImageList(
          previous.toObject() as {
            images?: HeroImageInput[];
            imageUrl?: string;
            publicId?: string;
            altText?: string;
          }
        )
      : [];

    const newPublicIds = new Set(images.map((image) => image.publicId));

    // Save the array and the legacy fields together. The legacy fields
    // allow older application code to continue reading the first image.
    const firstImage = images[0];

    if (previous) {
      previous.set({
        images,
        imageUrl: firstImage.imageUrl,
        publicId: firstImage.publicId,
        altText: firstImage.altText || DEFAULT_ALT,
      });

      await previous.save();
    } else {
      await HeroSettings.create({
        images,
        imageUrl: firstImage.imageUrl,
        publicId: firstImage.publicId,
        altText: firstImage.altText || DEFAULT_ALT,
      });
    }

    // Delete images that were removed from the carousel only after saving.
    const removedIds = previousImages
      .map((image) => image.publicId)
      .filter((id) => !newPublicIds.has(id));

    await destroyCloudinaryImages(removedIds);

    return NextResponse.json({
      success: true,
      message: `${images.length} hero image${images.length === 1 ? "" : "s"} saved successfully.`,
    });
  } catch (error) {
    console.error("Hero settings PUT error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to save hero images." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const denied = await authorize();
    if (denied) return denied;

    await connectDB();

    const settings = await HeroSettings.findOne();

    if (!settings) {
      return NextResponse.json({
        success: true,
        message: "The default hero image is already active.",
      });
    }

    const savedImages = getImageList(
      settings.toObject() as {
        images?: HeroImageInput[];
        imageUrl?: string;
        publicId?: string;
        altText?: string;
      }
    );

    // Delete the database settings first so the storefront can fall back
    // to its default image even if Cloudinary cleanup fails.
    await settings.deleteOne();

    await destroyCloudinaryImages(
      savedImages.map((image) => image.publicId)
    );

    return NextResponse.json({
      success: true,
      message: "Hero carousel deleted. The default image is now active.",
    });
  } catch (error) {
    console.error("Hero settings DELETE error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to delete hero images." },
      { status: 500 }
    );
  }
}
