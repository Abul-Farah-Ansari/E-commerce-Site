import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import SalePageClient, {
  type SaleProduct,
  type SaleCategory,
} from "@/components/SalePageClient";

export const dynamic = "force-dynamic";

const SITE_URL = "https://houseoforive.in";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sale Collection | Exclusive Fashion Offers",
    description:
      "Explore the Sale Collection at House of Orive. Discover selected styles and current offers across our fashion collection.",
    alternates: {
      canonical: `${SITE_URL}/sale`,
    },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/sale`,
      siteName: "House of Orive",
      title: "Sale Collection | House of Orive",
      description:
        "Discover selected House of Orive styles and current offers in our Sale Collection.",
    },
    twitter: {
      card: "summary_large_image",
      title: "Sale Collection | House of Orive",
      description:
        "Discover selected House of Orive styles and current offers.",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function SalePage() {
  await connectDB();

  const [productDocuments, categoryDocuments] = await Promise.all([
    Product.find({ sale: true, status: "active" })
      .populate("category", "name slug")
      .sort({ createdAt: -1 })
      .lean(),
    Category.find({ status: "active" })
      .select("name slug status")
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean(),
  ]);

  const initialProducts: SaleProduct[] = productDocuments.map((product: any) => {
    const category = product.category
      ? {
          _id: String(product.category._id ?? product.category),
          name: product.category.name ?? "Uncategorized",
          slug: product.category.slug ?? "",
        }
      : null;

    return {
      _id: String(product._id),
      name: String(product.name ?? ""),
      slug: String(product.slug ?? ""),
      description: product.description ?? "",
      category,
      price: Number(product.price ?? 0),
      compareAtPrice:
        product.compareAtPrice == null
          ? undefined
          : Number(product.compareAtPrice),
      images: Array.isArray(product.images) ? product.images : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      sku: product.sku ?? "",
      stock: Number(product.stock ?? 0),
      lowStockThreshold: Number(product.lowStockThreshold ?? 5),
      status: product.status,
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

  const initialCategories: SaleCategory[] = categoryDocuments.map(
    (category: any) => ({
      _id: String(category._id),
      name: String(category.name ?? ""),
      slug: String(category.slug ?? ""),
      status: category.status,
    })
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Sale Collection | House of Orive",
    description:
      "Discover selected House of Orive styles and current offers in our Sale Collection.",
    url: `${SITE_URL}/sale`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: initialProducts.length,
      itemListElement: initialProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/products/${product.slug}`,
        name: product.name,
        ...(product.images?.[0] ? { image: product.images[0] } : {}),
      })),
    },
  };

  const safeStructuredData = JSON.stringify(structuredData).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeStructuredData }}
      />
      <SalePageClient
        initialProducts={initialProducts}
        initialCategories={initialCategories}
      />
    </>
  );
}
