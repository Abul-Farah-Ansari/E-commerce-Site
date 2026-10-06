"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { useCart } from "@/components/CartContext";

interface ProductCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status?: string;
  featured?: boolean;
  sortOrder?: number;
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

  sku?: string;

  stock?: number;
  lowStockThreshold?: number;

  status?: "active" | "draft" | "out_of_stock";

  featured?: boolean;
  newArrival?: boolean;
}

interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  image?: string;
  images?: string[];
  category?: string | null;
  description?: string;
  sizes?: string[];
  colors?: string[];
  sku?: string;
  stock?: number;
  lowStockThreshold?: number;
  status?: "active" | "draft" | "out_of_stock";
  featured?: boolean;
  newArrival?: boolean;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85";

const WISHLIST_STORAGE_KEY = "ecommerce-wishlist";

export default function FeaturedProducts() {
  const { addToCart } = useCart();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const [wishlist, setWishlist] = useState<string[]>([]);

  const [addedProduct, setAddedProduct] = useState<string | null>(null);

  /*
  =========================================================
  LOAD FEATURED PRODUCTS
  =========================================================
  */

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);

        const response = await fetch("/api/products", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load products."
          );
        }

        if (mounted) {
          const featured = Array.isArray(data.products)
            ? data.products.filter(
                (product: ApiProduct) =>
                  product.featured === true
              )
            : [];

          setProducts(featured);
        }
      } catch (error) {
        console.error(
          "FEATURED PRODUCTS ERROR:",
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

      const parsed = JSON.parse(savedWishlist);

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
  NORMALIZE PRODUCT FOR CART
  =========================================================
  */

  const normalizeProduct = (
    product: ApiProduct
  ): CartProduct => {
    const compareAtPrice =
      product.compareAtPrice ?? undefined;

    let discount: number | undefined;

    if (
      compareAtPrice &&
      compareAtPrice > product.price
    ) {
      discount = Math.round(
        ((compareAtPrice - product.price) /
          compareAtPrice) *
          100
      );
    }

    return {
      id: product._id,

      name: product.name,

      slug: product.slug,

      price: product.price,

      oldPrice: compareAtPrice,

      discount,

      image:
        product.images?.[0] ||
        FALLBACK_IMAGE,

      images: product.images || [],

      category:
        product.category?.name ||
        product.category?.slug ||
        null,

      description:
        product.description || "",

      sizes: product.sizes || [],

      colors: product.colors || [],

      sku: product.sku,

      stock: product.stock,

      lowStockThreshold:
        product.lowStockThreshold,

      status: product.status,

      featured: product.featured,

      newArrival: product.newArrival,
    };
  };

  /*
  =========================================================
  QUICK ADD
  =========================================================

  Products with variants are sent to their product page
  so the customer can select the correct size/color.
  Products without variants can be added directly.
  */

  const handleQuickAdd = (
    event: React.MouseEvent<HTMLButtonElement>,
    product: ApiProduct
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const stock =
      typeof product.stock === "number"
        ? product.stock
        : 0;

    if (
      product.status === "out_of_stock" ||
      stock <= 0
    ) {
      return;
    }

    /*
    ---------------------------------------------------------
    Products with sizes/colors need user selection.
    ---------------------------------------------------------
    */

    const hasVariants =
      Boolean(product.sizes?.length) ||
      Boolean(product.colors?.length);

    if (hasVariants) {
      window.location.href =
        `/products/${product.slug}`;
      return;
    }

    /*
    ---------------------------------------------------------
    Direct add for products without variants.
    ---------------------------------------------------------
    */

    const cartProduct =
      normalizeProduct(product);

    addToCart(cartProduct, 1);

    setAddedProduct(product._id);

    window.setTimeout(() => {
      setAddedProduct((current) =>
        current === product._id
          ? null
          : current
      );
    }, 1400);
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
  DISPLAY PRODUCTS
  =========================================================
  */

  const displayedProducts = useMemo(() => {
    return products.slice(0, 8);
  }, [products]);

  /*
  =========================================================
  RENDER
  =========================================================
  */

  return (
    <section
      className="featured-section"
      style={{
        width: "100%",
        background: "#f8f8f6",
        padding: "100px 0",
        overflow: "hidden",
      }}
    >
      <div
        className="featured-container"
        style={{
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "0 40px",
        }}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="featured-header"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "30px",
            marginBottom: "45px",
          }}
        >
          <div>
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
                }}
              />

              <span
                className="featured-label"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "#777777",
                }}
              >
                Curated For You
              </span>
            </div>

            <h2
              className="featured-title"
              style={{
                margin: 0,
                fontSize: "clamp(40px, 5vw, 58px)",
                lineHeight: "1",
                fontWeight: 600,
                letterSpacing: "-0.045em",
                color: "#111111",
              }}
            >
              Featured Products
            </h2>
          </div>

          <Link
            href="/products"
            className="featured-view-all"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#111111",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            View All

            <Icon
              icon="solar:arrow-right-linear"
              width="18"
              height="18"
            />
          </Link>
        </div>

        {/* =====================================================
            LOADING
        ===================================================== */}

        {loading && (
          <div
            className="featured-loading"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",
              gap: "20px",
            }}
          >
            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="featured-skeleton"
                  style={{
                    width: "100%",
                    aspectRatio: "3 / 4",
                    borderRadius: "18px",
                    background:
                      "linear-gradient(90deg, #eeeeec 25%, #e5e5e3 50%, #eeeeec 75%)",
                    backgroundSize:
                      "200% 100%",
                  }}
                />
              )
            )}
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {!loading &&
          displayedProducts.length === 0 && (
            <div
              style={{
                width: "100%",
                padding: "70px 20px",
                textAlign: "center",
                borderTop:
                  "1px solid #dededb",
                borderBottom:
                  "1px solid #dededb",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#777777",
                }}
              >
                No featured products available
                right now.
              </p>
            </div>
          )}

        {/* =====================================================
            PRODUCT GRID
        ===================================================== */}

        {!loading &&
          displayedProducts.length > 0 && (
            <div
              className="featured-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, minmax(0, 1fr))",
                gap: "20px",
                width: "100%",
              }}
            >
              {displayedProducts.map(
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

                  const hasVariants =
                    Boolean(
                      product.sizes?.length
                    ) ||
                    Boolean(
                      product.colors?.length
                    );

                  const isAdded =
                    addedProduct ===
                    product._id;

                  return (
                    <Link
                      key={product._id}
                      href={`/products/${product.slug}`}
                      className="featured-product-card"
                      style={{
                        textDecoration:
                          "none",
                        color: "#111111",
                        display: "block",
                        minWidth: 0,
                      }}
                    >
                      {/* =================================================
                          IMAGE
                      ================================================= */}

                      <div
                        className="featured-image-wrapper"
                        style={{
                          position:
                            "relative",
                          width: "100%",
                          height: "430px",
                          overflow: "hidden",
                          borderRadius:
                            "18px",
                          background:
                            "#e9e9e7",
                        }}
                      >
                        <img
                          src={getImage(
                            product
                          )}
                          alt={product.name}
                          className="featured-product-image"
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit:
                              "cover",
                            display: "block",
                            transition:
                              "transform 0.6s ease",
                          }}
                        />

                        {/* Dark overlay */}

                        <div
                          className="featured-image-overlay"
                          style={{
                            position:
                              "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(to top, rgba(0,0,0,0.45), transparent 45%)",
                            opacity: 0,
                            transition:
                              "opacity 0.35s ease",
                            pointerEvents:
                              "none",
                          }}
                        />

                        {/* =================================================
                            DISCOUNT
                        ================================================= */}

                        {discount && (
                          <span
                            className="featured-discount"
                            style={{
                              position:
                                "absolute",
                              top: "15px",
                              left: "15px",
                              background:
                                "#111111",
                              color:
                                "#ffffff",
                              padding:
                                "7px 11px",
                              borderRadius:
                                "999px",
                              fontSize:
                                "10px",
                              fontWeight: 600,
                              letterSpacing:
                                "0.08em",
                            }}
                          >
                            {discount}% OFF
                          </span>
                        )}

                        {/* =================================================
                            WISHLIST
                        ================================================= */}

                        <button
                          type="button"
                          onClick={(
                            event
                          ) =>
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
                          className={`featured-wishlist ${
                            isWishlisted
                              ? "is-wishlisted"
                              : ""
                          }`}
                          style={{
                            position:
                              "absolute",
                            top: "15px",
                            right: "15px",
                            width: "42px",
                            height: "42px",
                            border:
                              "none",
                            borderRadius:
                              "50%",
                            background:
                              "#ffffff",
                            color:
                              isWishlisted
                                ? "#111111"
                                : "#111111",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            cursor:
                              "pointer",
                            transition:
                              "transform 0.25s ease",
                          }}
                        >
                          <Icon
                            icon={
                              isWishlisted
                                ? "solar:heart-bold"
                                : "solar:heart-linear"
                            }
                            width="21"
                            height="21"
                          />
                        </button>

                        {/* =================================================
                            QUICK ADD
                        ================================================= */}

                        {!isOutOfStock && (
                          <button
                            type="button"
                            onClick={(
                              event
                            ) =>
                              handleQuickAdd(
                                event,
                                product
                              )
                            }
                            className="featured-quick-add"
                            style={{
                              position:
                                "absolute",
                              left: "15px",
                              right: "15px",
                              bottom:
                                "15px",
                              height: "46px",
                              border:
                                "none",
                              background:
                                "#ffffff",
                              color:
                                "#111111",
                              fontSize:
                                "11px",
                              fontWeight: 600,
                              letterSpacing:
                                "0.14em",
                              textTransform:
                                "uppercase",
                              cursor:
                                "pointer",
                              opacity: 0,
                              transform:
                                "translateY(10px)",
                              transition:
                                "all 0.3s ease",
                            }}
                          >
                            {isAdded
                              ? "Added to Cart"
                              : hasVariants
                                ? "Choose Options"
                                : "Quick Add"}

                            <Icon
                              icon={
                                isAdded
                                  ? "solar:check-circle-linear"
                                  : hasVariants
                                    ? "solar:arrow-right-linear"
                                    : "solar:bag-2-linear"
                              }
                              width="17"
                              height="17"
                              style={{
                                marginLeft:
                                  "7px",
                                verticalAlign:
                                  "middle",
                              }}
                            />
                          </button>
                        )}

                        {/* =================================================
                            OUT OF STOCK
                        ================================================= */}

                        {isOutOfStock && (
                          <div
                            className="featured-out-stock"
                            style={{
                              position:
                                "absolute",
                              left: "15px",
                              right: "15px",
                              bottom:
                                "15px",
                              height: "46px",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              background:
                                "rgba(255,255,255,0.92)",
                              color:
                                "#555555",
                              fontSize:
                                "10px",
                              fontWeight: 600,
                              letterSpacing:
                                "0.14em",
                              textTransform:
                                "uppercase",
                            }}
                          >
                            Out of Stock
                          </div>
                        )}
                      </div>

                      {/* =================================================
                          PRODUCT INFO
                      ================================================= */}

                      <div
                        className="featured-product-info"
                        style={{
                          paddingTop:
                            "17px",
                        }}
                      >
                        {/* Category */}

                        <p
                          className="featured-product-category"
                          style={{
                            margin: 0,
                            fontSize: "10px",
                            fontWeight: 500,
                            textTransform:
                              "uppercase",
                            letterSpacing:
                              "0.18em",
                            color:
                              "#888888",
                          }}
                        >
                          {product.category
                            ?.name ||
                            "Collection"}
                        </p>

                        {/* Name */}

                        <h3
                          className="featured-product-name"
                          style={{
                            margin:
                              "7px 0 10px",
                            fontSize:
                              "16px",
                            lineHeight:
                              "1.4",
                            fontWeight: 600,
                          }}
                        >
                          {product.name}
                        </h3>

                        {/* Price */}

                        <div
                          className="featured-product-price"
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "9px",
                            flexWrap:
                              "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize:
                                "15px",
                              fontWeight: 600,
                            }}
                          >
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
                              <span
                                style={{
                                  fontSize:
                                    "13px",
                                  color:
                                    "#999999",
                                  textDecoration:
                                    "line-through",
                                }}
                              >
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
           TABLET
        ===================================================== */

        @media (max-width: 1024px) {
          .featured-section {
            padding: 80px 0 !important;
          }

          .featured-container {
            padding: 0 30px !important;
          }

          .featured-header {
            margin-bottom: 35px !important;
          }

          .featured-title {
            font-size: 46px !important;
          }

          .featured-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr)) !important;
            gap: 18px !important;
          }

          .featured-image-wrapper {
            height: 420px !important;
          }

          .featured-quick-add {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }

          .featured-image-overlay {
            opacity: 0 !important;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 768px) {
          .featured-section {
            padding: 60px 0 !important;
          }

          .featured-container {
            padding: 0 !important;
          }

          .featured-header {
            align-items: flex-end !important;
            padding: 0 20px !important;
            margin-bottom: 28px !important;
            gap: 15px !important;
          }

          .featured-header
            > div:first-child
            > div {
            gap: 9px !important;
            margin-bottom: 11px !important;
          }

          .featured-header
            > div:first-child
            > div
            > span:first-child {
            width: 25px !important;
          }

          .featured-label {
            font-size: 10px !important;
            letter-spacing: 0.2em !important;
          }

          .featured-title {
            font-size: clamp(
              32px,
              8vw,
              42px
            ) !important;
            line-height: 1.05 !important;
            letter-spacing: -0.04em !important;
          }

          .featured-view-all {
            font-size: 12px !important;
            gap: 5px !important;
          }

          /* =================================================
             HORIZONTAL CAROUSEL
          ================================================= */

          .featured-grid {
            display: flex !important;
            width: 100% !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
            flex-wrap: nowrap !important;
            gap: 12px !important;
            padding-left: 20px !important;
            padding-right: 20px !important;
            scroll-snap-type: x mandatory !important;
            scroll-padding-left: 20px !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
            overscroll-behavior-x: contain !important;
          }

          .featured-grid::-webkit-scrollbar {
            display: none !important;
          }

          /* =================================================
             TWO CARDS IN VIEW
          ================================================= */

          .featured-product-card {
            flex: 0 0
              calc(
                (100% - 12px) / 2
              ) !important;

            width: calc(
              (100% - 12px) / 2
            ) !important;

            min-width: calc(
              (100% - 12px) / 2
            ) !important;

            scroll-snap-align: start !important;
          }

          /* =================================================
             SQUARE IMAGE
          ================================================= */

          .featured-image-wrapper {
            height: auto !important;
            aspect-ratio: 1 / 1 !important;
            border-radius: 14px !important;
          }

          .featured-discount {
            top: 9px !important;
            left: 9px !important;
            padding: 5px 7px !important;
            font-size: 7px !important;
          }

          .featured-wishlist {
            top: 9px !important;
            right: 9px !important;
            width: 30px !important;
            height: 30px !important;
          }

          .featured-wishlist :global(svg) {
            width: 16px !important;
            height: 16px !important;
          }

          .featured-quick-add {
            left: 9px !important;
            right: 9px !important;
            bottom: 9px !important;
            height: 36px !important;
            font-size: 8px !important;
            letter-spacing: 0.08em !important;
            opacity: 1 !important;
            transform: translateY(0) !important;
          }

          .featured-quick-add :global(svg) {
            width: 14px !important;
            height: 14px !important;
          }

          .featured-out-stock {
            left: 9px !important;
            right: 9px !important;
            bottom: 9px !important;
            height: 36px !important;
            font-size: 7px !important;
          }

          /* =================================================
             PRODUCT INFO
          ================================================= */

          .featured-product-info {
            padding-top: 11px !important;
          }

          .featured-product-category {
            font-size: 7px !important;
            letter-spacing: 0.12em !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .featured-product-name {
            margin: 5px 0 7px !important;
            font-size: 13px !important;
            line-height: 1.3 !important;

            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .featured-product-price {
            gap: 6px !important;
          }

          .featured-product-price span {
            font-size: 12px !important;
          }

          .featured-product-price span:last-child {
            font-size: 10px !important;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 480px) {
          .featured-section {
            padding: 50px 0 !important;
          }

          .featured-header {
            padding: 0 15px !important;
            margin-bottom: 24px !important;
          }

          .featured-title {
            font-size: 32px !important;
          }

          .featured-grid {
            gap: 10px !important;
            padding-left: 15px !important;
            padding-right: 15px !important;
            scroll-padding-left: 15px !important;
          }

          .featured-product-card {
            flex: 0 0
              calc(
                (100% - 10px) / 2
              ) !important;

            width: calc(
              (100% - 10px) / 2
            ) !important;

            min-width: calc(
              (100% - 10px) / 2
            ) !important;
          }

          .featured-image-wrapper {
            aspect-ratio: 1 / 1 !important;
            border-radius: 12px !important;
          }

          .featured-discount {
            top: 7px !important;
            left: 7px !important;
            padding: 4px 6px !important;
            font-size: 6px !important;
          }

          .featured-wishlist {
            top: 7px !important;
            right: 7px !important;
            width: 27px !important;
            height: 27px !important;
          }

          .featured-wishlist :global(svg) {
            width: 14px !important;
            height: 14px !important;
          }

          .featured-quick-add {
            left: 7px !important;
            right: 7px !important;
            bottom: 7px !important;
            height: 32px !important;
            font-size: 7px !important;
          }

          .featured-quick-add :global(svg) {
            width: 13px !important;
            height: 13px !important;
          }

          .featured-out-stock {
            left: 7px !important;
            right: 7px !important;
            bottom: 7px !important;
            height: 32px !important;
            font-size: 6px !important;
          }

          .featured-product-info {
            padding-top: 9px !important;
          }

          .featured-product-category {
            font-size: 6px !important;
            letter-spacing: 0.1em !important;
          }

          .featured-product-name {
            margin: 4px 0 6px !important;
            font-size: 12px !important;
            line-height: 1.3 !important;
          }

          .featured-product-price {
            gap: 5px !important;
          }

          .featured-product-price span {
            font-size: 11px !important;
          }

          .featured-product-price span:last-child {
            font-size: 9px !important;
          }
        }

        /* =====================================================
           EXTRA SMALL
        ===================================================== */

        @media (max-width: 359px) {
          .featured-header {
            padding: 0 12px !important;
          }

          .featured-title {
            font-size: 29px !important;
          }

          .featured-view-all {
            font-size: 11px !important;
          }

          .featured-grid {
            gap: 8px !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
            scroll-padding-left: 12px !important;
          }

          .featured-product-card {
            flex: 0 0
              calc(
                (100% - 8px) / 2
              ) !important;

            width: calc(
              (100% - 8px) / 2
            ) !important;

            min-width: calc(
              (100% - 8px) / 2
            ) !important;
          }

          .featured-image-wrapper {
            aspect-ratio: 1 / 1 !important;
            border-radius: 10px !important;
          }

          .featured-wishlist {
            width: 25px !important;
            height: 25px !important;
          }

          .featured-wishlist :global(svg) {
            width: 13px !important;
            height: 13px !important;
          }

          .featured-product-name {
            font-size: 11px !important;
          }

          .featured-product-price span {
            font-size: 10px !important;
          }

          .featured-product-price span:last-child {
            font-size: 8px !important;
          }
        }

        /* =====================================================
           DESKTOP HOVER
        ===================================================== */

        @media (min-width: 769px) {
          .featured-product-card:hover
            .featured-product-image {
            transform: scale(1.045);
          }

          .featured-product-card:hover
            .featured-image-overlay {
            opacity: 1;
          }

          .featured-product-card:hover
            .featured-quick-add {
            opacity: 1 !important;
            transform: translateY(0) !important;
          }

          .featured-product-card:hover
            .featured-wishlist {
            transform: scale(1.05);
          }

          .featured-wishlist:hover {
            transform: scale(1.1) !important;
          }
        }

        /* =====================================================
           SKELETON ANIMATION
        ===================================================== */

        .featured-skeleton {
          animation: featuredSkeleton 1.5s
            infinite;
        }

        @keyframes featuredSkeleton {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        /* =====================================================
           REDUCE MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .featured-product-image,
          .featured-quick-add,
          .featured-wishlist,
          .featured-image-overlay {
            transition: none !important;
          }

          .featured-skeleton {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}