
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import heroImage from "../assets/images/hero2.jpeg";

type HeroSlide = {
  imageUrl: string;
  altText: string;
};

const DEFAULT_ALT = "House of Orive fashion collection";
const SLIDE_INTERVAL = 5000;

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([
    {
      imageUrl: heroImage.src,
      altText: DEFAULT_ALT,
    },
  ]);

  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const goToNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  const goToPrevious = useCallback(() => {
    setActiveIndex(
      (current) => (current - 1 + slides.length) % slides.length
    );
  }, [slides.length]);

  useEffect(() => {
    let active = true;

    async function loadHero() {
      try {
        const response = await fetch("/api/hero", {
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!active || !data.success) return;

        const savedImages = Array.isArray(data.hero?.images)
          ? data.hero.images
              .filter(
                (image: { imageUrl?: string }) =>
                  typeof image.imageUrl === "string" &&
                  image.imageUrl.length > 0
              )
              .map(
                (image: { imageUrl: string; altText?: string }) => ({
                  imageUrl: image.imageUrl,
                  altText: image.altText || DEFAULT_ALT,
                })
              )
          : data.hero?.imageUrl
            ? [
                {
                  imageUrl: data.hero.imageUrl,
                  altText: data.hero.altText || DEFAULT_ALT,
                },
              ]
            : [];

        if (savedImages.length > 0) {
          setSlides(savedImages);
          setActiveIndex(0);
        }
      } catch (error) {
        console.error("Unable to load custom hero images:", error);
      }
    }

    void loadHero();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    if (touchStartX.current === null) return;

    const endX = event.changedTouches[0]?.clientX;
    if (endX === undefined) return;

    const difference = touchStartX.current - endX;
    const swipeThreshold = 50;

    if (difference > swipeThreshold && slides.length > 1) {
      goToNext();
    } else if (difference < -swipeThreshold && slides.length > 1) {
      goToPrevious();
    }

    touchStartX.current = null;
  }

  return (
    <section
      aria-label="Featured fashion collection"
      className="relative m-0 h-[calc(100svh-76px)] min-h-[320px] w-full overflow-hidden bg-black p-0"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, index) => (
        <img
          key={`${slide.imageUrl}-${index}`}
          src={slide.imageUrl}
          alt={slide.altText}
          fetchPriority={index === activeIndex ? "high" : "auto"}
          loading={index === activeIndex ? "eager" : "lazy"}
          draggable={false}
          className={`absolute inset-0 m-0 block h-full w-full object-cover object-center p-0 transition-opacity duration-700 ease-in-out ${
            index === activeIndex
              ? "z-10 opacity-100"
              : "z-0 opacity-0"
          }`}
          aria-hidden={index !== activeIndex}
        />
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Previous hero image"
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/40 text-2xl text-white backdrop-blur-sm transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white sm:left-6 sm:h-12 sm:w-12"
          >
            <span aria-hidden="true">‹</span>
          </button>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Next hero image"
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/40 text-2xl text-white backdrop-blur-sm transition hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white sm:right-6 sm:h-12 sm:w-12"
          >
            <span aria-hidden="true">›</span>
          </button>

          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to hero image ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
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
