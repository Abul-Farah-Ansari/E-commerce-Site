"use client";

import { useEffect, useState } from "react";

export type PageHeroSlug =
  | "products"
  | "sale"
  | "about"
  | "contact";

export type PageHeroData = {
  // Desktop image
  desktopImageUrl: string;

  // Mobile image
  mobileImageUrl: string;

  // Legacy alias for existing page components
  imageUrl: string;

  altText: string;
  eyebrow: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
};

type PageHeroDefaults = {
  imageUrl?: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;

  altText: string;
  eyebrow: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
};

type SavedPageHero = Partial<PageHeroData>;

function createHeroData(
  saved: SavedPageHero | null | undefined,
  defaults: PageHeroDefaults
): PageHeroData {
  const desktopImageUrl =
    saved?.desktopImageUrl ||
    saved?.imageUrl ||
    defaults.desktopImageUrl ||
    defaults.imageUrl ||
    "";

  const mobileImageUrl =
    saved?.mobileImageUrl ||
    defaults.mobileImageUrl ||
    "";

  return {
    desktopImageUrl,
    mobileImageUrl,

    // Keep old components working with the desktop image.
    imageUrl: desktopImageUrl,

    altText:
      saved?.altText || defaults.altText,

    eyebrow:
      saved?.eyebrow || defaults.eyebrow,

    heading:
      saved?.heading || defaults.heading,

    description:
      saved?.description || defaults.description,

    buttonText:
      saved?.buttonText || defaults.buttonText,

    buttonLink:
      saved?.buttonLink || defaults.buttonLink,
  };
}

export function usePageHeroSettings(
  page: PageHeroSlug,
  defaults: PageHeroDefaults
) {
  const [hero, setHero] = useState<PageHeroData>(() =>
    createHeroData(null, defaults)
  );

  useEffect(() => {
    let cancelled = false;

    async function loadHero() {
      // Set the page's built-in defaults while loading.
      setHero(createHeroData(null, defaults));

      try {
        const response = await fetch(
          `/api/page-hero?page=${encodeURIComponent(page)}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (
          cancelled ||
          !data.success ||
          !data.hero
        ) {
          return;
        }

        const saved = data.hero as SavedPageHero;

        if (!cancelled) {
          setHero(
            createHeroData(saved, defaults)
          );
        }
      } catch (error) {
        console.error(
          `Unable to load ${page} hero settings:`,
          error
        );
      }
    }

    void loadHero();

    return () => {
      cancelled = true;
    };
  }, [
    page,
    defaults.imageUrl,
    defaults.desktopImageUrl,
    defaults.mobileImageUrl,
    defaults.altText,
    defaults.eyebrow,
    defaults.heading,
    defaults.description,
    defaults.buttonText,
    defaults.buttonLink,
  ]);

  return hero;
}