"use client";

import Link from "next/link";
import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
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

type Product = {
  _id: string;
  name: string;
  slug: string;
  description?: string;

  category:
    | string
    | {
        _id?: string;
        name?: string;
        slug?: string;
      }
    | null;

  price: number;
  compareAtPrice?: number;

  images?: string[];

  sizes?: string[];
  colors?: string[];

  sku?: string;
  stock?: number;

  status?:
    | "active"
    | "draft"
    | "out_of_stock";

  featured?: boolean;
  newArrival?: boolean;

  createdAt?: string;
  updatedAt?: string;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=85";

function ProductsPageContent() {
  const searchParams = useSearchParams();

  const searchFromUrl =
    searchParams.get("search") || "";

  const categoryFromUrl =
    searchParams.get("category") || "";

  const sortFromUrl =
    searchParams.get("sort") || "";

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState(searchFromUrl);

  const [selectedCategory, setSelectedCategory] =
    useState(categoryFromUrl);

  const [sort, setSort] =
    useState(sortFromUrl || "featured");

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  /*
   * =====================================================
   * SYNC URL SEARCH
   * =====================================================
   */

  useEffect(() => {
    setSearch(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    setSort(sortFromUrl || "featured");
  }, [sortFromUrl]);


  /*
   * =====================================================
   * LOAD PRODUCTS + CATEGORIES
   * =====================================================
   */

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          productsResponse,
          categoriesResponse,
        ] = await Promise.all([
          fetch("/api/products", {
            method: "GET",
            cache: "no-store",
          }),

          fetch("/api/categories", {
            method: "GET",
            cache: "no-store",
          }),
        ]);

        const productsData =
          await productsResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        if (!productsResponse.ok) {
          throw new Error(
            productsData?.message ||
              "Unable to load products."
          );
        }

        if (!mounted) return;

        const productList = Array.isArray(
          productsData?.products
        )
          ? productsData.products
          : [];

        const categoryList =
          Array.isArray(
            categoriesData?.categories
          )
            ? categoriesData.categories
            : [];

        setProducts(productList);

        setCategories(
          categoryList
            .filter(
              (category: Category) =>
                category.status !== "inactive"
            )
            .sort(
              (a: Category, b: Category) =>
                Number(a.sortOrder || 0) -
                Number(b.sortOrder || 0)
            )
        );
      } catch (requestError) {
        console.error(
          "Products page error:",
          requestError
        );

        if (mounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load products."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);


  /*
   * =====================================================
   * HELPERS
   * =====================================================
   */

  const getCategoryName = (
    category: Product["category"]
  ) => {
    if (!category) {
      return "House of Orive";
    }

    if (typeof category === "string") {
      return category;
    }

    return (
      category.name ||
      "House of Orive"
    );
  };

  const getCategorySlug = (
    category: Product["category"]
  ) => {
    if (!category) {
      return "";
    }

    if (typeof category === "string") {
      return category.toLowerCase();
    }

    return (
      category.slug ||
      category.name?.toLowerCase() ||
      ""
    );
  };

  const formatPrice = (
    price: number
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(price);
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
   * =====================================================
   * FILTER + SORT
   * =====================================================
   */

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const searchValue =
      search.trim().toLowerCase();

    if (searchValue) {
      result = result.filter((product) => {
        const name =
          product.name?.toLowerCase() || "";

        const description =
          product.description?.toLowerCase() ||
          "";

        const category =
          getCategoryName(
            product.category
          ).toLowerCase();

        const sku =
          product.sku?.toLowerCase() || "";

        return (
          name.includes(searchValue) ||
          description.includes(searchValue) ||
          category.includes(searchValue) ||
          sku.includes(searchValue)
        );
      });
    }

    if (selectedCategory) {
      result = result.filter(
        (product) => {
          const productCategory =
            getCategorySlug(
              product.category
            );

          return (
            productCategory ===
              selectedCategory.toLowerCase() ||
            product.category ===
              selectedCategory
          );
        }
      );
    }

    /*
     * Only active products should appear
     * on the customer storefront.
     */

    result = result.filter(
      (product) =>
        !product.status ||
        product.status === "active" ||
        product.status ===
          "out_of_stock"
    );

    /*
     * SORTING
     */

    if (sort === "newest") {
      result.sort((a, b) => {
        const aDate = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const bDate = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return bDate - aDate;
      });
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price) -
          Number(b.price)
      );
    }

    if (sort === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price) -
          Number(a.price)
      );
    }

    if (sort === "featured") {
      result.sort(
        (a, b) =>
          Number(Boolean(b.featured)) -
          Number(Boolean(a.featured))
      );
    }

    return result;
  }, [
    products,
    search,
    selectedCategory,
    sort,
  ]);


  /*
   * =====================================================
   * CLEAR FILTERS
   * =====================================================
   */

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSort("featured");

    window.history.replaceState(
      null,
      "",
      "/products"
    );
  };


  /*
   * =====================================================
   * UPDATE SEARCH
   * =====================================================
   */

  const handleSearchChange = (
    value: string
  ) => {
    setSearch(value);

    const params =
      new URLSearchParams(
        window.location.search
      );

    if (value.trim()) {
      params.set(
        "search",
        value.trim()
      );
    } else {
      params.delete("search");
    }

    const query =
      params.toString();

    window.history.replaceState(
      null,
      "",
      query
        ? `/products?${query}`
        : "/products"
    );
  };


  /*
   * =====================================================
   * CATEGORY CHANGE
   * =====================================================
   */

  const handleCategoryChange = (
    value: string
  ) => {
    setSelectedCategory(value);

    const params =
      new URLSearchParams(
        window.location.search
      );

    if (value) {
      params.set(
        "category",
        value
      );
    } else {
      params.delete("category");
    }

    const query =
      params.toString();

    window.history.replaceState(
      null,
      "",
      query
        ? `/products?${query}`
        : "/products"
    );
  };


  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="products-page">

          <section className="products-hero">
            <div className="hero-content">
              <span>
                HOUSE OF ORIVE
              </span>

              <h1>
                The Edit
              </h1>

              <p>
                Discover our considered
                collection of modern
                essentials.
              </p>
            </div>
          </section>

          <section className="products-content">

            <div className="products-heading">
              <div>
                <span>
                  COLLECTION
                </span>

                <h2>
                  All Pieces
                </h2>
              </div>
            </div>

            <div className="products-grid">
              {Array.from({
                length: 8,
              }).map((_, index) => (
                <div
                  className="product-skeleton"
                  key={index}
                >
                  <div className="skeleton-image" />
                  <div className="skeleton-line large" />
                  <div className="skeleton-line small" />
                </div>
              ))}
            </div>

          </section>
        </main>

        <Footer />

        <style jsx>{productsStyles}</style>
      </>
    );
  }


  /*
   * =====================================================
   * ERROR
   * =====================================================
   */

  if (error) {
    return (
      <>
        <Navbar />

        <main className="products-state">

          <span>!</span>

          <small>
            HOUSE OF ORIVE
          </small>

          <h1>
            Something went wrong.
          </h1>

          <p>
            We couldn't load the collection
            right now. Please try again.
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            <Icon
              icon="solar:refresh-linear"
              width={16}
              height={16}
            />

            Try Again
          </button>

        </main>

        <Footer />

        <style jsx>{productsStyles}</style>
      </>
    );
  }


  return (
    <>
      <Navbar />

      <main className="products-page">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="products-hero">

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=85"
              alt=""
            />
          </div>

          <div className="hero-overlay" />

          <div className="hero-content">

            <span>
              HOUSE OF ORIVE
            </span>

            <h1>
              The Edit
            </h1>

            <p>
              A considered collection of
              timeless silhouettes, modern
              essentials and refined details.
            </p>

          </div>

          <div className="hero-number">
            <span>
              COLLECTION
            </span>

            <strong>
              01
            </strong>
          </div>

        </section>


        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="products-content">

          <div className="products-heading">

            <div>
              <span>
                EXPLORE
              </span>

              <h2>
                All Pieces
              </h2>
            </div>

            <div className="heading-count">
              <strong>
                {String(
                  filteredProducts.length
                ).padStart(2, "0")}
              </strong>

              <span>
                PIECES
              </span>
            </div>

          </div>


          {/* =================================================
              MOBILE FILTER BUTTON
          ================================================= */}

          <button
            type="button"
            className="mobile-filter-button"
            onClick={() =>
              setMobileFiltersOpen(
                !mobileFiltersOpen
              )
            }
          >
            <Icon
              icon="solar:filter-linear"
              width={17}
              height={17}
            />

            Filters

            <span>
              {selectedCategory ||
                search
                ? "Active"
                : ""}
            </span>
          </button>


          <div
            className={
              mobileFiltersOpen
                ? "products-layout mobile-open"
                : "products-layout"
            }
          >

            {/* =================================================
                FILTER SIDEBAR
            ================================================= */}

            <aside className="filters">

              <div className="filter-header">

                <span>
                  FILTER
                </span>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                >
                  Clear
                </button>

              </div>


              {/* SEARCH */}

              <div className="filter-block">

                <label>
                  SEARCH
                </label>

                <div className="filter-search">

                  <Icon
                    icon="solar:magnifer-linear"
                    width={17}
                    height={17}
                  />

                  <input
                    type="text"
                    value={search}
                    placeholder="Search pieces"
                    onChange={(event) =>
                      handleSearchChange(
                        event.target.value
                      )
                    }
                  />

                  {search && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() =>
                        handleSearchChange(
                          ""
                        )
                      }
                    >
                      <Icon
                        icon="solar:close-circle-linear"
                        width={16}
                        height={16}
                      />
                    </button>
                  )}

                </div>

              </div>


              {/* CATEGORIES */}

              <div className="filter-block">

                <label>
                  CATEGORY
                </label>

                <div className="category-filter">

                  <button
                    type="button"
                    className={
                      !selectedCategory
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      handleCategoryChange(
                        ""
                      )
                    }
                  >
                    <span>
                      All Pieces
                    </span>

                    <small>
                      {products.length}
                    </small>
                  </button>

                  {categories.map(
                    (category) => (
                      <button
                        key={
                          category._id
                        }
                        type="button"
                        className={
                          selectedCategory ===
                          category.slug
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          handleCategoryChange(
                            category.slug
                          )
                        }
                      >
                        <span>
                          {
                            category.name
                          }
                        </span>

                        <Icon
                          icon="solar:arrow-right-linear"
                          width={14}
                          height={14}
                        />
                      </button>
                    )
                  )}

                </div>

              </div>


              {/* SORT */}

              <div className="filter-block">

                <label>
                  SORT BY
                </label>

                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(
                      event.target.value
                    )
                  }
                >
                  <option value="featured">
                    Featured
                  </option>

                  <option value="newest">
                    Newest
                  </option>

                  <option value="price-low">
                    Price: Low to High
                  </option>

                  <option value="price-high">
                    Price: High to Low
                  </option>
                </select>

              </div>

            </aside>


            {/* =================================================
                PRODUCT AREA
            ================================================= */}

            <div className="product-area">

              <div className="product-toolbar">

                <span>
                  {filteredProducts.length}{" "}
                  {filteredProducts.length ===
                  1
                    ? "piece"
                    : "pieces"}
                </span>

                {(search ||
                  selectedCategory) && (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                  >
                    Clear filters
                  </button>
                )}

              </div>


              {filteredProducts.length >
              0 ? (
                <div className="products-grid">

                  {filteredProducts.map(
                    (product) => {
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
                          key={
                            product._id
                          }
                        >

                          <Link
                            href={`/products/${product.slug}`}
                            className="product-image-wrap"
                          >

                            <img
                              src={image}
                              alt={
                                product.name
                              }
                              className="product-image"
                              loading="lazy"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.src =
                                  FALLBACK_IMAGE;
                              }}
                            />


                            {/* BADGES */}

                            <div className="product-badges">

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


                            {/* STOCK */}

                            {outOfStock && (
                              <div className="stock-overlay">
                                <span>
                                  Out of Stock
                                </span>
                              </div>
                            )}


                            {/* VIEW */}

                            <div className="view-product">

                              <span>
                                View Piece
                              </span>

                              <Icon
                                icon="solar:arrow-up-right-linear"
                                width={17}
                                height={17}
                              />

                            </div>

                          </Link>


                          {/* PRODUCT INFO */}

                          <div className="product-info">

                            <span className="product-category">
                              {getCategoryName(
                                product.category
                              )}
                            </span>

                            <Link
                              href={`/products/${product.slug}`}
                              className="product-name"
                            >
                              {
                                product.name
                              }
                            </Link>

                            <div className="price-row">

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
              ) : (

                /* =================================================
                   EMPTY SEARCH/FILTER
                ================================================= */

                <div className="empty-products">

                  <span>
                    00
                  </span>

                  <small>
                    HOUSE OF ORIVE
                  </small>

                  <h2>
                    No pieces found.
                  </h2>

                  <p>
                    We couldn't find anything
                    matching your current
                    selection.
                  </p>

                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                  >
                    View All Pieces
                  </button>

                </div>
              )}

            </div>

          </div>

        </section>


        {/* =================================================
            EDITORIAL CLOSING
        ================================================= */}

        <section className="products-closing">

          <div className="closing-copy">

            <span>
              HOUSE OF ORIVE
            </span>

            <h2>
              Considered
              <br />
              in every detail.
            </h2>

            <p>
              We believe the most enduring
              wardrobe is built around pieces
              that feel effortless today and
              remain relevant tomorrow.
            </p>

            <Link href="/categories">
              Explore Collections

              <Icon
                icon="solar:arrow-right-linear"
                width={17}
                height={17}
              />
            </Link>

          </div>

          <div className="closing-image">

            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85"
              alt="House of Orive collection"
            />

          </div>

        </section>

      </main>

      <Footer />

      <style jsx>{productsStyles}</style>
    </>
    
  );
  
}


/*
=========================================================
STYLES
=========================================================
*/

const productsStyles = `
  .products-page {
    width: 100%;
    background: #ffffff;
    color: #111111;
  }

  /* =====================================================
     HERO
  ===================================================== */

  .products-hero {
    position: relative;
    min-height: 570px;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
    background: #111111;
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
    filter: grayscale(100%);
  }

  .hero-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        180deg,
        rgba(0,0,0,.05),
        rgba(0,0,0,.84)
      );
  }

  .hero-content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 1440px;
    margin: auto;
    padding: 70px 42px 55px;
  }

  .hero-content > span {
    color: rgba(255,255,255,.65);
    font-family: var(--font-dm-sans);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .24em;
  }

  .hero-content h1 {
    margin: 18px 0 0;
    color: #ffffff;
    font-family: var(--font-bodoni);
    font-size: clamp(80px, 11vw, 155px);
    font-weight: 400;
    line-height: .76;
    letter-spacing: -.065em;
  }

  .hero-content p {
    max-width: 480px;
    margin: 30px 0 0;
    color: rgba(255,255,255,.74);
    font-family: var(--font-dm-sans);
    font-size: 11px;
    line-height: 1.8;
  }

  .hero-number {
    position: absolute;
    right: 42px;
    bottom: 58px;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 7px;
    color: rgba(255,255,255,.55);
    font-family: var(--font-dm-sans);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .2em;
  }

  .hero-number strong {
    color: #ffffff;
    font-family: var(--font-bodoni);
    font-size: 27px;
    font-weight: 400;
    letter-spacing: 0;
  }

  /* =====================================================
     CONTENT
  ===================================================== */

  .products-content {
    max-width: 1440px;
    margin: auto;
    padding: 100px 42px 120px;
  }

  .products-heading {
    margin-bottom: 48px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 30px;
  }

  .products-heading > div:first-child > span {
    color: #999999;
    font-family: var(--font-dm-sans);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .2em;
  }

  .products-heading h2 {
    margin: 12px 0 0;
    font-family: var(--font-bodoni);
    font-size: 55px;
    font-weight: 500;
    line-height: .86;
    letter-spacing: -.045em;
  }

  .heading-count {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .heading-count strong {
    font-family: var(--font-bodoni);
    font-size: 28px;
    font-weight: 500;
  }

  .heading-count span {
    color: #999999;
    font-family: var(--font-dm-sans);
    font-size: 6px;
    font-weight: 700;
    letter-spacing: .15em;
  }

  /* =====================================================
     LAYOUT
  ===================================================== */

  .products-layout {
    display: grid;
    grid-template-columns: 220px minmax(0,1fr);
    gap: 50px;
    align-items: start;
  }

  .filters {
    position: sticky;
    top: 110px;
  }

  .filter-header {
    padding-bottom: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #dededb;
  }

  .filter-header > span {
    font-family: var(--font-dm-sans);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .18em;
  }

  .filter-header button {
    border: 0;
    padding: 0;
    background: transparent;
    color: #888888;
    font-family: var(--font-dm-sans);
    font-size: 7px;
    cursor: pointer;
    text-transform: uppercase;
  }

  .filter-block {
    padding: 23px 0;
    border-bottom: 1px solid #e8e8e5;
  }

  .filter-block > label {
    display: block;
    margin-bottom: 13px;
    color: #999999;
    font-family: var(--font-dm-sans);
    font-size: 6px;
    font-weight: 700;
    letter-spacing: .16em;
  }

  .filter-search {
    height: 40px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 10px;
    border: 1px solid #dededb;
  }

  .filter-search svg {
    flex-shrink: 0;
    color: #777777;
  }

  .filter-search input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: #111111;
    font-family: var(--font-dm-sans);
    font-size: 9px;
  }

  .filter-search input::placeholder {
    color: #aaa;
  }

  .filter-search button {
    border: 0;
    padding: 0;
    background: transparent;
    color: #888888;
    cursor: pointer;
  }

  .category-filter {
    display: flex;
    flex-direction: column;
  }

  .category-filter button {
    min-height: 35px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 0;
    border-bottom: 1px solid #eeeeec;
    background: transparent;
    color: #777777;
    font-family: var(--font-dm-sans);
    font-size: 8px;
    text-align: left;
    cursor: pointer;
    transition: color .2s ease;
  }

  .category-filter button:hover,
  .category-filter button.active {
    color: #111111;
  }

  .category-filter button.active span {
    font-weight: 700;
  }

  .category-filter button small {
    color: #aaa;
    font-size: 7px;
  }

  .category-filter button svg {
    opacity: 0;
    transition: opacity .2s ease;
  }

  .category-filter button:hover svg,
  .category-filter button.active svg {
    opacity: 1;
  }

  .filter-block select {
    width: 100%;
    height: 40px;
    padding: 0 10px;
    border: 1px solid #dededb;
    outline: 0;
    background: #ffffff;
    color: #333333;
    font-family: var(--font-dm-sans);
    font-size: 8px;
    cursor: pointer;
  }

  /* =====================================================
     MOBILE FILTER BUTTON
  ===================================================== */

  .mobile-filter-button {
    display: none;
  }

  /* =====================================================
     PRODUCT AREA
  ===================================================== */

  .product-area {
    min-width: 0;
  }

  .product-toolbar {
    min-height: 38px;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .product-toolbar > span {
    color: #888888;
    font-family: var(--font-dm-sans);
    font-size: 7px;
    font-weight: 600;
    letter-spacing: .08em;
    text-transform: uppercase;
  }

  .product-toolbar button {
    border: 0;
    padding: 0;
    background: transparent;
    color: #111111;
    font-family: var(--font-dm-sans);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .08em;
    text-transform: uppercase;
    cursor: pointer;
  }

  /* =====================================================
     PRODUCT GRID
  ===================================================== */

  .products-grid {
    display: grid;
    grid-template-columns: repeat(3,minmax(0,1fr));
    gap: 38px 18px;
  }

  .product-card {
    min-width: 0;
  }

  .product-image-wrap {
    position: relative;
    display: block;
    width: 100%;
    aspect-ratio: .76;
    overflow: hidden;
    background: #f1f1ef;
    text-decoration: none;
  }

  .product-image {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    transition:
      transform .75s
      cubic-bezier(.22,1,.36,1);
  }

  .product-card:hover .product-image {
    transform: scale(1.045);
  }

  .product-badges {
    position: absolute;
    top: 12px;
    left: 12px;
    display: flex;
    gap: 5px;
  }

  .product-badges span {
    padding: 7px 8px;
    background: #ffffff;
    color: #111111;
    font-family: var(--font-dm-sans);
    font-size: 6px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
  }

  .product-badges .sale {
    background: #111111;
    color: #ffffff;
  }

  .stock-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,.42);
  }

  .stock-overlay span {
    padding: 9px 12px;
    background: #111111;
    color: #ffffff;
    font-family: var(--font-dm-sans);
    font-size: 6px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
  }

  .view-product {
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 12px;
    min-height: 43px;
    padding: 0 13px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(17,17,17,.94);
    color: #ffffff;
    font-family: var(--font-dm-sans);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .11em;
    text-transform: uppercase;
    opacity: 0;
    transform: translateY(8px);
    transition:
      opacity .25s ease,
      transform .25s ease;
  }

  .product-card:hover .view-product {
    opacity: 1;
    transform: translateY(0);
  }

  .product-info {
    padding-top: 14px;
  }

  .product-category {
    display: block;
    margin-bottom: 7px;
    color: #999999;
    font-family: var(--font-dm-sans);
    font-size: 6px;
    font-weight: 700;
    letter-spacing: .15em;
    text-transform: uppercase;
  }

  .product-name {
    display: block;
    color: #111111;
    text-decoration: none;
    font-family: var(--font-bodoni);
    font-size: 21px;
    font-weight: 500;
    line-height: 1.05;
  }

  .price-row {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .price-row strong {
    font-family: var(--font-dm-sans);
    font-size: 9px;
    font-weight: 700;
  }

  .price-row span {
    color: #999999;
    font-family: var(--font-dm-sans);
    font-size: 8px;
    text-decoration: line-through;
  }

  /* =====================================================
     EMPTY
  ===================================================== */

  .empty-products {
    min-height: 460px;
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    border-top: 1px solid #eeeeec;
    border-bottom: 1px solid #eeeeec;
  }

  .empty-products > span {
    color: #ddddda;
    font-family: var(--font-bodoni);
    font-size: 105px;
    line-height: .75;
  }

  .empty-products small {
    margin-top: 20px;
    color: #999999;
    font-family: var(--font-dm-sans);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .2em;
  }

  .empty-products h2 {
    margin: 17px 0 0;
    font-family: var(--font-bodoni);
    font-size: 45px;
    font-weight: 500;
  }

  .empty-products p {
    max-width: 390px;
    color: #777777;
    font-family: var(--font-dm-sans);
    font-size: 10px;
    line-height: 1.7;
  }

  .empty-products button {
    margin-top: 12px;
    padding: 13px 18px;
    border: 0;
    background: #111111;
    color: #ffffff;
    font-family: var(--font-dm-sans);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    cursor: pointer;
  }

  /* =====================================================
     SKELETON
  ===================================================== */

  .product-skeleton {
    min-width: 0;
  }

  .skeleton-image {
    width: 100%;
    aspect-ratio: .76;
    background:
      linear-gradient(
        90deg,
        #eeeeec 25%,
        #f8f8f6 50%,
        #eeeeec 75%
      );
    background-size: 200% 100%;
    animation: skeleton 1.4s infinite;
  }

  .skeleton-line {
    height: 10px;
    margin-top: 13px;
    background: #eeeeec;
  }

  .skeleton-line.large {
    width: 70%;
  }

  .skeleton-line.small {
    width: 35%;
    margin-top: 8px;
  }

  @keyframes skeleton {
    from {
      background-position: 200% 0;
    }

    to {
      background-position: -200% 0;
    }
  }

  /* =====================================================
     CLOSING
  ===================================================== */

  .products-closing {
    max-width: 1440px;
    margin: auto;
    padding: 0 42px 120px;
    display: grid;
    grid-template-columns: .9fr 1.1fr;
  }

  .closing-copy {
    min-height: 600px;
    padding: 70px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #f5f5f2;
  }

  .closing-copy > span {
    color: #999999;
    font-family: var(--font-dm-sans);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .2em;
  }

  .closing-copy h2 {
    margin: 22px 0 0;
    font-family: var(--font-bodoni);
    font-size: clamp(58px,6vw,90px);
    font-weight: 400;
    line-height: .78;
    letter-spacing: -.055em;
  }

  .closing-copy p {
    max-width: 390px;
    margin: 30px 0 0;
    color: #686868;
    font-family: var(--font-dm-sans);
    font-size: 10px;
    line-height: 1.8;
  }

  .closing-copy a {
    margin-top: 34px;
    display: inline-flex;
    align-items: center;
    gap: 14px;
    color: #111111;
    text-decoration: none;
    font-family: var(--font-dm-sans);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: .13em;
    text-transform: uppercase;
  }

  .closing-image {
    min-height: 600px;
    overflow: hidden;
  }

  .closing-image img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
    filter: grayscale(100%);
  }

  /* =====================================================
     ERROR STATE
  ===================================================== */

  .products-state {
    min-height: 65vh;
    padding: 80px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .products-state > span {
    width: 75px;
    height: 75px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #dddddd;
    border-radius: 50%;
    font-family: var(--font-bodoni);
    font-size: 42px;
  }

  .products-state small {
    margin-top: 25px;
    color: #999999;
    font-family: var(--font-dm-sans);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .2em;
  }

  .products-state h1 {
    margin: 18px 0 0;
    font-family: var(--font-bodoni);
    font-size: 48px;
    font-weight: 500;
  }

  .products-state p {
    max-width: 390px;
    color: #777777;
    font-family: var(--font-dm-sans);
    font-size: 10px;
    line-height: 1.7;
  }

  .products-state button {
    margin-top: 18px;
    min-height: 42px;
    padding: 0 17px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    border: 0;
    background: #111111;
    color: #ffffff;
    font-family: var(--font-dm-sans);
    font-size: 7px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase;
    cursor: pointer;
  }

  /* =====================================================
     RESPONSIVE
  ===================================================== */

  @media (max-width: 1100px) {
    .hero-content,
    .products-content,
    .products-closing {
      padding-left: 28px;
      padding-right: 28px;
    }

    .products-layout {
      grid-template-columns: 190px minmax(0,1fr);
      gap: 30px;
    }

    .products-grid {
      grid-template-columns:
        repeat(2,minmax(0,1fr));
    }
  }

  @media (max-width: 700px) {
    .products-hero {
      min-height: 480px;
    }

    .hero-content {
      padding:
        55px 20px 40px;
    }

    .hero-content h1 {
      font-size: 76px;
    }

    .hero-content p {
      max-width: 330px;
      font-size: 10px;
    }

    .hero-number {
      display: none;
    }

    .products-content {
      padding:
        65px 16px 80px;
    }

    .products-heading {
      margin-bottom: 28px;
    }

    .products-heading h2 {
      font-size: 43px;
    }

    .heading-count {
      display: none;
    }

    .mobile-filter-button {
      width: 100%;
      min-height: 43px;
      margin-bottom: 16px;
      padding: 0 13px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #dededb;
      background: #ffffff;
      color: #111111;
      font-family: var(--font-dm-sans);
      font-size: 7px;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      cursor: pointer;
    }

    .mobile-filter-button span {
      margin-left: auto;
      margin-right: 10px;
      color: #888888;
      font-size: 6px;
    }

    .products-layout {
      display: block;
    }

    .filters {
      display: none;
      position: static;
      margin-bottom: 30px;
      padding: 18px;
      border: 1px solid #e3e3e0;
      background: #fafaf8;
    }

    .products-layout.mobile-open .filters {
      display: block;
    }

    .product-toolbar {
      margin-bottom: 14px;
    }

    .products-grid {
      grid-template-columns:
        repeat(2,minmax(0,1fr));
      gap: 30px 10px;
    }

    .product-image-wrap {
      aspect-ratio: .73;
    }

    .product-badges {
      top: 7px;
      left: 7px;
    }

    .product-badges span {
      padding: 6px;
      font-size: 5px;
    }

    .view-product {
      left: 7px;
      right: 7px;
      bottom: 7px;
      min-height: 34px;
      padding: 0 8px;
      font-size: 5.5px;
      opacity: 1;
      transform: none;
    }

    .product-info {
      padding-top: 10px;
    }

    .product-category {
      font-size: 5px;
    }

    .product-name {
      font-size: 17px;
    }

    .price-row {
      margin-top: 6px;
    }

    .price-row strong {
      font-size: 8px;
    }

    .price-row span {
      font-size: 7px;
    }

    .products-closing {
      padding:
        0 16px 80px;
      display: flex;
      flex-direction: column-reverse;
    }

    .closing-copy {
      min-height: 470px;
      padding: 45px 30px;
    }

    .closing-image {
      min-height: 430px;
    }
  }

  @media (max-width: 390px) {
    .hero-content h1 {
      font-size: 65px;
    }

    .products-heading h2 {
      font-size: 39px;
    }

    .product-name {
      font-size: 15px;
    }

    .closing-copy h2 {
      font-size: 56px;
    }
  }

   @media (prefers-reduced-motion: reduce) {
    .product-image,
    .view-product,
    .skeleton-image {
      animation: none !important;
      transition: none !important;
    }
  }
`;

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageContent />
    </Suspense>
  );
}