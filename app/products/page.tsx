
import type { Metadata } from "next";

import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

import ProductsPageClient from "@/components/ProductsPageClient";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.houseoforive.in";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Explore the House of Orive collection. Discover contemporary fashion, timeless essentials and carefully selected styles.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    type: "website",
    url: `${BASE_URL}/products`,
    title: "Shop All Products | House of Orive",
    description:
      "Explore the House of Orive collection of contemporary fashion and timeless essentials.",
    siteName: "House of Orive",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop All Products | House of Orive",
    description:
      "Explore contemporary fashion and timeless essentials at House of Orive.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

type CategoryData = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: "active" | "inactive";
  featured: boolean;
  sortOrder: number;
};

type ProductData = {
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
  compareAtPrice?: number;
  images: string[];
  sizes: string[];
  colors: string[];
  sku: string;
  stock: number;
  lowStockThreshold: number;
  status: "active" | "draft" | "out_of_stock";
  featured: boolean;
  newArrival: boolean;
  trending: boolean;
  sale: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export default async function ProductsPage() {
  try {
    await connectDB();

    // Fetch active products
    const products = await Product.find({
      status: "active",
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "category",
        select: "name slug",
      })
      .lean();

    // Fetch active categories
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

    // Normalize category data
    const categoryData: CategoryData[] = categories.map((category) => ({
      _id: String(category._id),
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image: category.image || "",
      status: category.status as "active" | "inactive",
      featured: Boolean(category.featured),
      sortOrder: Number(category.sortOrder ?? 0),
    }));

    // Normalize product data
    const productData: ProductData[] = products.map((product) => {
      const category = product.category as unknown as
        | {
            _id: unknown;
            name?: string;
            slug?: string;
          }
        | null;

      return {
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
            : undefined,

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
        lowStockThreshold: Number(product.lowStockThreshold ?? 5),

        status: product.status as
          | "active"
          | "draft"
          | "out_of_stock",

        featured: Boolean(product.featured),
        newArrival: Boolean(product.newArrival),
        trending: Boolean(product.trending),
        sale: Boolean(product.sale),

        createdAt: product.createdAt
          ? new Date(product.createdAt).toISOString()
          : undefined,

        updatedAt: product.updatedAt
          ? new Date(product.updatedAt).toISOString()
          : undefined,
      };
    });

    // Collection structured data for search engines
    const collectionJsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Shop All Products | House of Orive",
      description:
        "Explore the House of Orive collection of contemporary fashion and timeless essentials.",
      url: `${BASE_URL}/products`,

      isPartOf: {
        "@type": "WebSite",
        name: "House of Orive",
        url: BASE_URL,
      },

      mainEntity: {
        "@type": "ItemList",
        name: "House of Orive Products",
        numberOfItems: productData.length,
        itemListOrder:
          "https://schema.org/ItemListOrderDescending",

        itemListElement: productData.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,

          url: `${BASE_URL}/products/${encodeURIComponent(
            product.slug
          )}`,

          item: {
            "@type": "Product",
            name: product.name,

            ...(product.description
              ? {
                  description: product.description
                    .replace(/<[^>]*>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim(),
                }
              : {}),

            ...(product.images.length > 0
              ? {
                  image: product.images,
                }
              : {}),

            ...(product.sku
              ? {
                  sku: product.sku,
                }
              : {}),

            brand: {
              "@type": "Brand",
              name: "House of Orive",
            },

            offers: {
              "@type": "Offer",
              url: `${BASE_URL}/products/${encodeURIComponent(
                product.slug
              )}`,
              priceCurrency: "INR",
              price: product.price.toFixed(2),

              availability:
                product.stock > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
            },
          },
        })),
      },
    };

    // Safely serialize JSON-LD
    const jsonLdString = JSON.stringify(collectionJsonLd).replace(
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

        <ProductsPageClient
          initialProducts={productData}
          initialCategories={categoryData}
        />
      </>
    );
  } catch (error) {
    console.error("SERVER PRODUCTS PAGE ERROR:", error);

    throw new Error("Unable to load the products collection.");
  }
}
