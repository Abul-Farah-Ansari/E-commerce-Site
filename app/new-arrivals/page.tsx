
import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";
import NewArrivalsPageClient, {
  type NewArrivalProduct,
} from "@/components/NewArrivalsPageClient";

export const dynamic = "force-dynamic";

const SITE_URL = "https://www.houseoforive.in";

export const metadata: Metadata = {
  title: "New Arrivals | Latest Fashion Collection",
  description:
    "Explore the latest arrivals at House of Orive. Discover new fashion pieces, refined silhouettes and timeless styles from our newest collection.",
  alternates: {
    canonical: `${SITE_URL}/new-arrivals`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/new-arrivals`,
    title: "New Arrivals | House of Orive",
    description:
      "Discover the latest pieces from the House of Orive collection.",
    siteName: "House of Orive",
  },
  twitter: {
    card: "summary_large_image",
    title: "New Arrivals | House of Orive",
    description:
      "Discover the latest pieces from the House of Orive collection.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function NewArrivalsPage() {
  await connectDB();

  const productsFromDB = await Product.find({
    status: "active",
    newArrival: true,
  })
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .lean();

  const products: NewArrivalProduct[] = productsFromDB.map((product: any) => {
    const category =
      product.category && typeof product.category === "object"
        ? {
            _id: String(product.category._id),
            name: String(product.category.name || ""),
            slug: String(product.category.slug || ""),
          }
        : typeof product.category === "string"
          ? product.category
          : null;

    return {
      _id: String(product._id),
      name: String(product.name || ""),
      slug: String(product.slug || ""),
      description: String(product.description || ""),
      category,
      price: Number(product.price || 0),
      compareAtPrice:
        product.compareAtPrice == null
          ? undefined
          : Number(product.compareAtPrice),
      images: Array.isArray(product.images) ? product.images : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      sku: product.sku ? String(product.sku) : undefined,
      stock:
        product.stock == null ? undefined : Number(product.stock),
      lowStockThreshold:
        product.lowStockThreshold == null
          ? undefined
          : Number(product.lowStockThreshold),
      status: product.status,
      featured: Boolean(product.featured),
      newArrival: Boolean(product.newArrival),
      createdAt: product.createdAt
        ? new Date(product.createdAt).toISOString()
        : undefined,
      updatedAt: product.updatedAt
        ? new Date(product.updatedAt).toISOString()
        : undefined,
    };
  });

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "New Arrivals | House of Orive",
    description:
      "Discover the latest pieces from the House of Orive collection.",
    url: `${SITE_URL}/new-arrivals`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/products/${product.slug}`,
        name: product.name,
        image: product.images?.[0] || undefined,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <NewArrivalsPageClient initialProducts={products} />
    </>
  );
}
