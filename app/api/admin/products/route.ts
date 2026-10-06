import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/adminAuth";

import Product from "@/models/Product";
import Category from "@/models/Category";

/* =========================================
   GET PRODUCTS
========================================= */

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin.success) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        {
          status: admin.status,
        }
      );
    }

    await connectDB();

    // Fetch all products.
    const products = await Product.find({})
      .sort({
        createdAt: -1,
      })
      .lean();

    // MongoDB may return Product.category as an ObjectId even though
    // the TypeScript model currently describes it as a string.
    // Convert both forms to a string ID.
    const categoryIds = products
      .map((product) => {
        if (!product.category) {
          return "";
        }

        return product.category.toString();
      })
      .filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );

    // Fetch all matching categories in one query.
    const categories =
      categoryIds.length > 0
        ? await Category.find({
            _id: {
              $in: categoryIds,
            },
          })
            .select(
              "_id name slug description image status featured sortOrder createdAt updatedAt"
            )
            .lean()
        : [];

    // Create category lookup:
    // "categoryObjectId" -> category document
    const categoryMap = new Map(
      categories.map((category) => [
        category._id.toString(),
        {
          ...category,
          _id: category._id.toString(),
        },
      ])
    );

    // Convert every product's category ID into its category object.
    const normalizedProducts = products.map((product) => {
      const categoryId = product.category
        ? product.category.toString()
        : "";

      const category =
        categoryId && categoryMap.has(categoryId)
          ? categoryMap.get(categoryId)
          : product.category;

      return {
        ...product,

        _id: product._id.toString(),

        category,

        lowStockThreshold:
          product.lowStockThreshold ?? 5,

        createdAt:
          product.createdAt?.toISOString?.() ??
          product.createdAt,

        updatedAt:
          product.updatedAt?.toISOString?.() ??
          product.updatedAt,
      };
    });

    return NextResponse.json(
      {
        success: true,
        products: normalizedProducts,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Get products error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch products.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================
   CREATE PRODUCT
========================================= */

export async function POST(
  request: Request
) {
  try {
    /* =======================================
       ADMIN CHECK
    ======================================= */

    const admin = await requireAdmin();

    if (!admin.success) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        {
          status: admin.status,
        }
      );
    }

    /* =======================================
       REQUEST BODY
    ======================================= */

    const body = await request.json();

    const {
      name,
      slug,
      description,
      category,
      price,
      compareAtPrice,
      images,
      sizes,
      colors,
      sku,
      stock,
      lowStockThreshold,
      status,

      // Product visibility flags
      featured,
      newArrival,
      trending,
      sale,
    } = body;

    /* =======================================
       REQUIRED FIELDS
    ======================================= */

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
        {
          status: 400,
        }
      );
    }

    /* =======================================
       NAME
    ======================================= */

    const cleanName = String(name).trim();

    if (cleanName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product name must be at least 2 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /* =======================================
       DESCRIPTION
    ======================================= */

    const cleanDescription =
      String(description).trim();

    if (cleanDescription.length < 5) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product description is too short.",
        },
        {
          status: 400,
        }
      );
    }

    /* =======================================
       PRICE
    ======================================= */

    const numericPrice = Number(price);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a valid product price.",
        },
        {
          status: 400,
        }
      );
    }

    /* =======================================
       COMPARE PRICE
    ======================================= */

    let numericCompareAtPrice:
      | number
      | undefined;

    if (
      compareAtPrice !== undefined &&
      compareAtPrice !== null &&
      compareAtPrice !== ""
    ) {
      numericCompareAtPrice =
        Number(compareAtPrice);

      if (
        !Number.isFinite(
          numericCompareAtPrice
        ) ||
        numericCompareAtPrice < 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Please enter a valid compare-at price.",
          },
          {
            status: 400,
          }
        );
      }

      if (
        numericCompareAtPrice < numericPrice
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Compare-at price cannot be lower than the selling price.",
          },
          {
            status: 400,
          }
        );
      }
    }

    /* =======================================
       SKU
    ======================================= */

    const cleanSku = String(sku)
      .trim()
      .toUpperCase();

    if (cleanSku.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "SKU must be at least 2 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /* =======================================
       STOCK
    ======================================= */

    const numericStock =
      stock === undefined || stock === ""
        ? 0
        : Number(stock);

    if (
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Stock must be a valid whole number.",
        },
        {
          status: 400,
        }
      );
    }

    /* =======================================
       LOW STOCK THRESHOLD
    ======================================= */

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
            "Low stock threshold must be a valid whole number.",
        },
        {
          status: 400,
        }
      );
    }

    /* =======================================
       STATUS
    ======================================= */

    const allowedStatuses = [
      "active",
      "draft",
      "out_of_stock",
    ];

    const cleanStatus = status || "draft";

    if (
      !allowedStatuses.includes(cleanStatus)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product status.",
        },
        {
          status: 400,
        }
      );
    }

    /* =======================================
       IMAGES
    ======================================= */

    const cleanImages = Array.isArray(images)
      ? images
          .map((image) =>
            String(image).trim()
          )
          .filter(Boolean)
      : [];

    /* =======================================
       SIZES
    ======================================= */

    const cleanSizes = Array.isArray(sizes)
      ? sizes
          .map((size) =>
            String(size).trim()
          )
          .filter(Boolean)
      : [];

    /* =======================================
       COLORS
    ======================================= */

    const cleanColors = Array.isArray(colors)
      ? colors
          .map((color) =>
            String(color).trim()
          )
          .filter(Boolean)
      : [];

    /* =======================================
       SLUG
    ======================================= */

    let cleanSlug = slug
      ? String(slug)
          .trim()
          .toLowerCase()
      : cleanName
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          );

    if (!cleanSlug) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to generate product slug.",
        },
        {
          status: 400,
        }
      );
    }

    /* =======================================
       DATABASE
    ======================================= */

    await connectDB();

    /* =======================================
       CATEGORY VALIDATION
    ======================================= */

    if (
      typeof category !== "string" ||
      !mongoose.Types.ObjectId.isValid(category)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid category.",
        },
        {
          status: 400,
        }
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
        {
          status: 400,
        }
      );
    }

    /* =======================================
       DUPLICATE SKU
    ======================================= */

    const existingSku =
      await Product.findOne({
        sku: cleanSku,
      });

    if (existingSku) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A product with this SKU already exists.",
        },
        {
          status: 409,
        }
      );
    }

    /* =======================================
       DUPLICATE SLUG
    ======================================= */

    const existingSlug =
      await Product.findOne({
        slug: cleanSlug,
      });

    if (existingSlug) {
      let counter = 2;

      const originalSlug = cleanSlug;

      while (
        await Product.findOne({
          slug: `${originalSlug}-${counter}`,
        })
      ) {
        counter++;
      }

      cleanSlug =
        `${originalSlug}-${counter}`;
    }

    /* =======================================
       CREATE PRODUCT
    ======================================= */

    const product =
      await Product.create({
        name: cleanName,

        slug: cleanSlug,

        description:
          cleanDescription,

        category:
          new mongoose.Types.ObjectId(
            category
          ),

        price:
          numericPrice,

        compareAtPrice:
          numericCompareAtPrice,

        images:
          cleanImages,

        sizes:
          cleanSizes,

        colors:
          cleanColors,

        sku:
          cleanSku,

        stock:
          numericStock,

        lowStockThreshold:
          numericLowStockThreshold,

        status:
          cleanStatus,

        // Product visibility flags
        featured:
          Boolean(featured),

        newArrival:
          Boolean(newArrival),

        trending:
          Boolean(trending),

        sale:
          Boolean(sale),
      });

    /* =======================================
       POPULATE CATEGORY
    ======================================= */

    const populatedProduct =
      await Product.findById(
        product._id
      ).populate("category");

    /* =======================================
       RESPONSE
    ======================================= */

    return NextResponse.json(
      {
        success: true,

        message:
          "Product created successfully.",

        product: {
          id:
            populatedProduct?._id.toString(),

          name:
            populatedProduct?.name,

          slug:
            populatedProduct?.slug,

          description:
            populatedProduct?.description,

          category:
            populatedProduct?.category,

          price:
            populatedProduct?.price,

          compareAtPrice:
            populatedProduct?.compareAtPrice,

          images:
            populatedProduct?.images,

          sizes:
            populatedProduct?.sizes,

          colors:
            populatedProduct?.colors,

          sku:
            populatedProduct?.sku,

          stock:
            populatedProduct?.stock,

          lowStockThreshold:
            populatedProduct?.lowStockThreshold ??
            5,

          status:
            populatedProduct?.status,

          featured:
            populatedProduct?.featured,

          newArrival:
            populatedProduct?.newArrival,

          trending:
            populatedProduct?.trending,

          sale:
            populatedProduct?.sale,

          createdAt:
            populatedProduct?.createdAt,

          updatedAt:
            populatedProduct?.updatedAt,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    console.error(
      "Create product error:",
      error
    );

    /* =======================================
       MONGOOSE DUPLICATE KEY
    ======================================= */

    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A product with this SKU or slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create product.",
      },
      {
        status: 500,
      }
    );
  }
}