"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { Icon } from "@iconify/react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartContext";

interface Category {
  _id?: string;
  name: string;
  slug: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;

  category?:
    | Category
    | string
    | null;

  price: number;
  compareAtPrice?: number;

  images?: string[];

  sizes?: string[];
  colors?: string[];

  sku?: string;

  stock?: number;

  lowStockThreshold?: number;

  status?:
    | "active"
    | "draft"
    | "out_of_stock";

  featured?: boolean;
  newArrival?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

type SortOption =
  | "newest"
  | "price-low"
  | "price-high"
  | "name";

export default function NewArrivalsPage() {
  const { addToCart } = useCart();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeCategory, setActiveCategory] =
    useState("all");

  const [sortBy, setSortBy] =
    useState<SortOption>("newest");

  const [wishlist, setWishlist] =
    useState<string[]>([]);

  const [addingProduct, setAddingProduct] =
    useState<string | null>(null);

  const [addedProduct, setAddedProduct] =
    useState<string | null>(null);

  /* =========================================================
     LOAD PRODUCTS
  ========================================================= */

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/products",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load products."
          );
        }

        const newProducts =
          Array.isArray(data.products)
            ? data.products.filter(
                (product: Product) =>
                  product.status === "active" &&
                  product.newArrival === true
              )
            : [];

        setProducts(newProducts);
      } catch (error) {
        console.error(
          "New arrivals loading error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load new arrivals."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  /* =========================================================
     LOAD WISHLIST
  ========================================================= */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          "ecommerce-wishlist"
        );

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setWishlist(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Wishlist loading error:",
        error
      );
    }
  }, []);

  /* =========================================================
     SAVE WISHLIST
  ========================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        "ecommerce-wishlist",
        JSON.stringify(wishlist)
      );
    } catch (error) {
      console.error(
        "Wishlist saving error:",
        error
      );
    }
  }, [wishlist]);

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        slug: string;
      }
    >();

    products.forEach((product) => {
      if (!product.category) return;

      if (
        typeof product.category === "string"
      ) {
        const value =
          product.category.trim();

        if (!value) return;

        map.set(value.toLowerCase(), {
          name: value,
          slug: value
            .toLowerCase()
            .replace(/\s+/g, "-"),
        });

        return;
      }

      if (
        product.category.name &&
        product.category.slug
      ) {
        map.set(
          product.category.slug,
          {
            name:
              product.category.name,
            slug:
              product.category.slug,
          }
        );
      }
    });

    return Array.from(
      map.values()
    );
  }, [products]);

  /* =========================================================
     FILTER + SORT
  ========================================================= */

  const visibleProducts = useMemo(() => {
    let result = [...products];

    /* CATEGORY */

    if (activeCategory !== "all") {
      result = result.filter(
        (product) => {
          if (!product.category) {
            return false;
          }

          if (
            typeof product.category ===
            "string"
          ) {
            return (
              product.category
                .toLowerCase()
                .replace(/\s+/g, "-") ===
              activeCategory
            );
          }

          return (
            product.category.slug ===
            activeCategory
          );
        }
      );
    }

    /* SORT */

    result.sort((a, b) => {
      if (sortBy === "price-low") {
        return (
          Number(a.price || 0) -
          Number(b.price || 0)
        );
      }

      if (sortBy === "price-high") {
        return (
          Number(b.price || 0) -
          Number(a.price || 0)
        );
      }

      if (sortBy === "name") {
        return a.name.localeCompare(
          b.name
        );
      }

      const first = a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;

      const second = b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;

      return second - first;
    });

    return result;
  }, [
    products,
    activeCategory,
    sortBy,
  ]);

  /* =========================================================
     WISHLIST
  ========================================================= */

  const toggleWishlist = (
    productId: string
  ) => {
    setWishlist((previous) => {
      if (previous.includes(productId)) {
        return previous.filter(
          (id) => id !== productId
        );
      }

      return [
        ...previous,
        productId,
      ];
    });
  };

  /* =========================================================
     CATEGORY NAME
  ========================================================= */

  const getCategoryName = (
    product: Product
  ) => {
    if (!product.category) {
      return "Collection";
    }

    if (
      typeof product.category ===
      "string"
    ) {
      return product.category;
    }

    return product.category.name;
  };

  /* =========================================================
     PRODUCT IMAGE
  ========================================================= */

  const getProductImage = (
    product: Product
  ) => {
    if (
      product.images &&
      product.images.length > 0 &&
      product.images[0]
    ) {
      return product.images[0];
    }

    return (
      "https://images.unsplash.com/" +
      "photo-1445205170230-053b83016050" +
      "?auto=format&fit=crop&w=1200&q=85"
    );
  };

  /* =========================================================
     DISCOUNT
  ========================================================= */

  const getDiscount = (
    product: Product
  ) => {
    if (
      !product.compareAtPrice ||
      product.compareAtPrice <=
        product.price
    ) {
      return 0;
    }

    return Math.round(
      ((product.compareAtPrice -
        product.price) /
        product.compareAtPrice) *
        100
    );
  };

  /* =========================================================
     ADD TO BAG
  ========================================================= */

  const handleAddToBag = (
    product: Product
  ) => {
    /*
     * Products that have variants should
     * be selected from the product page.
     */

    if (
      (product.sizes &&
        product.sizes.length > 0) ||
      (product.colors &&
        product.colors.length > 0)
    ) {
      return;
    }

    if (
      !product.stock ||
      product.stock <= 0
    ) {
      return;
    }

    try {
      setAddingProduct(
        product._id
      );

      addToCart({
        id: product._id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        oldPrice:
          product.compareAtPrice,
        image:
          getProductImage(product),
        images:
          product.images,
        category:
          product.category,
        description:
          product.description,
        sizes:
          product.sizes,
        colors:
          product.colors,
        sku: product.sku,
        stock:
          product.stock,
        lowStockThreshold:
          product.lowStockThreshold,
        status:
          product.status,
        featured:
          product.featured,
        newArrival:
          product.newArrival,
      });

      setAddedProduct(
        product._id
      );

      setTimeout(() => {
        setAddedProduct(null);
      }, 1800);
    } catch (error) {
      console.error(
        "Add to cart error:",
        error
      );
    } finally {
      setTimeout(() => {
        setAddingProduct(null);
      }, 400);
    }
  };

  return (
    <>
      <Navbar />

      <main className="new-arrivals-page">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="new-arrivals-hero">

          <div className="new-arrivals-hero-content">

            <span className="hero-eyebrow">
              HOUSE OF ORIVE
            </span>

            <h1>
              New Arrivals
            </h1>

            <p>
              Discover the latest pieces
              from our evolving collection —
              designed with quiet confidence,
              refined silhouettes and
              timeless character.
            </p>

            <div className="hero-line">
              <span />
              <span>
                COLLECTION 2026
              </span>
              <span />
            </div>

          </div>

          <div className="hero-side-detail">
            <span>
              01
            </span>

            <span>
              NEW
            </span>

            <span>
              SEASON
            </span>
          </div>

        </section>

        {/* ===================================================
            COLLECTION INTRO
        =================================================== */}

        <section className="collection-intro">

          <div className="intro-left">
            <span>
              THE LATEST EDIT
            </span>

            <h2>
              Fresh pieces.
              <br />
              Timeless attitude.
            </h2>
          </div>

          <div className="intro-right">
            <p>
              Explore our newest additions,
              carefully selected to bring
              contemporary ease to your
              everyday wardrobe.
            </p>

            <span className="intro-count">
              {loading
                ? "—"
                : `${products.length
                .toString()
                .padStart(2, "0")} PIECES`}
            </span>
          </div>

        </section>

        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <section className="collection-toolbar">

          <div className="category-filter">

            <button
              type="button"
              className={
                activeCategory ===
                "all"
                  ? "filter-button active"
                  : "filter-button"
              }
              onClick={() =>
                setActiveCategory(
                  "all"
                )
              }
            >
              All
            </button>

            {categories.map(
              (category) => (
                <button
                  key={
                    category.slug
                  }
                  type="button"
                  className={
                    activeCategory ===
                    category.slug
                      ? "filter-button active"
                      : "filter-button"
                  }
                  onClick={() =>
                    setActiveCategory(
                      category.slug
                    )
                  }
                >
                  {category.name}
                </button>
              )
            )}

          </div>

          <div className="toolbar-right">

            <span className="result-count">
              {loading
                ? "Loading..."
                : `${visibleProducts.length} ${
                    visibleProducts.length ===
                    1
                      ? "ITEM"
                      : "ITEMS"
                  }`}
            </span>

            <div className="sort-wrapper">

              <label htmlFor="sort">
                SORT
              </label>

              <select
                id="sort"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target
                      .value as SortOption
                  )
                }
              >
                <option value="newest">
                  Newest
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="name">
                  Name
                </option>
              </select>

              <Icon
                icon="solar:alt-arrow-down-linear"
                width={16}
                height={16}
              />

            </div>

          </div>

        </section>

        {/* ===================================================
            PRODUCTS
        =================================================== */}

        <section className="products-section">

          {loading ? (
            <div className="products-grid">

              {Array.from({
                length: 8,
              }).map(
                (_, index) => (
                  <div
                    className="product-skeleton"
                    key={index}
                  >
                    <div className="skeleton-image" />

                    <div className="skeleton-line large" />

                    <div className="skeleton-line small" />

                    <div className="skeleton-line price" />
                  </div>
                )
              )}

            </div>
          ) : error ? (
            <div className="state-box">

              <Icon
                icon="solar:danger-circle-linear"
                width={42}
                height={42}
              />

              <h3>
                Unable to load
                new arrivals
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>

            </div>
          ) : visibleProducts.length ===
            0 ? (
            <div className="state-box">

              <Icon
                icon="solar:hanger-2-linear"
                width={46}
                height={46}
              />

              <h3>
                Nothing here yet
              </h3>

              <p>
                New pieces are on
                their way. Check back
                soon for the latest
                House of Orive
                collection.
              </p>

              {activeCategory !==
                "all" && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      "all"
                    )
                  }
                >
                  View All Arrivals
                </button>
              )}

            </div>
          ) : (
            <div className="products-grid">

              {visibleProducts.map(
                (product, index) => {
                  const image =
                    getProductImage(
                      product
                    );

                  const discount =
                    getDiscount(
                      product
                    );

                  const isWishlisted =
                    wishlist.includes(
                      product._id
                    );

                  const hasVariants =
                    Boolean(
                      product.sizes
                        ?.length ||
                        product.colors
                          ?.length
                    );

                  const outOfStock =
                    !product.stock ||
                    product.stock <=
                      0 ||
                    product.status ===
                      "out_of_stock";

                  return (
                    <article
                      className="product-card"
                      key={
                        product._id
                      }
                    >

                      {/* IMAGE */}

                      <div className="product-image-wrap">

                        <Link
                          href={`/products/${product.slug}`}
                          className="product-image-link"
                        >
                          <img
                            src={image}
                            alt={
                              product.name
                            }
                            className="product-image"
                            loading={
                              index < 4
                                ? "eager"
                                : "lazy"
                            }
                          />
                        </Link>

                        {/* NEW BADGE */}

                        <div className="new-badge">
                          NEW
                        </div>

                        {/* DISCOUNT */}

                        {discount >
                          0 && (
                          <div className="discount-badge">
                            -
                            {discount}%
                          </div>
                        )}

                        {/* WISHLIST */}

                        <button
                          type="button"
                          className={
                            isWishlisted
                              ? "wishlist-button active"
                              : "wishlist-button"
                          }
                          aria-label={
                            isWishlisted
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                          onClick={() =>
                            toggleWishlist(
                              product._id
                            )
                          }
                        >
                          <Icon
                            icon={
                              isWishlisted
                                ? "solar:heart-bold"
                                : "solar:heart-linear"
                            }
                            width={20}
                            height={20}
                          />
                        </button>

                        {/* QUICK ACTION */}

                        {!outOfStock && (
                          <div className="product-action">

                            {hasVariants ? (
                              <Link
                                href={`/products/${product.slug}`}
                                className="quick-action-button"
                              >
                                <span>
                                  Select Options
                                </span>

                                <Icon
                                  icon="solar:arrow-right-linear"
                                  width={18}
                                  height={18}
                                />
                              </Link>
                            ) : (
                              <button
                                type="button"
                                className="quick-action-button"
                                disabled={
                                  addingProduct ===
                                  product._id
                                }
                                onClick={() =>
                                  handleAddToBag(
                                    product
                                  )
                                }
                              >
                                <span>
                                  {addedProduct ===
                                  product._id
                                    ? "Added to Bag"
                                    : addingProduct ===
                                        product._id
                                      ? "Adding..."
                                      : "Add to Bag"}
                                </span>

                                <Icon
                                  icon={
                                    addedProduct ===
                                    product._id
                                      ? "solar:check-circle-linear"
                                      : "solar:bag-4-linear"
                                  }
                                  width={
                                    18
                                  }
                                  height={
                                    18
                                  }
                                />
                              </button>
                            )}

                          </div>
                        )}

                      </div>

                      {/* PRODUCT INFO */}

                      <div className="product-info">

                        <div className="product-category">
                          {getCategoryName(
                            product
                          )}
                        </div>

                        <Link
                          href={`/products/${product.slug}`}
                          className="product-name"
                        >
                          {product.name}
                        </Link>

                        <div className="product-price-row">

                          <span className="product-price">
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
                              <span className="product-old-price">
                                ₹
                                {Number(
                                  product.compareAtPrice
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            )}

                        </div>

                        {/* VARIANT INFO */}

                        {(product.sizes?.length ||
                          product.colors
                            ?.length) && (
                          <div className="variant-hint">

                            {product.sizes
                              ?.length ? (
                              <span>
                                {
                                  product.sizes
                                    .length
                                } sizes
                              </span>
                            ) : null}

                            {product.colors
                              ?.length ? (
                              <span>
                                {
                                  product.colors
                                    .length
                                } colors
                              </span>
                            ) : null}

                          </div>
                        )}

                        {/* STOCK */}

                        {outOfStock ? (
                          <div className="stock-text out">
                            Out of Stock
                          </div>
                        ) : product.stock &&
                          product.lowStockThreshold &&
                          product.stock <=
                            product.lowStockThreshold ? (
                          <div className="stock-text low">
                            Only{" "}
                            {product.stock}{" "}
                            left
                          </div>
                        ) : null}

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* ===================================================
            EDITORIAL BANNER
        =================================================== */}

        {!loading &&
          products.length > 0 && (
            <section className="editorial-banner">

              <div className="editorial-image">

                <img
                  src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=90"
                  alt="House of Orive collection"
                />

              </div>

              <div className="editorial-overlay" />

              <div className="editorial-content">

                <span>
                  HOUSE OF ORIVE
                </span>

                <h2>
                  Designed for
                  <br />
                  the now.
                </h2>

                <p>
                  Modern silhouettes,
                  considered details and
                  effortless refinement.
                </p>

                <Link href="/products">
                  Explore The Collection
                  <Icon
                    icon="solar:arrow-right-linear"
                    width={19}
                    height={19}
                  />
                </Link>

              </div>

            </section>
          )}

      </main>

      <Footer />

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx>{`
        .new-arrivals-page {
          background: #FAF8F5;
          color: #111111;
          overflow: hidden;
        }

        /* =========================================
           HERO
        ========================================= */

        .new-arrivals-hero {
          position: relative;
          min-height: 560px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 90px 40px;
          box-sizing: border-box;
          background:
            linear-gradient(
              180deg,
              #f8f8f6 0%,
              #ffffff 100%
            );
          border-bottom: 1px solid #eeeeee;
          overflow: hidden;
        }

        .new-arrivals-hero::before {
          content: "NEW";
          position: absolute;
          left: -50px;
          bottom: -95px;
          color: rgba(0, 0, 0, 0.025);
          font-family: var(--font-bodoni);
          font-size: 330px;
          line-height: 0.8;
          white-space: nowrap;
          pointer-events: none;
        }

        .new-arrivals-hero-content {
          position: relative;
          z-index: 2;
          max-width: 760px;
          text-align: center;
        }

        .hero-eyebrow {
          display: block;
          margin-bottom: 24px;
          color: #777777;
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.32em;
        }

        .new-arrivals-hero h1 {
          margin: 0;
          color: #111111;
          font-family: var(--font-bodoni);
          font-size: clamp(
            70px,
            9vw,
            132px
          );
          font-weight: 400;
          letter-spacing: -0.045em;
          line-height: 0.82;
        }

        .new-arrivals-hero p {
          max-width: 550px;
          margin: 38px auto 0;
          color: #666666;
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 400;
          line-height: 1.8;
        }

        .hero-line {
          margin-top: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          color: #999999;
          font-family: var(--font-body);
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.22em;
        }

        .hero-line span:first-child,
        .hero-line span:last-child {
          width: 38px;
          height: 1px;
          background: #cccccc;
        }

        .hero-side-detail {
          position: absolute;
          right: 30px;
          top: 50%;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transform: translateY(-50%);
          color: #999999;
          font-family: var(--font-body);
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.22em;
          writing-mode: vertical-rl;
        }

        /* =========================================
           INTRO
        ========================================= */

        .collection-intro {
          max-width: 1320px;
          margin: 0 auto;
          padding: 100px 40px 75px;
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(320px, 0.65fr);
          gap: 100px;
          box-sizing: border-box;
        }

        .intro-left > span {
          display: block;
          margin-bottom: 20px;
          color: #888888;
          font-family: var(--font-body);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.24em;
        }

        .intro-left h2 {
          margin: 0;
          color: #111111;
          font-family: var(--font-bodoni);
          font-size: clamp(
            42px,
            5vw,
            68px
          );
          font-weight: 400;
          line-height: 0.95;
          letter-spacing: -0.035em;
        }

        .intro-right {
          align-self: end;
          padding-bottom: 5px;
        }

        .intro-right p {
          max-width: 440px;
          margin: 0;
          color: #666666;
          font-family: var(--font-body);
          font-size: 14px;
          line-height: 1.85;
        }

        .intro-count {
          display: block;
          margin-top: 28px;
          color: #111111;
          font-family: var(--font-body);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.2em;
        }

        /* =========================================
           TOOLBAR
        ========================================= */

        .collection-toolbar {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 40px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 30px;
          border-bottom: 1px solid #dedede;
          box-sizing: border-box;
        }

        .category-filter {
          display: flex;
          align-items: center;
          gap: 24px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .category-filter::-webkit-scrollbar {
          display: none;
        }

        .filter-button {
          position: relative;
          flex-shrink: 0;
          padding: 0 0 9px;
          border: none;
          background: transparent;
          color: #888888;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .filter-button::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          width: 0;
          height: 1px;
          background: #111111;
          transition:
            width 0.25s ease;
        }

        .filter-button:hover {
          color: #111111;
        }

        .filter-button.active {
          color: #111111;
        }

        .filter-button.active::after {
          width: 100%;
        }

        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 30px;
          flex-shrink: 0;
        }

        .result-count {
          color: #999999;
          font-family: var(--font-body);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.16em;
        }

        .sort-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sort-wrapper label {
          color: #888888;
          font-family: var(--font-body);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.15em;
        }

        .sort-wrapper select {
          appearance: none;
          -webkit-appearance: none;
          min-width: 120px;
          padding: 0 22px 0 0;
          border: none;
          outline: none;
          background: transparent;
          color: #111111;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 500;
        }

        .sort-wrapper > svg {
          position: absolute;
          right: 0;
          pointer-events: none;
        }

        /* =========================================
           PRODUCTS
        ========================================= */

        .products-section {
          max-width: 1320px;
          margin: 0 auto;
          padding: 45px 40px 120px;
          box-sizing: border-box;
        }

        .products-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 52px 22px;
        }

        .product-card {
          min-width: 0;
        }

        .product-image-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 0.77;
          background: #f5f5f3;
          overflow: hidden;
        }

        .product-image-link {
          position: absolute;
          inset: 0;
          display: block;
          overflow: hidden;
        }

        .product-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition:
            transform 0.7s
              cubic-bezier(
                0.22,
                1,
                0.36,
                1
              );
        }

        .product-card:hover
          .product-image {
          transform: scale(1.045);
        }

        .new-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          z-index: 2;
          padding: 7px 9px;
          background: #111111;
          color: #ffffff;
          font-family: var(--font-body);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }

        .discount-badge {
          position: absolute;
          top: 14px;
          left: 57px;
          z-index: 2;
          padding: 7px 9px;
          background: #FAF8F5;
          color: #111111;
          font-family: var(--font-body);
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .wishlist-button {
          position: absolute;
          top: 13px;
          right: 13px;
          z-index: 3;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: rgba(
            255,
            255,
            255,
            0.9
          );
          color: #222222;
          cursor: pointer;
          opacity: 0;
          transform: translateY(
            -4px
          );
          transition:
            opacity 0.25s ease,
            transform 0.25s ease,
            background 0.2s ease;
        }

        .product-card:hover
          .wishlist-button,
        .wishlist-button.active {
          opacity: 1;
          transform: translateY(0);
        }

        .wishlist-button:hover {
          background: #111111;
          color: #ffffff;
        }

        .wishlist-button.active {
          color: #111111;
        }

        .wishlist-button.active:hover {
          color: #ffffff;
        }

        .product-action {
          position: absolute;
          left: 12px;
          right: 12px;
          bottom: 12px;
          z-index: 3;
          transform: translateY(
            8px
          );
          opacity: 0;
          transition:
            opacity 0.3s ease,
            transform 0.3s ease;
        }

        .product-card:hover
          .product-action {
          opacity: 1;
          transform: translateY(0);
        }

        .quick-action-button {
          width: 100%;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 0 16px;
          box-sizing: border-box;
          border: none;
          background: rgba(
            17,
            17,
            17,
            0.96
          );
          color: #ffffff;
          text-decoration: none;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .quick-action-button:disabled {
          opacity: 0.65;
          cursor: default;
        }

        .product-info {
          padding-top: 18px;
        }

        .product-category {
          margin-bottom: 7px;
          color: #999999;
          font-family: var(--font-body);
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.17em;
          text-transform: uppercase;
        }

        .product-name {
          display: block;
          color: #111111;
          text-decoration: none;
          font-family: var(--font-bodoni);
          font-size: 22px;
          font-weight: 500;
          line-height: 1.05;
          letter-spacing: -0.015em;
          transition: color 0.2s ease;
        }

        .product-name:hover {
          color: #777777;
        }

        .product-price-row {
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .product-price {
          color: #111111;
          font-family: var(--font-body);
          font-size: 12px;
          font-weight: 600;
        }

        .product-old-price {
          color: #999999;
          font-family: var(--font-body);
          font-size: 11px;
          text-decoration: line-through;
        }

        .variant-hint {
          margin-top: 10px;
          display: flex;
          gap: 8px;
          color: #999999;
          font-family: var(--font-body);
          font-size: 9px;
        }

        .variant-hint span + span {
          padding-left: 8px;
          border-left: 1px solid #dddddd;
        }

        .stock-text {
          margin-top: 9px;
          font-family: var(--font-body);
          font-size: 9px;
          font-weight: 600;
        }

        .stock-text.low {
          color: #8a6500;
        }

        .stock-text.out {
          color: #999999;
        }

        /* =========================================
           SKELETON
        ========================================= */

        .product-skeleton {
          min-width: 0;
        }

        .skeleton-image {
          width: 100%;
          aspect-ratio: 0.77;
          background:
            linear-gradient(
              90deg,
              #f3f3f1 25%,
              #eaeae8 50%,
              #f3f3f1 75%
            );
          background-size: 200% 100%;
          animation:
            skeleton-loading 1.5s
            infinite;
        }

        .skeleton-line {
          margin-top: 16px;
          height: 12px;
          background: #f0f0ee;
          animation:
            skeleton-loading 1.5s
            infinite;
        }

        .skeleton-line.large {
          width: 72%;
        }

        .skeleton-line.small {
          width: 38%;
          margin-top: 9px;
        }

        .skeleton-line.price {
          width: 25%;
          margin-top: 12px;
        }

        @keyframes skeleton-loading {
          0% {
            background-position: 200%
              0;
          }

          100% {
            background-position: -200%
              0;
          }
        }

        /* =========================================
           EMPTY / ERROR
        ========================================= */

        .state-box {
          min-height: 430px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 50px 20px;
          text-align: center;
          color: #777777;
        }

        .state-box > svg {
          margin-bottom: 20px;
          color: #999999;
        }

        .state-box h3 {
          margin: 0;
          color: #111111;
          font-family: var(--font-bodoni);
          font-size: 34px;
          font-weight: 500;
        }

        .state-box p {
          max-width: 430px;
          margin: 12px 0 24px;
          color: #777777;
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.7;
        }

        .state-box button {
          min-height: 44px;
          padding: 0 22px;
          border: 1px solid #111111;
          background: #111111;
          color: #ffffff;
          cursor: pointer;
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .state-box button:hover {
          background: #FAF8F5;
          color: #111111;
        }

        /* =========================================
           EDITORIAL BANNER
        ========================================= */

        .editorial-banner {
          position: relative;
          min-height: 620px;
          margin: 0 40px 100px;
          overflow: hidden;
          background: #222222;
        }

        .editorial-image {
          position: absolute;
          inset: 0;
        }

        .editorial-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          transition:
            transform 1s
              cubic-bezier(
                0.22,
                1,
                0.36,
                1
              );
        }

        .editorial-banner:hover
          .editorial-image img {
          transform: scale(1.025);
        }

        .editorial-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.68),
              rgba(0, 0, 0, 0.2)
                65%,
              rgba(0, 0, 0, 0.05)
            );
        }

        .editorial-content {
          position: relative;
          z-index: 2;
          max-width: 520px;
          padding: 90px;
          color: #ffffff;
        }

        .editorial-content > span {
          display: block;
          margin-bottom: 25px;
          font-family: var(--font-body);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.28em;
        }

        .editorial-content h2 {
          margin: 0;
          font-family: var(--font-bodoni);
          font-size: clamp(
            55px,
            6vw,
            88px
          );
          font-weight: 400;
          line-height: 0.88;
          letter-spacing: -0.035em;
        }

        .editorial-content p {
          max-width: 360px;
          margin: 30px 0 35px;
          color: rgba(
            255,
            255,
            255,
            0.75
          );
          font-family: var(--font-body);
          font-size: 13px;
          line-height: 1.8;
        }

        .editorial-content a {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          min-height: 48px;
          padding: 0 20px;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.55
            );
          color: #ffffff;
          text-decoration: none;
          font-family: var(--font-body);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          transition:
            background 0.25s ease,
            color 0.25s ease;
        }

        .editorial-content a:hover {
          background: #FAF8F5;
          color: #111111;
        }

        /* =========================================
           TABLET
        ========================================= */

        @media (max-width: 1050px) {
          .products-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .collection-intro {
            gap: 60px;
          }

          .editorial-banner {
            margin-left: 25px;
            margin-right: 25px;
          }
        }

        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 768px) {
          .new-arrivals-hero {
            min-height: 480px;
            padding: 70px 25px;
          }

          .new-arrivals-hero h1 {
            font-size: clamp(
              58px,
              17vw,
              92px
            );
          }

          .new-arrivals-hero p {
            margin-top: 28px;
            font-size: 13px;
            line-height: 1.75;
          }

          .hero-side-detail {
            display: none;
          }

          .collection-intro {
            padding: 70px 22px 55px;
            grid-template-columns: 1fr;
            gap: 35px;
          }

          .intro-left h2 {
            font-size: 48px;
          }

          .intro-right {
            padding-bottom: 0;
          }

          .collection-toolbar {
            padding: 0 22px 18px;
            flex-direction: column;
            align-items: stretch;
            gap: 18px;
          }

          .category-filter {
            width: 100%;
            gap: 20px;
            padding-bottom: 3px;
          }

          .toolbar-right {
            justify-content: space-between;
          }

          .products-section {
            padding: 32px 16px 80px;
          }

          .products-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
            gap: 38px 10px;
          }

          .product-image-wrap {
            aspect-ratio: 0.72;
          }

          .product-action {
            display: none;
          }

          .wishlist-button {
            opacity: 1;
            transform: none;
            width: 34px;
            height: 34px;
          }

          .new-badge {
            top: 9px;
            left: 9px;
            padding: 6px 7px;
            font-size: 7px;
          }

          .discount-badge {
            top: 9px;
            left: 49px;
            padding: 6px 7px;
            font-size: 7px;
          }

          .wishlist-button {
            top: 8px;
            right: 8px;
          }

          .product-info {
            padding-top: 13px;
          }

          .product-category {
            margin-bottom: 6px;
            font-size: 7px;
          }

          .product-name {
            font-size: 19px;
          }

          .product-price-row {
            margin-top: 8px;
          }

          .product-price {
            font-size: 11px;
          }

          .product-old-price {
            font-size: 10px;
          }

          .variant-hint {
            font-size: 8px;
          }

          .editorial-banner {
            min-height: 540px;
            margin:
              0 16px 70px;
          }

          .editorial-content {
            padding: 60px 28px;
          }

          .editorial-content h2 {
            font-size: 62px;
          }

          .editorial-overlay {
            background:
              linear-gradient(
                180deg,
                rgba(0, 0, 0, 0.2),
                rgba(0, 0, 0, 0.75)
              );
          }

          .editorial-content {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
          }
        }

        /* =========================================
           SMALL MOBILE
        ========================================= */

        @media (max-width: 480px) {
          .new-arrivals-hero {
            min-height: 440px;
            padding: 55px 20px;
          }

          .hero-eyebrow {
            font-size: 8px;
            letter-spacing: 0.25em;
          }

          .new-arrivals-hero h1 {
            font-size: 57px;
          }

          .new-arrivals-hero p {
            max-width: 330px;
            font-size: 12px;
          }

          .hero-line {
            margin-top: 28px;
          }

          .collection-intro {
            padding:
              55px 18px 45px;
          }

          .intro-left h2 {
            font-size: 42px;
          }

          .intro-right p {
            font-size: 12px;
          }

          .collection-toolbar {
            padding-left: 18px;
            padding-right: 18px;
          }

          .category-filter {
            gap: 17px;
          }

          .filter-button {
            font-size: 8px;
          }

          .result-count {
            font-size: 8px;
          }

          .sort-wrapper label {
            display: none;
          }

          .sort-wrapper select {
            min-width: 110px;
            font-size: 9px;
          }

          .products-section {
            padding:
              28px 10px 65px;
          }

          .products-grid {
            gap:
              34px 8px;
          }

          .product-name {
            font-size: 17px;
          }

          .product-category {
            font-size: 6.5px;
          }

          .product-price {
            font-size: 10px;
          }

          .product-old-price {
            font-size: 9px;
          }

          .variant-hint {
            font-size: 7px;
          }

          .stock-text {
            font-size: 8px;
          }

          .editorial-banner {
            min-height: 500px;
            margin:
              0 10px 55px;
          }

          .editorial-content {
            padding: 40px 24px;
          }

          .editorial-content h2 {
            font-size: 54px;
          }

          .editorial-content p {
            font-size: 11px;
            margin:
              22px 0 26px;
          }
        }

        /* =========================================
           REDUCED MOTION
        ========================================= */

        @media (prefers-reduced-motion: reduce) {
          .product-image,
          .editorial-image img,
          .product-action,
          .wishlist-button,
          .filter-button::after {
            transition: none;
          }

          .skeleton-image,
          .skeleton-line {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}