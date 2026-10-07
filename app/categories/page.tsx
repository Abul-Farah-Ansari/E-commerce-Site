"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=90",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1800&q=90",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=90",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1800&q=90",
  "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=1800&q=90",
];

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=2200&q=90";

const CLOSING_IMAGE =
  "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2200&q=90";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/categories",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data?.message ||
              "Unable to load collections."
          );
        }

        if (!mounted) {
          return;
        }

        const items = Array.isArray(
          data.categories
        )
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

        setCategories(activeCategories);
      } catch (requestError) {
        console.error(
          "Categories loading error:",
          requestError
        );

        if (mounted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load collections."
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

  // =========================================================
  // FEATURED CATEGORIES
  // =========================================================

  const featuredCategories = useMemo(() => {
    const featured = categories.filter(
      (category) => category.featured
    );

    if (featured.length > 0) {
      return featured;
    }

    return categories.slice(0, 3);
  }, [categories]);

  // =========================================================
  // IMAGE
  // =========================================================

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

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="bg-white">
          {/* HERO SKELETON */}
          <section className="relative h-[620px] overflow-hidden bg-[#e9e8e5]">
            <div className="absolute inset-0 animate-pulse bg-[#deddd9]" />

            <div className="relative z-10 mx-auto flex h-full max-w-[1600px] items-end px-6 pb-16 sm:px-10 lg:px-16">
              <div>
                <div className="h-3 w-28 animate-pulse bg-white/50" />

                <div className="mt-6 h-24 w-[360px] animate-pulse bg-white/40 sm:w-[520px]" />

                <div className="mt-7 h-4 w-[320px] animate-pulse bg-white/30" />
              </div>
            </div>
          </section>

          {/* GRID SKELETON */}
          <section className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12">
            <div className="mb-10">
              <div className="h-3 w-24 animate-pulse bg-black/10" />
              <div className="mt-4 h-12 w-72 animate-pulse bg-black/10" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="aspect-[4/5] animate-pulse bg-[#eeeeeb]"
                  />
                )
              )}
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

        <main className="flex min-h-[70vh] items-center justify-center bg-white px-5">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f3f3f0]">
              <Icon
                icon="solar:danger-circle-linear"
                width={27}
                height={27}
                className="text-black/60"
              />
            </div>

            <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.22em] text-black/40">
              House Of Orive
            </p>

            <h1 className="mt-3 font-serif text-4xl">
              Collections unavailable
            </h1>

            <p className="mx-auto mt-4 max-w-[400px] text-sm leading-7 text-black/45">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-7 bg-black px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white"
            >
              Try Again
            </button>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-white text-[#111]">
        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative flex min-h-[620px] items-end overflow-hidden bg-black">
          <img
            src={HERO_IMAGE}
            alt="House Of Orive Collections"
            className="absolute inset-0 h-full w-full object-cover grayscale"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/10" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/10" />

          <div className="relative z-10 mx-auto flex w-full max-w-[1600px] items-end justify-between gap-10 px-6 pb-14 sm:px-10 sm:pb-16 lg:px-16">
            <div className="max-w-[850px]">
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-white/60" />

                <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/65">
                  House Of Orive
                </span>
              </div>

              <h1 className="mt-6 font-serif text-[70px] leading-[0.86] tracking-[-0.045em] text-white sm:text-[100px] lg:text-[140px]">
                Collections
              </h1>

              <p className="mt-7 max-w-[530px] text-sm leading-7 text-white/70">
                Discover considered pieces, refined
                silhouettes and modern essentials
                curated for the House Of Orive
                wardrobe.
              </p>
            </div>

            <div className="hidden shrink-0 text-right lg:block">
              <span className="block text-[9px] uppercase tracking-[0.25em] text-white/45">
                Collections
              </span>

              <span className="mt-1 block font-serif text-4xl text-white">
                {String(
                  categories.length
                ).padStart(2, "0")}
              </span>
            </div>
          </div>

          {/* SCROLL */}
          <div className="absolute bottom-7 left-6 flex items-center gap-3 sm:left-10 lg:left-16">
            <Icon
              icon="solar:arrow-down-linear"
              width={17}
              height={17}
              className="text-white/60"
            />

            <span className="text-[8px] uppercase tracking-[0.25em] text-white/50">
              Explore
            </span>
          </div>
        </section>

        {/* ================================================= */}
        {/* INTRO */}
        {/* ================================================= */}

        <section className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32">
          <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-24">
            <div>
              <span className="text-[9px] font-medium uppercase tracking-[0.27em] text-black/40">
                The Orive Edit
              </span>

              <span className="mt-5 block font-serif text-7xl leading-none text-black/10 sm:text-8xl">
                01
              </span>
            </div>

            <div className="max-w-[750px]">
              <h2 className="font-serif text-4xl leading-[1] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Find your
                <br />
                <i>expression.</i>
              </h2>

              <p className="mt-7 max-w-[600px] text-sm leading-8 text-black/50">
                Explore collections created around
                modern dressing — from everyday
                essentials to pieces designed to make
                an impression.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* FEATURED COLLECTION */}
        {/* ================================================= */}

        {featuredCategories.length > 0 && (
          <section className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
            <div className="mb-8 flex items-end justify-between border-b border-black/10 pb-5">
              <div>
                <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-black/40">
                  Featured
                </span>

                <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em] sm:text-4xl">
                  The Featured Edit
                </h2>
              </div>

              <span className="hidden text-[9px] uppercase tracking-[0.18em] text-black/35 sm:block">
                Selected Collections
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
              {/* MAIN FEATURED */}
              {featuredCategories[0] && (
                <Link
                  href={`/categories/${featuredCategories[0].slug}`}
                  className="group relative min-h-[600px] overflow-hidden bg-[#eeeeeb] lg:min-h-[700px]"
                >
                  <img
                    src={getImage(
                      featuredCategories[0],
                      0
                    )}
                    alt={
                      featuredCategories[0].name
                    }
                    className="absolute inset-0 h-full w-full object-cover grayscale transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04] group-hover:grayscale-[70%]"
                    onError={(event) => {
                      event.currentTarget.src =
                        FALLBACK_IMAGES[0];
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase tracking-[0.25em] text-white/55">
                          Featured Collection
                        </span>

                        <h3 className="mt-3 font-serif text-5xl leading-none tracking-[-0.035em] text-white sm:text-6xl">
                          {
                            featuredCategories[0]
                              .name
                          }
                        </h3>
                      </div>

                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/35 text-white transition-all duration-300 group-hover:bg-white group-hover:text-black">
                        <Icon
                          icon="solar:arrow-right-up-linear"
                          width={20}
                          height={20}
                        />
                      </span>
                    </div>

                    {featuredCategories[0]
                      .description && (
                      <p className="mt-5 max-w-[560px] text-sm leading-6 text-white/65">
                        {
                          featuredCategories[0]
                            .description
                        }
                      </p>
                    )}
                  </div>
                </Link>
              )}

              {/* SECONDARY FEATURED */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {featuredCategories
                  .slice(1, 3)
                  .map((category, index) => (
                    <Link
                      key={category._id}
                      href={`/categories/${category.slug}`}
                      className="group relative min-h-[300px] overflow-hidden bg-[#eeeeeb] lg:min-h-0"
                    >
                      <img
                        src={getImage(
                          category,
                          index + 1
                        )}
                        alt={category.name}
                        className="absolute inset-0 h-full w-full object-cover grayscale transition-transform duration-1000 ease-out group-hover:scale-[1.05] group-hover:grayscale-[70%]"
                        onError={(event) => {
                          event.currentTarget.src =
                            FALLBACK_IMAGES[
                              (index + 1) %
                                FALLBACK_IMAGES.length
                            ];
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

                      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                        <div className="flex items-end justify-between gap-5">
                          <div>
                            <span className="text-[8px] uppercase tracking-[0.22em] text-white/55">
                              Collection
                            </span>

                            <h3 className="mt-2 font-serif text-3xl leading-none text-white sm:text-4xl">
                              {category.name}
                            </h3>
                          </div>

                          <Icon
                            icon="solar:arrow-right-up-linear"
                            width={19}
                            height={19}
                            className="text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* ================================================= */}
        {/* ALL COLLECTIONS */}
        {/* ================================================= */}

        {categories.length > 0 && (
          <section className="mx-auto max-w-[1500px] px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
            <div className="mb-10 flex flex-col gap-5 border-b border-black/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-black/40">
                  Explore
                </span>

                <h2 className="mt-2 font-serif text-4xl tracking-[-0.035em] sm:text-5xl">
                  All Collections
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl">
                  {String(
                    categories.length
                  ).padStart(2, "0")}
                </span>

                <span className="text-[8px] uppercase tracking-[0.18em] text-black/35">
                  Collections
                </span>
              </div>
            </div>

            <div className="grid gap-x-4 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map(
                (category, index) => (
                  <Link
                    key={category._id}
                    href={`/categories/${category.slug}`}
                    className="group"
                  >
                    {/* IMAGE */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#efefec]">
                      <img
                        src={getImage(
                          category,
                          index
                        )}
                        alt={category.name}
                        className="h-full w-full object-cover grayscale transition-all duration-1000 ease-out group-hover:scale-[1.035] group-hover:grayscale-[65%]"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src =
                            FALLBACK_IMAGES[
                              index %
                                FALLBACK_IMAGES.length
                            ];
                        }}
                      />

                      {/* NUMBER */}
                      <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[9px] font-medium">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </div>

                      {/* ARROW */}
                      <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 opacity-0 transition-all duration-300 group-hover:opacity-100">
                        <Icon
                          icon="solar:arrow-right-up-linear"
                          width={17}
                          height={17}
                        />
                      </div>
                    </div>

                    {/* TEXT */}
                    <div className="flex items-start justify-between gap-5 pt-5">
                      <div>
                        <span className="text-[8px] font-medium uppercase tracking-[0.22em] text-black/35">
                          Collection
                        </span>

                        <h3 className="mt-2 font-serif text-3xl leading-none tracking-[-0.025em]">
                          {category.name}
                        </h3>

                        {category.description && (
                          <p className="mt-3 max-w-[360px] text-xs leading-6 text-black/45">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <Icon
                        icon="solar:arrow-right-up-linear"
                        width={19}
                        height={19}
                        className="mt-7 shrink-0 text-black/35 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-black"
                      />
                    </div>
                  </Link>
                )
              )}
            </div>
          </section>
        )}

        {/* ================================================= */}
        {/* EMPTY */}
        {/* ================================================= */}

        {!loading &&
          !error &&
          categories.length === 0 && (
            <section className="flex min-h-[550px] items-center justify-center px-5 text-center">
              <div>
                <span className="font-serif text-8xl text-black/10">
                  00
                </span>

                <p className="mt-7 text-[9px] font-medium uppercase tracking-[0.25em] text-black/40">
                  House Of Orive
                </p>

                <h2 className="mt-3 font-serif text-4xl">
                  The edit is coming soon.
                </h2>

                <p className="mx-auto mt-4 max-w-[400px] text-sm leading-7 text-black/45">
                  Our collections are currently
                  being curated.
                </p>

                <Link
                  href="/products"
                  className="mt-7 inline-flex bg-black px-7 py-3.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white"
                >
                  Shop All Products
                </Link>
              </div>
            </section>
          )}

        {/* ================================================= */}
        {/* CLOSING EDITORIAL */}
        {/* ================================================= */}

        <section className="relative min-h-[600px] overflow-hidden bg-black">
          <img
            src={CLOSING_IMAGE}
            alt="House Of Orive"
            className="absolute inset-0 h-full w-full object-cover grayscale"
          />

          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 flex min-h-[600px] items-center justify-center px-6 text-center">
            <div>
              <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/55">
                House Of Orive
              </span>

              <h2 className="mt-6 font-serif text-5xl leading-[0.9] tracking-[-0.045em] text-white sm:text-7xl lg:text-8xl">
                Less,
                <br />
                <i>but better.</i>
              </h2>

              <p className="mx-auto mt-7 max-w-[470px] text-sm leading-7 text-white/60">
                Discover pieces selected with
                intention — designed to move
                effortlessly between seasons,
                occasions and moments.
              </p>

              <Link
                href="/products"
                className="group mt-9 inline-flex items-center gap-4 border border-white/40 px-7 py-4 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-white hover:text-black"
              >
                Shop The Full Edit

                <Icon
                  icon="solar:arrow-right-up-linear"
                  width={17}
                  height={17}
                  className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}