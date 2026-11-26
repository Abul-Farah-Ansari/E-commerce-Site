
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

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  try {
    await connectDB();

    const category = await Category.findOne({
      slug: slug.toLowerCase(),
      status: "active",
    })
      .select("name slug description image status")
      .lean();

    if (!category) {
      notFound();
    }

    const products = await Product.find({
      category: category._id,
      status: { $in: ["active", "out_of_stock"] },
    })
      .select(
        "name slug description price compareAtPrice images stock status featured newArrival"
      )
      .sort({ createdAt: -1 })
      .lean();

    const initialCategory = {
      _id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      image: category.image || "",
      status: category.status,
    };

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

    // Clean category description for structured data.
    const cleanDescription = (category.description || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const categoryUrl = `${BASE_URL}/categories/${encodeURIComponent(
      category.slug
    )}`;

    // CollectionPage + ItemList structured data.
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${category.name} Collection | House of Orive`,
      url: categoryUrl,
      description:
        cleanDescription ||
        `Explore the ${category.name} collection at House of Orive.`,
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
        itemListOrder: "https://schema.org/ItemListOrderAscending",
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

    // Escape characters that could break the JSON-LD script.
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
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_HTTP_ERROR_FALLBACK")
    ) {
      throw error;
    }

    console.error("CATEGORY PAGE ERROR:", error);
    throw error;
  }
}
