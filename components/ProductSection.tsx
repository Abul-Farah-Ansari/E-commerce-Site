"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

type Product = {
  _id: string;
  name: string;
  slug: string;
  description?: string;

  price: number;
  compareAtPrice?: number | null;

  images?: string[];
  stock?: number;

  status?: "active" | "draft" | "out_of_stock";

  featured?: boolean;
  newArrival?: boolean;
  trending?: boolean;
  sale?: boolean;
};

type ProductSectionProps = {
  title: string;
  subtitle?: string;
  type?: "all" | "new" | "featured" | "trending" | "sale";
  limit?: number;
};

export default function ProductSection({
  title,
  subtitle,
  type = "all",
  limit = 5,
}: ProductSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(limit);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  ============================================================
  FETCH PRODUCTS
  ============================================================
  */

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data?.message || "Unable to load products."
          );
        }

        let items: Product[] = Array.isArray(data.products)
          ? data.products
          : [];

        /*
        ========================================================
        FILTER
        ========================================================
        */

        if (type === "new") {
          items = items.filter(
            (product) => product.newArrival
          );
        }

        if (type === "featured") {
          items = items.filter(
            (product) => product.featured
          );
        }

        if (type === "trending") {
          items = items.filter(
            (product) => product.trending
          );
        }

        if (type === "sale") {
          items = items.filter(
            (product) => product.sale
          );
        }

        setProducts(items);

        // Reset visible products when section type changes
        setVisibleCount(limit);
      } catch (error) {
        console.error(
          "Product section error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load products."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [type, limit]);

  /*
  ============================================================
  PRODUCTS TO SHOW
  ============================================================
  */

  const visibleProducts = products.slice(
    0,
    visibleCount
  );

  /*
  ============================================================
  HAS MORE
  ============================================================
  */

  const hasMore =
    visibleCount < products.length;

  /*
  ============================================================
  VIEW ALL
  ============================================================
  */

  const handleViewAll = () => {
    if (hasMore) {
      setVisibleCount(
        Math.min(
          visibleCount + limit,
          products.length
        )
      );
    } else {
      setVisibleCount(limit);
    }
  };

  /*
  ============================================================
  IMAGE
  ============================================================
  */

  const getProductImage = (
    product: Product
  ) => {
    return (
      product.images?.[0] ||
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=85"
    );
  };

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <section className="product-section">

      {/* HEADER */}

      <div className="product-section-header">

        <div>
          {subtitle && (
            <span className="section-eyebrow">
              {subtitle}
            </span>
          )}

          <h2>
            {title}
          </h2>
        </div>

        <div className="section-count">
          <strong>
            {String(products.length).padStart(2, "0")}
          </strong>

          <span>
            PRODUCTS
          </span>
        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="product-error">

          <Icon
            icon="solar:danger-circle-linear"
            width={20}
          />

          <span>
            {error}
          </span>

        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="product-grid">

          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div
              key={index}
              className="product-skeleton"
            />
          ))}

        </div>
      )}

      {/* PRODUCTS */}

      {!loading &&
        !error &&
        visibleProducts.length > 0 && (
          <div className="product-grid">

            {visibleProducts.map(
              (product) => (
                <Link
                  key={product._id}
                  href={`/products/${product.slug}`}
                  className="product-card"
                >

                  <div className="product-image-wrap">

                    <img
                      src={getProductImage(
                        product
                      )}
                      alt={product.name}
                    />

                    {/* QUICK ICON */}

                    <div className="product-arrow">

                      <Icon
                        icon="solar:arrow-up-right-linear"
                        width={18}
                      />

                    </div>

                  </div>

                  <div className="product-info">

                    <div>

                      <h3>
                        {product.name}
                      </h3>

                      <span className="product-category">
                        HOUSE OF ORIVE
                      </span>

                    </div>

                    <div className="product-price">

                      <span>
                        ₹
                        {Number(
                          product.price
                        ).toLocaleString("en-IN")}
                      </span>

                      {product.compareAtPrice &&
                        product.compareAtPrice >
                          product.price && (
                          <del>
                            ₹
                            {Number(
                              product.compareAtPrice
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </del>
                        )}

                    </div>

                  </div>

                </Link>
              )
            )}

          </div>
        )}

      {/* NO PRODUCTS */}

      {!loading &&
        !error &&
        products.length === 0 && (
          <div className="no-products">
            No products available.
          </div>
        )}

      {/* VIEW ALL */}

      {!loading &&
        !error &&
        products.length > limit && (
          <div className="view-all-wrapper">

            <button
              type="button"
              onClick={handleViewAll}
              className="view-all-button"
            >

              <span>
                {hasMore
                  ? "View All"
                  : "Show Less"}
              </span>

              <Icon
                icon={
                  hasMore
                    ? "solar:arrow-down-linear"
                    : "solar:arrow-up-linear"
                }
                width={18}
              />

            </button>

          </div>
        )}

      <style jsx>{`

        .product-section {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding: 100px 48px;
        }

        /* HEADER */

        .product-section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding-bottom: 35px;
          border-bottom: 1px solid #e6e3de;
        }

        .section-eyebrow {
          display: block;
          margin-bottom: 12px;
          color: #99948c;
          font-family: var(--font-dm-sans);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .22em;
          text-transform: uppercase;
        }

        .product-section-header h2 {
          margin: 0;
          color: #151515;
          font-family: var(--font-bodoni);
          font-size: clamp(
            48px,
            5vw,
            76px
          );
          font-weight: 400;
          line-height: .85;
          letter-spacing: -.055em;
        }

        .section-count {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .section-count strong {
          font-family: var(--font-bodoni);
          font-size: 32px;
          font-weight: 400;
        }

        .section-count span {
          color: #99948c;
          font-family: var(--font-dm-sans);
          font-size: 7px;
          font-weight: 700;
          letter-spacing: .15em;
        }

        /* GRID */

        .product-grid {
          display: grid;
          grid-template-columns:
            repeat(
              5,
              minmax(0, 1fr)
            );
          gap: 14px;
          padding-top: 35px;
        }

        /* CARD */

        .product-card {
          display: block;
          color: #111;
          text-decoration: none;
        }

        .product-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #f2f1ee;
        }

        .product-image-wrap img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition:
            transform .7s
            cubic-bezier(
              .22,
              1,
              .36,
              1
            );
        }

        .product-card:hover
        .product-image-wrap img {
          transform: scale(1.05);
        }

        /* ARROW */

        .product-arrow {
          position: absolute;
          right: 14px;
          top: 14px;
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background:
            rgba(
              255,
              255,
              255,
              .92
            );
          opacity: 0;
          transform:
            translateY(6px);
          transition:
            opacity .3s ease,
            transform .3s ease;
        }

        .product-card:hover
        .product-arrow {
          opacity: 1;
          transform:
            translateY(0);
        }

        /* INFO */

        .product-info {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 15px 1px 0;
        }

        .product-info h3 {
          margin: 0;
          font-family: var(--font-dm-sans);
          font-size: 13px;
          font-weight: 500;
        }

        .product-category {
          display: block;
          margin-top: 6px;
          color: #99948c;
          font-family: var(--font-dm-sans);
          font-size: 7px;
          font-weight: 700;
          letter-spacing: .14em;
        }

        .product-price {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 3px;
          font-family: var(--font-dm-sans);
          font-size: 12px;
        }

        .product-price del {
          color: #aaa;
          font-size: 10px;
        }

        /* VIEW ALL */

        .view-all-wrapper {
          display: flex;
          justify-content: center;
          padding-top: 55px;
        }

        .view-all-button {
          display: inline-flex;
          align-items: center;
          gap: 25px;
          padding: 14px 0;
          border: 0;
          border-bottom: 1px solid #111;
          background: transparent;
          color: #111;
          font-family: var(--font-dm-sans);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .14em;
          text-transform: uppercase;
          cursor: pointer;
        }

        /* SKELETON */

        .product-skeleton {
          aspect-ratio: 3 / 4;
          background:
            linear-gradient(
              100deg,
              #e9e7e2 20%,
              #f6f4f0 40%,
              #e9e7e2 60%
            );
          background-size:
            220% 100%;
          animation:
            skeleton 1.5s infinite;
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

        /* ERROR */

        .product-error {
          margin-top: 30px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 10px;
          border:
            1px solid #e5e2dd;
          color: #777;
          font-family: var(--font-dm-sans);
          font-size: 10px;
        }

        /* EMPTY */

        .no-products {
          padding: 80px 0;
          text-align: center;
          color: #888;
          font-family: var(--font-dm-sans);
          font-size: 11px;
        }

        /* TABLET */

        @media (max-width: 1100px) {

          .product-section {
            padding:
              80px 28px;
          }

          .product-grid {
            grid-template-columns:
              repeat(3, 1fr);
          }

        }

        /* MOBILE */

        @media (max-width: 700px) {

          .product-section {
            padding:
              65px 16px;
          }

          .product-section-header {
            padding-bottom: 25px;
          }

          .product-section-header h2 {
            font-size: 47px;
          }

          .section-count {
            display: none;
          }

          .product-grid {
            grid-template-columns:
              repeat(2, 1fr);
            gap: 12px;
            padding-top: 25px;
          }

          .product-info {
            display: block;
          }

          .product-price {
            align-items: flex-start;
            margin-top: 8px;
          }

          .product-info h3 {
            font-size: 12px;
          }

          .product-arrow {
            opacity: 1;
            width: 32px;
            height: 32px;
            transform: none;
          }

        }

      `}</style>

    </section>
  );
}