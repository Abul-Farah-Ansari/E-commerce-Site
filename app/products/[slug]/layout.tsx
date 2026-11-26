
import type { Metadata } from "next";

import { connectDB } from "@/lib/mongodb";
import Product from "@/models/Product";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

const BASE_URL = "https://www.houseoforive.in";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  try {
    const { slug } = await params;

    await connectDB();

    const product = await Product.findOne({
      slug: slug.toLowerCase(),
      status: "active",
    })
      .select("name slug description images")
      .lean();

    if (!product) {
      return {
        title: "Product Not Found",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = product.name;

    // Clean HTML and unnecessary whitespace from description
    const cleanDescription = (product.description || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const description =
      cleanDescription.slice(0, 155).trim() ||
      `Discover ${product.name} at House of Orive. Explore timeless fashion and modern elegance.`;

    const canonicalUrl = `${BASE_URL}/products/${encodeURIComponent(
      product.slug
    )}`;

    const image = product.images?.[0] || undefined;

    return {
      title,
      description,

      alternates: {
        canonical: canonicalUrl,
      },

      openGraph: {
        title: `${product.name} | House of Orive`,
        description,
        url: canonicalUrl,
        siteName: "House of Orive",
        locale: "en_IN",
        type: "website",
        ...(image
          ? {
              images: [
                {
                  url: image,
                  alt: product.name,
                },
              ],
            }
          : {}),
      },

      twitter: {
        card: image ? "summary_large_image" : "summary",
        title: `${product.name} | House of Orive`,
        description,
        ...(image ? { images: [image] } : {}),
      },

      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
        },
      },
    };
  } catch (error) {
    console.error("PRODUCT SEO METADATA ERROR:", error);

    return {
      title: "Product",
      description:
        "Discover timeless styles and modern elegance at House of Orive.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function ProductLayout({ children }: Props) {
  return <>{children}</>;
}
