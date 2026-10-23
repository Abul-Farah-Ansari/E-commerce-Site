"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import WishlistButton from "@/components/WishlistButton";

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

  const visibleProducts = products.slice(0, Math.max(0, limit));

  /*
  ============================================================
  HAS MORE
  ============================================================
  */

  /*
  ============================================================
  VIEW ALL
  ============================================================
  */

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

                    <div
                      className={`product-image-stack ${
                        product.images?.[1] ? "has-secondary" : ""
                      }`}
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="product-image-primary"
                      />

                      {product.images && product.images.length > 1 && product.images[1] && (
                        <img
                          src={product.images[1]}
                          alt={`${product.name} - alternate view`}
                          className="product-image-secondary"
                          loading="lazy"
                        />
                      )}
                    </div>

                    {/* WISHLIST */}

                    <WishlistButton
                      productId={product._id}
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

                      <span className="current-price">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </span>

                      {product.compareAtPrice &&
                        product.compareAtPrice > product.price && (
                          <div className="price-meta">
                            <del>
                              ₹{Number(product.compareAtPrice).toLocaleString("en-IN")}
                            </del>
                            <span className="discount-percent">
                              {Math.round(
                                ((product.compareAtPrice - product.price) /
                                  product.compareAtPrice) *
                                  100
                              )}% OFF
                            </span>
                          </div>
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
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          padding-top: 30px;
        }

        /* CARD */

        .product-card {
          display: block;
          min-width: 0;
          color: #171613;
          text-decoration: none;
        }

        .product-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #f2f0eb;
          isolation: isolate;
        }

        .product-image-stack {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #f2f0eb;
        }

        .product-image-stack img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          will-change: transform;
          transition:
            transform .7s cubic-bezier(.22, 1, .36, 1),
            opacity .35s ease;
        }

        .product-image-primary {
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        .product-image-secondary {
          opacity: 1;
          transform: translateX(100%) scale(1);
        }

        /* Slide the alternate image in like a quiet editorial carousel. */
        .product-card:hover .product-image-stack.has-secondary .product-image-primary {
          transform: translateX(-100%) scale(1);
        }

        .product-card:hover .product-image-stack.has-secondary .product-image-secondary {
          transform: translateX(0) scale(1);
        }

        /* When there is no alternate image, keep the main image visible. */
        .product-card:hover .product-image-stack:not(.has-secondary) .product-image-primary {
          transform: scale(1.045);
        }

        .product-card:focus-visible .product-image-stack.has-secondary .product-image-primary {
          transform: translateX(-100%);
        }

        .product-card:focus-visible .product-image-stack.has-secondary .product-image-secondary {
          transform: translateX(0);
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
          align-items: flex-start;
          gap: 14px;
          padding: 17px 2px 0;
        }

        .product-info > div:first-child {
          min-width: 0;
        }

        .product-info h3 {
          margin: 0;
          color: #171613;
          font-family: var(--font-dm-sans);
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
          letter-spacing: -.02em;
          transition: color .25s ease;
        }

        .product-card:hover .product-info h3 {
          color: #777064;
        }

        .product-category {
          display: block;
          margin-top: 7px;
          color: #99948c;
          font-family: var(--font-dm-sans);
          font-size: 8px;
          font-weight: 600;
          letter-spacing: .16em;
        }

        .product-price {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 5px;
          padding: 1px 0 0;
          color: #171613;
          font-family: var(--font-dm-sans);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -.025em;
          white-space: nowrap;
        }

        .price-meta {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 7px;
        }

        .product-price del {
          color: #a7a197;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0;
        }

        .discount-percent {
          color: #8a4b3c;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: .06em;
        }

        .product-price .current-price {
          display: inline-flex;
          align-items: baseline;
          gap: 2px;
        }

        /* VIEW ALL */

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
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
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
            grid-template-columns: repeat(2, minmax(0, 1fr));
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

          .product-info {
            gap: 8px;
            padding-top: 11px;
          }

          .product-price {
            font-size: 12px;
          }

          .product-price del {
            font-size: 9px;
          }

          .price-meta {
            justify-content: flex-start;
          }

          .discount-percent {
            font-size: 8px;
          }

          .product-arrow {
            display: none;
          }


        }

      `}</style>

    </section>
  );
}