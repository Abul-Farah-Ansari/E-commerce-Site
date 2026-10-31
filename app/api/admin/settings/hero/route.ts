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

/*
=========================================================
TYPES
=========================================================
*/

// Supports both new desktop/mobile images and older records.
type HeroImageInput = {
  desktopImageUrl?: string;
  desktopPublicId?: string;

  mobileImageUrl?: string;
  mobilePublicId?: string;

  // Legacy fields for backward compatibility.
  imageUrl?: string;
  publicId?: string;

  altText?: string;
  sortOrder?: number;
};

type HeroImage = {
  desktopImageUrl: string;
  desktopPublicId: string;

  mobileImageUrl?: string;
  mobilePublicId?: string;

  // Legacy aliases: desktop image.
  imageUrl: string;
  publicId: string;

  altText: string;
  sortOrder: number;
};

/*
=========================================================
ADMIN AUTHORIZATION
=========================================================
*/

async function authorize() {
  const admin = await requireAdmin();

  if (!admin.success) {
    return NextResponse.json(
      {
        success: false,
        message: admin.message || "Unauthorized",
      },
      {
        status: admin.status || 401,
      }
    );
  }

  return null;
}

/*
=========================================================
VALIDATION
=========================================================
*/

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

/*
=========================================================
NORMALIZE SAVED IMAGES
=========================================================
*/

function getImageList(settings: {
  images?: HeroImageInput[];
  imageUrl?: string;
  publicId?: string;
  altText?: string;
}): HeroImage[] {
  if (
    Array.isArray(settings.images) &&
    settings.images.length > 0
  ) {
    return settings.images
      .map((image, index) => {
        // Prefer the new desktop fields.
        // Fall back to the old imageUrl/publicId fields.
        const desktopImageUrl =
          image.desktopImageUrl || image.imageUrl || "";

        const desktopPublicId =
          image.desktopPublicId || image.publicId || "";

        return {
          desktopImageUrl,
          desktopPublicId,

          mobileImageUrl:
            image.mobileImageUrl || undefined,

          mobilePublicId:
            image.mobilePublicId || undefined,

          // Legacy aliases point to the desktop image.
          imageUrl: desktopImageUrl,
          publicId: desktopPublicId,

          altText:
            image.altText || DEFAULT_ALT,

          sortOrder:
            image.sortOrder ?? index,
        };
      })
      .filter(
        (image) =>
          Boolean(image.desktopImageUrl) &&
          Boolean(image.desktopPublicId)
      )
      .sort(
        (a, b) =>
          a.sortOrder - b.sortOrder
      );
  }

  // Backward compatibility for the original
  // single-image database structure.
  if (settings.imageUrl && settings.publicId) {
    return [
      {
        desktopImageUrl: settings.imageUrl,
        desktopPublicId: settings.publicId,

        mobileImageUrl: undefined,
        mobilePublicId: undefined,

        imageUrl: settings.imageUrl,
        publicId: settings.publicId,

        altText:
          settings.altText || DEFAULT_ALT,

        sortOrder: 0,
      },
    ];
  }

  return [];
}

/*
=========================================================
GET ALL CLOUDINARY PUBLIC IDS
=========================================================
*/

function getAllPublicIds(images: HeroImageInput[]) {
  const ids: string[] = [];

  for (const image of images) {
    const desktopId =
      image.desktopPublicId || image.publicId;

    const mobileId =
      image.mobilePublicId;

    if (desktopId) {
      ids.push(desktopId);
    }

    if (mobileId) {
      ids.push(mobileId);
    }
  }

  return [...new Set(ids)];
}

/*
=========================================================
DELETE CLOUDINARY IMAGES
=========================================================
*/

async function destroyCloudinaryImages(
  publicIds: string[]
) {
  for (const publicId of [...new Set(publicIds)]) {
    try {
      const result =
        await cloudinary.uploader.destroy(
          publicId,
          {
            resource_type: "image",
            invalidate: true,
          }
        );

      if (
        result.result !== "ok" &&
        result.result !== "not found"
      ) {
        console.error(
          "Hero image cleanup failed:",
          publicId,
          result
        );
      }
    } catch (error) {
      console.error(
        "Hero image cleanup failed:",
        publicId,
        error
      );
    }
  }
}

/*
=========================================================
GET
=========================================================
*/

export async function GET() {
  try {
    const denied = await authorize();

    if (denied) return denied;

    await connectDB();

    const settings =
      await HeroSettings.findOne().lean();

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
    console.error(
      "Hero settings GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load hero settings.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
=========================================================
PUT
=========================================================
*/

export async function PUT(
  request: NextRequest
) {
  try {
    const denied = await authorize();

    if (denied) return denied;

    const body = await request.json();

    if (!Array.isArray(body.images)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide an images array.",
        },
        {
          status: 400,
        }
      );
    }

    const inputImages =
      body.images as HeroImageInput[];

    if (
      inputImages.length < 1 ||
      inputImages.length > MAX_IMAGES
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Select between 1 and ${MAX_IMAGES} hero images.`,
        },
        {
          status: 400,
        }
      );
    }

    const images: HeroImage[] = [];

    /*
     * Validate every desktop and mobile image.
     */

    for (
      let index = 0;
      index < inputImages.length;
      index++
    ) {
      const image = inputImages[index];

      if (!image || typeof image !== "object") {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid image details for slide ${index + 1}.`,
          },
          {
            status: 400,
          }
        );
      }

      // New fields first, old fields as fallback.
      const desktopImageUrl =
        image.desktopImageUrl || image.imageUrl;

      const desktopPublicId =
        image.desktopPublicId || image.publicId;

      if (
        !validImageUrl(desktopImageUrl) ||
        !validPublicId(desktopPublicId)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid desktop image details for slide ${index + 1}.`,
          },
          {
            status: 400,
          }
        );
      }

      // Mobile image is optional.
      const mobileImageUrl =
        image.mobileImageUrl || undefined;

      const mobilePublicId =
        image.mobilePublicId || undefined;

      // Both mobile fields must be provided together.
      if (
        Boolean(mobileImageUrl) !==
        Boolean(mobilePublicId)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Both mobile image URL and public ID are required for slide ${index + 1}.`,
          },
          {
            status: 400,
          }
        );
      }

      if (
        mobileImageUrl &&
        !validImageUrl(mobileImageUrl)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid mobile image URL for slide ${index + 1}.`,
          },
          {
            status: 400,
          }
        );
      }

      if (
        mobilePublicId &&
        !validPublicId(mobilePublicId)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid mobile image public ID for slide ${index + 1}.`,
          },
          {
            status: 400,
          }
        );
      }

      if (
        image.altText !== undefined &&
        (
          typeof image.altText !== "string" ||
          image.altText.trim().length > 200
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid alternative text for slide ${index + 1}.`,
          },
          {
            status: 400,
          }
        );
      }

      images.push({
        desktopImageUrl,
        desktopPublicId,

        mobileImageUrl,
        mobilePublicId,

        // Keep old frontend/API code working.
        imageUrl: desktopImageUrl,
        publicId: desktopPublicId,

        altText:
          image.altText?.trim() || DEFAULT_ALT,

        sortOrder: index,
      });
    }

    /*
     * Prevent duplicate Cloudinary images.
     */

    const allNewPublicIds = images.flatMap(
      (image) => [
        image.desktopPublicId,
        ...(image.mobilePublicId
          ? [image.mobilePublicId]
          : []),
      ]
    );

    if (
      new Set(allNewPublicIds).size !==
      allNewPublicIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "The same Cloudinary image cannot be added more than once.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Save database settings.
     */

    await connectDB();

    const previous =
      await HeroSettings.findOne();

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

    const oldPublicIds = getAllPublicIds(
      previousImages
    );

    const newPublicIds = new Set(
      allNewPublicIds
    );

    const firstImage = images[0];

    if (previous) {
      previous.set({
        images,

        // Keep legacy fields for compatibility.
        imageUrl: firstImage.desktopImageUrl,
        publicId: firstImage.desktopPublicId,
        altText: firstImage.altText,
      });

      await previous.save();

    } else {
      await HeroSettings.create({
        images,

        // Keep legacy fields for compatibility.
        imageUrl: firstImage.desktopImageUrl,
        publicId: firstImage.desktopPublicId,
        altText: firstImage.altText,
      });
    }

    /*
     * Remove images that are no longer referenced.
     * Cleanup happens only after the database save succeeds.
     */

    const removedIds = oldPublicIds.filter(
      (id) => !newPublicIds.has(id)
    );

    await destroyCloudinaryImages(
      removedIds
    );

    return NextResponse.json({
      success: true,
      message: `${images.length} hero slide${images.length === 1 ? "" : "s"} saved successfully.`,
    });

  } catch (error) {
    console.error(
      "Hero settings PUT error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save hero images.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
=========================================================
DELETE
=========================================================
*/

export async function DELETE() {
  try {
    const denied = await authorize();

    if (denied) return denied;

    await connectDB();

    const settings =
      await HeroSettings.findOne();

    if (!settings) {
      return NextResponse.json({
        success: true,
        message: "The hero carousel is already empty.",
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

    const publicIds = getAllPublicIds(
      savedImages
    );

    // Delete database settings first.
    await settings.deleteOne();

    // Delete both desktop and mobile images.
    await destroyCloudinaryImages(
      publicIds
    );

    return NextResponse.json({
      success: true,
      message: "Hero carousel deleted successfully.",
    });

  } catch (error) {
    console.error(
      "Hero settings DELETE error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete hero images.",
      },
      {
        status: 500,
      }
    );
  }
}