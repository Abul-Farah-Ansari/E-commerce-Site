"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

export default function BrandStory() {
  return (
    <section className="brand-story">

      <div className="brand-story-inner">

        {/* LEFT — CONTENT */}
        <div className="brand-story-content">

          <div className="brand-story-eyebrow">
            THE HOUSE / OUR STORY
          </div>

          <h2>
            Designed for
            <br />
            <em>modern elegance.</em>
          </h2>

          <div className="brand-story-line" />

          <p className="brand-story-intro">
            House of Orive is built around a simple
            belief — true style does not need to be
            loud.
          </p>

          <p className="brand-story-description">
            We create thoughtfully selected pieces
            that bring together timeless design,
            contemporary silhouettes and everyday
            sophistication. Every collection is
            curated with an emphasis on quality,
            confidence and effortless expression.
          </p>

          <div className="brand-story-signature">

            <div>
              <strong>
                House of Orive
              </strong>

              <span>
                A modern fashion house
              </span>
            </div>

          </div>

          <Link
            href="/about"
            className="brand-story-button"
          >
            <span>
              Discover Our Story
            </span>

            <Icon
              icon="solar:arrow-right-linear"
              width={18}
              height={18}
            />
          </Link>

        </div>


        {/* RIGHT — CEO IMAGE */}
        <div className="brand-story-visual">

          <div className="brand-story-image-wrap">

            <img
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=85"
              alt="Founder of House of Orive"
            />

            <div className="brand-story-image-overlay" />

            <div className="brand-story-image-label">
              <span>
                HOUSE
              </span>

              <span>
                OF ORIVE
              </span>
            </div>

            <div className="brand-story-number">
              01
            </div>

          </div>


          {/* CEO INFO */}
          <div className="brand-story-ceo">

            <div className="ceo-line" />

            <div className="ceo-info">

              <span>
                FOUNDER & CEO
              </span>

              <strong>
                Your Name
              </strong>

            </div>

          </div>

        </div>

      </div>


      <style jsx>{`

        .brand-story {
          width: 100%;
          padding: 110px 24px;
          background: #ffffff;
          overflow: hidden;
        }

        .brand-story-inner {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;

          display: grid;
          grid-template-columns:
            minmax(0, 0.9fr)
            minmax(0, 1.1fr);

          gap: 90px;
          align-items: center;
        }


        /* =================================================
           CONTENT
        ================================================= */

        .brand-story-content {
          max-width: 520px;
        }

        .brand-story-eyebrow {
          margin-bottom: 24px;

          color: #999999;

          font-family:
            var(--font-dm-sans),
            Arial,
            sans-serif;

          font-size: 9px;
          font-weight: 700;

          letter-spacing: 0.22em;
        }

        .brand-story-content h2 {
          margin: 0;

          color: #111111;

          font-family:
            var(--font-bodoni),
            "Bodoni Moda",
            Didot,
            serif;

          font-size: clamp(
            48px,
            5.2vw,
            76px
          );

          font-weight: 500;
          line-height: 0.94;

          letter-spacing: -0.045em;
        }

        .brand-story-content h2 em {
          font-style: italic;
          font-weight: 400;
        }

        .brand-story-line {
          width: 55px;
          height: 1px;

          margin: 32px 0;

          background: #111111;
        }

        .brand-story-intro {
          max-width: 460px;

          margin: 0 0 17px;

          color: #333333;

          font-family:
            var(--font-dm-sans),
            Arial,
            sans-serif;

          font-size: 16px;
          font-weight: 500;

          line-height: 1.7;
        }

        .brand-story-description {
          max-width: 470px;

          margin: 0;

          color: #777777;

          font-family:
            var(--font-dm-sans),
            Arial,
            sans-serif;

          font-size: 12px;

          line-height: 1.9;
        }


        /* =================================================
           SIGNATURE
        ================================================= */

        .brand-story-signature {
          margin-top: 34px;

          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-story-signature::before {
          content: "";

          width: 32px;
          height: 1px;

          background: #111111;
        }

        .brand-story-signature > div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .brand-story-signature strong {
          color: #222222;

          font-family:
            var(--font-bodoni),
            "Bodoni Moda",
            Didot,
            serif;

          font-size: 18px;
          font-weight: 500;

          letter-spacing: 0.01em;
        }

        .brand-story-signature span {
          color: #999999;

          font-size: 8px;
          font-weight: 600;

          letter-spacing: 0.13em;
          text-transform: uppercase;
        }


        /* =================================================
           BUTTON
        ================================================= */

        .brand-story-button {
          width: fit-content;

          margin-top: 38px;

          padding: 14px 0;

          display: inline-flex;
          align-items: center;
          gap: 22px;

          color: #111111;

          border-bottom: 1px solid #111111;

          text-decoration: none;

          font-size: 10px;
          font-weight: 700;

          letter-spacing: 0.13em;
          text-transform: uppercase;

          transition:
            gap 0.25s ease,
            color 0.25s ease;
        }

        .brand-story-button:hover {
          gap: 30px;
        }


        /* =================================================
           IMAGE
        ================================================= */

        .brand-story-visual {
          position: relative;
          width: 100%;
        }

        .brand-story-image-wrap {
          position: relative;

          width: 100%;

          aspect-ratio: 0.82;

          overflow: hidden;

          background: #eeeeee;
        }

        .brand-story-image-wrap img {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          filter: grayscale(100%);

          transition:
            transform 0.8s
              cubic-bezier(
                0.2,
                0.65,
                0.25,
                1
              );
        }

        .brand-story-image-wrap:hover img {
          transform: scale(1.035);
        }

        .brand-story-image-overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.02),
              rgba(0, 0, 0, 0.12)
            );

          pointer-events: none;
        }


        /* =================================================
           IMAGE LABEL
        ================================================= */

        .brand-story-image-label {
          position: absolute;

          left: 24px;
          bottom: 24px;

          display: flex;
          flex-direction: column;

          color: #ffffff;

          font-family:
            var(--font-dm-sans),
            Arial,
            sans-serif;

          font-size: 8px;
          font-weight: 700;

          letter-spacing: 0.2em;

          line-height: 1.5;
        }

        .brand-story-number {
          position: absolute;

          top: 22px;
          right: 22px;

          color: rgba(
            255,
            255,
            255,
            0.9
          );

          font-size: 9px;
          font-weight: 700;

          letter-spacing: 0.15em;
        }


        /* =================================================
           CEO
        ================================================= */

        .brand-story-ceo {
          margin-top: 20px;

          display: flex;
          align-items: center;
          gap: 15px;
        }

        .ceo-line {
          width: 45px;
          height: 1px;

          background: #111111;
        }

        .ceo-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .ceo-info span {
          color: #999999;

          font-size: 7px;
          font-weight: 700;

          letter-spacing: 0.18em;
        }

        .ceo-info strong {
          color: #222222;

          font-family:
            var(--font-bodoni),
            "Bodoni Moda",
            Didot,
            serif;

          font-size: 17px;
          font-weight: 500;
        }


        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1000px) {

          .brand-story {
            padding: 85px 22px;
          }

          .brand-story-inner {
            gap: 55px;
          }

          .brand-story-content h2 {
            font-size: 55px;
          }

        }


        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 760px) {

          .brand-story {
            padding: 70px 18px;
          }

          .brand-story-inner {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .brand-story-content {
            max-width: none;
          }

          .brand-story-content h2 {
            font-size: clamp(
              45px,
              14vw,
              64px
            );
          }

          .brand-story-intro {
            font-size: 14px;
          }

          .brand-story-description {
            font-size: 11px;
            line-height: 1.8;
          }

          .brand-story-image-wrap {
            aspect-ratio: 0.82;
          }

          .brand-story-ceo {
            margin-top: 15px;
          }

        }


        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 420px) {

          .brand-story {
            padding: 58px 15px;
          }

          .brand-story-eyebrow {
            margin-bottom: 18px;
            font-size: 8px;
          }

          .brand-story-content h2 {
            font-size: 43px;
          }

          .brand-story-line {
            margin: 25px 0;
          }

          .brand-story-button {
            margin-top: 30px;
          }

          .brand-story-image-label {
            left: 17px;
            bottom: 17px;
          }

          .brand-story-number {
            top: 17px;
            right: 17px;
          }

        }

      `}</style>

    </section>
  );
}