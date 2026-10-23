
"use client";

import { useEffect, useState } from "react";

export type PageHeroSlug = "products" | "sale" | "about" | "contact";

export type PageHeroData = {
  imageUrl: string;
  altText: string;
  eyebrow: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
};

type PageHeroDefaults = PageHeroData;

export function usePageHeroSettings(
  page: PageHeroSlug,
  defaults: PageHeroDefaults
) {
  const [hero, setHero] = useState<PageHeroData>(defaults);

  useEffect(() => {
    let cancelled = false;

    async function loadHero() {
      try {
        const response = await fetch(
          `/api/page-hero?page=${page}`,
          { cache: "no-store" }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (cancelled || !data.success || !data.hero) return;

        const saved = data.hero as Partial<PageHeroData>;

        setHero({
          imageUrl: saved.imageUrl || defaults.imageUrl,
          altText: saved.altText || defaults.altText,
          eyebrow: saved.eyebrow || defaults.eyebrow,
          heading: saved.heading || defaults.heading,
          description: saved.description || defaults.description,
          buttonText: saved.buttonText || "",
          buttonLink: saved.buttonLink || "",
        });
      } catch (error) {
        console.error(`Unable to load ${page} hero settings:`, error);
      }
    }

    void loadHero();

    return () => {
      cancelled = true;
    };
  }, [page, defaults]);

  return hero;
}
