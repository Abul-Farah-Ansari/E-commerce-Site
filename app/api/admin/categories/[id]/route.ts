import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/adminAuth";


// ===============================
// GET SINGLE CATEGORY
// ===============================
export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await context.params;

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error: any) {
    console.error("GET CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Failed to fetch category.",
      },
      { status: 500 }
    );
  }
}


// ===============================
// UPDATE CATEGORY
// ===============================
export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await context.params;

    const body = await request.json();

    const {
      name,
      slug,
      description,
      image,
      status,
      featured,
      sortOrder,
    } = body;

    // ===============================
    // REQUIRED FIELDS
    // ===============================
    if (!name || !slug) {
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
    const cleanName = String(name).trim();

    const cleanSlug = String(slug)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    if (!cleanName || !cleanSlug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category name and slug cannot be empty.",
        },
        { status: 400 }
      );
    }

    // ===============================
    // CHECK CATEGORY EXISTS
    // ===============================
    const existingCategory =
      await Category.findById(id);

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    // ===============================
    // CHECK DUPLICATE SLUG
    // ===============================
    const duplicateSlug = await Category.findOne({
      slug: cleanSlug,
      _id: { $ne: id },
    });

    if (duplicateSlug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A category with this slug already exists.",
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
    // UPDATE CATEGORY
    // ===============================
    existingCategory.name = cleanName;
    existingCategory.slug = cleanSlug;
    existingCategory.description = description
      ? String(description).trim()
      : "";
    existingCategory.image = image
      ? String(image).trim()
      : "";
    existingCategory.status =
      status === "inactive" ? "inactive" : "active";
    existingCategory.featured = Boolean(featured);
    existingCategory.sortOrder = parsedSortOrder;

    await existingCategory.save();

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      category: existingCategory,
    });
  } catch (error: any) {
    console.error("UPDATE CATEGORY ERROR:", error);

    // MongoDB duplicate key protection
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A category with this slug already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Failed to update category.",
      },
      { status: 500 }
    );
  }
}


// ===============================
// DELETE CATEGORY
// ===============================
export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await context.params;

    const category =
      await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Category not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Failed to delete category.",
      },
      { status: 500 }
    );
  }
}