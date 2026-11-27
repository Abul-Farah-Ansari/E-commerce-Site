
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { TouchEvent } from "react";

export type HeroSlide = {
  desktopImageUrl: string;
  mobileImageUrl?: string;
  altText: string;
  sortOrder?: number;
};

type HeroProps = {
  initialSlides?: HeroSlide[];
};

const SLIDE_INTERVAL = 5000;

export default function Hero({
  initialSlides = [],
}: HeroProps) {
  const [slides] = useState<HeroSlide[]>(initialSlides);
  const [activeIndex, setActiveIndex] = useState(0);

  const touchStartX = useRef<number | null>(null);

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
              index === 0 ? "high" : "auto"
            }
            loading={
              index === 0 ? "eager" : "lazy"
            }
            draggable={false}
            className="absolute inset-0 m-0 block h-full w-full object-cover object-center p-0"
            aria-hidden={index !== activeIndex}
          />
        </picture>
      ))}

      {/* CAROUSEL CONTROLS */}

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
