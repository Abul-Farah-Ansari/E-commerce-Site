"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status?: "active" | "inactive";
  featured?: boolean;
  sortOrder?: number;
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=90",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=90",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=90",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=90",
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1600&q=90",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  ============================================================
  LOAD CATEGORIES
  ============================================================
  */

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/categories", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data?.message || "Unable to load categories."
          );
        }

        const items = Array.isArray(data.categories)
          ? data.categories
          : [];

        const activeCategories = items
          .filter(
            (category: Category) =>
              category.status !== "inactive"
          )
          .sort(
            (a: Category, b: Category) =>
              Number(a.sortOrder || 0) -
              Number(b.sortOrder || 0)
          );

        if (mounted) {
          setCategories(activeCategories);
        }
      } catch (requestError) {
        console.error(
          "Categories loading error:",
          requestError
        );

        if (mounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load categories."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  /*
  ============================================================
  IMAGE
  ============================================================
  */

  const getImage = (
    category: Category,
    index: number
  ) => {
    if (category.image?.trim()) {
      return category.image;
    }

    return FALLBACK_IMAGES[
      index % FALLBACK_IMAGES.length
    ];
  };

  /*
  ============================================================
  PAGE
  ============================================================
  */

  return (
    <>
      <Navbar />

      <main className="categories-page">

        {/* ==================================================
            HERO
        ================================================== */}

        <section className="categories-hero">

          <div className="hero-image">

            <img
              src={
                categories.length > 0
                  ? getImage(categories[0], 0)
                  : FALLBACK_IMAGES[0]
              }
              alt="House Of Orive"
              onError={(event) => {
                event.currentTarget.src =
                  FALLBACK_IMAGES[0];
              }}
            />

          </div>

          <div className="hero-overlay" />

          <div className="hero-content">

            <div className="hero-top">

              <span>
                HOUSE OF ORIVE
              </span>

              <span>
                COLLECTIONS / 01
              </span>

            </div>

            <div className="hero-bottom">

              <div>

                <span className="hero-label">
                  THE EDIT
                </span>

                <h1>
                  Collections
                </h1>

              </div>

              <div className="hero-arrow">
                <Icon
                  icon="solar:arrow-down-linear"
                  width={21}
                />
              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            COLLECTION HEADER
        ================================================== */}

        <section className="collection-header">

          <div className="header-left">

            <span>
              EXPLORE
            </span>

            <h2>
              Our collections
            </h2>

          </div>

          <div className="header-count">

            <strong>
              {loading
                ? "—"
                : String(
                    categories.length
                  ).padStart(2, "0")}
            </strong>

            <span>
              EDITS
            </span>

          </div>

        </section>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <section className="error-box">

            <Icon
              icon="solar:danger-circle-linear"
              width={20}
            />

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
            >
              Retry
            </button>

          </section>
        )}


        {/* ==================================================
            LOADING
        ================================================== */}

        {loading && (
          <section className="category-grid">

            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="category-skeleton"
              />
            ))}

          </section>
        )}


        {/* ==================================================
            CATEGORIES
        ================================================== */}

        {!loading &&
          !error &&
          categories.length > 0 && (
            <section className="category-grid">

              {categories.map(
                (category, index) => {

                  const image = getImage(
                    category,
                    index
                  );

                  return (
                    <Link
                      key={category._id}
                      href={`/categories/${category.slug}`}
                      className={
                        index === 0
                          ? "category-card category-card-large"
                          : "category-card"
                      }
                    >

                      <img
                        src={image}
                        alt={category.name}
                        loading={
                          index < 3
                            ? "eager"
                            : "lazy"
                        }
                        onError={(event) => {
                          event.currentTarget.src =
                            FALLBACK_IMAGES[
                              index %
                                FALLBACK_IMAGES.length
                            ];
                        }}
                      />

                      <div className="card-overlay" />

                      <div className="card-top">

                        <span>
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </span>

                        <Icon
                          icon="solar:arrow-up-right-linear"
                          width={20}
                        />

                      </div>

                      <div className="card-bottom">

                        <span>
                          COLLECTION
                        </span>

                        <h3>
                          {category.name}
                        </h3>

                      </div>

                    </Link>
                  );
                }
              )}

            </section>
          )}


        {/* ==================================================
            EMPTY
        ================================================== */}

        {!loading &&
          !error &&
          categories.length === 0 && (
            <section className="empty-state">

              <span>
                00
              </span>

              <h2>
                No collections yet.
              </h2>

              <Link href="/products">
                Shop all products
              </Link>

            </section>
          )}


        {/* ==================================================
            BOTTOM
        ================================================== */}

        {!loading &&
          !error &&
          categories.length > 0 && (
            <section className="bottom-line">

              <span>
                HOUSE OF ORIVE
              </span>

              <div />

              <span>
                EST. 2026
              </span>

            </section>
          )}

      </main>

      <Footer />


      {/* ======================================================
          STYLES
      ====================================================== */}

      <style jsx>{`

        .categories-page {
          width: 100%;
          background: #fff;
          color: #151515;
          overflow: hidden;
        }


        /* =====================================================
           HERO
        ====================================================== */

        .categories-hero {
          position: relative;

          min-height:
            min(
              680px,
              calc(100vh - 80px)
            );

          overflow: hidden;

          display: flex;
          align-items: flex-end;

          background: #111;
        }

        .hero-image {
          position: absolute;
          inset: 0;
        }

        .hero-image img {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          filter:
            grayscale(18%)
            contrast(.95);

          transform:
            scale(1.02);

          transition:
            transform 1.3s
            cubic-bezier(.22,1,.36,1);
        }

        .categories-hero:hover
        .hero-image img {
          transform:
            scale(1.05);
        }

        .hero-overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              90deg,
              rgba(0,0,0,.65),
              rgba(0,0,0,.08)
            ),
            linear-gradient(
              0deg,
              rgba(0,0,0,.82),
              transparent 65%
            );
        }

        .hero-content {
          position: relative;
          z-index: 2;

          width:
            min(
              1500px,
              100%
            );

          min-height: inherit;

          margin: auto;

          padding:
            32px 48px 48px;

          display: flex;
          flex-direction: column;

          justify-content:
            space-between;
        }

        .hero-top {
          display: flex;

          justify-content:
            space-between;

          color:
            rgba(255,255,255,.68);

          font-family:
            var(--font-dm-sans);

          font-size: 8px;
          font-weight: 700;

          letter-spacing:
            .24em;

          text-transform:
            uppercase;
        }

        .hero-bottom {
          display: flex;

          align-items:
            flex-end;

          justify-content:
            space-between;
        }

        .hero-label {
          display: block;

          color:
            rgba(255,255,255,.62);

          font-family:
            var(--font-dm-sans);

          font-size: 9px;
          font-weight: 700;

          letter-spacing:
            .27em;

          text-transform:
            uppercase;
        }

        .hero-bottom h1 {
          margin: 18px 0 0;

          color: #fff;

          font-family:
            var(--font-bodoni);

          font-size:
            clamp(
              90px,
              12vw,
              175px
            );

          font-weight: 400;

          line-height: .75;

          letter-spacing:
            -.065em;
        }

        .hero-arrow {
          width: 54px;
          height: 54px;

          border:
            1px solid
            rgba(255,255,255,.38);

          border-radius: 50%;

          display: grid;
          place-items: center;

          color: #fff;

          margin-bottom: 8px;
        }


        /* =====================================================
           HEADER
        ====================================================== */

        .collection-header {
          width:
            min(
              1500px,
              calc(100% - 96px)
            );

          margin: auto;

          padding:
            105px 0 45px;

          display: flex;

          align-items:
            flex-end;

          justify-content:
            space-between;

          border-bottom:
            1px solid #e4e1dc;
        }

        .header-left > span {
          color: #99948b;

          font-family:
            var(--font-dm-sans);

          font-size: 8px;
          font-weight: 700;

          letter-spacing:
            .24em;

          text-transform:
            uppercase;
        }

        .header-left h2 {
          margin: 14px 0 0;

          font-family:
            var(--font-bodoni);

          font-size:
            clamp(
              52px,
              6vw,
              82px
            );

          font-weight: 400;

          line-height: .82;

          letter-spacing:
            -.055em;
        }

        .header-count {
          display: flex;

          align-items:
            baseline;

          gap: 8px;
        }

        .header-count strong {
          font-family:
            var(--font-bodoni);

          font-size: 42px;
          font-weight: 400;
        }

        .header-count span {
          color: #99948b;

          font-family:
            var(--font-dm-sans);

          font-size: 7px;
          font-weight: 700;

          letter-spacing:
            .17em;
        }


        /* =====================================================
           GRID
        ====================================================== */

        .category-grid {
          width:
            min(
              1500px,
              calc(100% - 96px)
            );

          margin:
            0 auto;

          padding:
            35px 0 110px;

          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap:
            14px;
        }

        .category-card {
          position: relative;

          min-height: 470px;

          overflow: hidden;

          display: block;

          background: #ddd;

          color: #fff;

          text-decoration: none;
        }

        .category-card-large {
          grid-row:
            span 2;

          min-height:
            954px;
        }

        .category-card img {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;

          display: block;

          filter:
            grayscale(15%);

          transition:
            transform .9s
            cubic-bezier(.22,1,.36,1),
            filter .5s ease;
        }

        .category-card:hover img {
          transform:
            scale(1.055);

          filter:
            grayscale(0%);
        }

        .card-overlay {
          position: absolute;

          inset: 0;

          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,.1),
              transparent 38%,
              rgba(0,0,0,.78)
            );

          transition:
            background .4s ease;
        }

        .category-card:hover
        .card-overlay {
          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,.12),
              transparent 32%,
              rgba(0,0,0,.86)
            );
        }

        .card-top {
          position: absolute;

          top: 20px;
          left: 20px;
          right: 20px;

          display: flex;

          align-items:
            center;

          justify-content:
            space-between;

          z-index: 2;
        }

        .card-top span {
          color:
            rgba(255,255,255,.72);

          font-family:
            var(--font-dm-sans);

          font-size: 8px;
          font-weight: 700;

          letter-spacing:
            .17em;
        }

        .card-top svg {
          transition:
            transform .3s ease;
        }

        .category-card:hover
        .card-top svg {
          transform:
            translate(
              4px,
              -4px
            );
        }

        .card-bottom {
          position: absolute;

          z-index: 2;

          left: 22px;
          right: 22px;
          bottom: 22px;
        }

        .card-bottom > span {
          display: block;

          margin-bottom: 8px;

          color:
            rgba(255,255,255,.62);

          font-family:
            var(--font-dm-sans);

          font-size: 7px;
          font-weight: 700;

          letter-spacing:
            .2em;

          text-transform:
            uppercase;
        }

        .card-bottom h3 {
          margin: 0;

          color: #fff;

          font-family:
            var(--font-bodoni);

          font-size: 43px;
          font-weight: 400;

          line-height: .9;

          letter-spacing:
            -.035em;
        }

        .category-card-large
        .card-bottom h3 {
          font-size:
            clamp(
              55px,
              6vw,
              88px
            );
        }


        /* =====================================================
           ERROR
        ====================================================== */

        .error-box {
          width:
            min(
              1500px,
              calc(100% - 96px)
            );

          margin:
            35px auto 0;

          padding:
            18px 20px;

          border:
            1px solid #e4e1dc;

          display: flex;

          align-items:
            center;

          gap: 12px;

          color: #77736c;

          font-family:
            var(--font-dm-sans);

          font-size: 10px;
        }

        .error-box button {
          margin-left: auto;

          border: 0;

          padding:
            9px 15px;

          background: #171717;

          color: #fff;

          font-family:
            var(--font-dm-sans);

          font-size: 8px;
          font-weight: 700;

          letter-spacing:
            .1em;

          text-transform:
            uppercase;

          cursor: pointer;
        }


        /* =====================================================
           SKELETON
        ====================================================== */

        .category-skeleton {
          min-height: 470px;

          background:
            linear-gradient(
              100deg,
              #e9e7e2 20%,
              #f5f3ef 40%,
              #e9e7e2 60%
            );

          background-size:
            220% 100%;

          animation:
            skeleton 1.5s infinite;
        }

        .category-skeleton:first-child {
          min-height:
            954px;

          grid-row:
            span 2;
        }

        @keyframes skeleton {
          from {
            background-position:
              200% 0;
          }

          to {
            background-position:
              -20% 0;
          }
        }


        /* =====================================================
           EMPTY
        ====================================================== */

        .empty-state {
          min-height: 450px;

          padding:
            80px 20px;

          display: flex;

          flex-direction:
            column;

          align-items:
            center;

          justify-content:
            center;

          text-align: center;
        }

        .empty-state > span {
          color: #ddd9d1;

          font-family:
            var(--font-bodoni);

          font-size: 100px;

          line-height: .75;
        }

        .empty-state h2 {
          margin-top: 20px;

          font-family:
            var(--font-bodoni);

          font-size: 42px;

          font-weight: 400;
        }

        .empty-state a {
          margin-top: 25px;

          padding:
            13px 19px;

          background: #171717;

          color: #fff;

          font-family:
            var(--font-dm-sans);

          font-size: 8px;
          font-weight: 700;

          letter-spacing:
            .12em;

          text-decoration: none;

          text-transform:
            uppercase;
        }


        /* =====================================================
           BOTTOM LINE
        ====================================================== */

        .bottom-line {
          width:
            min(
              1500px,
              calc(100% - 96px)
            );

          margin: 0 auto;

          padding:
            22px 0 35px;

          border-top:
            1px solid #e4e1dc;

          display: flex;

          align-items:
            center;

          gap: 20px;

          color: #99948b;

          font-family:
            var(--font-dm-sans);

          font-size: 7px;
          font-weight: 700;

          letter-spacing:
            .2em;
        }

        .bottom-line div {
          flex: 1;

          height: 1px;

          background: #e4e1dc;
        }


        /* =====================================================
           TABLET
        ====================================================== */

        @media (max-width: 1050px) {

          .hero-content {
            padding-left: 30px;
            padding-right: 30px;
          }

          .collection-header,
          .category-grid,
          .bottom-line {
            width:
              calc(100% - 60px);
          }

          .category-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .category-card-large {
            min-height: 650px;

            grid-row:
              span 1;
          }

          .category-card {
            min-height: 470px;
          }

          .category-card-large
          .card-bottom h3 {
            font-size: 58px;
          }
        }


        /* =====================================================
           MOBILE
        ====================================================== */

        @media (max-width: 700px) {

          .categories-hero {
            min-height: 520px;
          }

          .hero-content {
            padding:
              24px 20px 35px;
          }

          .hero-top {
            font-size: 7px;
          }

          .hero-bottom h1 {
            margin-top: 13px;

            font-size:
              clamp(
                70px,
                19vw,
                105px
              );
          }

          .hero-label {
            font-size: 7px;
          }

          .hero-arrow {
            width: 45px;
            height: 45px;

            margin-bottom: 3px;
          }


          .collection-header {
            width:
              calc(100% - 40px);

            padding:
              75px 0 28px;
          }

          .header-left h2 {
            font-size: 48px;
          }

          .header-count strong {
            font-size: 28px;
          }

          .header-count span {
            display: none;
          }


          .category-grid {
            width:
              calc(100% - 32px);

            padding:
              25px 0 75px;

            grid-template-columns: 1fr;

            gap: 10px;
          }

          .category-card,
          .category-card-large {
            min-height: 500px;

            grid-row:
              span 1;
          }

          .category-card-large
          .card-bottom h3,
          .card-bottom h3 {
            font-size: 52px;
          }

          .card-top {
            top: 15px;
            left: 15px;
            right: 15px;
          }

          .card-bottom {
            left: 17px;
            right: 17px;
            bottom: 17px;
          }

          .card-bottom > span {
            font-size: 6px;
          }


          .error-box {
            width:
              calc(100% - 32px);
          }

          .error-box span {
            max-width: 200px;
            line-height: 1.5;
          }


          .bottom-line {
            width:
              calc(100% - 32px);

            padding-bottom: 25px;
          }

        }


        @media (max-width: 390px) {

          .categories-hero {
            min-height: 470px;
          }

          .hero-bottom h1 {
            font-size: 65px;
          }

          .category-card,
          .category-card-large {
            min-height: 430px;
          }

          .category-card-large
          .card-bottom h3,
          .card-bottom h3 {
            font-size: 46px;
          }

        }


        @media (prefers-reduced-motion: reduce) {

          .hero-image img,
          .category-card img,
          .card-top svg,
          .category-skeleton {
            animation: none !important;
            transition: none !important;
          }

        }

      `}</style>
    </>
  );
}