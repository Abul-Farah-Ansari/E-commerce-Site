"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { TouchEvent } from "react";

type HeroSlide = {
  desktopImageUrl: string;
  mobileImageUrl?: string;
  altText: string;
  sortOrder?: number;
};

const DEFAULT_ALT = "House of Orive fashion collection";
const SLIDE_INTERVAL = 5000;

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const touchStartX = useRef<number | null>(null);

  /*
  =========================================================
  LOAD HERO IMAGES
  =========================================================
  */

  useEffect(() => {
    let active = true;

    async function loadHero() {
      try {
        const response = await fetch("/api/hero", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to fetch hero images.");
        }

        const data = await response.json();

        if (!active || !data.success) return;

        const savedImages: HeroSlide[] =
          Array.isArray(data.hero?.images)
            ? data.hero.images
                .map(
                  (image: {
                    desktopImageUrl?: string;
                    mobileImageUrl?: string;
                    imageUrl?: string;
                    altText?: string;
                    sortOrder?: number;
                  }) => ({
                    desktopImageUrl:
                      image.desktopImageUrl ||
                      image.imageUrl ||
                      "",

                    mobileImageUrl:
                      image.mobileImageUrl || undefined,

                    altText:
                      image.altText || DEFAULT_ALT,

                    sortOrder: image.sortOrder,
                  })
                )
                .filter(
                  (image: HeroSlide) =>
                    Boolean(image.desktopImageUrl)
                )
                .sort(
                  (a: HeroSlide, b: HeroSlide) =>
                    (a.sortOrder ?? 0) -
                    (b.sortOrder ?? 0)
                )
            : [];

        if (!active) return;

        setSlides(savedImages);
        setActiveIndex(0);
      } catch (error) {
        console.error(
          "Unable to load custom hero images:",
          error
        );

        if (active) {
          setSlides([]);
          setActiveIndex(0);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadHero();

    return () => {
      active = false;
    };
  }, []);

  /*
  =========================================================
  NEXT SLIDE
  =========================================================
  */

  const goToNext = useCallback(() => {
    setActiveIndex((current) =>
      slides.length > 0
        ? (current + 1) % slides.length
        : 0
    );
  }, [slides.length]);

  /*
  =========================================================
  PREVIOUS SLIDE
  =========================================================
  */

  const goToPrevious = useCallback(() => {
    setActiveIndex((current) =>
      slides.length > 0
        ? (current - 1 + slides.length) %
          slides.length
        : 0
    );
  }, [slides.length]);

  /*
  =========================================================
  AUTOMATIC SLIDER
  =========================================================
  */

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) =>
        (current + 1) % slides.length
      );
    }, SLIDE_INTERVAL);

    return () => {
      window.clearInterval(timer);
    };
  }, [slides.length]);

  /*
  =========================================================
  TOUCH / SWIPE SUPPORT
  =========================================================
  */

  function handleTouchStart(
    event: TouchEvent<HTMLElement>
  ) {
    touchStartX.current =
      event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(
    event: TouchEvent<HTMLElement>
  ) {
    if (touchStartX.current === null) return;

    const endX =
      event.changedTouches[0]?.clientX;

    if (endX === undefined) {
      touchStartX.current = null;
      return;
    }

    const difference =
      touchStartX.current - endX;

    const swipeThreshold = 50;

    if (slides.length > 1) {
      if (difference > swipeThreshold) {
        goToNext();
      } else if (difference < -swipeThreshold) {
        goToPrevious();
      }
    }

    touchStartX.current = null;
  }

  /*
  =========================================================
  HERO SECTION
  =========================================================
  */

  return (
    <section
      aria-label="Featured fashion collection"
      aria-busy={loading}
      className="relative m-0 h-[60svh] min-h-[300px] max-h-[480px] w-full overflow-hidden bg-black p-0 md:h-[calc(100svh-76px)] md:min-h-[320px] md:max-h-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* HERO IMAGES */}

      {slides.map((slide, index) => (
        <picture
          key={`${slide.desktopImageUrl}-${index}`}
          className={`absolute inset-0 m-0 block h-full w-full transition-opacity duration-700 ease-in-out ${
            index === activeIndex
              ? "z-10 opacity-100"
              : "z-0 opacity-0"
          }`}
        >
          {/* MOBILE IMAGE */}

          {slide.mobileImageUrl && (
            <source
              media="(max-width: 767px)"
              srcSet={slide.mobileImageUrl}
            />
          )}

          {/* DESKTOP IMAGE / MOBILE FALLBACK */}

          <img
            src={slide.desktopImageUrl}
            alt={slide.altText}
            fetchPriority={
              index === activeIndex
                ? "high"
                : "auto"
            }
            loading={
              index === activeIndex
                ? "eager"
                : "lazy"
            }
            draggable={false}
            className="absolute inset-0 m-0 block h-full w-full object-cover object-center p-0"
            aria-hidden={
              index !== activeIndex
            }
          />
        </picture>
      ))}

      {/* CAROUSEL CONTROLS */}

      {slides.length > 1 && (
        <>
          {/* PREVIOUS */}

          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Previous hero image"
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/40 text-2xl text-white backdrop-blur-sm transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white sm:left-6 sm:h-12 sm:w-12"
          >
            <span aria-hidden="true">
              ‹
            </span>
          </button>

          {/* NEXT */}

          <button
            type="button"
            onClick={goToNext}
            aria-label="Next hero image"
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/40 text-2xl text-white backdrop-blur-sm transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white sm:right-6 sm:h-12 sm:w-12"
          >
            <span aria-hidden="true">
              ›
            </span>
          </button>

          {/* SLIDE INDICATORS */}

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  setActiveIndex(index)
                }
                aria-label={`Go to hero image ${index + 1}`}
                aria-current={
                  index === activeIndex
                    ? "true"
                    : undefined
                }
                className={`h-2.5 rounded-full border border-white/80 transition-all duration-300 ${
                  index === activeIndex
                    ? "w-7 bg-white"
                    : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}