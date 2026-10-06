import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find({
      status: "active",
    })
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .select(
        "_id name slug description image status featured sortOrder"
      )
      .lean();

    const normalizedCategories = categories.map((category) => ({
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      status: category.status,
      featured: Boolean(category.featured),
      sortOrder: category.sortOrder ?? 0,
    }));

    return NextResponse.json(
      {
        success: true,
        categories: normalizedCategories,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Get public categories error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch categories.",
      },
      {
        status: 500,
      }
    );
  }
}