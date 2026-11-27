
import { notFound } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";

import CategoryDetailsClient from "@/components/CategoryDetailsClient";

type Props = {
  params: Promise<{ slug: string }>;
};

const BASE_URL = "https://www.houseoforive.in";

export const dynamic = "force-dynamic";

function cleanDescription(value: string = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  let category: any = null;
  let products: any[] = [];

  try {
    await connectDB();

    // ===============================
    // FETCH CATEGORY
    // ===============================
    category = await Category.findOne({
      slug: slug.toLowerCase(),
      status: "active",
    })
      .select(
        "name slug description image status seoTitle seoDescription"
      )
      .lean();

    if (category) {
      // ===============================
      // FETCH CATEGORY PRODUCTS
      // ===============================
      products = await Product.find({
        category: category._id,
        status: { $in: ["active", "out_of_stock"] },
      })
        .select(
          "name slug description price compareAtPrice images stock status featured newArrival"
        )
        .sort({ createdAt: -1 })
        .lean();
    }
  } catch (error) {
    console.error("CATEGORY PAGE ERROR:", error);
    throw error;
  }

  // Keep notFound outside the try/catch.
  if (!category) {
    notFound();
  }

  // ===============================
  // PREPARE CATEGORY DATA
  // ===============================
  const initialCategory = {
    _id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    image: category.image || "",
    status: category.status,
  };

  // ===============================
  // PREPARE PRODUCT DATA
  // ===============================
  const initialProducts = products.map((product) => ({
    _id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    images: product.images || [],
    stock: product.stock,
    status: product.status,
    featured: product.featured,
    newArrival: product.newArrival,
  }));

  // ===============================
  // SEO DATA
  // ===============================
  const seoTitle =
    cleanDescription(category.seoTitle || "") ||
    `${category.name} Collection | House of Orive`;

  const seoDescription =
    cleanDescription(category.seoDescription || "") ||
    cleanDescription(category.description || "") ||
    `Explore the ${category.name} collection at House of Orive.`;

  const categoryUrl = `${BASE_URL}/categories/${encodeURIComponent(
    category.slug
  )}`;

  // ===============================
  // COLLECTION PAGE + ITEM LIST SCHEMA
  // ===============================
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seoTitle,
    url: categoryUrl,
    description: seoDescription,

    isPartOf: {
      "@type": "WebSite",
      name: "House of Orive",
      url: BASE_URL,
    },

    publisher: {
      "@type": "Organization",
      name: "House of Orive",
      url: BASE_URL,
    },

    mainEntity: {
      "@type": "ItemList",
      name: `${category.name} Products`,
      numberOfItems: initialProducts.length,

      itemListElement: initialProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,

        item: {
          "@type": "Product",
          name: product.name,
          url: `${BASE_URL}/products/${encodeURIComponent(
            product.slug
          )}`,

          ...(product.images?.length
            ? { image: product.images }
            : {}),
        },
      })),
    },

    ...(category.image ? { image: category.image } : {}),
  };

  // ===============================
  // SAFE JSON-LD OUTPUT
  // ===============================
  const jsonLdString = JSON.stringify(structuredData).replace(
    /</g,
    "\\u003c"
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdString,
        }}
      />

      <CategoryDetailsClient
        initialCategory={initialCategory}
        initialProducts={initialProducts}
      />
    </>
  );
}
