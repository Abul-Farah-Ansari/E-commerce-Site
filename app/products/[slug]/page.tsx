
import { notFound } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductDetailsClient from "@/components/ProductDetailsClient";

type Props = {
  params: { slug: string } | Promise<{ slug: string }>;
};

type ProductDetailsData = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  sku: string;
  stock: number;
  lowStockThreshold: number;
  status: "active" | "draft" | "out_of_stock";
  featured: boolean;
  newArrival: boolean;
};

const BASE_URL = "https://houseoforive.in";

export const dynamic = "force-dynamic";

export default async function ProductDetailsPage({
  params,
}: Props) {
  const { slug } = await params;

  try {
    await connectDB();

    const product = await Product.findOne({
      slug: slug.toLowerCase(),
      status: "active",
    })
      .populate({
        path: "category",
        select: "name slug",
      })
      .lean();

    if (!product) {
      notFound();
    }

    const category = product.category as unknown as
      | {
          _id: unknown;
          name: string;
          slug: string;
        }
      | null;

    const productData: ProductDetailsData = {
      _id: String(product._id),
      name: product.name || "",
      slug: product.slug || "",
      description: product.description || "",

      category: category
        ? {
            _id: String(category._id),
            name: category.name || "",
            slug: category.slug || "",
          }
        : null,

      price: Number(product.price || 0),

      compareAtPrice:
        product.compareAtPrice != null
          ? Number(product.compareAtPrice)
          : null,

      images: Array.isArray(product.images)
        ? product.images.map(String)
        : [],

      sizes: Array.isArray(product.sizes)
        ? product.sizes.map(String)
        : [],

      colors: Array.isArray(product.colors)
        ? product.colors.map(String)
        : [],

      sku: product.sku || "",
      stock: Number(product.stock || 0),
      lowStockThreshold: Number(product.lowStockThreshold || 0),

      status: product.status as
        | "active"
        | "draft"
        | "out_of_stock",

      featured: Boolean(product.featured),
      newArrival: Boolean(product.newArrival),
    };

    // Product structured data for search engines
    const productUrl = `${BASE_URL}/products/${encodeURIComponent(
      productData.slug
    )}`;

    const cleanDescription = productData.description
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",

      name: productData.name,
      description: cleanDescription || productData.name,

      ...(productData.images.length > 0
        ? { image: productData.images }
        : {}),

      ...(productData.sku
        ? { sku: productData.sku }
        : {}),

      ...(productData.category
        ? { category: productData.category.name }
        : {}),

      brand: {
        "@type": "Brand",
        name: "House of Orive",
      },

      ...(productData.colors.length > 0
        ? { color: productData.colors.join(", ") }
        : {}),

      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "INR",
        price: productData.price.toFixed(2),

        availability:
          productData.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",

        itemCondition: "https://schema.org/NewCondition",

        seller: {
          "@type": "Organization",
          name: "House of Orive",
          url: BASE_URL,
        },
      },
    };

    // Escape HTML-sensitive characters before embedding JSON-LD
    const jsonLdString = JSON.stringify(productJsonLd).replace(
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

        <ProductDetailsClient initialProduct={productData} />
      </>
    );
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      String(error.digest).startsWith("NEXT_HTTP_ERROR_FALLBACK")
    ) {
      throw error;
    }

    console.error("SERVER PRODUCT FETCH ERROR:", error);

    throw new Error("Unable to load product details.");
  }
}
