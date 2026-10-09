"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

import heroImage from "../assets/images/hero.jpg";
import heroImage2 from "../assets/images/2.jpg";
import heroImage3 from "../assets/images/3.jpg";
import heroImage4 from "../assets/images/4.jpg";

const images = [
  heroImage.src,
  heroImage2.src,
  heroImage3.src,
  heroImage4.src,
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="hero">

      {/* =====================================
          HERO IMAGES
      ===================================== */}

      <div className="hero-images">
        {images.map((image, index) => (
          <img
            key={image}
            src={image}
            alt="House Of Orive fashion collection"
            className={`hero-image ${
              current === index ? "active" : ""
            }`}
          />
        ))}
      </div>

      {/* =====================================
          OVERLAYS
      ===================================== */}

      <div className="hero-overlay" />

      <div className="hero-gradient" />

      {/* =====================================
          TOP BRAND
      ===================================== */}

      <div className="hero-brand">
        HOUSE OF ORIVE
      </div>

      {/* =====================================
          SLIDE NUMBER
      ===================================== */}

      <div className="hero-number">
        <span className="active-number">
          {String(current + 1).padStart(2, "0")}
        </span>

        <span className="number-divider">
          /
        </span>

        <span>
          {String(images.length).padStart(2, "0")}
        </span>
      </div>

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <div className="hero-content">
        <div className="hero-copy">

          {/* EYEBROW */}

          <div className="hero-eyebrow">
            <span className="eyebrow-line" />

            <span>
              THE NEW EDIT · 2026
            </span>
          </div>

          {/* TITLE */}

          <h1>
            Modern
            <br />
            <span>Essentials.</span>
          </h1>

          {/* DESCRIPTION */}

          <p className="hero-description">
            Thoughtfully selected fashion for
            effortless everyday elegance.
          </p>

          {/* BUTTON */}

          <div className="hero-button-wrapper">
            <Link
              href="/products"
              className="shop-button"
            >
              <span className="shop-button-text">
                Shop Collection
              </span>

              <span className="shop-button-arrow">
                <Icon
                  icon="solar:arrow-right-linear"
                  width="20"
                  height="20"
                />
              </span>
            </Link>
          </div>

        </div>
      </div>

      {/* =====================================
          BOTTOM LEFT
      ===================================== */}

      <div className="hero-bottom-left">
        <span>Timeless</span>

        <span className="bottom-dot">
          •
        </span>

        <span>Modern</span>

        <span className="bottom-dot">
          •
        </span>

        <span>Essential</span>
      </div>

      {/* =====================================
          SLIDE INDICATOR
      ===================================== */}

      <div className="hero-indicator">

        <div className="indicator-numbers">
          <span className="indicator-current">
            {String(current + 1).padStart(2, "0")}
          </span>

          <span className="indicator-total">
            {String(images.length).padStart(2, "0")}
          </span>
        </div>

        <div className="indicator-line">
          <div
            className="indicator-progress"
            style={{
              width: `${
                ((current + 1) / images.length) * 100
              }%`,
            }}
          />
        </div>

      </div>

      {/* =====================================
          DOTS
      ===================================== */}

      <div className="hero-dots">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => setCurrent(index)}
            className={`hero-dot ${
              current === index
                ? "hero-dot-active"
                : ""
            }`}
          />
        ))}
      </div>

      {/* =====================================
          STYLES
      ===================================== */}

      <style jsx>{`
        /* =====================================
           HERO
        ===================================== */

        .hero {
          position: relative;

          width: 100%;
          height: 650px;

          overflow: hidden;

          background: #111111;

          isolation: isolate;
        }

        /* =====================================
           IMAGES
        ===================================== */

        .hero-images {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          overflow: hidden;

          z-index: 0;
        }

        .hero-image {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          object-position: center;

          opacity: 0;

          filter:
            grayscale(100%)
            contrast(1.08)
            brightness(0.92);

          transform: scale(1.025);

          transition:
            opacity 1.2s ease,
            transform 6s ease;

          user-select: none;
        }

        .hero-image.active {
          opacity: 1;

          transform: scale(1);
        }

        /* =====================================
           OVERLAY
        ===================================== */

        .hero-overlay {
          position: absolute;

          inset: 0;

          z-index: 1;

          pointer-events: none;

          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.74) 0%,
              rgba(0, 0, 0, 0.48) 34%,
              rgba(0, 0, 0, 0.16) 70%,
              rgba(0, 0, 0, 0.04) 100%
            );
        }

        .hero-gradient {
          position: absolute;

          inset: 0;

          z-index: 2;

          pointer-events: none;

          background:
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.16) 0%,
              transparent 45%,
              rgba(0, 0, 0, 0.5) 100%
            );
        }

        /* =====================================
           BRAND
        ===================================== */

        .hero-brand {
          position: absolute;

          top: 32px;
          left: 6%;

          z-index: 10;

          color:
            rgba(255, 255, 255, 0.88);

          font-size: 9px;

          font-weight: 700;

          letter-spacing: 0.32em;

          text-transform: uppercase;
        }

        /* =====================================
           NUMBER
        ===================================== */

        .hero-number {
          position: absolute;

          top: 32px;
          right: 6%;

          z-index: 10;

          display: flex;

          align-items: center;

          gap: 8px;

          color:
            rgba(255, 255, 255, 0.42);

          font-size: 10px;

          font-weight: 500;

          letter-spacing: 0.16em;
        }

        .active-number {
          color: #ffffff;

          font-weight: 700;
        }

        .number-divider {
          color:
            rgba(255, 255, 255, 0.28);
        }

        /* =====================================
           CONTENT
        ===================================== */

        .hero-content {
          position: relative;

          z-index: 8;

          width: 100%;
          height: 100%;

          display: flex;

          align-items: center;

          box-sizing: border-box;

          padding-left: 7%;
        }

        .hero-copy {
          width: 620px;

          max-width: 100%;
        }

        /* =====================================
           EYEBROW
        ===================================== */

        .hero-eyebrow {
          display: flex;

          align-items: center;

          gap: 14px;

          margin-bottom: 28px;

          color:
            rgba(255, 255, 255, 0.84);

          font-size: 10px;

          font-weight: 700;

          letter-spacing: 0.3em;

          text-transform: uppercase;
        }

        .eyebrow-line {
          width: 42px;

          height: 1px;

          background:
            rgba(255, 255, 255, 0.8);

          flex-shrink: 0;
        }

        /* =====================================
           TITLE
        ===================================== */

        .hero-copy h1 {
          margin: 0;

          color: #ffffff;

          font-size:
            clamp(
              65px,
              8vw,
              108px
            );

          line-height: 0.88;

          font-weight: 600;

          letter-spacing: -0.065em;

          text-transform: uppercase;
        }

        .hero-copy h1 span {
          color:
            rgba(255, 255, 255, 0.62);

          font-weight: 300;
        }

        /* =====================================
           DESCRIPTION
        ===================================== */

        .hero-description {
          max-width: 410px;

          margin: 34px 0 0;

          color:
            rgba(255, 255, 255, 0.84);

          font-size: 15px;

          line-height: 1.8;

          letter-spacing: 0.015em;
        }

        /* =====================================
           BUTTON WRAPPER
        ===================================== */

        .hero-button-wrapper {
          margin-top: 34px;

          display: block;
        }

        /* =====================================
           PREMIUM BUTTON
        ===================================== */

        .shop-button {
          position: relative;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 18px;

          min-height: 54px;

          padding: 7px 8px 7px 27px;

          box-sizing: border-box;

          border: 1px solid #ffffff;

          border-radius: 999px;

          background: #FAF8F5;

          color: #111111;

          text-decoration: none;

          font-size: 11px;

          font-weight: 800;

          letter-spacing: 0.13em;

          text-transform: uppercase;

          box-shadow:
            0 12px 30px
              rgba(0, 0, 0, 0.42),
            0 0 0 5px
              rgba(255, 255, 255, 0.08);

          transition:
            transform 0.3s ease,
            background 0.3s ease,
            color 0.3s ease,
            box-shadow 0.3s ease;
        }

        .shop-button:hover {
          transform:
            translateY(-3px);

          background: #111111;

          color: #ffffff;

          box-shadow:
            0 18px 42px
              rgba(0, 0, 0, 0.55),
            0 0 0 5px
              rgba(255, 255, 255, 0.13);
        }

        .shop-button-text {
          display: block;

          white-space: nowrap;
        }

        .shop-button-arrow {
          width: 39px;
          height: 39px;

          display: flex;

          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 50%;

          background: #111111;

          color: #ffffff;

          transition:
            transform 0.3s ease,
            background 0.3s ease,
            color 0.3s ease;
        }

        .shop-button:hover
          .shop-button-arrow {
          transform:
            translateX(4px);

          background: #FAF8F5;

          color: #111111;
        }

        /* =====================================
           BOTTOM LEFT
        ===================================== */

        .hero-bottom-left {
          position: absolute;

          left: 6%;

          bottom: 31px;

          z-index: 10;

          display: flex;

          align-items: center;

          gap: 10px;

          color:
            rgba(255, 255, 255, 0.5);

          font-size: 8px;

          font-weight: 500;

          letter-spacing: 0.24em;

          text-transform: uppercase;
        }

        .bottom-dot {
          color:
            rgba(255, 255, 255, 0.25);
        }

        /* =====================================
           INDICATOR
        ===================================== */

        .hero-indicator {
          position: absolute;

          right: 6%;

          bottom: 31px;

          z-index: 10;

          display: flex;

          align-items: center;

          gap: 14px;
        }

        .indicator-numbers {
          display: flex;

          gap: 7px;

          color:
            rgba(255, 255, 255, 0.4);

          font-size: 8px;

          letter-spacing: 0.12em;
        }

        .indicator-current {
          color: #ffffff;
        }

        .indicator-line {
          width: 80px;

          height: 1px;

          background:
            rgba(255, 255, 255, 0.25);
        }

        .indicator-progress {
          height: 1px;

          background: #FAF8F5;

          transition:
            width 0.5s ease;
        }

        /* =====================================
           DOTS
        ===================================== */

        .hero-dots {
          position: absolute;

          left: 50%;

          bottom: 30px;

          z-index: 10;

          transform:
            translateX(-50%);

          display: flex;

          align-items: center;

          gap: 6px;
        }

        .hero-dot {
          width: 5px;

          height: 5px;

          padding: 0;

          border: 0;

          border-radius: 50%;

          background:
            rgba(255, 255, 255, 0.35);

          cursor: pointer;

          transition:
            width 0.3s ease,
            background 0.3s ease;
        }

        .hero-dot-active {
          width: 25px;

          border-radius: 10px;

          background: #FAF8F5;
        }

        /* =====================================
           TABLET
        ===================================== */

        @media (max-width: 900px) {
          .hero {
            height: 590px;
          }

          .hero-content {
            padding-left: 6%;
          }

          .hero-copy h1 {
            font-size:
              clamp(
                58px,
                9vw,
                90px
              );
          }
        }

        /* =====================================
           MOBILE
        ===================================== */

        @media (max-width: 600px) {
          .hero {
            height: 560px;
          }

          .hero-image {
            object-position: 62% center;
          }

          .hero-overlay {
            background:
              linear-gradient(
                90deg,
                rgba(0, 0, 0, 0.78) 0%,
                rgba(0, 0, 0, 0.53) 55%,
                rgba(0, 0, 0, 0.18) 100%
              );
          }

          .hero-brand {
            top: 23px;

            left: 22px;

            font-size: 7px;

            letter-spacing: 0.23em;
          }

          .hero-number {
            top: 23px;

            right: 22px;

            font-size: 8px;
          }

          .hero-content {
            padding: 0 24px;
          }

          .hero-eyebrow {
            gap: 9px;

            margin-bottom: 21px;

            font-size: 8px;

            letter-spacing: 0.19em;
          }

          .eyebrow-line {
            width: 26px;
          }

          .hero-copy h1 {
            font-size: 56px;

            line-height: 0.9;
          }

          .hero-description {
            max-width: 310px;

            margin-top: 25px;

            font-size: 12px;

            line-height: 1.7;
          }

          .hero-button-wrapper {
            margin-top: 28px;
          }

          .shop-button {
            min-height: 50px;

            padding:
              6px 7px 6px 20px;

            gap: 12px;

            font-size: 9px;

            letter-spacing: 0.1em;
          }

          .shop-button-arrow {
            width: 35px;

            height: 35px;
          }

          .hero-bottom-left {
            left: 22px;

            bottom: 22px;

            font-size: 6px;

            letter-spacing: 0.16em;

            gap: 6px;
          }

          .hero-indicator {
            display: none;
          }

          .hero-dots {
            left: auto;

            right: 22px;

            bottom: 23px;

            transform: none;
          }
        }

        /* =====================================
           SMALL MOBILE
        ===================================== */

        @media (max-width: 400px) {
          .hero {
            height: 520px;
          }

          .hero-content {
            padding: 0 20px;
          }

          .hero-copy h1 {
            font-size: 49px;
          }

          .hero-description {
            max-width: 290px;

            margin-top: 22px;

            font-size: 11px;
          }

          .hero-button-wrapper {
            margin-top: 25px;
          }

          .hero-bottom-left {
            display: none;
          }

          .hero-dots {
            left: 20px;

            right: auto;

            bottom: 22px;
          }
        }
      `}
      </style>
    </section>
  );
}