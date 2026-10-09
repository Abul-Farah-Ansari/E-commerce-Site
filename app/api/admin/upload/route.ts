
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin authentication.
    const adminCheck = await requireAdmin();

    if (!adminCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: adminCheck.message || "Admin authentication failed.",
        },
        { status: adminCheck.status || 401 }
      );
    }

    // 2. Verify Cloudinary configuration.
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("Cloudinary environment variables are missing.");

      return NextResponse.json(
        {
          success: false,
          message:
            "Cloudinary is not configured. Check your environment variables.",
        },
        { status: 500 }
      );
    }

    // 3. Read uploaded form data.
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select an image to upload.",
        },
        { status: 400 }
      );
    }

    // 4. Validate image format.
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Only JPEG, PNG, WebP, and AVIF images are allowed.",
        },
        { status: 400 }
      );
    }

    // 5. Validate image size.
    if (file.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The selected image is empty.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Image size must not exceed 2 MB.",
        },
        { status: 413 }
      );
    }

    // 6. Convert image to a Base64 data URI.
    const buffer = Buffer.from(await file.arrayBuffer());

    const dataUri =
      "data:" +
      file.type +
      ";base64," +
      buffer.toString("base64");

    // 7. Upload image to Cloudinary.
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "house-of-orive/products",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
    });

    // 8. Return hosted image URL.
    return NextResponse.json(
      {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product image upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Image upload failed. Please try again.",
      },
      { status: 500 }
    );
  }
}
