"use client";

import Link from "next/link";

import { use, useEffect, useMemo, useState } from "react";

import { Icon } from "@iconify/react";

import Navbar from "@/components/Navbar";

import Footer from "@/components/Footer";

import WishlistButton from "@/components/WishlistButton";

type Category = {

  _id: string;

  name: string;

  slug: string;

  description?: string;

  image?: string;

  status?: "active" | "inactive";

};

type Product = {

  _id: string;

  name: string;

  slug: string;

  description?: string;

  price: number;

  compareAtPrice?: number;

  images?: string[];

  stock?: number;

  status?: "active" | "draft" | "out_of_stock";

  featured?: boolean;

  newArrival?: boolean;

};

type CategoryPageProps = {

  params: Promise<{

    slug: string;

  }>;

};

const FALLBACK_IMAGE =

  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=90";

export default function CategoryPage({ params }: CategoryPageProps) {

  const { slug } = use(params);

  const [category, setCategory] = useState<Category | null>(null);

  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [activeFilter, setActiveFilter] = useState<

    "all" | "new" | "sale"

  >("all");

  const [sortBy, setSortBy] = useState<

    "featured" | "price-low" | "price-high"

  >("featured");

  /*

  ============================================================

  LOAD CATEGORY + PRODUCTS

  ============================================================

  */

  useEffect(() => {

    let mounted = true;

    const loadCategory = async () => {

      try {

        setLoading(true);

        setError("");

        const categoryResponse = await fetch("/api/categories", {

          method: "GET",

          cache: "no-store",

        });

        const categoryData = await categoryResponse.json();

        if (!categoryResponse.ok || !categoryData.success) {

          throw new Error(

            categoryData?.message || "Unable to load category."

          );

        }

        const foundCategory = (

          Array.isArray(categoryData.categories)

            ? categoryData.categories

            : []

        ).find((item: Category) => item.slug === slug);

        if (!foundCategory) {

          throw new Error("Category not found.");

        }

        const productResponse = await fetch(

          `/api/products?category=${encodeURIComponent(

            foundCategory._id

          )}`,

          {

            method: "GET",

            cache: "no-store",

          }

        );

        const productData = await productResponse.json();

        if (!productResponse.ok) {

          throw new Error(

            productData?.message || "Unable to load products."

          );

        }

        if (!mounted) return;

        setCategory(foundCategory);

        setProducts(

          Array.isArray(productData?.products)

            ? productData.products

            : []

        );

      } catch (requestError) {

        console.error("Category page error:", requestError);

        if (mounted) {

          setError(

            requestError instanceof Error

              ? requestError.message

              : "Unable to load category."

          );

        }

      } finally {

        if (mounted) {

          setLoading(false);

        }

      }

    };

    loadCategory();

    return () => {

      mounted = false;

    };

  }, [slug]);

  /*

  ============================================================

  HELPERS

  ============================================================

  */

  const formatPrice = (price: number) => {

    return new Intl.NumberFormat("en-IN", {

      style: "currency",

      currency: "INR",

      maximumFractionDigits: 0,

    }).format(price);

  };

  const getDiscount = (

    price: number,

    compareAtPrice?: number

  ) => {

    if (

      !compareAtPrice ||

      compareAtPrice <= price

    ) {

      return 0;

    }

    return Math.round(

      ((compareAtPrice - price) /

        compareAtPrice) *

        100

    );

  };

  /*

  ============================================================

  FILTER COUNTS

  ============================================================

  */

  const newCount = products.filter(

    (product) => product.newArrival

  ).length;

  const saleCount = products.filter(

    (product) =>

      !!product.compareAtPrice &&

      product.compareAtPrice > product.price

  ).length;

  /*

  ============================================================

  FILTER + SORT PRODUCTS

  ============================================================

  */

  const filteredProducts = useMemo(() => {

    let result = [...products];

    if (activeFilter === "new") {

      result = result.filter(

        (product) => product.newArrival

      );

    }

    if (activeFilter === "sale") {

      result = result.filter(

        (product) =>

          !!product.compareAtPrice &&

          product.compareAtPrice > product.price

      );

    }

    if (sortBy === "price-low") {

      result.sort(

        (a, b) => a.price - b.price

      );

    }

    if (sortBy === "price-high") {

      result.sort(

        (a, b) => b.price - a.price

      );

    }

    if (sortBy === "featured") {

      result.sort(

        (a, b) =>

          Number(b.featured) -

          Number(a.featured)

      );

    }

    return result;

  }, [

    products,

    activeFilter,

    sortBy,

  ]);

  /*

  ============================================================

  ERROR / 404

  ============================================================

  */

  if (!loading && error) {

    return (

      <>

        <Navbar />

        <main className="error-page">

          <div className="error-inner">

            <span className="error-number">

              404

            </span>

            <span className="error-brand">

              HOUSE OF ORIVE

            </span>

            <h1>

              Collection

              <br />

              unavailable.

            </h1>

            <p>

              The collection you&apos;re looking

              for doesn&apos;t exist or may have

              been removed.

            </p>

            <Link

              href="/categories"

              className="dark-button"

            >

              <Icon

                icon="solar:arrow-left-linear"

                width={17}

              />

              Back to Collections

            </Link>

          </div>

        </main>

        <Footer />

        <style jsx>{`

          .error-page {

            min-height: 72vh;

            padding: 100px 20px;

            display: flex;

            align-items: center;

            justify-content: center;

            background: #f7f6f2;

            text-align: center;

          }

          .error-inner {

            max-width: 650px;

          }

          .error-number {

            display: block;

            color: #d8d5ce;

            font-family: var(--font-bodoni);

            font-size: clamp(120px, 18vw, 220px);

            line-height: 0.7;

            letter-spacing: -0.08em;

          }

          .error-brand {

            display: block;

            margin-top: 40px;

            color: #8a867f;

            font-family: var(--font-dm-sans);

            font-size: 9px;

            font-weight: 700;

            letter-spacing: 0.28em;

          }

          .error-inner h1 {

            margin: 20px 0 0;

            color: #151515;

            font-family: var(--font-bodoni);

            font-size: clamp(48px, 7vw, 80px);

            font-weight: 400;

            line-height: 0.86;

            letter-spacing: -0.05em;

          }

          .error-inner p {

            max-width: 420px;

            margin: 25px auto 0;

            color: #77736c;

            font-family: var(--font-dm-sans);

            font-size: 13px;

            line-height: 1.8;

          }

          .dark-button {

            margin-top: 30px;

            display: inline-flex;

            align-items: center;

            gap: 9px;

            padding: 15px 21px;

            background: #171717;

            color: #fff;

            font-family: var(--font-dm-sans);

            font-size: 9px;

            font-weight: 700;

            letter-spacing: 0.12em;

            text-decoration: none;

            text-transform: uppercase;

          }

        `}</style>

      </>

    );

  }

  return (

    <>

      <Navbar />

      <main className="category-page">

        {/* =====================================================

            HERO

        ====================================================== */}

        <section className="hero">

          <div className="hero-image">

            <img

              src={

                category?.image ||

                FALLBACK_IMAGE

              }

              alt={

                category?.name ||

                "House Of Orive"

              }

              onError={(event) => {

                event.currentTarget.src =

                  FALLBACK_IMAGE;

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

                COLLECTION / 2026

              </span>

            </div>

            <div className="hero-bottom">

              <div className="hero-copy">

                <span className="eyebrow">

                  THE COLLECTION

                </span>

                <h1>

                  {loading ? (

                    <>

                      <span>House</span>

                      <span>Of Orive</span>

                    </>

                  ) : (

                    <>

                      <span>

                        {category?.name}

                      </span>

                      <em>

                        collection

                      </em>

                    </>

                  )}

                </h1>

                {!loading &&

                  category?.description && (

                    <p>

                      {category.description}

                    </p>

                  )}

              </div>

              <div className="hero-stats">

                <span>

                  CURATED PIECES

                </span>

                <strong>

                  {products.length

                    .toString()

                    .padStart(2, "0")}

                </strong>

                <small>

                  AVAILABLE NOW

                </small>

              </div>

            </div>

          </div>

          <div className="hero-scroll">

            <span>

              SCROLL TO EXPLORE

            </span>

            <Icon

              icon="solar:arrow-down-linear"

              width={17}

            />

          </div>

        </section>

        {/* =====================================================

            EDITORIAL INTRO

        ====================================================== */}

        <section className="intro">

          <div className="intro-number">

            01

          </div>

          <div className="intro-main">

            <span className="label">

              HOUSE OF ORIVE /{" "}

              {category?.name}

            </span>

            <h2>

              Designed for

              <br />

              <i>everyday elegance.</i>

            </h2>

            <p>

              Explore our carefully selected

              collection of pieces created to

              bring effortless character,

              comfort and confidence to your

              everyday wardrobe.

            </p>

          </div>

          <div className="intro-symbol">

            <Icon

              icon="solar:star-fall-minimalistic-linear"

              width={27}

            />

          </div>

        </section>

        {/* =====================================================

            COLLECTION

        ====================================================== */}

        <section className="collection">

          <div className="collection-header">

            <div>

              <span className="label">

                THE EDIT

              </span>

              <h2>

                {category?.name ||

                  "Collection"}

              </h2>

            </div>

            <div className="collection-count">

              <strong>

                {filteredProducts.length

                  .toString()

                  .padStart(2, "0")}

              </strong>

              <span>

                PIECES

              </span>

            </div>

          </div>

          {/* TOOLBAR */}

          <div className="toolbar">

            <div className="filters">

              <button

                type="button"

                className={

                  activeFilter === "all"

                    ? "active"

                    : ""

                }

                onClick={() =>

                  setActiveFilter("all")

                }

              >

                All

                <span>

                  {products.length}

                </span>

              </button>

              <button

                type="button"

                className={

                  activeFilter === "new"

                    ? "active"

                    : ""

                }

                onClick={() =>

                  setActiveFilter("new")

                }

              >

                New arrivals

                <span>

                  {newCount}

                </span>

              </button>

              <button

                type="button"

                className={

                  activeFilter === "sale"

                    ? "active"

                    : ""

                }

                onClick={() =>

                  setActiveFilter("sale")

                }

              >

                On sale

                <span>

                  {saleCount}

                </span>

              </button>

            </div>

            <label className="sort">

              <span>

                Sort by

              </span>

              <select

                value={sortBy}

                onChange={(event) =>

                  setSortBy(

                    event.target.value as

                      | "featured"

                      | "price-low"

                      | "price-high"

                  )

                }

              >

                <option value="featured">

                  Featured

                </option>

                <option value="price-low">

                  Price: Low to high

                </option>

                <option value="price-high">

                  Price: High to low

                </option>

              </select>

              <Icon

                icon="solar:alt-arrow-down-linear"

                width={15}

              />

            </label>

          </div>

          {/* =================================================

              LOADING

          ================================================== */}

          {loading && (

            <div className="products-grid">

              {Array.from({

                length: 8,

              }).map((_, index) => (

                <div

                  className="skeleton-card"

                  key={index}

                >

                  <div className="skeleton-image" />

                  <div className="skeleton-small" />

                  <div className="skeleton-title" />

                  <div className="skeleton-price" />

                </div>

              ))}

            </div>

          )}

          {/* =================================================

              PRODUCTS

          ================================================== */}

          {!loading &&

            filteredProducts.length > 0 && (

              <div className="products-grid">

                {filteredProducts.map(

                  (product, index) => {

                    const image =

                      product.images?.[0] ||

                      FALLBACK_IMAGE;

                    const discount =

                      getDiscount(

                        product.price,

                        product.compareAtPrice

                      );

                    const outOfStock =

                      product.stock === 0 ||

                      product.status ===

                        "out_of_stock";

                    return (

                      <article

                        className="product-card"

                        key={product._id}

                      >

                        <Link

                          href={`/products/${product.slug}`}

                          className="product-image"

                        >

                          <img

                            src={image}

                            alt={product.name}

                            loading={

                              index < 4

                                ? "eager"

                                : "lazy"

                            }

                            onError={(event) => {

                              event.currentTarget.src =

                                FALLBACK_IMAGE;

                            }}

                          />

                          <div className="category-wishlist">

                            <WishlistButton

                              productId={product._id}

                            />

                          </div>

                          <div className="image-index">

                            {String(

                              index + 1

                            ).padStart(2, "0")}

                          </div>

                          <div className="badges">

                            {product.newArrival && (

                              <span>

                                New

                              </span>

                            )}

                            {discount > 0 && (

                              <span className="sale">

                                -{discount}%

                              </span>

                            )}

                          </div>

                          {outOfStock && (

                            <div className="out-stock">

                              <span>

                                Out of stock

                              </span>

                            </div>

                          )}

                          <div className="view-piece">

                            <span>

                              View piece

                            </span>

                            <Icon

                              icon="solar:arrow-up-right-linear"

                              width={18}

                            />

                          </div>

                        </Link>

                        <div className="product-details">

                          <div className="product-meta">

                            <span>

                              {category?.name ||

                                "HOUSE OF ORIVE"}

                            </span>

                            {product.featured && (

                              <Icon

                                icon="solar:star-fall-minimalistic-linear"

                                width={14}

                              />

                            )}

                          </div>

                          <Link

                            href={`/products/${product.slug}`}

                            className="product-name"

                          >

                            {product.name}

                          </Link>

                          <div className="price">

                            <strong>

                              {formatPrice(

                                product.price

                              )}

                            </strong>

                            {product.compareAtPrice &&

                              product.compareAtPrice >

                                product.price && (

                                <span>

                                  {formatPrice(

                                    product.compareAtPrice

                                  )}

                                </span>

                              )}

                          </div>

                        </div>

                      </article>

                    );

                  }

                )}

              </div>

            )}

          {/* =================================================

              EMPTY

          ================================================== */}

          {!loading &&

            filteredProducts.length ===

              0 && (

              <div className="empty">

                <div className="empty-icon">

                  <Icon

                    icon="solar:bag-4-linear"

                    width={30}

                  />

                </div>

                <span>

                  THE COLLECTION

                </span>

                <h3>

                  Nothing here

                  <br />

                  <i>yet.</i>

                </h3>

                <p>

                  This collection is

                  currently being curated.

                  Explore our other

                  collections to discover

                  your next favourite piece.

                </p>

                <Link href="/categories">

                  Explore collections

                  <Icon

                    icon="solar:arrow-right-linear"

                    width={17}

                  />

                </Link>

              </div>

            )}

        </section>

        {/* =====================================================

            CLOSING BANNER

        ====================================================== */}

        <section className="closing">

          <div className="closing-image">

            <img

              src={

                category?.image ||

                FALLBACK_IMAGE

              }

              alt=""

              onError={(event) => {

                event.currentTarget.src =

                  FALLBACK_IMAGE;

              }}

            />

          </div>

          <div className="closing-overlay" />

          <div className="closing-content">

            <span className="label">

              HOUSE OF ORIVE

            </span>

            <h2>

              Keep

              <br />

              <i>exploring.</i>

            </h2>

            <Link href="/categories">

              View all collections

              <Icon

                icon="solar:arrow-right-up-linear"

                width={18}

              />

            </Link>

          </div>

          <div className="closing-mark">

            H.O.

          </div>

        </section>

      </main>

      <Footer />

      <style jsx>{`

        /* =====================================================

           BASE

        ====================================================== */

        .category-page {

          --black: #141414;

          --muted: #77736c;

          --soft-muted: #99948b;

          --line: #e5e2dc;

          --cream: #f5f3ee;

          --cream-dark: #ebe8e1;

          width: 100%;

          overflow: hidden;

          background: #fff;

          color: var(--black);

        }

        .label {

          display: block;

          color: var(--soft-muted);

          font-family: var(--font-dm-sans);

          font-size: 9px;

          font-weight: 700;

          letter-spacing: .25em;

          line-height: 1.3;

          text-transform: uppercase;

        }

        /* =====================================================

           HERO

        ====================================================== */

        .hero {

          position: relative;

          min-height: min(

            760px,

            calc(100vh - 80px)

          );

          overflow: hidden;

          display: flex;

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

            saturate(.82)

            contrast(.96);

          transform: scale(1.015);

          transition:

            transform 1.2s

            cubic-bezier(.22,1,.36,1);

        }

        .hero:hover

        .hero-image img {

          transform: scale(1.035);

        }

        .hero-overlay {

          position: absolute;

          inset: 0;

          background:

            linear-gradient(

              90deg,

              rgba(0,0,0,.72),

              rgba(0,0,0,.12) 75%

            ),

            linear-gradient(

              0deg,

              rgba(0,0,0,.76),

              transparent 58%

            );

        }

        .hero-content {

          position: relative;

          z-index: 2;

          width: min(

            1500px,

            100%

          );

          min-height: inherit;

          margin: auto;

          padding:

            35px 48px 65px;

          display: flex;

          flex-direction: column;

          justify-content: space-between;

        }

        .hero-top {

          display: flex;

          align-items: center;

          justify-content: space-between;

          color:

            rgba(255,255,255,.65);

          font-family:

            var(--font-dm-sans);

          font-size: 9px;

          font-weight: 700;

          letter-spacing:

            .23em;

          text-transform:

            uppercase;

        }

        .hero-bottom {

          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          gap: 50px;

        }

        .hero-copy {

          max-width: 900px;

        }

        .hero-copy .eyebrow {

          color:

            rgba(255,255,255,.68);

          font-family:

            var(--font-dm-sans);

          font-size: 10px;

          font-weight: 700;

          letter-spacing:

            .3em;

          text-transform:

            uppercase;

        }

        .hero-copy h1 {

          margin: 20px 0 0;

          color: #fff;

          font-family:

            var(--font-bodoni);

          font-size:

            clamp(

              78px,

              11vw,

              160px

            );

          font-weight: 400;

          line-height: .76;

          letter-spacing:

            -.065em;

        }

        .hero-copy h1 span {

          display: block;

        }

        .hero-copy h1 em {

          display: block;

          margin-top: 12px;

          color:

            rgba(255,255,255,.72);

          font-size:

            .38em;

          font-style: italic;

          line-height: 1;

          letter-spacing:

            -.015em;

        }

        .hero-copy p {

          max-width: 480px;

          margin-top: 30px;

          color:

            rgba(255,255,255,.75);

          font-family:

            var(--font-dm-sans);

          font-size: 12px;

          line-height: 1.9;

        }

        .hero-stats {

          min-width: 150px;

          padding-bottom: 4px;

          color:

            rgba(255,255,255,.7);

          font-family:

            var(--font-dm-sans);

          text-align: right;

        }

        .hero-stats::before {

          content: "";

          display: block;

          width: 100%;

          height: 1px;

          margin-bottom: 13px;

          background:

            rgba(255,255,255,.32);

        }

        .hero-stats span,

        .hero-stats small {

          display: block;

          font-size: 8px;

          font-weight: 700;

          letter-spacing:

            .2em;

        }

        .hero-stats strong {

          display: block;

          margin: 8px 0;

          color: #fff;

          font-family:

            var(--font-bodoni);

          font-size: 43px;

          font-weight: 400;

          letter-spacing:

            -.03em;

        }

        .hero-scroll {

          position: absolute;

          z-index: 4;

          right: 48px;

          bottom: 25px;

          display: flex;

          align-items: center;

          gap: 11px;

          color:

            rgba(255,255,255,.65);

          font-family:

            var(--font-dm-sans);

          font-size: 8px;

          font-weight: 700;

          letter-spacing:

            .2em;

          text-transform:

            uppercase;

        }

        /* =====================================================

           INTRO

        ====================================================== */

        .intro {

          width:

            min(

              1280px,

              calc(100% - 96px)

            );

          margin: auto;

          padding:

            120px 0 110px;

          display: grid;

          grid-template-columns:

            80px 1fr 80px;

          gap: 55px;

          align-items: start;

        }

        .intro-number {

          padding-top: 10px;

          color: #aaa59d;

          font-family:

            var(--font-dm-sans);

          font-size: 10px;

          font-weight: 700;

          letter-spacing:

            .2em;

        }

        .intro-main {

          max-width: 730px;

        }

        .intro-main h2 {

          margin-top: 24px;

          font-family:

            var(--font-bodoni);

          font-size:

            clamp(

              56px,

              7vw,

              98px

            );

          font-weight: 400;

          line-height: .84;

          letter-spacing:

            -.055em;

        }

        .intro-main h2 i {

          font-style: italic;

        }

        .intro-main p {

          max-width: 480px;

          margin-top: 35px;

          color: var(--muted);

          font-family:

            var(--font-dm-sans);

          font-size: 13px;

          line-height: 1.9;

        }

        .intro-symbol {

          width: 68px;

          height: 68px;

          border:

            1px solid var(--line);

          border-radius: 50%;

          display: grid;

          place-items: center;

          color: #77736b;

        }

        /* =====================================================

           COLLECTION

        ====================================================== */

        .collection {

          padding:

            90px 48px 135px;

          background:

            var(--cream);

        }

        .collection-header {

          width:

            min(

              1500px,

              100%

            );

          margin:

            0 auto 40px;

          display: flex;

          align-items:

            flex-end;

          justify-content:

            space-between;

          gap: 30px;

        }

        .collection-header h2 {

          margin-top: 13px;

          font-family:

            var(--font-bodoni);

          font-size:

            clamp(

              55px,

              6vw,

              86px

            );

          font-weight: 400;

          line-height: .85;

          letter-spacing:

            -.055em;

        }

        .collection-count {

          display: flex;

          align-items: baseline;

          gap: 8px;

        }

        .collection-count strong {

          font-family:

            var(--font-bodoni);

          font-size: 42px;

          font-weight: 400;

        }

        .collection-count span {

          color: #99948c;

          font-family:

            var(--font-dm-sans);

          font-size: 8px;

          font-weight: 700;

          letter-spacing:

            .18em;

        }

        /* =====================================================

           TOOLBAR

        ====================================================== */

        .toolbar {

          width:

            min(

              1500px,

              100%

            );

          margin:

            0 auto 38px;

          padding:

            12px 0;

          border-top:

            1px solid var(--line);

          border-bottom:

            1px solid var(--line);

          display: flex;

          align-items: center;

          justify-content:

            space-between;

          gap: 20px;

        }

        .filters {

          display: flex;

          align-items: center;

          gap: 4px;

          overflow-x: auto;

          scrollbar-width: none;

        }

        .filters::-webkit-scrollbar {

          display: none;

        }

        .filters button {

          border: 0;

          padding:

            10px 14px;

          background: transparent;

          color: #817c74;

          cursor: pointer;

          font-family:

            var(--font-dm-sans);

          font-size: 9px;

          font-weight: 700;

          letter-spacing:

            .08em;

          text-transform:

            uppercase;

          white-space:

            nowrap;

          transition:

            all .25s ease;

        }

        .filters button:hover {

          color: #111;

        }

        .filters button span {

          margin-left: 5px;

          color: #aaa59d;

          font-size: 8px;

        }

        .filters button.active {

          background: #171717;

          color: #fff;

        }

        .filters button.active span {

          color:

            rgba(255,255,255,.58);

        }

        .sort {

          position: relative;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          gap: 7px;

          color: #77736c;

          font-family:

            var(--font-dm-sans);

          font-size: 9px;

          font-weight: 700;

          letter-spacing:

            .07em;

          text-transform:

            uppercase;

        }

        .sort select {

          appearance: none;

          border: 0;

          outline: 0;

          padding:

            8px 25px 8px 2px;

          background: transparent;

          color: #171717;

          cursor: pointer;

          font: inherit;

          letter-spacing:

            .02em;

        }

        .sort > svg {

          position: absolute;

          right: 2px;

          pointer-events:

            none;

        }

        /* =====================================================

           PRODUCTS GRID

        ====================================================== */

        .products-grid {

          width:

            min(

              1500px,

              100%

            );

          margin: auto;

          display: grid;

          grid-template-columns:

            repeat(

              4,

              minmax(0,1fr)

            );

          gap:

            45px 20px;

        }

        .product-card {

          position: relative;

          min-width: 0;

        }

        .product-image {

          position: relative;

          display: block;

          width: 100%;

          aspect-ratio:

            .77;

          overflow: hidden;

          background:

            #e7e4dd;

          text-decoration:

            none;

        }

        .product-image::after {

          content: "";

          position: absolute;

          inset: 0;

          pointer-events: none;

          background:

            linear-gradient(

              180deg,

              rgba(0,0,0,.03),

              transparent 45%,

              rgba(0,0,0,.1)

            );

          opacity: .5;

        }

        .product-image img {

          width: 100%;

          height: 100%;

          display: block;

          object-fit: cover;

          transition:

            transform .8s

            cubic-bezier(

              .22,

              1,

              .36,

              1

            );

        }

        .product-card:hover

        .product-image img {

          transform:

            scale(1.055);

        }

        .category-wishlist {

          position: absolute;

          top: 14px;

          right: 14px;

          z-index: 30;

          width: 40px;

          height: 40px;

          display: flex;

          align-items: center;

          justify-content: center;

        }

        .category-wishlist > button {

          position: static !important;

          top: auto !important;

          right: auto !important;

          z-index: auto !important;

        }

        .image-index {

          position: absolute;

          z-index: 2;

          top: 14px;

          right: 68px;

          color:

            rgba(255,255,255,.85);

          font-family:

            var(--font-dm-sans);

          font-size: 8px;

          font-weight: 700;

          letter-spacing:

            .08em;

          mix-blend-mode:

            difference;

        }

        .badges {

          position: absolute;

          z-index: 2;

          top: 13px;

          left: 13px;

          display: flex;

          gap: 5px;

        }

        .badges span {

          padding:

            8px 10px;

          background:

            rgba(255,255,255,.95);

          color: #171717;

          font-family:

            var(--font-dm-sans);

          font-size: 7px;

          font-weight: 700;

          letter-spacing:

            .12em;

          text-transform:

            uppercase;

        }

        .badges .sale {

          background: #171717;

          color: #fff;

        }

        .view-piece {

          position: absolute;

          z-index: 3;

          left: 13px;

          right: 13px;

          bottom: 13px;

          min-height: 48px;

          padding:

            0 15px;

          display: flex;

          align-items: center;

          justify-content:

            space-between;

          background:

            rgba(18,18,18,.95);

          color: #fff;

          font-family:

            var(--font-dm-sans);

          font-size: 8px;

          font-weight: 700;

          letter-spacing:

            .14em;

          text-transform:

            uppercase;

          opacity: 0;

          transform:

            translateY(10px);

          transition:

            opacity .28s ease,

            transform .28s ease;

        }

        .product-card:hover

        .view-piece {

          opacity: 1;

          transform:

            translateY(0);

        }

        .out-stock {

          position: absolute;

          z-index: 4;

          inset: 0;

          display: grid;

          place-items: center;

          background:

            rgba(255,255,255,.46);

          backdrop-filter:

            blur(2px);

        }

        .out-stock span {

          padding:

            10px 13px;

          background:

            #171717;

          color: #fff;

          font-family:

            var(--font-dm-sans);

          font-size: 8px;

          font-weight: 700;

          letter-spacing:

            .12em;

          text-transform:

            uppercase;

        }

        /* =====================================================

           PRODUCT INFORMATION

        ====================================================== */

        .product-details {

          padding:

            16px 2px 0;

        }

        .product-meta {

          min-height: 17px;

          display: flex;

          align-items: center;

          justify-content:

            space-between;

        }

        .product-meta span {

          color:

            #99948b;

          font-family:

            var(--font-dm-sans);

          font-size: 7px;

          font-weight: 700;

          letter-spacing:

            .16em;

          text-transform:

            uppercase;

        }

        .product-meta svg {

          color: #8a857c;

        }

        .product-name {

          display: block;

          margin-top: 8px;

          color: #171717;

          font-family:

            var(--font-bodoni);

          font-size: 23px;

          font-weight: 400;

          line-height:

            1.05;

          letter-spacing:

            -.025em;

          text-decoration:

            none;

          transition:

            opacity .2s ease;

        }

        .product-name:hover {

          opacity: .55;

        }

        .price {

          margin-top: 9px;

          display: flex;

          align-items: baseline;

          gap: 9px;

        }

        .price strong {

          color: #171717;

          font-family:

            var(--font-dm-sans);

          font-size: 10px;

          font-weight: 700;

        }

        .price span {

          color:

            #aaa59d;

          font-family:

            var(--font-dm-sans);

          font-size: 9px;

          text-decoration:

            line-through;

        }

        /* =====================================================

           SKELETON

        ====================================================== */

        .skeleton-card {

          min-width: 0;

        }

        .skeleton-image {

          width: 100%;

          aspect-ratio:

            .77;

          background:

            linear-gradient(

              100deg,

              #e7e4dd 20%,

              #f3f1ec 40%,

              #e7e4dd 60%

            );

          background-size:

            220% 100%;

          animation:

            shimmer 1.5s

            infinite;

        }

        .skeleton-small,

        .skeleton-title,

        .skeleton-price {

          background:

            #e1ded7;

          animation:

            pulse 1.5s

            infinite;

        }

        .skeleton-small {

          width: 28%;

          height: 7px;

          margin-top: 16px;

        }

        .skeleton-title {

          width: 60%;

          height: 11px;

          margin-top: 12px;

        }

        .skeleton-price {

          width: 24%;

          height: 7px;

          margin-top: 10px;

        }

        @keyframes shimmer {

          0% {

            background-position:

              200% 0;

          }

          100% {

            background-position:

              -20% 0;

          }

        }

        @keyframes pulse {

          0%,

          100% {

            opacity: .55;

          }

          50% {

            opacity: 1;

          }

        }

        /* =====================================================

           EMPTY

        ====================================================== */

        .empty {

          width:

            min(

              720px,

              100%

            );

          min-height: 460px;

          margin:

            10px auto 0;

          padding:

            70px 30px;

          border-top:

            1px solid var(--line);

          border-bottom:

            1px solid var(--line);

          display: flex;

          flex-direction:

            column;

          align-items:

            center;

          justify-content:

            center;

          text-align:

            center;

        }

        .empty-icon {

          width: 66px;

          height: 66px;

          border:

            1px solid #d8d4cc;

          border-radius: 50%;

          display: grid;

          place-items: center;

          color:

            #79746b;

        }

        .empty > span {

          margin-top: 24px;

          color:

            #969189;

          font-family:

            var(--font-dm-sans);

          font-size: 8px;

          font-weight: 700;

          letter-spacing:

            .25em;

        }

        .empty h3 {

          margin-top: 18px;

          font-family:

            var(--font-bodoni);

          font-size:

            clamp(

              48px,

              6vw,

              76px

            );

          font-weight: 400;

          line-height: .84;

          letter-spacing:

            -.055em;

        }

        .empty h3 i {

          font-style: italic;

        }

        .empty p {

          max-width: 420px;

          margin-top: 25px;

          color:

            var(--muted);

          font-family:

            var(--font-dm-sans);

          font-size: 12px;

          line-height: 1.8;

        }

        .empty a {

          margin-top: 28px;

          display: inline-flex;

          align-items: center;

          gap: 11px;

          padding:

            14px 20px;

          background:

            #171717;

          color: #fff;

          font-family:

            var(--font-dm-sans);

          font-size: 9px;

          font-weight: 700;

          letter-spacing:

            .12em;

          text-decoration:

            none;

          text-transform:

            uppercase;

        }

        /* =====================================================

           CLOSING

        ====================================================== */

        .closing {

          position: relative;

          min-height: 620px;

          overflow: hidden;

          display: flex;

          align-items:

            flex-end;

          background:

            #151515;

        }

        .closing-image {

          position: absolute;

          inset: 0;

        }

        .closing-image img {

          width: 100%;

          height: 100%;

          object-fit: cover;

          opacity: .72;

          filter:

            saturate(.75);

        }

        .closing-overlay {

          position: absolute;

          inset: 0;

          background:

            linear-gradient(

              90deg,

              rgba(8,8,8,.88),

              rgba(8,8,8,.14)

            ),

            linear-gradient(

              0deg,

              rgba(8,8,8,.72),

              transparent 70%

            );

        }

        .closing-content {

          position: relative;

          z-index: 2;

          width:

            min(

              1500px,

              100%

            );

          margin: auto;

          padding:

            100px 48px;

        }

        .closing-content .label {

          color:

            rgba(255,255,255,.54);

        }

        .closing-content h2 {

          margin-top: 22px;

          color: #fff;

          font-family:

            var(--font-bodoni);

          font-size:

            clamp(

              75px,

              10vw,

              150px

            );

          font-weight: 400;

          line-height: .78;

          letter-spacing:

            -.065em;

        }

        .closing-content h2 i {

          font-style: italic;

        }

        .closing-content a {

          margin-top: 43px;

          display: inline-flex;

          align-items: center;

          gap: 13px;

          color: #fff;

          font-family:

            var(--font-dm-sans);

          font-size: 9px;

          font-weight: 700;

          letter-spacing:

            .15em;

          text-decoration:

            none;

          text-transform:

            uppercase;

        }

        .closing-mark {

          position: absolute;

          z-index: 3;

          right: 48px;

          bottom: 43px;

          color:

            rgba(255,255,255,.45);

          font-family:

            var(--font-bodoni);

          font-size: 25px;

          font-style: italic;

        }

        /* =====================================================

           TABLET

        ====================================================== */

        @media (max-width: 1100px) {

          .hero-content,

          .closing-content {

            padding-left: 30px;

            padding-right: 30px;

          }

          .hero-scroll {

            right: 30px;

          }

          .intro {

            width:

              calc(100% - 60px);

            grid-template-columns:

              50px 1fr 65px;

            gap: 30px;

          }

          .collection {

            padding-left: 30px;

            padding-right: 30px;

          }

          .products-grid {

            grid-template-columns:

              repeat(

                3,

                minmax(0,1fr)

              );

          }

        }

        /* =====================================================

           MOBILE

        ====================================================== */

        @media (max-width: 720px) {

          .hero {

            min-height: 650px;

          }

          .hero-content {

            padding:

              25px 20px 48px;

          }

          .hero-top {

            font-size: 7px;

          }

          .hero-bottom {

            display: block;

          }

          .hero-copy h1 {

            font-size:

              clamp(

                68px,

                19vw,

                110px

              );

          }

          .hero-copy p {

            max-width: 330px;

            margin-top: 23px;

            font-size: 11px;

          }

          .hero-stats {

            display: none;

          }

          .hero-scroll {

            right: 20px;

            bottom: 19px;

            font-size: 7px;

          }

          .intro {

            width:

              calc(100% - 40px);

            padding:

              75px 0 70px;

            display: block;

          }

          .intro-number,

          .intro-symbol {

            display: none;

          }

          .intro-main h2 {

            margin-top: 18px;

            font-size:

              clamp(

                54px,

                15vw,

                80px

              );

          }

          .intro-main p {

            margin-top: 25px;

            font-size: 12px;

          }

          .collection {

            padding:

              65px 16px 85px;

          }

          .collection-header {

            margin-bottom: 28px;

          }

          .collection-header h2 {

            font-size: 54px;

          }

          .collection-count strong {

            font-size: 28px;

          }

          .collection-count span {

            display: none;

          }

          .toolbar {

            align-items:

              flex-start;

            flex-direction:

              column;

            gap: 12px;

            margin-bottom: 28px;

          }

          .filters {

            width: 100%;

          }

          .sort {

            width: 100%;

            justify-content:

              space-between;

            padding-top: 12px;

            border-top:

              1px solid var(--line);

          }

          .sort select {

            margin-left: auto;

          }

          .products-grid {

            grid-template-columns:

              repeat(

                2,

                minmax(0,1fr)

              );

            gap:

              34px 10px;

          }

          .product-image {

            aspect-ratio:

              .72;

          }

          .badges {

            top: 7px;

            left: 7px;

          }

          .badges span {

            padding:

              6px 7px;

            font-size: 6px;

          }

          .image-index {

            top: 8px;

            right: 8px;

          }

          .view-piece {

            left: 7px;

            right: 7px;

            bottom: 7px;

            min-height: 37px;

            padding:

              0 9px;

            font-size: 6px;

          }

          .product-details {

            padding-top: 11px;

          }

          .product-meta span {

            font-size: 5.5px;

          }

          .product-name {

            margin-top: 6px;

            font-size: 18px;

          }

          .price {

            margin-top: 6px;

          }

          .price strong {

            font-size: 8px;

          }

          .price span {

            font-size: 7px;

          }

          .closing {

            min-height: 560px;

          }

          .closing-content {

            padding:

              75px 20px;

          }

          .closing-content h2 {

            font-size:

              clamp(

                70px,

                19vw,

                110px

              );

          }

          .closing-mark {

            right: 20px;

            bottom: 25px;

          }

        }

        @media (max-width: 390px) {

          .hero-copy h1 {

            font-size: 62px;

          }

          .collection-header h2 {

            font-size: 48px;

          }

          .product-name {

            font-size: 16px;

          }

        }

        @media (hover: none) {

          .view-piece {

            opacity: 1;

            transform: none;

          }

        }

        @media (prefers-reduced-motion: reduce) {

          .hero-image img,

          .product-image img,

          .view-piece,

          .skeleton-image,

          .skeleton-small,

          .skeleton-title,

          .skeleton-price {

            animation: none !important;

            transition: none !important;

          }

        }

      `}</style>

    </>

  );

}
