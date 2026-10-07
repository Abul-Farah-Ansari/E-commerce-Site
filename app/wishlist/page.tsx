"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { Icon } from "@iconify/react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WishlistButton from "@/components/WishlistButton";

type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  stock?: number;
  status?: string;
  category?: {
    name?: string;
    slug?: string;
  } | null;
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=85";

export default function WishlistPage() {
  const router = useRouter();

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch("/api/wishlist", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

      const data =
        await response.json();

      if (response.status === 401) {
        router.push(
          "/login?redirect=/wishlist"
        );
        return;
      }

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data?.message ||
            "Unable to load wishlist."
        );
      }

      setProducts(
        Array.isArray(data.products)
          ? data.products
          : []
      );
    } catch (requestError) {
      console.error(
        "Wishlist loading error:",
        requestError
      );

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load wishlist."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();

    const handleWishlistUpdate =
      () => {
        loadWishlist();
      };

    window.addEventListener(
      "wishlist-updated",
      handleWishlistUpdate
    );

    return () => {
      window.removeEventListener(
        "wishlist-updated",
        handleWishlistUpdate
      );
    };
  }, []);

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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <section className="border-b border-black/10 px-5 pb-12 pt-20 sm:px-8 lg:px-12 lg:pb-16 lg:pt-28">
          <div className="mx-auto max-w-[1500px]">
            <div className="flex items-center gap-3">
              <Icon
                icon="solar:heart-linear"
                width={18}
                height={18}
                className="text-black/45"
              />

              <span className="text-[9px] font-medium uppercase tracking-[0.25em] text-black/40">
                Your Selection
              </span>
            </div>

            <div className="mt-5 flex items-end justify-between gap-6">
              <div>
                <h1 className="font-serif text-5xl leading-none tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                  Wishlist
                </h1>

                <p className="mt-5 max-w-[500px] text-sm leading-7 text-black/45">
                  Pieces you've saved for
                  later.
                </p>
              </div>

              {!loading &&
                !error &&
                products.length > 0 && (
                  <div className="hidden items-baseline gap-2 sm:flex">
                    <strong className="font-serif text-3xl font-normal">
                      {String(
                        products.length
                      ).padStart(2, "0")}
                    </strong>

                    <span className="text-[8px] uppercase tracking-[0.18em] text-black/35">
                      Pieces
                    </span>
                  </div>
                )}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <section className="mx-auto max-w-[1500px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          {/* LOADING */}

          {loading && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div key={index}>
                  <div className="aspect-[4/5] animate-pulse bg-[#eeeeeb]" />

                  <div className="mt-5 h-4 w-32 animate-pulse bg-black/10" />

                  <div className="mt-3 h-3 w-20 animate-pulse bg-black/10" />
                </div>
              ))}
            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="flex min-h-[400px] items-center justify-center text-center">
              <div>
                <Icon
                  icon="solar:danger-circle-linear"
                  width={30}
                  height={30}
                  className="mx-auto text-black/35"
                />

                <h2 className="mt-5 font-serif text-3xl">
                  Something went wrong
                </h2>

                <p className="mt-3 text-sm text-black/45">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadWishlist}
                  className="mt-6 bg-black px-7 py-3 text-[9px] font-medium uppercase tracking-[0.18em] text-white"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* EMPTY */}

          {!loading &&
            !error &&
            products.length === 0 && (
              <div className="flex min-h-[500px] items-center justify-center text-center">
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f4f1]">
                    <Icon
                      icon="solar:heart-linear"
                      width={28}
                      height={28}
                      className="text-black/45"
                    />
                  </div>

                  <span className="mt-7 block text-[9px] font-medium uppercase tracking-[0.25em] text-black/35">
                    Your Wishlist
                  </span>

                  <h2 className="mt-3 font-serif text-4xl tracking-[-0.03em]">
                    Nothing saved yet.
                  </h2>

                  <p className="mx-auto mt-4 max-w-[400px] text-sm leading-7 text-black/45">
                    Tap the heart on any piece
                    you love and it will appear
                    here.
                  </p>

                  <Link
                    href="/products"
                    className="mt-7 inline-flex bg-black px-7 py-3.5 text-[9px] font-medium uppercase tracking-[0.18em] text-white"
                  >
                    Explore Products
                  </Link>
                </div>
              </div>
            )}

          {/* PRODUCTS */}

          {!loading &&
            !error &&
            products.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
                {products.map(
                  (product) => {
                    const image =
                      product.images?.[0] ||
                      FALLBACK_IMAGE;

                    const outOfStock =
                      product.stock === 0 ||
                      product.status ===
                        "out_of_stock";

                    return (
                      <article
                        key={product._id}
                        className="group"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#eeeeeb]">
                          <Link
                            href={`/products/${product.slug}`}
                            className="block h-full w-full"
                          >
                            <img
                              src={image}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.src =
                                  FALLBACK_IMAGE;
                              }}
                            />
                          </Link>

                          {/* REMOVE */}
                          <div className="absolute right-3 top-3 z-10">
                            <WishlistButton
                              productId={
                                product._id
                              }
                            />
                          </div>

                          {outOfStock && (
                            <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-2 text-[8px] font-medium uppercase tracking-[0.15em]">
                              Out of stock
                            </div>
                          )}
                        </div>

                        <div className="pt-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-black/35">
                                {product
                                  .category
                                  ?.name ||
                                  "House Of Orive"}
                              </span>

                              <Link
                                href={`/products/${product.slug}`}
                              >
                                <h2 className="mt-2 font-serif text-xl leading-none tracking-[-0.02em]">
                                  {
                                    product.name
                                  }
                                </h2>
                              </Link>
                            </div>

                            <strong className="shrink-0 text-sm font-medium">
                              {formatPrice(
                                product.price
                              )}
                            </strong>
                          </div>

                          {product.compareAtPrice &&
                            product.compareAtPrice >
                              product.price && (
                              <div className="mt-2">
                                <del className="text-xs text-black/35">
                                  {formatPrice(
                                    product.compareAtPrice
                                  )}
                                </del>
                              </div>
                            )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
        </section>
      </main>

      <Footer />
    </>
  );
}