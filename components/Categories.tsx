"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

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

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/categories", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load categories."
          );
        }

        if (isMounted) {
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("LOAD CATEGORIES ERROR:", error);

        if (isMounted) {
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      className="categories-section"
      style={{
        width: "100%",
        background: "#ffffff",
        padding: "90px 0",
        overflow: "hidden",
      }}
    >
      <div
        className="categories-container"
        style={{
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 40px",
        }}
      >
        {/* ================= HEADER ================= */}

        <div
          className="categories-header"
          style={{
            marginBottom: "45px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "14px",
            }}
          >
            <span
              style={{
                width: "32px",
                height: "1px",
                background: "#111111",
                display: "block",
                flexShrink: 0,
              }}
            />

            <span
              className="categories-label"
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#666666",
              }}
            >
              Explore
            </span>
          </div>

          <h2
            className="categories-title"
            style={{
              margin: 0,
              fontSize: "52px",
              lineHeight: "1.05",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              color: "#111111",
            }}
          >
            Shop by Category
          </h2>

          <p
            className="categories-description"
            style={{
              margin: "18px 0 0",
              maxWidth: "650px",
              fontSize: "16px",
              lineHeight: "1.7",
              color: "#555555",
            }}
          >
            Discover carefully selected styles for every mood,
            occasion, and everyday moment.
          </p>
        </div>

        {/* ================= CATEGORY CARDS ================= */}

        <div
          className="categories-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: "20px",
            width: "100%",
          }}
        >
          {loading ? (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "50px 0",
                textAlign: "center",
                color: "#666666",
                fontSize: "14px",
              }}
            >
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "50px 0",
                textAlign: "center",
                color: "#666666",
                fontSize: "14px",
              }}
            >
              No categories available.
            </div>
          ) : (
            categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="category-card"
                style={{
                  position: "relative",
                  display: "block",
                  width: "100%",
                  height: "460px",
                  overflow: "hidden",
                  borderRadius: "18px",
                  textDecoration: "none",
                  backgroundColor: "#dddddd",
                  flexShrink: 0,
                }}
              >
                {/* ================= IMAGE ================= */}

                <img
                  src={
                    category.image ||
                    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=85"
                  }
                  alt={category.name}
                  className="category-image"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.6s ease",
                  }}
                />

                {/* ================= OVERLAY ================= */}

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0.05) 65%)",
                  }}
                />

                {/* ================= CONTENT ================= */}

                <div
                  className="category-content"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: "28px",
                  }}
                >
                  <div
                    className="category-description"
                    style={{
                      fontSize: "11px",
                      fontWeight: 500,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.7)",
                      marginBottom: "8px",
                    }}
                  >
                    {category.description || "Explore collection"}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "15px",
                    }}
                  >
                    <h3
                      className="category-name"
                      style={{
                        margin: 0,
                        fontSize: "30px",
                        fontWeight: 600,
                        color: "#ffffff",
                      }}
                    >
                      {category.name}
                    </h3>

                    <span
                      className="category-arrow"
                      style={{
                        width: "44px",
                        height: "44px",
                        flexShrink: 0,
                        borderRadius: "50%",
                        background: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#111111",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <Icon
                        icon="solar:arrow-right-up-linear"
                        width="20"
                        height="20"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* ================= VIEW ALL ================= */}

        <div
          className="categories-view-all"
          style={{
            marginTop: "35px",
          }}
        >
          <Link
            href="/categories"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              color: "#111111",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            View All Categories

            <Icon
              icon="solar:arrow-right-linear"
              width="20"
              height="20"
            />
          </Link>
        </div>
      </div>

      {/* =====================================================
          RESPONSIVE CSS
      ===================================================== */}

      <style jsx>{`
        /* =========================================
           TABLET
           769px - 1024px
        ========================================= */

        @media (max-width: 1024px) {
          .categories-section {
            padding: 75px 0 !important;
          }

          .categories-container {
            padding: 0 30px !important;
          }

          .categories-header {
            margin-bottom: 35px !important;
          }

          .categories-title {
            font-size: 44px !important;
          }

          .categories-description {
            font-size: 15px !important;
            max-width: 600px !important;
          }

          .categories-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            ) !important;

            gap: 18px !important;
          }

          .category-card {
            height: 430px !important;
          }

          .category-content {
            padding: 24px !important;
          }

          .category-name {
            font-size: 28px !important;
          }
        }

        /* =========================================
           MOBILE
           Up to 768px
        ========================================= */

        @media (max-width: 768px) {
          .categories-section {
            padding: 60px 0 !important;
          }

          .categories-container {
            padding: 0 !important;
          }

          .categories-header {
            padding: 0 20px !important;
            margin-bottom: 28px !important;
          }

          .categories-header > div:first-child {
            gap: 9px !important;
            margin-bottom: 11px !important;
          }

          .categories-header > div:first-child > span:first-child {
            width: 25px !important;
          }

          .categories-label {
            font-size: 10px !important;
            letter-spacing: 0.2em !important;
          }

          .categories-title {
            font-size: clamp(
              34px,
              8vw,
              44px
            ) !important;

            line-height: 1.05 !important;
            letter-spacing: -0.035em !important;
          }

          .categories-description {
            margin-top: 13px !important;
            font-size: 14px !important;
            line-height: 1.6 !important;
            max-width: 500px !important;
          }

          /* =========================================
             HORIZONTAL MOBILE CAROUSEL
          ========================================= */

          .categories-grid {
            display: flex !important;
            width: 100% !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            gap: 12px !important;
            padding-left: 20px !important;
            padding-right: 20px !important;
            flex-wrap: nowrap !important;
            scroll-snap-type: x mandatory !important;
            scroll-padding-left: 20px !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
            overscroll-behavior-x: contain !important;
          }

          .categories-grid::-webkit-scrollbar {
            display: none !important;
          }

          /* =========================================
             TWO SMALL SQUARE CARDS
          ========================================= */

          .category-card {
            flex: 0 0 calc((100% - 12px) / 2) !important;
            width: calc((100% - 12px) / 2) !important;
            min-width: calc((100% - 12px) / 2) !important;
            height: auto !important;
            aspect-ratio: 1 / 1 !important;
            border-radius: 14px !important;
            scroll-snap-align: start !important;
            scroll-snap-stop: normal !important;
          }

          .category-content {
            padding: 12px !important;
          }

          .category-description {
            font-size: 7px !important;
            letter-spacing: 0.08em !important;
            margin-bottom: 5px !important;
          }

          .category-name {
            font-size: 17px !important;
            letter-spacing: -0.02em !important;
          }

          .category-arrow {
            width: 30px !important;
            height: 30px !important;
          }

          .category-arrow svg {
            width: 15px !important;
            height: 15px !important;
          }

          .categories-view-all {
            margin-top: 22px !important;
            padding: 0 20px !important;
          }

          .categories-view-all a {
            font-size: 13px !important;
            gap: 7px !important;
          }

          .categories-view-all svg {
            width: 17px !important;
            height: 17px !important;
          }
        }

        /* =========================================
           SMALL MOBILE
           360px - 480px
        ========================================= */

        @media (max-width: 480px) {
          .categories-section {
            padding: 50px 0 !important;
          }

          .categories-header {
            padding: 0 15px !important;
            margin-bottom: 24px !important;
          }

          .categories-title {
            font-size: 34px !important;
          }

          .categories-description {
            font-size: 13px !important;
            line-height: 1.55 !important;
          }

          .categories-grid {
            gap: 10px !important;
            padding-left: 15px !important;
            padding-right: 15px !important;
            scroll-padding-left: 15px !important;
          }

          .category-card {
            flex: 0 0 calc((100% - 10px) / 2) !important;
            width: calc((100% - 10px) / 2) !important;
            min-width: calc((100% - 10px) / 2) !important;
            height: auto !important;
            aspect-ratio: 1 / 1 !important;
            border-radius: 13px !important;
          }

          .category-content {
            padding: 11px !important;
          }

          .category-description {
            font-size: 6px !important;
            letter-spacing: 0.07em !important;
            margin-bottom: 4px !important;
          }

          .category-name {
            font-size: 16px !important;
          }

          .category-arrow {
            width: 28px !important;
            height: 28px !important;
          }

          .category-arrow svg {
            width: 14px !important;
            height: 14px !important;
          }

          .categories-view-all {
            margin-top: 20px !important;
            padding: 0 15px !important;
          }

          .categories-view-all a {
            font-size: 12px !important;
          }
        }

        /* =========================================
           EXTRA SMALL MOBILE
           Below 360px
        ========================================= */

        @media (max-width: 359px) {
          .categories-header {
            padding: 0 12px !important;
          }

          .categories-title {
            font-size: 31px !important;
          }

          .categories-description {
            font-size: 12px !important;
          }

          .categories-grid {
            gap: 8px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
            scroll-padding-left: 12px !important;
          }

          .category-card {
            flex: 0 0 calc((100% - 8px) / 2) !important;
            width: calc((100% - 8px) / 2) !important;
            min-width: calc((100% - 8px) / 2) !important;
            height: auto !important;
            aspect-ratio: 1 / 1 !important;
            border-radius: 11px !important;
          }

          .category-content {
            padding: 9px !important;
          }

          .category-description {
            font-size: 5.5px !important;
          }

          .category-name {
            font-size: 14px !important;
          }

          .category-arrow {
            width: 25px !important;
            height: 25px !important;
          }

          .category-arrow svg {
            width: 13px !important;
            height: 13px !important;
          }
        }

        /* =========================================
           DESKTOP HOVER
        ========================================= */

        @media (min-width: 769px) {
          .category-card:hover .category-image {
            transform: scale(1.04);
          }

          .category-card:hover .category-arrow {
            transform: translate(2px, -2px);
          }
        }
      `}</style>
    </section>
  );
}