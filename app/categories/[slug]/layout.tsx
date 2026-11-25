
import type { Metadata } from "next";

import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

const BASE_URL = "https://houseoforive.in";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  try {
    const { slug } = await params;

    await connectDB();

    const category = await Category.findOne({
      slug: slug.toLowerCase(),
      status: "active",
    })
      .select("name slug description image")
      .lean();

    if (!category) {
      return {
        title: "Collection Not Found",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = `${category.name} Collection`;

    const cleanDescription = (category.description || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const description =
      cleanDescription.slice(0, 155).trim() ||
      `Explore the ${category.name} collection at House of Orive. Discover thoughtfully selected styles and modern fashion.`;

    const canonicalUrl = `${BASE_URL}/categories/${encodeURIComponent(
      category.slug
    )}`;

    const image = category.image || undefined;

    return {
      title,
      description,

      alternates: {
        canonical: canonicalUrl,
      },

      openGraph: {
        title: `${title} | House of Orive`,
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
                  alt: `${category.name} collection`,
                },
              ],
            }
          : {}),
      },

      twitter: {
        card: image ? "summary_large_image" : "summary",
        title: `${title} | House of Orive`,
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

    return {
      title: "Collection",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default function CategoryLayout({ children }: Props) {
  return <>{children}</>;
}
