
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/adminAuth";

// ===============================
// HELPER: CLEAN STRING VALUES
// ===============================
const cleanString = (value: unknown): string => {
  return typeof value === "string" ? value.trim() : "";
};

// ===============================
// GET ALL CATEGORIES
// ===============================
export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const categories = await Category.find({})
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error: any) {
    console.error("GET CATEGORIES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch categories.",
      },
      { status: 500 }
    );
  }
}

// ===============================
// CREATE CATEGORY
// ===============================
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await request.json();

    const {
      name,
      slug,
      description,
      seoTitle,
      seoDescription,
      image,
      status,
      featured,
      sortOrder,
    } = body;

    // ===============================
    // REQUIRED FIELDS
    // ===============================
    const cleanName = cleanString(name);
    const cleanSlug = cleanString(slug)
      .toLowerCase()
      .replace(/\s+/g, "-");

    if (!cleanName || !cleanSlug) {
      return NextResponse.json(
        {
          success: false,
          message: "Category name and slug are required.",
        },
        { status: 400 }
      );
    }

    // ===============================
    // CLEAN VALUES
    // ===============================
    const cleanDescription = cleanString(description);
    const cleanSeoTitle = cleanString(seoTitle);
    const cleanSeoDescription = cleanString(seoDescription);
    const cleanImage = cleanString(image);

    // ===============================
    // VALIDATE SEO FIELDS
    // ===============================
    if (cleanSeoTitle.length > 70) {
      return NextResponse.json(
        {
          success: false,
          message: "SEO title cannot exceed 70 characters.",
        },
        { status: 400 }
      );
    }

    if (cleanSeoDescription.length > 170) {
      return NextResponse.json(
        {
          success: false,
          message: "SEO description cannot exceed 170 characters.",
        },
        { status: 400 }
      );
    }

    // ===============================
    // CHECK DUPLICATE SLUG
    // ===============================
    const existingCategory = await Category.findOne({
      slug: cleanSlug,
    });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "A category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    // ===============================
    // VALIDATE SORT ORDER
    // ===============================
    const parsedSortOrder =
      sortOrder === undefined || sortOrder === ""
        ? 0
        : Number(sortOrder);

    if (
      !Number.isInteger(parsedSortOrder) ||
      parsedSortOrder < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sort order must be a whole number greater than or equal to 0.",
        },
        { status: 400 }
      );
    }

    // ===============================
    // CREATE CATEGORY
    // ===============================
    const category = await Category.create({
      name: cleanName,
      slug: cleanSlug,
      description: cleanDescription,
      seoTitle: cleanSeoTitle,
      seoDescription: cleanSeoDescription,
      image: cleanImage,
      status: status === "inactive" ? "inactive" : "active",
      featured: featured === true,
      sortOrder: parsedSortOrder,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully.",
        category,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("CREATE CATEGORY ERROR:", error);

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Failed to create category.",
      },
      { status: 500 }
    );
  }
}
