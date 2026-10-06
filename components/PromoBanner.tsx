"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

export default function PromoBanner() {
  return (
    <section className="promo-section">
      <div className="promo-container">
        <div className="promo-banner">
          {/* =====================================================
              IMAGE
          ===================================================== */}

          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=85"
            alt="New season fashion collection"
            className="promo-image"
          />

          {/* =====================================================
              OVERLAY
          ===================================================== */}

          <div className="promo-overlay" />

          {/* =====================================================
              SUBTLE IMAGE GRAIN
          ===================================================== */}

          <div className="promo-grain" />

          {/* =====================================================
              CONTENT
          ===================================================== */}

          <div className="promo-content">
            <div className="promo-text">
              {/* LABEL */}

              <div className="promo-label">
                <span className="promo-label-line" />

                <span>
                  Limited Time
                </span>
              </div>

              {/* HEADING */}

              <h2 className="promo-heading">
                New Season.
                <br />

                <span>
                  New Style.
                </span>
              </h2>

              {/* DESCRIPTION */}

              <p className="promo-description">
                Refresh your wardrobe with our
                latest collection. Discover
                selected pieces made for the
                season ahead.
              </p>

              {/* CTA */}

              <div className="promo-cta">
                <Link
                  href="/products"
                  className="promo-button"
                >
                  <span>
                    Explore Collection
                  </span>

                  <span className="promo-button-icon">
                    <Icon
                      icon="solar:arrow-right-linear"
                      width="19"
                      height="19"
                    />
                  </span>
                </Link>
              </div>
            </div>

            {/* =================================================
                SIDE DETAIL
            ================================================= */}

            <div className="promo-side-detail">
              <span>2026</span>
              <span className="promo-side-line" />
              <span>COLLECTION</span>
            </div>
          </div>

          {/* =====================================================
              CORNER NUMBER
          ===================================================== */}

          <div className="promo-number">
            01
          </div>
        </div>
      </div>

      {/* =====================================================
          RESPONSIVE CSS
      ===================================================== */}

      <style jsx>{`
        /* =====================================================
           SECTION
        ===================================================== */

        .promo-section {
          width: 100%;
          padding: 100px 0;
          background: #ffffff;
          overflow: hidden;
        }

        .promo-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* =====================================================
           BANNER
        ===================================================== */

        .promo-banner {
          position: relative;
          width: 100%;
          min-height: 500px;
          overflow: hidden;
          border-radius: 22px;
          background: #171717;
        }

        /* =====================================================
           IMAGE
        ===================================================== */

        .promo-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transform: scale(1.01);
          transition:
            transform 1.2s
            cubic-bezier(0.2, 0.7, 0.2, 1);
        }

        .promo-banner:hover .promo-image {
          transform: scale(1.035);
        }

        /* =====================================================
           OVERLAY
        ===================================================== */

        .promo-overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.88) 0%,
              rgba(0, 0, 0, 0.68) 35%,
              rgba(0, 0, 0, 0.38) 65%,
              rgba(0, 0, 0, 0.12) 100%
            );
        }

        /* =====================================================
           GRAIN
        ===================================================== */

        .promo-grain {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          opacity: 0.08;
          background-image:
            url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");
        }

        /* =====================================================
           CONTENT
        ===================================================== */

        .promo-content {
          position: relative;
          z-index: 3;
          min-height: 500px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 65px;
        }

        .promo-text {
          max-width: 580px;
        }

        /* =====================================================
           LABEL
        ===================================================== */

        .promo-label {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 20px;
        }

        .promo-label-line {
          width: 38px;
          height: 1px;
          flex-shrink: 0;
          background: #ffffff;
        }

        .promo-label span:last-child {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.75);
        }

        /* =====================================================
           HEADING
        ===================================================== */

        .promo-heading {
          margin: 0;
          font-size: clamp(
            48px,
            5.5vw,
            72px
          );
          line-height: 0.94;
          font-weight: 600;
          letter-spacing: -0.055em;
          color: #ffffff;
        }

        .promo-heading span {
          font-weight: 300;
          color: rgba(
            255,
            255,
            255,
            0.7
          );
        }

        /* =====================================================
           DESCRIPTION
        ===================================================== */

        .promo-description {
          margin: 25px 0 0;
          max-width: 480px;
          font-size: 15px;
          line-height: 1.8;
          color: rgba(
            255,
            255,
            255,
            0.7
          );
        }

        /* =====================================================
           CTA
        ===================================================== */

        .promo-cta {
          margin-top: 32px;
        }

        .promo-button {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          padding: 15px 17px 15px 24px;
          border-radius: 999px;
          background: #ffffff;
          color: #111111;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition:
            background 0.25s ease,
            color 0.25s ease,
            transform 0.25s ease;
        }

        .promo-button-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111111;
          color: #ffffff;
          transition:
            transform 0.25s ease;
        }

        .promo-button:hover {
          transform: translateY(-2px);
        }

        .promo-button:hover
          .promo-button-icon {
          transform: translateX(3px);
        }

        /* =====================================================
           SIDE DETAIL
        ===================================================== */

        .promo-side-detail {
          position: absolute;
          right: 65px;
          bottom: 60px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(
            255,
            255,
            255,
            0.6
          );
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.22em;
        }

        .promo-side-line {
          width: 30px;
          height: 1px;
          background: rgba(
            255,
            255,
            255,
            0.45
          );
        }

        /* =====================================================
           NUMBER
        ===================================================== */

        .promo-number {
          position: absolute;
          z-index: 4;
          top: 30px;
          right: 35px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          color: rgba(
            255,
            255,
            255,
            0.55
          );
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1024px) {
          .promo-section {
            padding: 80px 0;
          }

          .promo-container {
            padding: 0 30px;
          }

          .promo-banner {
            min-height: 440px;
            border-radius: 18px;
          }

          .promo-content {
            min-height: 440px;
            padding: 55px;
          }

          .promo-heading {
            font-size: 56px;
          }

          .promo-description {
            font-size: 14px;
            max-width: 430px;
          }

          .promo-side-detail {
            right: 55px;
            bottom: 45px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {
          .promo-section {
            padding: 60px 0;
          }

          .promo-container {
            padding: 0 20px;
          }

          .promo-banner {
            min-height: 520px;
            border-radius: 16px;
          }

          .promo-image {
            object-position: 63% center;
          }

          .promo-overlay {
            background:
              linear-gradient(
                180deg,
                rgba(0, 0, 0, 0.25) 0%,
                rgba(0, 0, 0, 0.62) 45%,
                rgba(0, 0, 0, 0.9) 100%
              );
          }

          .promo-content {
            min-height: 520px;
            padding: 35px 25px;
            align-items: flex-end;
          }

          .promo-text {
            width: 100%;
            max-width: 100%;
          }

          .promo-label {
            margin-bottom: 16px;
          }

          .promo-label-line {
            width: 28px;
          }

          .promo-label span:last-child {
            font-size: 9px;
            letter-spacing: 0.22em;
          }

          .promo-heading {
            font-size: 44px;
            line-height: 0.96;
            letter-spacing: -0.045em;
          }

          .promo-description {
            margin-top: 18px;
            max-width: 100%;
            font-size: 13px;
            line-height: 1.7;
          }

          .promo-cta {
            margin-top: 24px;
          }

          .promo-button {
            padding: 13px 15px 13px 20px;
            font-size: 12px;
            gap: 11px;
          }

          .promo-button-icon {
            width: 29px;
            height: 29px;
          }

          .promo-side-detail {
            display: none;
          }

          .promo-number {
            top: 22px;
            right: 22px;
            font-size: 9px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 480px) {
          .promo-section {
            padding: 50px 0;
          }

          .promo-container {
            padding: 0 15px;
          }

          .promo-banner {
            min-height: 490px;
            border-radius: 14px;
          }

          .promo-content {
            min-height: 490px;
            padding: 30px 20px;
          }

          .promo-heading {
            font-size: 38px;
          }

          .promo-description {
            font-size: 12px;
            line-height: 1.65;
          }

          .promo-cta {
            margin-top: 21px;
          }

          .promo-button {
            padding: 12px 14px 12px 18px;
            font-size: 11px;
          }

          .promo-button-icon {
            width: 27px;
            height: 27px;
          }

          .promo-number {
            top: 18px;
            right: 18px;
          }
        }

        /* =====================================================
           EXTRA SMALL
        ===================================================== */

        @media (max-width: 359px) {
          .promo-banner {
            min-height: 455px;
          }

          .promo-content {
            min-height: 455px;
            padding: 25px 18px;
          }

          .promo-heading {
            font-size: 34px;
          }

          .promo-description {
            font-size: 11px;
          }

          .promo-button {
            padding: 11px 13px 11px 16px;
            font-size: 10px;
          }

          .promo-button-icon {
            width: 25px;
            height: 25px;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .promo-image,
          .promo-button,
          .promo-button-icon {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}