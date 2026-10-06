import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const categoryParam = searchParams.get("category");

    /*
    =========================================
    FIND CATEGORY
    =========================================

    The category parameter can be either:

    1. Category slug
       /api/products?category=women

    2. Category MongoDB ID
       /api/products?category=6ac116a659fa91929002c7cc

    We support both.
    */

    let categoryId: string | null = null;
    let categoryInfo: any = null;

    if (categoryParam) {
      const normalizedCategoryParam =
        categoryParam.trim();

      let category = null;

      /*
      -----------------------------------------
      CASE 1: CATEGORY ID
      -----------------------------------------
      */

      if (
        mongoose.Types.ObjectId.isValid(
          normalizedCategoryParam
        )
      ) {
        category = await Category.findOne({
          _id: normalizedCategoryParam,
          status: "active",
        })
          .select(
            "_id name slug description image status featured sortOrder"
          )
          .lean();
      }

      /*
      -----------------------------------------
      CASE 2: CATEGORY SLUG
      -----------------------------------------
      */

      if (!category) {
        category = await Category.findOne({
          slug: normalizedCategoryParam.toLowerCase(),
          status: "active",
        })
          .select(
            "_id name slug description image status featured sortOrder"
          )
          .lean();
      }

      /*
      -----------------------------------------
      CATEGORY NOT FOUND
      -----------------------------------------
      */

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            message: "Category not found.",
          },
          {
            status: 404,
          }
        );
      }

      categoryId = category._id.toString();

      categoryInfo = {
        _id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || "",
        status: category.status,
        featured: Boolean(category.featured),
        sortOrder: category.sortOrder ?? 0,
      };
    }

    /*
    =========================================
    FETCH ACTIVE PRODUCTS
    =========================================
    */

    const products = await Product.find({
      status: "active",
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    /*
    =========================================
    FILTER PRODUCTS BY CATEGORY
    =========================================
    */

    const filteredProducts = categoryId
      ? products.filter((product) => {
          if (!product.category) {
            return false;
          }

          return (
            product.category.toString() === categoryId
          );
        })
      : products;

    /*
    =========================================
    GET CATEGORY IDS FROM PRODUCTS
    =========================================
    */

    const categoryIds = filteredProducts
      .map((product) => {
        if (!product.category) {
          return "";
        }

        return product.category.toString();
      })
      .filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );

    /*
    =========================================
    FETCH CATEGORY INFORMATION
    =========================================
    */

    const categories =
      categoryIds.length > 0
        ? await Category.find({
            _id: {
              $in: categoryIds,
            },
          })
            .select(
              "_id name slug description image status featured sortOrder"
            )
            .lean()
        : [];

    /*
    =========================================
    CATEGORY LOOKUP MAP
    =========================================
    */

    const categoryMap = new Map(
      categories.map((category) => [
        category._id.toString(),
        {
          _id: category._id.toString(),
          name: category.name,
          slug: category.slug,
          description: category.description || "",
          image: category.image || "",
          status: category.status,
          featured: Boolean(category.featured),
          sortOrder: category.sortOrder ?? 0,
        },
      ])
    );

    /*
    =========================================
    NORMALIZE PRODUCTS
    =========================================
    */

    const normalizedProducts =
      filteredProducts.map((product) => {
        const productCategoryId =
          product.category
            ? product.category.toString()
            : "";

        const category =
          categoryMap.get(productCategoryId) || null;

        return {
          _id: product._id.toString(),

          name: product.name,

          slug: product.slug,

          description: product.description,

          category,

          price: product.price,

          compareAtPrice:
            product.compareAtPrice ?? null,

          images: product.images || [],

          sizes: product.sizes || [],

          colors: product.colors || [],

          sku: product.sku,

          stock: product.stock,

          lowStockThreshold:
            product.lowStockThreshold ?? 5,

          status: product.status,

          /*
          =====================================
          PRODUCT SECTIONS
          =====================================
          */

          featured: Boolean(product.featured),

          newArrival: Boolean(product.newArrival),

          trending: Boolean(product.trending),

          sale: Boolean(product.sale),

          createdAt:
            product.createdAt?.toISOString?.() ??
            product.createdAt,

          updatedAt:
            product.updatedAt?.toISOString?.() ??
            product.updatedAt,
        };
      });

    /*
    =========================================
    RESPONSE
    =========================================
    */

    return NextResponse.json(
      {
        success: true,

        category: categoryInfo,

        count: normalizedProducts.length,

        products: normalizedProducts,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PUBLIC PRODUCTS API ERROR:",
      error
    );

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