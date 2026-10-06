import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";

import Product from "@/models/Product";
import Category from "@/models/Category";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================
   CREATE SLUG
========================= */

const createSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

/* =========================
   GET UNIQUE SLUG
========================= */

const getUniqueSlug = async (
  baseSlug: string,
  productId: string
) => {
  let slug = baseSlug || "product";
  let counter = 2;

  while (true) {
    const existingProduct = await Product.findOne({
      slug,
      _id: { $ne: productId },
    });

    if (!existingProduct) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

/* =========================
   GET SINGLE PRODUCT
========================= */

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const admin = await requireAdmin();

    if (!admin.success) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        { status: admin.status }
      );
    }

    const { id } = await context.params;

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID.",
        },
        { status: 400 }
      );
    }

    const product = await Product.findById(id)
      .populate("category")
      .lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        product: {
          ...product,
          lowStockThreshold:
            product.lowStockThreshold ?? 5,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get product error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while loading the product.",
      },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE PRODUCT
========================= */

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const admin = await requireAdmin();

    if (!admin.success) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        { status: admin.status }
      );
    }

    const { id } = await context.params;

    const body = await request.json();

    const {
      name,
      description,
      category,
      price,
      compareAtPrice,
      sku,
      stock,
      lowStockThreshold,
      status,
      images,
      sizes,
      colors,
      featured,
      newArrival,
      trending,
      sale,
    } = body;

    /* =========================
       REQUIRED FIELDS
    ========================= */

    if (
      !name ||
      !description ||
      !category ||
      price === undefined ||
      !sku
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, description, category, price and SKU are required.",
        },
        { status: 400 }
      );
    }

    /* =========================
       PRICE VALIDATION
    ========================= */

    if (Number(price) < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price cannot be negative.",
        },
        { status: 400 }
      );
    }

    /* =========================
       COMPARE PRICE VALIDATION
    ========================= */

    if (
      compareAtPrice !== undefined &&
      compareAtPrice !== null &&
      compareAtPrice !== "" &&
      Number(compareAtPrice) < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Compare-at price cannot be negative.",
        },
        { status: 400 }
      );
    }

    /* =========================
       STOCK VALIDATION
    ========================= */

    if (
      stock !== undefined &&
      stock !== "" &&
      (!Number.isInteger(Number(stock)) ||
        Number(stock) < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Stock must be a valid whole number greater than or equal to 0.",
        },
        { status: 400 }
      );
    }

    /* =========================
       LOW STOCK THRESHOLD
    ========================= */

    const numericLowStockThreshold =
      lowStockThreshold === undefined ||
      lowStockThreshold === ""
        ? 5
        : Number(lowStockThreshold);

    if (
      !Number.isInteger(
        numericLowStockThreshold
      ) ||
      numericLowStockThreshold < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Low stock threshold must be a valid whole number greater than or equal to 0.",
        },
        { status: 400 }
      );
    }

    /* =========================
       STATUS VALIDATION
    ========================= */

    const allowedStatuses = [
      "active",
      "draft",
      "out_of_stock",
    ];

    if (
      status &&
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product status.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    /* =========================
       PRODUCT ID VALIDATION
    ========================= */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID.",
        },
        { status: 400 }
      );
    }

    /* =========================
       FIND PRODUCT
    ========================= */

    const existingProduct =
      await Product.findById(id);

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    /* =========================
       CATEGORY VALIDATION
    ========================= */

    if (
      typeof category !== "string" ||
      !mongoose.Types.ObjectId.isValid(category)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category.",
        },
        { status: 400 }
      );
    }

    const existingCategory =
      await Category.findById(category);

    if (!existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected category does not exist.",
        },
        { status: 400 }
      );
    }

    /* =========================
       SKU VALIDATION
    ========================= */

    const normalizedSku = sku
      .trim()
      .toUpperCase();

    const duplicateSku =
      await Product.findOne({
        sku: normalizedSku,
        _id: { $ne: id },
      });

    if (duplicateSku) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another product already uses this SKU.",
        },
        { status: 409 }
      );
    }

    /* =========================
       SLUG
    ========================= */

    const trimmedName = name.trim();

    let slug = existingProduct.slug;

    if (
      trimmedName.toLowerCase() !==
      existingProduct.name
        .trim()
        .toLowerCase()
    ) {
      const baseSlug =
        createSlug(trimmedName);

      slug = await getUniqueSlug(
        baseSlug,
        id
      );
    }

    /* =========================
       UPDATE DATA
    ========================= */

    const updateData: Record<
      string,
      unknown
    > = {
      name: trimmedName,

      slug,

      description: description.trim(),

      category: new mongoose.Types.ObjectId(
        category
      ),

      price: Number(price),

      sku: normalizedSku,

      stock:
        stock === undefined ||
        stock === ""
          ? 0
          : Number(stock),

      lowStockThreshold:
        numericLowStockThreshold,

      status:
        status || existingProduct.status,

      images: Array.isArray(images)
        ? images
            .map((image: unknown) =>
              String(image).trim()
            )
            .filter(Boolean)
        : [],

      sizes: Array.isArray(sizes)
        ? sizes
            .map((size: unknown) =>
              String(size).trim()
            )
            .filter(Boolean)
        : [],

      colors: Array.isArray(colors)
        ? colors
            .map((color: unknown) =>
              String(color).trim()
            )
            .filter(Boolean)
        : [],

          featured:
  typeof featured === "boolean"
    ? featured
    : existingProduct.featured,

newArrival:
  typeof newArrival === "boolean"
    ? newArrival
    : existingProduct.newArrival,

trending:
  typeof trending === "boolean"
    ? trending
    : existingProduct.trending,

sale:
  typeof sale === "boolean"
    ? sale
    : existingProduct.sale,
    };

    /* =========================
       COMPARE-AT PRICE
    ========================= */

    if (
      compareAtPrice === undefined ||
      compareAtPrice === null ||
      compareAtPrice === ""
    ) {
      updateData.compareAtPrice =
        undefined;
    } else {
      updateData.compareAtPrice =
        Number(compareAtPrice);
    }

    /* =========================
       UPDATE DATABASE
    ========================= */

    const updatedProduct =
      await Product.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).populate("category");

    if (!updatedProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Product updated successfully.",
        product: {
          ...updatedProduct.toObject(),
          lowStockThreshold:
            updatedProduct.lowStockThreshold ??
            5,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Update product error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while updating the product.",
      },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE PRODUCT
========================= */

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const admin = await requireAdmin();

    if (!admin.success) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        { status: admin.status }
      );
    }

    const { id } = await context.params;

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID.",
        },
        { status: 400 }
      );
    }

    const product =
      await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Product deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Something went wrong while deleting the product.",
      },
      { status: 500 }
    );
  }
}