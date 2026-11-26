
import type { MetadataRoute } from "next";

import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use the www domain consistently with Google's selected canonical.
  const baseUrl = "https://www.houseoforive.in";

  // Public static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/new-arrivals`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sale`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/accessibility`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/return-refund-policy`,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms-and-conditions`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies-policy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    await connectDB();

    // Fetch active products
    const products = await Product.find({
      status: "active",
    })
      .select("slug updatedAt")
      .lean();

    const productPages: MetadataRoute.Sitemap = products
      .filter((product) => Boolean(product.slug))
      .map((product) => ({
        url: `${baseUrl}/products/${encodeURIComponent(product.slug)}`,
        ...(product.updatedAt
          ? { lastModified: new Date(product.updatedAt) }
          : {}),
        changeFrequency: "weekly",
        priority: 0.8,
      }));

    // Fetch active categories
    const categories = await Category.find({
      status: "active",
    })
      .select("slug updatedAt")
      .lean();

    const categoryPages: MetadataRoute.Sitemap = categories
      .filter((category) => Boolean(category.slug))
      .map((category) => ({
        url: `${baseUrl}/categories/${encodeURIComponent(category.slug)}`,
        ...(category.updatedAt
          ? { lastModified: new Date(category.updatedAt) }
          : {}),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    return [
      ...staticPages,
      ...categoryPages,
      ...productPages,
    ];
  } catch (error) {
    console.error("SITEMAP GENERATION ERROR:", error);

    // Keep static pages available if MongoDB is unavailable
    return staticPages;
  }
}
