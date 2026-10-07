import { NextResponse } from "next/server";

import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product";
import Wishlist from "@/models/Wishlist";

const AUTH_SECRET = process.env.AUTH_SECRET;

type DecodedToken = {
  userId: string;
  email: string;
  role?: string;
};

/* =========================================================
   AUTHENTICATED USER
========================================================= */

async function getAuthenticatedUser(
  request: Request
) {
  if (!AUTH_SECRET) {
    throw new Error(
      "AUTH_CONFIG_MISSING"
    );
  }

  const cookieHeader =
    request.headers.get("cookie");

  if (!cookieHeader) {
    return null;
  }

  const authCookie = cookieHeader
    .split(";")
    .find((cookie) =>
      cookie
        .trim()
        .startsWith("auth_token=")
    );

  if (!authCookie) {
    return null;
  }

  const token = authCookie
    .trim()
    .substring(
      "auth_token=".length
    );

  if (!token) {
    return null;
  }

  const decoded = jwt.verify(
    token,
    AUTH_SECRET
  ) as DecodedToken;

  if (!decoded.userId) {
    return null;
  }

  await connectDB();

  const user = await User.findById(
    decoded.userId
  );

  return user;
}

/* =========================================================
   GET WISHLIST
========================================================= */

export async function GET(
  request: Request
) {
  try {
    const user =
      await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message:
            "Please login to view your wishlist.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const wishlist =
      await Wishlist.findOne({
        user: user._id,
      }).populate({
        path: "products",
        match: {
          status: {
            $in: [
              "active",
              "out_of_stock",
            ],
          },
        },
        populate: {
          path: "category",
          select: "name slug",
        },
      });

    const products =
      wishlist?.products || [];

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        products,
        count: products.length,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Get wishlist error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load wishlist.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   ADD TO WISHLIST
========================================================= */

export async function POST(
  request: Request
) {
  try {
    const user =
      await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message:
            "Please login to add products to your wishlist.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const productId = String(
      body?.productId || ""
    ).trim();

    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid product.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const product =
      await Product.findOne({
        _id: productId,
        status: {
          $in: [
            "active",
            "out_of_stock",
          ],
        },
      });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Product is not available.",
        },
        {
          status: 404,
        }
      );
    }

    const wishlist =
      await Wishlist.findOneAndUpdate(
        {
          user: user._id,
        },
        {
          $addToSet: {
            products: product._id,
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

    return NextResponse.json(
      {
        success: true,
        wishlisted: true,
        count:
          wishlist.products.length,
        message:
          "Added to wishlist.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Add wishlist error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to add product to wishlist.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   REMOVE FROM WISHLIST
========================================================= */

export async function DELETE(
  request: Request
) {
  try {
    const user =
      await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message:
            "Please login to manage your wishlist.",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const productId = String(
      body?.productId || ""
    ).trim();

    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid product.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const wishlist =
      await Wishlist.findOneAndUpdate(
        {
          user: user._id,
        },
        {
          $pull: {
            products:
              new mongoose.Types.ObjectId(
                productId
              ),
          },
        },
        {
          new: true,
        }
      );

    return NextResponse.json(
      {
        success: true,
        wishlisted: false,
        count:
          wishlist?.products.length || 0,
        message:
          "Removed from wishlist.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Remove wishlist error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to remove product from wishlist.",
      },
      {
        status: 500,
      }
    );
  }
}