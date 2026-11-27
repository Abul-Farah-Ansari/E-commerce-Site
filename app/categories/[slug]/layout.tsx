
import type { Metadata } from "next";

import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

const BASE_URL = "https://www.houseoforive.in";

function cleanText(value: string = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function limitDescription(value: string, maxLength = 155) {
  if (value.length <= maxLength) return value;

  return `${value.slice(0, maxLength - 3).trim()}...`;
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    await connectDB();

    const category = await Category.findOne({
      slug: slug.toLowerCase(),
      status: "active",
    })
      .select(
        "name slug description seoTitle seoDescription image"
      )
      .lean();

    if (!category) {
      return {
        title: "Collection Not Found | House of Orive",
        description: "The requested collection could not be found.",
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    // SEO TITLE
    const customSeoTitle = cleanText(category.seoTitle || "");

    const title =
      customSeoTitle ||
      `${category.name} Collection | House of Orive`;

    // SEO DESCRIPTION
    const categoryDescription = cleanText(
      category.description || ""
    );

    const customSeoDescription = cleanText(
      category.seoDescription || ""
    );

    const description = limitDescription(
      customSeoDescription ||
        categoryDescription ||
        `Explore the ${category.name} collection at House of Orive. Discover thoughtfully selected styles and modern fashion.`
    );

    // CANONICAL URL
    const canonicalUrl = `${BASE_URL}/categories/${encodeURIComponent(
      category.slug
    )}`;

    // SOCIAL IMAGE
    const image = category.image || undefined;

    return {
      title,
      description,

      alternates: {
        canonical: canonicalUrl,
      },

      openGraph: {
        title,
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
                  alt: `${category.name} collection at House of Orive`,
                },
              ],
            }
          : {}),
      },

      twitter: {
        card: image ? "summary_large_image" : "summary",
        title,
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
    console.error("CATEGORY SEO METADATA ERROR:", error);

    // Do not replace category metadata with generic
    // metadata or mark the page noindex on a DB error.
    throw error;
  }
}

export default function CategoryLayout({ children }: Props) {
  return <>{children}</>;
}
