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
export const revalidate = 0;

const DEFAULT_ALT = "House Of Orive collection";
const CLOUDINARY_FOLDER = "house-of-orive/page-heroes";

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

type HeroSettingsRecord = {
  page: PageHeroSlug;

  desktopImageUrl?: string;
  desktopPublicId?: string;

  mobileImageUrl?: string;
  mobilePublicId?: string;

  // Legacy fields
  imageUrl?: string;
  publicId?: string;

  altText?: string;
  eyebrow?: string;
  heading?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
};

/*
=========================================================
HELPERS
=========================================================
*/

function isValidPage(value: string): value is PageHeroSlug {
  return (
    PAGE_HERO_SLUGS as readonly string[]
  ).includes(value);
}

function isValidImageUrl(value: string): boolean {
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

function isValidPublicId(value: string): boolean {
  return (
    value === "" ||
    (
      value.startsWith(`${CLOUDINARY_FOLDER}/`) &&
      value.length <= 300
    )
  );
}

function cleanText(
  value: unknown,
  maxLength: number
): string {
  if (typeof value !== "string") return "";

  return value.trim().slice(0, maxLength);
}

/*
=========================================================
NORMALIZE LEGACY SETTINGS
=========================================================
*/

function normalizeHero(
  settings: HeroSettingsRecord | null
) {
  if (!settings) return null;

  const desktopImageUrl =
    settings.desktopImageUrl ||
    settings.imageUrl ||
    "";

  const desktopPublicId =
    settings.desktopPublicId ||
    settings.publicId ||
    "";

  return {
    ...settings,

    // New desktop fields
    desktopImageUrl,
    desktopPublicId,

    // New mobile fields
    mobileImageUrl:
      settings.mobileImageUrl || "",

    mobilePublicId:
      settings.mobilePublicId || "",

    // Legacy fields remain synchronized
    imageUrl: desktopImageUrl,
    publicId: desktopPublicId,

    altText:
      settings.altText || DEFAULT_ALT,
  };
}

/*
=========================================================
CLOUDINARY CLEANUP
=========================================================
*/

function getPublicIds(
  settings: HeroSettingsRecord | null
): string[] {
  if (!settings) return [];

  const desktopPublicId =
    settings.desktopPublicId ||
    settings.publicId ||
    "";

  const mobilePublicId =
    settings.mobilePublicId || "";

  return [
    desktopPublicId,
    mobilePublicId,
  ].filter(
    (id): id is string =>
      Boolean(id) &&
      id.startsWith(`${CLOUDINARY_FOLDER}/`)
  );
}

async function destroyCloudinaryImages(
  publicIds: string[]
) {
  const uniqueIds = [
    ...new Set(publicIds),
  ];

  for (const publicId of uniqueIds) {
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
          "Page hero image cleanup failed:",
          publicId,
          result
        );
      }
    } catch (error) {
      console.error(
        "Page hero image cleanup failed:",
        publicId,
        error
      );
    }
  }
}

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
GET
GET /api/admin/settings/page-hero?page=products
=========================================================
*/

export async function GET(
  request: NextRequest
) {
  try {
    const denied = await authorize();

    if (denied) return denied;

    const page =
      request.nextUrl.searchParams.get("page") || "";

    if (!isValidPage(page)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid page selected.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const settings =
      await PageHeroSettings.findOne({
        page,
      }).lean();

    return NextResponse.json(
      {
        success: true,
        hero: normalizeHero(
          settings as HeroSettingsRecord | null
        ),
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
      "Admin page hero GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load page hero settings.",
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
PUT /api/admin/settings/page-hero
=========================================================
*/

export async function PUT(
  request: NextRequest
) {
  try {
    const denied = await authorize();

    if (denied) return denied;

    const body = await request.json();

    const page =
      typeof body.page === "string"
        ? body.page
        : "";

    if (!isValidPage(page)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid page selected.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * DESKTOP IMAGE
     *
     * Accept the new field names.
     * Fall back to legacy imageUrl/publicId.
     */

    const desktopImageUrl = cleanText(
      typeof body.desktopImageUrl === "string"
        ? body.desktopImageUrl
        : body.imageUrl,
      2000
    );

    const desktopPublicId = cleanText(
      typeof body.desktopPublicId === "string"
        ? body.desktopPublicId
        : body.publicId,
      300
    );

    /*
     * MOBILE IMAGE
     */

    const mobileImageUrl = cleanText(
      body.mobileImageUrl,
      2000
    );

    const mobilePublicId = cleanText(
      body.mobilePublicId,
      300
    );

    /*
     * DESKTOP VALIDATION
     *
     * Both values must exist together,
     * or both must be empty.
     */

    if (
      Boolean(desktopImageUrl) !==
      Boolean(desktopPublicId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Desktop image URL and public ID must both be provided.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      desktopImageUrl &&
      !isValidImageUrl(desktopImageUrl)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid desktop image URL.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidPublicId(desktopPublicId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid desktop Cloudinary public ID.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * MOBILE VALIDATION
     *
     * Mobile image is optional.
     */

    if (
      Boolean(mobileImageUrl) !==
      Boolean(mobilePublicId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Mobile image URL and public ID must both be provided.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      mobileImageUrl &&
      !isValidImageUrl(mobileImageUrl)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid mobile image URL.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isValidPublicId(mobilePublicId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid mobile Cloudinary public ID.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * PREVENT SAME IMAGE BEING USED TWICE
     */

    if (
      desktopPublicId &&
      mobilePublicId &&
      desktopPublicId === mobilePublicId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please upload separate desktop and mobile images.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * TEXT FIELDS
     */

    const fields = {
      // New image fields
      desktopImageUrl,
      desktopPublicId,
      mobileImageUrl,
      mobilePublicId,

      // Legacy fields point to desktop image
      imageUrl: desktopImageUrl,
      publicId: desktopPublicId,

      altText:
        cleanText(body.altText, 200) ||
        DEFAULT_ALT,

      eyebrow:
        cleanText(body.eyebrow, 100),

      heading:
        cleanText(body.heading, 150),

      description:
        cleanText(body.description, 500),

      buttonText:
        cleanText(body.buttonText, 80),

      buttonLink:
        cleanText(body.buttonLink, 300),
    };

    if (
      fields.buttonText &&
      !fields.buttonLink
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please provide a link for the hero button.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * SAVE DATABASE
     */

    await connectDB();

    const existing =
      await PageHeroSettings.findOne({
        page,
      });

    const previousSettings =
      existing
        ? (
            existing.toObject() as HeroSettingsRecord
          )
        : null;

    const previousPublicIds =
      getPublicIds(previousSettings);

    const saved =
      await PageHeroSettings.findOneAndUpdate(
        {
          page,
        },
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

    /*
     * DELETE REPLACED IMAGES
     *
     * Only after successful database saving.
     */

    const newPublicIds = new Set([
      desktopPublicId,
      mobilePublicId,
    ].filter(Boolean));

    const removedPublicIds =
      previousPublicIds.filter(
        (id) => !newPublicIds.has(id)
      );

    await destroyCloudinaryImages(
      removedPublicIds
    );

    return NextResponse.json({
      success: true,
      message:
        "Page hero settings saved successfully.",
      hero: normalizeHero(
        saved.toObject() as HeroSettingsRecord
      ),
    });

  } catch (error) {
    console.error(
      "Admin page hero PUT error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save page hero settings.",
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
DELETE /api/admin/settings/page-hero?page=products
=========================================================
*/

export async function DELETE(
  request: NextRequest
) {
  try {
    const denied = await authorize();

    if (denied) return denied;

    const page =
      request.nextUrl.searchParams.get("page") || "";

    if (!isValidPage(page)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid page selected.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const settings =
      await PageHeroSettings.findOne({
        page,
      });

    if (!settings) {
      return NextResponse.json({
        success: true,
        message:
          "Page hero settings are already reset.",
      });
    }

    const savedSettings =
      settings.toObject() as HeroSettingsRecord;

    const publicIds =
      getPublicIds(savedSettings);

    /*
     * DELETE DATABASE RECORD FIRST
     */

    await settings.deleteOne();

    /*
     * DELETE DESKTOP + MOBILE IMAGES
     */

    await destroyCloudinaryImages(
      publicIds
    );

    return NextResponse.json({
      success: true,
      message:
        "Page hero settings reset successfully.",
    });

  } catch (error) {
    console.error(
      "Admin page hero DELETE error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to reset page hero settings.",
      },
      {
        status: 500,
      }
    );
  }
}