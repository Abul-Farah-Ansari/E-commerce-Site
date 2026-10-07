"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
  lowStockThreshold?: number;

  status?: "active" | "draft" | "out_of_stock";

  featured?: boolean;
  newArrival?: boolean;
  trending?: boolean;
  sale?: boolean;

  createdAt?: string | Date;
  updatedAt?: string | Date;
};

type Category = {
  _id: string;
  name: string;
  slug: string;
  status?: "active" | "inactive";
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=85";

export default function SalePage() {
  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [categories, setCategories] = useState<
    Category[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [sort, setSort] = useState("featured");

  // =========================================================
  // LOAD PRODUCTS + CATEGORIES
  // =========================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          productsResponse,
          categoriesResponse,
        ] = await Promise.all([
          fetch("/api/products", {
            cache: "no-store",
          }),

          fetch("/api/categories", {
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

        const productList = Array.isArray(
          productsData?.products
        )
          ? productsData.products
          : [];

        const categoryList = Array.isArray(
          categoriesData?.categories
        )
          ? categoriesData.categories
          : [];

        setProducts(productList);

        setCategories(categoryList);
      } catch (requestError) {
        console.error(
          "Sale page error:",
          requestError
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load sale products."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // =========================================================
  // CATEGORY NAME
  // =========================================================

  const getCategoryName = (
    category: Product["category"]
  ) => {
    if (!category) {
      return "Uncategorized";
    }

    if (typeof category === "string") {
      return category;
    }

    return category.name || "Uncategorized";
  };

  // =========================================================
  // CATEGORY SLUG
  // =========================================================

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

  // =========================================================
  // SALE PRODUCTS
  // =========================================================

  const saleProducts = useMemo(() => {
    let result = products.filter(
      (product) =>
        product.sale === true &&
        product.status === "active"
    );

    // =======================================================
    // SEARCH
    // =======================================================

    if (search.trim()) {
      const searchValue =
        search.trim().toLowerCase();

      result = result.filter((product) => {
        const categoryName =
          getCategoryName(
            product.category
          ).toLowerCase();

        return (
          product.name
            .toLowerCase()
            .includes(searchValue) ||
          product.slug
            .toLowerCase()
            .includes(searchValue) ||
          categoryName.includes(searchValue)
        );
      });
    }

    // =======================================================
    // CATEGORY
    // =======================================================

    if (selectedCategory) {
      result = result.filter((product) => {
        const productCategory =
          getCategorySlug(product.category);

        return (
          productCategory ===
          selectedCategory.toLowerCase()
        );
      });
    }

    // =======================================================
    // SORT
    // =======================================================

    if (sort === "featured") {
      result.sort((a, b) => {
        return (
          Number(Boolean(b.featured)) -
          Number(Boolean(a.featured))
        );
      });
    }

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

    return result;
  }, [
    products,
    search,
    selectedCategory,
    sort,
  ]);

  // =========================================================
  // DISCOUNT
  // =========================================================

  const calculateDiscount = (
    price: number,
    compareAtPrice?: number
  ) => {
    if (
      !compareAtPrice ||
      compareAtPrice <= price
    ) {
      return null;
    }

    return Math.round(
      ((compareAtPrice - price) /
        compareAtPrice) *
        100
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-white">
          <section className="flex min-h-[600px] items-center justify-center">
            <div className="text-center">
              <Icon
                icon="solar:refresh-linear"
                width={30}
                height={30}
                className="mx-auto animate-spin text-black/50"
              />

              <p className="mt-4 text-[11px] uppercase tracking-[0.25em] text-black/45">
                Loading Sale
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center px-5">
          <div className="text-center">
            <Icon
              icon="solar:danger-circle-linear"
              width={40}
              height={40}
              className="mx-auto text-red-500"
            />

            <p className="mt-5 text-sm text-red-500">
              {error}
            </p>

            <Link
              href="/products"
              className="mt-6 inline-flex bg-black px-7 py-3 text-[10px] font-medium uppercase tracking-[0.16em] text-white"
            >
              View All Products
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <>
      <Navbar />

      <main className="bg-white">
        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative flex min-h-[560px] items-center overflow-hidden bg-neutral-900">
          <img
            src={FALLBACK_IMAGE}
            alt="House Of Orive Sale"
            className="absolute inset-0 h-full w-full object-cover opacity-50 grayscale"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/40 to-black/20" />

          <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 py-28 sm:px-10 lg:px-16">
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/65">
              House Of Orive
            </p>

            <h1 className="mt-5 font-serif text-[72px] leading-[0.88] tracking-[-0.045em] text-white sm:text-[100px] lg:text-[140px]">
              Sale
            </h1>

            <p className="mt-8 max-w-[580px] text-sm leading-7 text-white/70">
              Discover selected House Of Orive
              pieces at considered prices.
            </p>
          </div>

          <div className="absolute bottom-8 right-8 hidden text-right lg:block">
            <p className="text-[9px] uppercase tracking-[0.25em] text-white/55">
              Special Edit
            </p>

            <p className="mt-1 font-serif text-3xl text-white">
              01
            </p>
          </div>
        </section>

        {/* ================================================= */}
        {/* COLLECTION */}
        {/* ================================================= */}

        <section className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:px-12">
          {/* HEADER */}
          <div className="mb-10 flex flex-col gap-6 border-b border-black/10 pb-7 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-black/40">
                Special Edit
              </p>

              <h2 className="mt-2 font-serif text-4xl tracking-[-0.035em] sm:text-5xl">
                Sale Collection
              </h2>

              <p className="mt-3 text-sm text-black/45">
                {saleProducts.length}{" "}
                {saleProducts.length === 1
                  ? "piece"
                  : "pieces"}
              </p>
            </div>

            {/* SORT */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                Sort
              </span>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value)
                }
                className="border-0 border-b border-black/20 bg-transparent px-1 pb-2 text-[11px] uppercase tracking-[0.12em] outline-none"
              >
                <option value="featured">
                  Featured
                </option>

                <option value="newest">
                  Newest
                </option>

                <option value="price-low">
                  Price Low
                </option>

                <option value="price-high">
                  Price High
                </option>
              </select>
            </div>
          </div>

          {/* ================================================= */}
          {/* FILTER BAR */}
          {/* ================================================= */}

          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* SEARCH */}
            <div className="relative w-full md:max-w-[360px]">
              <Icon
                icon="solar:magnifer-linear"
                width={19}
                height={19}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-black/40"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search sale products..."
                className="w-full border-b border-black/15 bg-transparent py-3 pl-8 text-sm outline-none placeholder:text-black/30"
              />
            </div>

            {/* CATEGORY */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.18em] text-black/40">
                Category
              </span>

              <select
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(
                    event.target.value
                  )
                }
                className="border-0 border-b border-black/20 bg-transparent px-1 pb-2 text-[11px] uppercase tracking-[0.12em] outline-none"
              >
                <option value="">
                  All Categories
                </option>

                {categories
                  .filter(
                    (category) =>
                      category.status !==
                      "inactive"
                  )
                  .map((category) => (
                    <option
                      key={category._id}
                      value={category.slug}
                    >
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* ================================================= */}
          {/* PRODUCTS */}
          {/* ================================================= */}

          {saleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {saleProducts.map((product) => {
                const image =
                  product.images?.[0] ||
                  FALLBACK_IMAGE;

                const discount =
                  calculateDiscount(
                    product.price,
                    product.compareAtPrice
                  );

                return (
                  <Link
                    key={product._id}
                    href={`/products/${product.slug}`}
                    className="group"
                  >
                    {/* IMAGE */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#f4f4f4]">
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />

                      {/* SALE */}
                      <span className="absolute left-3 top-3 bg-black px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.15em] text-white">
                        Sale
                      </span>

                      {/* DISCOUNT */}
                      {discount && (
                        <span className="absolute right-3 top-3 bg-white px-2.5 py-1.5 text-[9px] font-medium tracking-[0.08em] text-black">
                          {discount}% OFF
                        </span>
                      )}

                      {/* WISHLIST */}
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                        }}
                        className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center bg-white/95 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        aria-label="Add to wishlist"
                      >
                        <Icon
                          icon="solar:heart-linear"
                          width={18}
                          height={18}
                        />
                      </button>
                    </div>

                    {/* INFO */}
                    <div className="pt-4">
                      <p className="text-[9px] uppercase tracking-[0.15em] text-black/40">
                        {getCategoryName(
                          product.category
                        )}
                      </p>

                      <h3 className="mt-1.5 line-clamp-1 text-[13px] font-medium text-black">
                        {product.name}
                      </h3>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-medium text-black">
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
                            <span className="text-xs text-black/35 line-through">
                              ₹
                              {Number(
                                product.compareAtPrice
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            /* ================================================= */
            /* NO SALE PRODUCTS */
            /* ================================================= */

            <div className="flex min-h-[400px] items-center justify-center border border-black/10">
              <div className="px-5 text-center">
                <Icon
                  icon="solar:tag-price-linear"
                  width={42}
                  height={42}
                  className="mx-auto text-black/20"
                />

                <h3 className="mt-5 font-serif text-3xl tracking-[-0.02em]">
                  No Sale Products
                </h3>

                <p className="mt-3 text-sm text-black/45">
                  There are currently no products
                  marked for sale.
                </p>

                <Link
                  href="/products"
                  className="mt-7 inline-flex bg-black px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-80"
                >
                  Shop All Products
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}