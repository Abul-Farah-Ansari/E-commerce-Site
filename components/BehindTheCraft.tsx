
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

const craftImages = [
  {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=85",
    alt: "Garment craftsmanship",
  },
  {
    src: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1000&q=85",
    alt: "Creative design process",
  },
  {
    src: "https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=1000&q=85",
    alt: "Tailoring and garment production",
  },
  {
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1000&q=85",
    alt: "Fashion collection",
  },
  {
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85",
    alt: "Fashion styling",
  },
];

export default function BehindTheCraft() {
  const [visibleCount, setVisibleCount] = useState(3);
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const total = craftImages.length;

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(window.innerWidth <= 640 ? 1 : 3);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);

    return () =>
      window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const slides = [
    ...craftImages.slice(-visibleCount),
    ...craftImages,
    ...craftImages.slice(0, visibleCount),
  ];

  useEffect(() => {
    setIsTransitioning(false);
    setTrackIndex(visibleCount);
    setActiveIndex(0);

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [visibleCount]);

  useEffect(() => {
    if (isTransitioning) return;

    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [isTransitioning]);

  const nextSlide = () => {
    if (!isTransitioning) return;

    setTrackIndex((current) => current + 1);
    setActiveIndex((current) => (current + 1) % total);
  };

  const previousSlide = () => {
    if (!isTransitioning) return;

    setTrackIndex((current) => current - 1);
    setActiveIndex((current) => (current - 1 + total) % total);
  };

  const handleTransitionEnd = () => {
    if (trackIndex >= total + visibleCount) {
      setIsTransitioning(false);
      setTrackIndex(visibleCount);
    } else if (trackIndex < visibleCount) {
      setIsTransitioning(false);
      setTrackIndex(total + trackIndex);
    }
  };

  return (
    <section className="w-full overflow-hidden bg-[#FAF8F5] py-8 sm:py-10">
      {/* 10% margin on both sides */}
      <div className="mx-auto w-[80%]">
        {/* Heading */}
        <div className="mb-5">
          <h2 className="font-serif text-[25px] uppercase leading-tight tracking-[-0.03em] text-black sm:text-[30px]">
            Behind the Craft
          </h2>
        </div>

        {/* Infinite Carousel */}
        <div className="relative overflow-hidden">
          <div
            className="craft-carousel-track flex"
            style={{
              transform: `translateX(-${
                (trackIndex * 100) / slides.length
              }%)`,
              transition: isTransitioning
                ? "transform 450ms ease-in-out"
                : "none",
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {slides.map((image, index) => (
              <div
                key={`${image.src}-${index}`}
                className="craft-carousel-slide shrink-0"
              >
                <div className="h-[280px] overflow-hidden bg-[#FAF8F5] sm:h-[350px] lg:h-[460px]">
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    draggable={false}
                    className="block h-full w-full select-none object-cover"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Previous Arrow */}
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous photos"
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white transition hover:bg-black/60"
          >
            <Icon
              icon="solar:alt-arrow-left-linear"
              width={27}
              height={27}
            />
          </button>

          {/* Next Arrow */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next photos"
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white transition hover:bg-black/60"
          >
            <Icon
              icon="solar:alt-arrow-right-linear"
              width={27}
              height={27}
            />
          </button>
        </div>
      </div>

      <style jsx>{`
        .craft-carousel-track {
          width: 100%;
          will-change: transform;
        }

        .craft-carousel-slide {
          flex: 0 0 33.333333%;
          width: 33.333333%;
          box-sizing: border-box;
          padding-right: 10px;
        }

        .craft-carousel-slide:last-child {
          padding-right: 0;
        }

        .craft-carousel-slide img {
          object-position: center;
        }

        @media (max-width: 640px) {
          .craft-carousel-slide {
            flex-basis: 100%;
            width: 100%;
            padding-right: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .craft-carousel-track {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
