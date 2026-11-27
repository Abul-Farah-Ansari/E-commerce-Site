
import type { Metadata } from "next";

import { connectDB } from "@/lib/mongodb";
import HeroSettings from "@/models/HeroSettings";

import Navbar from "@/components/Navbar";
import Hero, { type HeroSlide } from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import HomeVideoSection from "@/components/HomeVideoSection";
import Benefits from "@/components/Benefits";
import Testimonials from "@/components/Testimonials";
import BrandStory from "@/components/BrandStory";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "House of Orive | Timeless Fashion & Modern Elegance",
  description:
    "Discover House of Orive for timeless fashion, refined essentials and contemporary styles. Explore our latest arrivals and shop online.",

  alternates: {
    canonical: "https://www.houseoforive.in/",
  },

  openGraph: {
    type: "website",
    url: "https://www.houseoforive.in/",
    title: "House of Orive | Timeless Fashion & Modern Elegance",
    description:
      "Discover timeless fashion, refined essentials and contemporary styles at House of Orive.",
    siteName: "House of Orive",
    locale: "en_IN",
  },

  twitter: {
    card: "summary_large_image",
    title: "House of Orive | Timeless Fashion & Modern Elegance",
    description:
      "Discover timeless fashion and modern elegance at House of Orive.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

const DEFAULT_ALT = "House of Orive fashion collection";

async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    await connectDB();

    const settings = await HeroSettings.findOne()
      .select("images")
      .lean();

    if (!settings || !Array.isArray(settings.images)) {
      return [];
    }

    return settings.images
      .map((image, index) => {
        const desktopImageUrl =
          image.desktopImageUrl ||
          image.imageUrl ||
          "";

        return {
          desktopImageUrl,
          mobileImageUrl:
            image.mobileImageUrl || undefined,
          altText:
            image.altText || DEFAULT_ALT,
          sortOrder: image.sortOrder ?? index,
        };
      })
      .filter((image) => Boolean(image.desktopImageUrl))
      .sort(
        (a, b) =>
          (a.sortOrder ?? 0) -
          (b.sortOrder ?? 0)
      );
  } catch (error) {
    console.error(
      "Homepage hero image loading failed:",
      error
    );

    return [];
  }
}

export default async function Home() {
  const heroSlides = await getHeroSlides();

  return (
    <>
      <Navbar />

      <main>
        <Hero initialSlides={heroSlides} />

        <HomeVideoSection />

        <ProductSection
          title="New Arrivals"
          subtitle="THE LATEST EDIT"
          type="new"
          limit={5}
        />

        <ProductSection
          title="Sale"
          subtitle="SPECIAL EDIT"
          type="sale"
          limit={5}
        />

        <ProductSection
          title="Trending Now"
          subtitle="WHAT'S HOT"
          type="trending"
          limit={5}
        />

        <ProductSection
          title="Best Sellers"
          subtitle="MOST WANTED"
          type="featured"
          limit={5}
        />

        <Benefits />
        <BrandStory />
        <Testimonials />
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}
