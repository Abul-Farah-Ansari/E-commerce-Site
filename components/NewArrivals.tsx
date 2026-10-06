"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
}

interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  description?: string;

  category?: ProductCategory | null;

  price: number;
  compareAtPrice?: number | null;

  images?: string[];

  sizes?: string[];
  colors?: string[];

  stock?: number;
  lowStockThreshold?: number;

  status?: "active" | "draft" | "out_of_stock";

  featured?: boolean;
  newArrival?: boolean;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85";

const WISHLIST_STORAGE_KEY =
  "ecommerce-wishlist";

export default function NewArrivals() {
  const [products, setProducts] = useState<
    ApiProduct[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [wishlist, setWishlist] =
    useState<string[]>([]);

  /*
  =========================================================
  LOAD NEW ARRIVALS
  =========================================================
  */

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);

        const response = await fetch(
          "/api/products",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Unable to load products."
          );
        }

        if (mounted) {
          const newArrivals =
            Array.isArray(data.products)
              ? data.products.filter(
                  (product: ApiProduct) =>
                    product.newArrival === true
                )
              : [];

          setProducts(
            newArrivals.slice(0, 8)
          );
        }
      } catch (error) {
        console.error(
          "NEW ARRIVALS ERROR:",
          error
        );

        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /*
  =========================================================
  LOAD WISHLIST
  =========================================================
  */

  useEffect(() => {
    try {
      const savedWishlist =
        localStorage.getItem(
          WISHLIST_STORAGE_KEY
        );

      if (!savedWishlist) {
        return;
      }

      const parsed =
        JSON.parse(savedWishlist);

      if (Array.isArray(parsed)) {
        setWishlist(
          parsed.filter(
            (id): id is string =>
              typeof id === "string"
          )
        );
      }
    } catch (error) {
      console.error(
        "Wishlist loading error:",
        error
      );
    }
  }, []);

  /*
  =========================================================
  WISHLIST TOGGLE
  =========================================================
  */

  const toggleWishlist = (
    event: React.MouseEvent<HTMLButtonElement>,
    productId: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setWishlist((current) => {
      const exists =
        current.includes(productId);

      const updated = exists
        ? current.filter(
            (id) => id !== productId
          )
        : [...current, productId];

      try {
        localStorage.setItem(
          WISHLIST_STORAGE_KEY,
          JSON.stringify(updated)
        );
      } catch (error) {
        console.error(
          "Wishlist saving error:",
          error
        );
      }

      return updated;
    });
  };

  /*
  =========================================================
  IMAGE
  =========================================================
  */

  const getImage = (
    product: ApiProduct
  ) => {
    return (
      product.images?.[0] ||
      FALLBACK_IMAGE
    );
  };

  /*
  =========================================================
  DISCOUNT
  =========================================================
  */

  const getDiscount = (
    product: ApiProduct
  ) => {
    if (
      !product.compareAtPrice ||
      product.compareAtPrice <= product.price
    ) {
      return null;
    }

    return Math.round(
      ((product.compareAtPrice -
        product.price) /
        product.compareAtPrice) *
        100
    );
  };

  /*
  =========================================================
  RENDER
  =========================================================
  */

  return (
    <section className="new-arrivals-section">
      <div className="new-arrivals-container">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="new-arrivals-header">
          <div>
            <div className="new-arrivals-label">
              <span className="new-arrivals-label-line" />

              <span>
                Just In
              </span>
            </div>

            <h2 className="new-arrivals-title">
              New Arrivals
            </h2>

            <p className="new-arrivals-description">
              Fresh styles have arrived.
              Discover the latest pieces
              added to our collection.
            </p>
          </div>

          <Link
            href="/products?sort=newest"
            className="new-arrivals-link"
          >
            <span>
              Shop New Arrivals
            </span>

            <Icon
              icon="solar:arrow-right-linear"
              width="19"
              height="19"
            />
          </Link>
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div className="new-arrivals-grid">
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="new-arrivals-skeleton"
                />
              )
            )}
          </div>
        )}

        {/* =====================================================
            EMPTY
        ===================================================== */}

        {!loading &&
          products.length === 0 && (
            <div className="new-arrivals-empty">
              <p>
                No new arrivals available
                right now.
              </p>
            </div>
          )}

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        {!loading &&
          products.length > 0 && (
            <div className="new-arrivals-grid">
              {products.map(
                (product) => {
                  const discount =
                    getDiscount(product);

                  const isWishlisted =
                    wishlist.includes(
                      product._id
                    );

                  const stock =
                    typeof product.stock ===
                    "number"
                      ? product.stock
                      : 0;

                  const isOutOfStock =
                    product.status ===
                      "out_of_stock" ||
                    stock <= 0;

                  return (
                    <div
                      key={product._id}
                      className="new-arrivals-card"
                    >
                      {/* =================================================
                          IMAGE
                      ================================================= */}

                      <Link
                        href={`/products/${product.slug}`}
                        className="new-arrivals-image"
                      >
                        <img
                          src={getImage(
                            product
                          )}
                          alt={product.name}
                          loading="lazy"
                        />

                        {/* IMAGE OVERLAY */}

                        <div className="new-arrivals-image-overlay" />

                        {/* NEW BADGE */}

                        <span className="new-arrivals-badge">
                          New
                        </span>

                        {/* DISCOUNT */}

                        {discount && (
                          <span className="new-arrivals-discount">
                            {discount}% OFF
                          </span>
                        )}

                        {/* OUT OF STOCK */}

                        {isOutOfStock && (
                          <span className="new-arrivals-stock">
                            Out of Stock
                          </span>
                        )}
                      </Link>

                      {/* =================================================
                          WISHLIST
                      ================================================= */}

                      <button
                        type="button"
                        onClick={(event) =>
                          toggleWishlist(
                            event,
                            product._id
                          )
                        }
                        aria-label={
                          isWishlisted
                            ? `Remove ${product.name} from wishlist`
                            : `Add ${product.name} to wishlist`
                        }
                        className={`new-arrivals-wishlist ${
                          isWishlisted
                            ? "is-wishlisted"
                            : ""
                        }`}
                      >
                        <Icon
                          icon={
                            isWishlisted
                              ? "solar:heart-bold"
                              : "solar:heart-linear"
                          }
                          width="20"
                          height="20"
                        />
                      </button>

                      {/* =================================================
                          DETAILS
                      ================================================= */}

                      <div className="new-arrivals-details">
                        <Link
                          href={`/products/${product.slug}`}
                          className="new-arrivals-info-link"
                        >
                          <p className="new-arrivals-category">
                            {product.category
                              ?.name ||
                              "Collection"}
                          </p>

                          <h3 className="new-arrivals-product-name">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="new-arrivals-bottom">
                          <div className="new-arrivals-prices">
                            <span className="new-arrivals-price">
                              ₹
                              {Number(
                                product.price
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </span>

                            {product.compareAtPrice &&
                              product.compareAtPrice >
                                product.price && (
                                <span className="new-arrivals-old-price">
                                  ₹
                                  {Number(
                                    product.compareAtPrice
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </span>
                              )}
                          </div>

                          <Link
                            href={`/products/${product.slug}`}
                            className="new-arrivals-arrow"
                            aria-label={`View ${product.name}`}
                          >
                            <Icon
                              icon="solar:arrow-right-up-linear"
                              width="18"
                              height="18"
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
      </div>

      {/* =====================================================
          RESPONSIVE CSS
      ===================================================== */}

      <style jsx>{`
        /* =====================================================
           SECTION
        ===================================================== */

        .new-arrivals-section {
          width: 100%;
          background: #ffffff;
          padding: 100px 0;
          overflow: hidden;
        }

        .new-arrivals-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .new-arrivals-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 45px;
        }

        .new-arrivals-label {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }

        .new-arrivals-label-line {
          width: 32px;
          height: 1px;
          background: #111111;
          flex-shrink: 0;
        }

        .new-arrivals-label span:last-child {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #666666;
        }

        .new-arrivals-title {
          margin: 0;
          font-size: clamp(
            42px,
            5vw,
            58px
          );
          line-height: 1;
          font-weight: 600;
          letter-spacing: -0.045em;
          color: #111111;
        }

        .new-arrivals-description {
          margin: 18px 0 0;
          max-width: 620px;
          font-size: 15px;
          line-height: 1.7;
          color: #666666;
        }

        .new-arrivals-link {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #111111;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          transition:
            transform 0.25s ease,
            opacity 0.25s ease;
        }

        .new-arrivals-link:hover {
          transform: translateX(4px);
          opacity: 0.65;
        }

        /* =====================================================
           GRID
        ===================================================== */

        .new-arrivals-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 20px;
          width: 100%;
        }

        /* =====================================================
           CARD
        ===================================================== */

        .new-arrivals-card {
          position: relative;
          min-width: 0;
          background: #f5f5f3;
          border-radius: 18px;
          overflow: hidden;
        }

        /* =====================================================
           IMAGE
        ===================================================== */

        .new-arrivals-image {
          position: relative;
          display: block;
          width: 100%;
          height: 400px;
          overflow: hidden;
          text-decoration: none;
          background: #e9e9e7;
        }

        .new-arrivals-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition:
            transform 0.6s
            cubic-bezier(0.2, 0.7, 0.2, 1);
        }

        .new-arrivals-image-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              to top,
              rgba(0, 0, 0, 0.35),
              transparent 45%
            );
          opacity: 0;
          transition:
            opacity 0.35s ease;
          pointer-events: none;
        }

        .new-arrivals-card:hover
          .new-arrivals-image img {
          transform: scale(1.045);
        }

        .new-arrivals-card:hover
          .new-arrivals-image-overlay {
          opacity: 1;
        }

        /* =====================================================
           NEW BADGE
        ===================================================== */

        .new-arrivals-badge {
          position: absolute;
          top: 15px;
          left: 15px;
          padding: 7px 11px;
          background: #ffffff;
          border-radius: 999px;
          color: #111111;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* =====================================================
           DISCOUNT
        ===================================================== */

        .new-arrivals-discount {
          position: absolute;
          left: 15px;
          bottom: 15px;
          padding: 7px 10px;
          background: #111111;
          color: #ffffff;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.08em;
        }

        /* =====================================================
           STOCK
        ===================================================== */

        .new-arrivals-stock {
          position: absolute;
          left: 15px;
          right: 15px;
          bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 38px;
          background: rgba(
            255,
            255,
            255,
            0.92
          );
          color: #555555;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* =====================================================
           WISHLIST
        ===================================================== */

        .new-arrivals-wishlist {
          position: absolute;
          top: 15px;
          right: 15px;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          background: #ffffff;
          color: #111111;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 3;
          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }

        .new-arrivals-wishlist:hover {
          transform: scale(1.08);
        }

        .new-arrivals-wishlist.is-wishlisted {
          background: #111111;
          color: #ffffff;
        }

        /* =====================================================
           DETAILS
        ===================================================== */

        .new-arrivals-details {
          padding: 19px 20px 20px;
          background: #ffffff;
        }

        .new-arrivals-info-link {
          display: block;
          color: inherit;
          text-decoration: none;
        }

        .new-arrivals-category {
          margin: 0;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #888888;
        }

        .new-arrivals-product-name {
          margin: 8px 0 0;
          font-size: 16px;
          font-weight: 600;
          line-height: 1.4;
          color: #111111;
        }

        .new-arrivals-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 14px;
        }

        .new-arrivals-prices {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          flex-wrap: wrap;
        }

        .new-arrivals-price {
          font-size: 15px;
          font-weight: 700;
          color: #111111;
        }

        .new-arrivals-old-price {
          font-size: 12px;
          color: #999999;
          text-decoration: line-through;
        }

        .new-arrivals-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #111111;
          color: #ffffff;
          text-decoration: none;
          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }

        .new-arrivals-arrow:hover {
          transform: translate(
            2px,
            -2px
          );
        }

        /* =====================================================
           SKELETON
        ===================================================== */

        .new-arrivals-skeleton {
          width: 100%;
          aspect-ratio: 3 / 4;
          border-radius: 18px;
          background:
            linear-gradient(
              90deg,
              #eeeeec 25%,
              #e4e4e2 50%,
              #eeeeec 75%
            );
          background-size: 200% 100%;
          animation:
            newArrivalsSkeleton 1.5s
            infinite;
        }

        @keyframes newArrivalsSkeleton {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .new-arrivals-empty {
          width: 100%;
          padding: 70px 20px;
          text-align: center;
          border-top: 1px solid #dededb;
          border-bottom: 1px solid #dededb;
        }

        .new-arrivals-empty p {
          margin: 0;
          font-size: 14px;
          color: #777777;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1024px) {
          .new-arrivals-section {
            padding: 80px 0;
          }

          .new-arrivals-container {
            padding: 0 30px;
          }

          .new-arrivals-header {
            margin-bottom: 35px;
          }

          .new-arrivals-title {
            font-size: 46px;
          }

          .new-arrivals-grid {
            gap: 18px;
          }

          .new-arrivals-image {
            height: 340px;
          }

          .new-arrivals-details {
            padding: 16px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {
          .new-arrivals-section {
            padding: 65px 0;
          }

          .new-arrivals-container {
            padding: 0;
          }

          .new-arrivals-header {
            display: block;
            margin-bottom: 30px;
            padding: 0 20px;
          }

          .new-arrivals-label {
            gap: 9px;
            margin-bottom: 11px;
          }

          .new-arrivals-label-line {
            width: 25px;
          }

          .new-arrivals-label span:last-child {
            font-size: 10px;
            letter-spacing: 0.2em;
          }

          .new-arrivals-title {
            font-size: 36px;
            line-height: 1.05;
          }

          .new-arrivals-description {
            margin-top: 15px;
            font-size: 13px;
            line-height: 1.65;
            max-width: 100%;
          }

          .new-arrivals-link {
            margin-top: 22px;
            display: inline-flex;
            font-size: 12px;
          }

          /* =================================================
             HORIZONTAL CAROUSEL
          ================================================= */

          .new-arrivals-grid {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            gap: 12px;
            padding-left: 20px;
            padding-right: 20px;
            scroll-snap-type: x mandatory;
            scroll-padding-left: 20px;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .new-arrivals-grid::-webkit-scrollbar {
            display: none;
          }

          /* =================================================
             TWO CARDS
          ================================================= */

          .new-arrivals-card {
            flex: 0 0
              calc(
                (100% - 12px) / 2
              );
            width: calc(
              (100% - 12px) / 2
            );
            min-width: calc(
              (100% - 12px) / 2
            );
            scroll-snap-align: start;
            border-radius: 14px;
          }

          /* =================================================
             SQUARE IMAGE
          ================================================= */

          .new-arrivals-image {
            height: auto;
            aspect-ratio: 1 / 1;
          }

          .new-arrivals-image-overlay {
            opacity: 0;
          }

          .new-arrivals-badge {
            top: 9px;
            left: 9px;
            padding: 5px 8px;
            font-size: 7px;
          }

          .new-arrivals-discount {
            left: 9px;
            bottom: 9px;
            padding: 5px 7px;
            font-size: 7px;
          }

          .new-arrivals-stock {
            left: 9px;
            right: 9px;
            bottom: 9px;
            height: 32px;
            font-size: 7px;
          }

          .new-arrivals-wishlist {
            width: 31px;
            height: 31px;
            top: 9px;
            right: 9px;
          }

          .new-arrivals-wishlist
            :global(svg) {
            width: 16px;
            height: 16px;
          }

          /* =================================================
             DETAILS
          ================================================= */

          .new-arrivals-details {
            padding: 13px;
          }

          .new-arrivals-category {
            font-size: 7px;
            letter-spacing: 0.11em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .new-arrivals-product-name {
            margin-top: 6px;
            font-size: 13px;
            line-height: 1.35;

            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .new-arrivals-bottom {
            margin-top: 10px;
            gap: 7px;
          }

          .new-arrivals-prices {
            gap: 5px;
          }

          .new-arrivals-price {
            font-size: 12px;
          }

          .new-arrivals-old-price {
            font-size: 9px;
          }

          .new-arrivals-arrow {
            width: 31px;
            height: 31px;
          }

          .new-arrivals-arrow
            :global(svg) {
            width: 15px;
            height: 15px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 480px) {
          .new-arrivals-section {
            padding: 55px 0;
          }

          .new-arrivals-header {
            padding: 0 15px;
          }

          .new-arrivals-title {
            font-size: 32px;
          }

          .new-arrivals-description {
            font-size: 12px;
          }

          .new-arrivals-grid {
            gap: 10px;
            padding-left: 15px;
            padding-right: 15px;
            scroll-padding-left: 15px;
          }

          .new-arrivals-card {
            flex: 0 0
              calc(
                (100% - 10px) / 2
              );
            width: calc(
              (100% - 10px) / 2
            );
            min-width: calc(
              (100% - 10px) / 2
            );
          }

          .new-arrivals-details {
            padding: 11px;
          }

          .new-arrivals-category {
            font-size: 6px;
          }

          .new-arrivals-product-name {
            font-size: 12px;
          }

          .new-arrivals-price {
            font-size: 11px;
          }

          .new-arrivals-old-price {
            font-size: 8px;
          }

          .new-arrivals-arrow {
            width: 29px;
            height: 29px;
          }

          .new-arrivals-wishlist {
            width: 28px;
            height: 28px;
          }

          .new-arrivals-wishlist
            :global(svg) {
            width: 14px;
            height: 14px;
          }
        }

        /* =====================================================
           VERY SMALL
        ===================================================== */

        @media (max-width: 359px) {
          .new-arrivals-header {
            padding: 0 12px;
          }

          .new-arrivals-title {
            font-size: 29px;
          }

          .new-arrivals-grid {
            gap: 8px;
            padding-left: 12px;
            padding-right: 12px;
            scroll-padding-left: 12px;
          }

          .new-arrivals-card {
            flex: 0 0
              calc(
                (100% - 8px) / 2
              );
            width: calc(
              (100% - 8px) / 2
            );
            min-width: calc(
              (100% - 8px) / 2
            );
          }

          .new-arrivals-details {
            padding: 9px;
          }

          .new-arrivals-product-name {
            font-size: 11px;
          }

          .new-arrivals-price {
            font-size: 10px;
          }

          .new-arrivals-arrow {
            width: 27px;
            height: 27px;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .new-arrivals-image img,
          .new-arrivals-link,
          .new-arrivals-arrow,
          .new-arrivals-wishlist {
            transition: none !important;
          }

          .new-arrivals-skeleton {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}