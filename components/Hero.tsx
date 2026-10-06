"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";

import heroImage from "../assets/images/hero.jpg";

const slides = [
  {
    id: 1,
    image: heroImage,
    label: "New Collection · 2026",
    title: "Style",
    titleLight: "Without Limits.",
    description:
      "Discover carefully selected pieces designed for modern living. Timeless style, effortless comfort, and quality made to last.",
    position: "center",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1711467714592-56781075e928?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    label: "The Essentials · 2026",
    title: "Defined",
    titleLight: "By Detail.",
    description:
      "Refined silhouettes and considered details created for a wardrobe that feels effortlessly modern.",
    position: "center",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2200&q=90",
    label: "The Edit · 2026",
    title: "Made",
    titleLight: "To Stand Out.",
    description:
      "Explore contemporary pieces that balance confidence, comfort, and timeless design.",
    position: "center",
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = slides.length;

  /* =========================================
     NEXT SLIDE
  ========================================= */

  const nextSlide = () => {
    setCurrentSlide((previous) =>
      previous === totalSlides - 1
        ? 0
        : previous + 1
    );
  };

  /* =========================================
     PREVIOUS SLIDE
  ========================================= */

  const previousSlide = () => {
    setCurrentSlide((previous) =>
      previous === 0
        ? totalSlides - 1
        : previous - 1
    );
  };

  /* =========================================
     AUTO CAROUSEL
  ========================================= */

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentSlide((previous) =>
        previous === totalSlides - 1
          ? 0
          : previous + 1
      );
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isPaused, totalSlides]);

  const slide = slides[currentSlide];

  return (
    <section
      className="hero-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* =====================================
          BACKGROUND CAROUSEL
      ===================================== */}

      <div className="hero-background">
        <AnimatePresence initial={false}>
          <motion.div
            key={slide.id}
            className="hero-slide-image"
            initial={{
              opacity: 0,
              scale: 1.06,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              scale: 1.02,
            }}
            transition={{
              opacity: {
                duration: 1,
              },
              scale: {
                duration: 6,
                ease: "easeOut",
              },
            }}
            style={{
              backgroundImage:
                typeof slide.image === "string"
                  ? `url("${slide.image}")`
                  : undefined,
              backgroundPosition:
                slide.position,
            }}
          >
            {/* Local next/image background */}
            {slide.id === 1 && (
              <Image
                src={heroImage}
                alt="New fashion collection"
                fill
                priority
                sizes="100vw"
                className="hero-local-image"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>


      {/* =====================================
          PREMIUM OVERLAY
      ===================================== */}

      <div className="hero-overlay" />

      <div className="hero-overlay-secondary" />


      {/* =====================================
          TOP RIGHT SLIDE NUMBER
      ===================================== */}

      <div className="hero-slide-number">

        <span className="hero-slide-current">
          {String(currentSlide + 1).padStart(
            2,
            "0"
          )}
        </span>

        <span className="hero-slide-divider">
          /
        </span>

        <span className="hero-slide-total">
          {String(totalSlides).padStart(
            2,
            "0"
          )}
        </span>

      </div>


      {/* =====================================
          CONTENT
      ===================================== */}

      <div className="hero-content-layer">

        <div className="hero-content-container">

          <AnimatePresence mode="wait">

            <motion.div
              key={slide.id}
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -15,
              }}
              transition={{
                duration: 0.65,
                ease: "easeOut",
              }}
              className="hero-content"
            >

              {/* =========================
                  LABEL
              ========================= */}

              <div className="hero-label">

                <span className="hero-label-line" />

                <span className="hero-label-text">
                  {slide.label}
                </span>

              </div>


              {/* =========================
                  HEADING
              ========================= */}

              <h1 className="hero-title">

                {slide.title}

                <br />

                <span>
                  {slide.titleLight}
                </span>

              </h1>


              {/* =========================
                  DESCRIPTION
              ========================= */}

              <p className="hero-description">
                {slide.description}
              </p>


              {/* =========================
                  BUTTON
              ========================= */}

              <div className="hero-button-wrapper">

                <Link
                  href="/products"
                  className="hero-button"
                >

                  <span>
                    Shop Collection
                  </span>

                  <span className="hero-button-icon">

                    <Icon
                      icon="solar:arrow-right-linear"
                      width="20"
                      height="20"
                    />

                  </span>

                </Link>

              </div>

            </motion.div>

          </AnimatePresence>

        </div>

      </div>


      {/* =====================================
          CAROUSEL CONTROLS
      ===================================== */}

      <div className="hero-controls">

        {/* PREVIOUS */}

        <button
          type="button"
          className="hero-arrow hero-arrow-prev"
          onClick={previousSlide}
          aria-label="Previous slide"
        >

          <Icon
            icon="solar:arrow-left-linear"
            width="20"
            height="20"
          />

        </button>


        {/* DOTS */}

        <div className="hero-dots">

          {slides.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`hero-dot ${
                currentSlide === index
                  ? "hero-dot-active"
                  : ""
              }`}
              onClick={() =>
                setCurrentSlide(index)
              }
              aria-label={`Go to slide ${
                index + 1
              }`}
            />
          ))}

        </div>


        {/* NEXT */}

        <button
          type="button"
          className="hero-arrow hero-arrow-next"
          onClick={nextSlide}
          aria-label="Next slide"
        >

          <Icon
            icon="solar:arrow-right-linear"
            width="20"
            height="20"
          />

        </button>

      </div>


      {/* =====================================
          BOTTOM INFORMATION
      ===================================== */}

      <div className="hero-bottom-info">

        <span className="hero-bottom-text">
          Timeless · Modern · Essential
        </span>


        <div className="hero-scroll">

          <span>
            Scroll
          </span>

          <Icon
            icon="solar:arrow-down-linear"
            width="17"
            height="17"
          />

        </div>

      </div>


      {/* =====================================
          PROGRESS BAR
      ===================================== */}

      <div className="hero-progress">

        <motion.div
          key={`${currentSlide}-${isPaused}`}
          className="hero-progress-bar"
          initial={{
            width: "0%",
          }}
          animate={{
            width: isPaused
              ? undefined
              : "100%",
          }}
          transition={{
            duration: isPaused
              ? 0
              : 5,
            ease: "linear",
          }}
        />

      </div>


      {/* =====================================
          RESPONSIVE CSS
      ===================================== */}

      <style jsx>{`

        /* =====================================
           HERO
        ===================================== */

        .hero-section {
          position: relative;

          width: 100%;

          height: 620px;

          overflow: hidden;

          background: #111111;

          isolation: isolate;
        }


        /* =====================================
           BACKGROUND
        ===================================== */

        .hero-background {
          position: absolute;

          inset: 0;

          z-index: 0;

          overflow: hidden;
        }

        .hero-slide-image {
          position: absolute;

          inset: 0;

          width: 100%;

          height: 100%;

          background-size: cover;

          background-repeat: no-repeat;
        }

        .hero-local-image {
          position: absolute !important;

          inset: 0 !important;

          width: 100% !important;

          height: 100% !important;

          object-fit: cover !important;

          object-position: center !important;
        }


        /* =====================================
           OVERLAY
        ===================================== */

        .hero-overlay {
          position: absolute;

          inset: 0;

          z-index: 1;

          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.76) 0%,
              rgba(0, 0, 0, 0.56) 30%,
              rgba(0, 0, 0, 0.22) 68%,
              rgba(0, 0, 0, 0.05) 100%
            );
        }

        .hero-overlay-secondary {
          position: absolute;

          inset: 0;

          z-index: 1;

          background:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.18) 0%,
              transparent 35%,
              rgba(0, 0, 0, 0.32) 100%
            );

          pointer-events: none;
        }


        /* =====================================
           CONTENT
        ===================================== */

        .hero-content-layer {
          position: relative;

          z-index: 3;

          width: 100%;

          height: 100%;

          display: flex;

          align-items: center;
        }

        .hero-content-container {
          width: 100%;

          max-width: 1280px;

          margin: 0 auto;

          padding:
            0 40px;

          box-sizing: border-box;
        }

        .hero-content {
          max-width: 600px;
        }


        /* =====================================
           LABEL
        ===================================== */

        .hero-label {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-bottom: 22px;
        }

        .hero-label-line {
          display: block;

          width: 38px;

          height: 1px;

          background:
            rgba(255, 255, 255, 0.8);

          flex-shrink: 0;
        }

        .hero-label-text {
          color:
            rgba(255, 255, 255, 0.88);

          font-size: 11px;

          font-weight: 600;

          letter-spacing:
            0.28em;

          text-transform: uppercase;
        }


        /* =====================================
           TITLE
        ===================================== */

        .hero-title {
          margin: 0;

          color: #ffffff;

          font-size:
            clamp(58px, 7vw, 92px);

          line-height: 0.88;

          font-weight: 700;

          letter-spacing:
            -0.045em;

          text-transform: uppercase;
        }

        .hero-title span {
          color:
            rgba(255, 255, 255, 0.76);

          font-weight: 300;
        }


        /* =====================================
           DESCRIPTION
        ===================================== */

        .hero-description {
          margin:
            28px 0 0;

          max-width: 500px;

          color:
            rgba(255, 255, 255, 0.82);

          font-size: 16px;

          line-height: 1.8;

          font-weight: 400;

          letter-spacing:
            0.01em;
        }


        /* =====================================
           BUTTON
        ===================================== */

        .hero-button-wrapper {
          margin-top: 32px;
        }

        .hero-button {
          display: inline-flex;

          align-items: center;

          gap: 13px;

          padding:
            15px 17px 15px 24px;

          border-radius: 999px;

          background: #ffffff;

          color: #111111;

          font-size: 13px;

          font-weight: 600;

          text-decoration: none;

          transition:
            transform 0.3s ease,
            background 0.3s ease,
            box-shadow 0.3s ease;
        }

        .hero-button:hover {
          transform:
            translateY(-3px);

          background: #f3f3f3;

          box-shadow:
            0 12px 30px
            rgba(0, 0, 0, 0.2);
        }

        .hero-button-icon {
          width: 31px;

          height: 31px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          background: #111111;

          color: #ffffff;

          transition:
            transform 0.3s ease;
        }

        .hero-button:hover
          .hero-button-icon {
          transform:
            translateX(3px);
        }


        /* =====================================
           SLIDE NUMBER
        ===================================== */

        .hero-slide-number {
          position: absolute;

          top: 34px;

          right: 40px;

          z-index: 4;

          display: flex;

          align-items: center;

          gap: 7px;

          color:
            rgba(255, 255, 255, 0.68);

          font-size: 11px;

          letter-spacing:
            0.12em;

          font-weight: 500;
        }

        .hero-slide-current {
          color: #ffffff;

          font-weight: 700;
        }

        .hero-slide-divider {
          color:
            rgba(255, 255, 255, 0.35);
        }


        /* =====================================
           CAROUSEL CONTROLS
        ===================================== */

        .hero-controls {
          position: absolute;

          right: 40px;

          bottom: 72px;

          z-index: 5;

          display: flex;

          align-items: center;

          gap: 11px;
        }

        .hero-arrow {
          width: 43px;

          height: 43px;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 0;

          border:
            1px solid
            rgba(255, 255, 255, 0.32);

          border-radius: 50%;

          background:
            rgba(0, 0, 0, 0.18);

          backdrop-filter: blur(8px);

          -webkit-backdrop-filter:
            blur(8px);

          color: #ffffff;

          cursor: pointer;

          transition:
            background 0.25s ease,
            border-color 0.25s ease,
            transform 0.25s ease;
        }

        .hero-arrow:hover {
          background:
            rgba(255, 255, 255, 0.15);

          border-color:
            rgba(255, 255, 255, 0.7);

          transform:
            translateY(-2px);
        }


        /* =====================================
           DOTS
        ===================================== */

        .hero-dots {
          display: flex;

          align-items: center;

          gap: 6px;

          padding:
            0 3px;
        }

        .hero-dot {
          width: 6px;

          height: 6px;

          padding: 0;

          border: none;

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.38);

          cursor: pointer;

          transition:
            width 0.3s ease,
            background 0.3s ease;
        }

        .hero-dot-active {
          width: 25px;

          background: #ffffff;
        }


        /* =====================================
           BOTTOM INFORMATION
        ===================================== */

        .hero-bottom-info {
          position: absolute;

          left: 0;

          right: 0;

          bottom: 25px;

          z-index: 4;

          padding:
            0 40px;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          pointer-events: none;
        }

        .hero-bottom-text {
          color:
            rgba(255, 255, 255, 0.58);

          font-size: 9px;

          letter-spacing:
            0.3em;

          text-transform: uppercase;
        }

        .hero-scroll {
          display: flex;

          align-items: center;

          gap: 8px;

          color:
            rgba(255, 255, 255, 0.58);
        }

        .hero-scroll span {
          font-size: 9px;

          letter-spacing:
            0.25em;

          text-transform: uppercase;
        }


        /* =====================================
           PROGRESS
        ===================================== */

        .hero-progress {
          position: absolute;

          left: 0;

          right: 0;

          bottom: 0;

          z-index: 6;

          height: 2px;

          background:
            rgba(255, 255, 255, 0.16);
        }

        .hero-progress-bar {
          height: 100%;

          background: #ffffff;
        }


        /* =====================================
           TABLET
        ===================================== */

        @media (max-width: 1024px) {

          .hero-section {
            height: 570px;
          }

          .hero-content-container {
            padding:
              0 30px;
          }

          .hero-content {
            max-width: 540px;
          }

          .hero-title {
            font-size:
              clamp(
                52px,
                8vw,
                76px
              );
          }

          .hero-description {
            max-width: 450px;

            font-size: 15px;
          }

          .hero-slide-number {
            right: 30px;
          }

          .hero-controls {
            right: 30px;

            bottom: 68px;
          }

          .hero-bottom-info {
            padding:
              0 30px;
          }
        }


        /* =====================================
           MOBILE
        ===================================== */

        @media (max-width: 768px) {

          .hero-section {
            height: 540px;
          }

          .hero-slide-image {
            background-position:
              62% center;
          }

          .hero-local-image {
            object-position:
              62% center !important;
          }

          .hero-overlay {
            background:
              linear-gradient(
                90deg,
                rgba(0, 0, 0, 0.76) 0%,
                rgba(0, 0, 0, 0.56) 48%,
                rgba(0, 0, 0, 0.20) 100%
              );
          }

          .hero-content-container {
            padding:
              0 22px;
          }

          .hero-content {
            width: 100%;

            max-width: 520px;
          }

          .hero-label {
            gap: 9px;

            margin-bottom: 18px;
          }

          .hero-label-line {
            width: 28px;
          }

          .hero-label-text {
            font-size: 9px;

            letter-spacing:
              0.18em;
          }

          .hero-title {
            font-size:
              clamp(
                46px,
                13vw,
                68px
              );

            line-height: 0.92;
          }

          .hero-description {
            margin-top: 22px;

            max-width: 430px;

            font-size: 14px;

            line-height: 1.65;
          }

          .hero-button-wrapper {
            margin-top: 26px;
          }

          .hero-button {
            padding:
              12px 14px 12px 20px;

            gap: 10px;

            font-size: 12px;
          }

          .hero-button-icon {
            width: 28px;

            height: 28px;
          }

          .hero-slide-number {
            top: 23px;

            right: 22px;

            font-size: 9px;
          }

          .hero-controls {
            left: 22px;

            right: auto;

            bottom: 67px;

            gap: 8px;
          }

          .hero-arrow {
            width: 37px;

            height: 37px;
          }

          .hero-dots {
            gap: 5px;
          }

          .hero-dot {
            width: 5px;

            height: 5px;
          }

          .hero-dot-active {
            width: 21px;
          }

          .hero-bottom-info {
            bottom: 17px;

            padding:
              0 22px;
          }

          .hero-bottom-text {
            font-size: 7px;

            letter-spacing:
              0.18em;
          }

          .hero-scroll {
            gap: 5px;
          }

          .hero-scroll span {
            font-size: 7px;

            letter-spacing:
              0.16em;
          }

          .hero-scroll :global(svg) {
            width: 13px;

            height: 13px;
          }
        }


        /* =====================================
           SMALL MOBILE
        ===================================== */

        @media (max-width: 480px) {

          .hero-section {
            height: 500px;
          }

          .hero-slide-image {
            background-position:
              65% center;
          }

          .hero-local-image {
            object-position:
              65% center !important;
          }

          .hero-content-container {
            padding:
              0 18px;
          }

          .hero-label {
            margin-bottom: 15px;
          }

          .hero-label-line {
            width: 22px;
          }

          .hero-label-text {
            font-size: 8px;

            letter-spacing:
              0.14em;
          }

          .hero-title {
            font-size: 46px;

            line-height: 0.94;
          }

          .hero-description {
            margin-top: 19px;

            max-width: 340px;

            font-size: 12px;

            line-height: 1.6;
          }

          .hero-button-wrapper {
            margin-top: 22px;
          }

          .hero-button {
            padding:
              11px 13px 11px 17px;

            font-size: 11px;

            gap: 8px;
          }

          .hero-button-icon {
            width: 26px;

            height: 26px;
          }

          .hero-slide-number {
            top: 19px;

            right: 18px;

            font-size: 8px;
          }

          .hero-controls {
            left: 18px;

            bottom: 61px;
          }

          .hero-arrow {
            width: 34px;

            height: 34px;
          }

          .hero-arrow :global(svg) {
            width: 17px;

            height: 17px;
          }

          .hero-bottom-info {
            bottom: 13px;

            padding:
              0 18px;
          }

          .hero-bottom-text {
            font-size: 6px;

            letter-spacing:
              0.12em;
          }

          .hero-scroll {
            display: none;
          }
        }


        /* =====================================
           EXTRA SMALL
        ===================================== */

        @media (max-width: 360px) {

          .hero-section {
            height: 480px;
          }

          .hero-title {
            font-size: 41px;
          }

          .hero-description {
            font-size: 11px;

            max-width: 310px;
          }

          .hero-button {
            padding:
              10px 12px 10px 15px;

            font-size: 10px;
          }

          .hero-button-icon {
            width: 24px;

            height: 24px;
          }

          .hero-controls {
            bottom: 57px;
          }

          .hero-arrow {
            width: 32px;

            height: 32px;
          }

          .hero-bottom-text {
            font-size: 5px;
          }
        }

      `}</style>
    </section>
  );
}