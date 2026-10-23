"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartContext";

type Category = {
  _id: string;
  name: string;
  slug: string;
};

type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: Category | null;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  sizes: string[];
  colors: string[];
  sku: string;
  stock: number;
  lowStockThreshold: number;
  status: "active" | "draft" | "out_of_stock";
  featured: boolean;
  newArrival: boolean;
};

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const { addToCart } = useCart();

  const slug = params?.slug as string;

  const [product, setProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const [added, setAdded] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | FETCH PRODUCT
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/products?slug=${encodeURIComponent(slug)}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message || "Unable to load product."
          );
        }

        const fetchedProduct =
  Array.isArray(data?.products)
    ? data.products.find(
        (item: Product) =>
          item.slug === slug
      ) || null
    : null;

        if (!fetchedProduct) {
          setProduct(null);
          return;
        }

        setProduct(fetchedProduct);

        setSelectedSize(
          fetchedProduct.sizes?.[0] || ""
        );

        setSelectedColor(
          fetchedProduct.colors?.[0] || ""
        );
      } catch (err) {
        console.error("PRODUCT DETAILS ERROR:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  /*
  |--------------------------------------------------------------------------
  | RESET IMAGE WHEN PRODUCT CHANGES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setSelectedImage(0);
  }, [product?._id]);

  /*
  |--------------------------------------------------------------------------
  | PRICE CALCULATIONS
  |--------------------------------------------------------------------------
  */

  const discountedPrice = Number(
    product?.price || 0
  );

  const oldPrice = Number(
    product?.compareAtPrice || 0
  );

  const discountPercentage = useMemo(() => {
    if (
      !oldPrice ||
      oldPrice <= discountedPrice ||
      discountedPrice <= 0
    ) {
      return 0;
    }

    return Math.round(
      ((oldPrice - discountedPrice) / oldPrice) * 100
    );
  }, [oldPrice, discountedPrice]);

  /*
  |--------------------------------------------------------------------------
  | STOCK
  |--------------------------------------------------------------------------
  */

  const isOutOfStock =
    !product ||
    product.stock <= 0 ||
    product.status === "out_of_stock";

  const maxQuantity = product?.stock || 1;

  /*
  |--------------------------------------------------------------------------
  | CART PRODUCT
  |--------------------------------------------------------------------------
  */

  const cartProduct = product
    ? {
        ...product,

        id: product._id,

        image:
          product.images?.[0] || "",

        oldPrice:
          product.compareAtPrice || undefined,

        discount:
          discountPercentage || undefined,

        category:
          product.category?.name || "Uncategorized",
      }
    : null;

  /*
  |--------------------------------------------------------------------------
  | ADD TO CART
  |--------------------------------------------------------------------------
  */

  const handleAddToCart = () => {
    if (!cartProduct || isOutOfStock) {
      return;
    }

    addToCart(
      cartProduct,
      quantity,
      selectedSize,
      selectedColor
    );

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1800);
  };

  /*
  |--------------------------------------------------------------------------
  | BUY NOW
  |--------------------------------------------------------------------------
  */

  const handleBuyNow = () => {
    if (!cartProduct || isOutOfStock) {
      return;
    }

    addToCart(
      cartProduct,
      quantity,
      selectedSize,
      selectedColor
    );

    router.push("/checkout");
  };

  /*
  |--------------------------------------------------------------------------
  | QUANTITY
  |--------------------------------------------------------------------------
  */

  const increaseQuantity = () => {
    setQuantity((previous) =>
      Math.min(previous + 1, maxQuantity)
    );
  };

  const decreaseQuantity = () => {
    setQuantity((previous) =>
      Math.max(1, previous - 1)
    );
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <>
        <Navbar />

        <main
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#fff",
            padding: "80px 20px",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <div
              className="product-loading-spinner"
              style={{
                width: "42px",
                height: "42px",
                border: "3px solid #e5e5e5",
                borderTopColor: "#111",
                borderRadius: "50%",
                margin: "0 auto 18px",
              }}
            />

            <p
              style={{
                margin: 0,
                color: "#666",
                fontSize: "14px",
              }}
            >
              Loading product...
            </p>
          </div>
        </main>

        <Footer />

        <style jsx>{`
          .product-loading-spinner {
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <>
        <Navbar />

        <main
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 20px",
            background: "#fafafa",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: "500px",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                margin: "0 auto 24px",
                borderRadius: "50%",
                background: "#111",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                icon="solar:danger-triangle-linear"
                width="32"
              />
            </div>

            <h1
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#111",
                margin: "0 0 12px",
              }}
            >
              Unable to Load Product
            </h1>

            <p
              style={{
                color: "#666",
                fontSize: "15px",
                lineHeight: 1.7,
                margin: "0 0 28px",
              }}
            >
              {error}
            </p>

            <Link
              href="/products"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 22px",
                background: "#111",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <Icon
                icon="solar:arrow-left-linear"
                width="18"
              />

              Back to Products
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PRODUCT NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!product) {
    return (
      <>
        <Navbar />

        <main
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 20px",
            background: "#fafafa",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: "500px",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                margin: "0 auto 24px",
                borderRadius: "50%",
                background: "#111",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                icon="solar:bag-cross-linear"
                width="32"
              />
            </div>

            <h1
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: "#111",
                margin: "0 0 12px",
              }}
            >
              Product Not Found
            </h1>

            <p
              style={{
                color: "#666",
                fontSize: "15px",
                lineHeight: 1.7,
                margin: "0 0 28px",
              }}
            >
              The product you're looking for may have
              been removed or the product link is
              incorrect.
            </p>

            <Link
              href="/products"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 22px",
                background: "#111",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              <Icon
                icon="solar:arrow-left-linear"
                width="18"
              />

              Back to Products
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const mainImage =
    product.images?.[selectedImage] ||
    product.images?.[0] ||
    "";

  /*
  |--------------------------------------------------------------------------
  | MAIN PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <Navbar />

      <main
        style={{
          background: "#FAF8F5",
          minHeight: "100vh",
        }}
      >
        {/* CONTINUE SHOPPING */}

        <div
          style={{
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "24px 24px 0",
          }}
        >
          <Link
            href="/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              color: "#555",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 500,
            }}
          >
            <Icon
              icon="solar:arrow-left-linear"
              width="18"
            />

            Continue Shopping
          </Link>
        </div>

        {/* PRODUCT SECTION */}

        <section
          style={{
            width: "100%",
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "35px 24px 90px",
          }}
        >
          <div
            className="product-details-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1.05fr) minmax(400px, 0.95fr)",
              gap: "70px",
              alignItems: "start",
            }}
          >
            {/* ================= PREMIUM PRODUCT GALLERY ================= */}
            <div style={{ width: "100%", minWidth: 0 }}>
              <div
                className="product-gallery-layout"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    product.images && product.images.length > 1
                      ? "88px minmax(0, 1fr)"
                      : "minmax(0, 1fr)",
                  gap: "16px",
                  alignItems: "start",
                }}
              >
                {/* Vertical thumbnails on the left */}
                {product.images && product.images.length > 1 && (
                  <div className="product-gallery-thumbnails">
                    {product.images.map((image, index) => {
                      const active = selectedImage === index;

                      return (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setSelectedImage(index)}
                          aria-label={`View ${product.name} image ${index + 1}`}
                          aria-pressed={active}
                          style={{
                            display: "block",
                            width: "100%",
                            aspectRatio: "3 / 4",
                            padding: "4px",
                            border: active
                              ? "1px solid #171717"
                              : "1px solid #e5e0d9",
                            borderRadius: "5px",
                            overflow: "hidden",
                            background: "#FAF8F5",
                            cursor: "pointer",
                            transition: "border-color 180ms ease",
                          }}
                        >
                          <img
                            src={image}
                            alt={`${product.name} thumbnail ${index + 1}`}
                            loading="lazy"
                            style={{
                              display: "block",
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                              objectPosition: "center",
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Large, uncropped main image */}
                <div
                  className="product-main-image"
                  onMouseEnter={() => setZoomVisible(true)}
                  onMouseLeave={() => setZoomVisible(false)}
                  onMouseMove={(event) => {
                    const bounds = event.currentTarget.getBoundingClientRect();
                    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
                    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
                    setZoomPosition({
                      x: Math.max(0, Math.min(100, x)),
                      y: Math.max(0, Math.min(100, y)),
                    });
                  }}
                  style={{
                    position: "relative",
                    width: "100%",
                    minWidth: 0,
                    aspectRatio: "4 / 5",
                    overflow: "hidden",
                    background: "#FAF8F5",
                    border: "1px solid #eee9e1",
                    cursor: mainImage ? "crosshair" : "default",
                  }}
                >
                  {mainImage ? (
                    <img
                      src={mainImage}
                      alt={product.name}
                      fetchPriority="high"
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        objectPosition: "center",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#999",
                      }}
                    >
                      <Icon icon="solar:gallery-linear" width="50" />
                    </div>
                  )}

                  {mainImage && zoomVisible && (
                    <div
                      className="product-image-zoom-preview"
                      aria-label="3x magnified product image preview"
                      style={{
                        backgroundImage: `url("${mainImage}")`,
                        backgroundSize: "300% 300%",
                        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }}
                    >
                      <span className="product-image-zoom-label">3× ZOOM</span>
                    </div>
                  )}

                  {discountPercentage > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "16px",
                        left: "16px",
                        padding: "8px 11px",
                        background: "#171717",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {discountPercentage}% OFF
                    </div>
                  )}

                  {isOutOfStock && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(250,248,245,0.58)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          background: "#171717",
                          color: "#fff",
                          padding: "12px 18px",
                          fontSize: "12px",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                        }}
                      >
                        OUT OF STOCK
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Service assurances */}
              <div
                className="product-service-cards"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "10px",
                  marginTop: "18px",
                }}
              >
                <div style={{ background: "#FAF8F5", padding: "14px 8px", textAlign: "center" }}>
                  <Icon icon="solar:shield-check-linear" width="21" />
                  <div style={{ marginTop: "6px", fontSize: "11px", color: "#555", fontWeight: 600 }}>Quality</div>
                </div>
                <div style={{ background: "#FAF8F5", padding: "14px 8px", textAlign: "center" }}>
                  <Icon icon="solar:delivery-linear" width="21" />
                  <div style={{ marginTop: "6px", fontSize: "11px", color: "#555", fontWeight: 600 }}>Fast Delivery</div>
                </div>
                <div style={{ background: "#FAF8F5", padding: "14px 8px", textAlign: "center" }}>
                  <Icon icon="solar:refresh-linear" width="21" />
                  <div style={{ marginTop: "6px", fontSize: "11px", color: "#555", fontWeight: 600 }}>Easy Returns</div>
                </div>
              </div>
            </div>

            {/* ================= PRODUCT INFO ================= */}

            <div
              style={{
                paddingTop: "8px",
              }}
            >
              {/* CATEGORY */}

              {product.category?.name && (
                <Link
                  href={`/categories/${product.category.slug}`}
                  style={{
                    display: "inline-block",
                    fontSize: "12px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "1.8px",
                    color: "#777",
                    marginBottom: "14px",
                    textDecoration: "none",
                  }}
                >
                  {product.category.name}
                </Link>
              )}

              {/* PRODUCT NAME */}

              <h1
                style={{
                  fontSize:
                    "clamp(30px, 4vw, 48px)",
                  lineHeight: 1.08,
                  fontWeight: 700,
                  letterSpacing: "-1.5px",
                  color: "#111",
                  margin: "0 0 18px",
                }}
              >
                {product.name}
              </h1>

              {/* PRICE */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    fontSize: "30px",
                    fontWeight: 700,
                    color: "#111",
                  }}
                >
                  ₹
                  {discountedPrice.toLocaleString(
                    "en-IN"
                  )}
                </span>

                {oldPrice > discountedPrice && (
                  <>
                    <span
                      style={{
                        fontSize: "17px",
                        color: "#999",
                        textDecoration:
                          "line-through",
                      }}
                    >
                      ₹
                      {oldPrice.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                    {discountPercentage > 0 && (
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#111",
                          background: "#f0f0f0",
                          padding: "6px 9px",
                          borderRadius: "6px",
                        }}
                      >
                        Save{" "}
                        {discountPercentage}%
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* STOCK */}

              <div
                style={{
                  marginBottom: "22px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: isOutOfStock
                      ? "#d11"
                      : product.stock <=
                          product.lowStockThreshold
                        ? "#c58a00"
                        : "#16833b",
                  }}
                />

                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: isOutOfStock
                      ? "#b00000"
                      : product.stock <=
                          product.lowStockThreshold
                        ? "#9a6b00"
                        : "#333",
                  }}
                >
                  {isOutOfStock
                    ? "Out of Stock"
                    : product.stock <=
                        product.lowStockThreshold
                      ? `Only ${product.stock} left in stock`
                      : "In Stock"}
                </span>
              </div>

              {/* DESCRIPTION */}

              <div
                style={{
                  borderTop:
                    "1px solid #e8e8e8",
                  paddingTop: "22px",
                  marginBottom: "28px",
                }}
              >
                <p
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.8,
                    color: "#666",
                    margin: 0,
                  }}
                >
                  {product.description ||
                    "Designed with a clean and modern aesthetic, this product combines everyday comfort, quality and timeless style."}
                </p>
              </div>

              {/* SIZE */}

              {product.sizes &&
                product.sizes.length > 0 && (
                  <div
                    style={{
                      marginBottom: "26px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#111",
                          textTransform:
                            "uppercase",
                          letterSpacing: "0.8px",
                        }}
                      >
                        Select Size
                      </span>

                      <button
                        type="button"
                        style={{
                          border: "none",
                          background: "none",
                          color: "#777",
                          fontSize: "12px",
                          cursor: "pointer",
                          textDecoration:
                            "underline",
                        }}
                      >
                        Size Guide
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "9px",
                      }}
                    >
                      {product.sizes.map(
                        (size) => {
                          const isSelected =
                            selectedSize ===
                            size;

                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() =>
                                setSelectedSize(
                                  size
                                )
                              }
                              style={{
                                minWidth: "52px",
                                height: "46px",
                                padding:
                                  "0 15px",
                                border: isSelected
                                  ? "1.5px solid #111"
                                  : "1px solid #ddd",
                                background:
                                  isSelected
                                    ? "#111"
                                    : "#fff",
                                color:
                                  isSelected
                                    ? "#fff"
                                    : "#111",
                                borderRadius:
                                  "8px",
                                cursor:
                                  "pointer",
                                fontSize: "13px",
                                fontWeight: 600,
                              }}
                            >
                              {size}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

              {/* COLOR */}

              {product.colors &&
                product.colors.length > 0 && (
                  <div
                    style={{
                      marginBottom: "28px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#111",
                        textTransform:
                          "uppercase",
                        letterSpacing: "0.8px",
                        marginBottom: "12px",
                      }}
                    >
                      Color
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "9px",
                      }}
                    >
                      {product.colors.map(
                        (color) => {
                          const isSelected =
                            selectedColor ===
                            color;

                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() =>
                                setSelectedColor(
                                  color
                                )
                              }
                              style={{
                                padding:
                                  "11px 17px",
                                border:
                                  isSelected
                                    ? "1.5px solid #111"
                                    : "1px solid #ddd",
                                background:
                                  isSelected
                                    ? "#111"
                                    : "#fff",
                                color:
                                  isSelected
                                    ? "#fff"
                                    : "#333",
                                borderRadius:
                                  "8px",
                                cursor:
                                  "pointer",
                                fontSize: "13px",
                                fontWeight: 600,
                              }}
                            >
                              {color}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

              {/* QUANTITY */}

              {!isOutOfStock && (
                <div
                  style={{
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#111",
                      textTransform:
                        "uppercase",
                      letterSpacing: "0.8px",
                      marginBottom: "12px",
                    }}
                  >
                    Quantity
                  </div>

                  <div
                    style={{
                      width: "132px",
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      border: "1px solid #ddd",
                      borderRadius: "9px",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      disabled={quantity <= 1}
                      style={{
                        width: "42px",
                        height: "100%",
                        border: "none",
                        background: "#fff",
                        cursor:
                          quantity <= 1
                            ? "not-allowed"
                            : "pointer",
                        color:
                          quantity <= 1
                            ? "#bbb"
                            : "#111",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                      }}
                    >
                      <Icon
                        icon="solar:minus-linear"
                        width="17"
                      />
                    </button>

                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#111",
                      }}
                    >
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      disabled={
                        quantity >= maxQuantity
                      }
                      style={{
                        width: "42px",
                        height: "100%",
                        border: "none",
                        background: "#fff",
                        cursor:
                          quantity >=
                          maxQuantity
                            ? "not-allowed"
                            : "pointer",
                        color:
                          quantity >=
                          maxQuantity
                            ? "#bbb"
                            : "#111",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                      }}
                    >
                      <Icon
                        icon="solar:add-linear"
                        width="17"
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}

              <div
                className="product-action-buttons"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap: "12px",
                  marginBottom: "25px",
                }}
              >
                <button
                  type="button"
                  onClick={
                    handleAddToCart
                  }
                  disabled={isOutOfStock}
                  style={{
                    minHeight: "54px",
                    border:
                      "1px solid #111",
                    background:
                      isOutOfStock
                        ? "#f1f1f1"
                        : added
                          ? "#111"
                          : "#fff",
                    color:
                      isOutOfStock
                        ? "#999"
                        : added
                          ? "#fff"
                          : "#111",
                    borderRadius: "10px",
                    cursor: isOutOfStock
                      ? "not-allowed"
                      : "pointer",
                    fontSize: "14px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    gap: "9px",
                  }}
                >
                  <Icon
                    icon={
                      added
                        ? "solar:check-circle-bold"
                        : "solar:cart-large-2-linear"
                    }
                    width="20"
                  />

                  {isOutOfStock
                    ? "Out of Stock"
                    : added
                      ? "Added to Cart"
                      : "Add to Cart"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleBuyNow
                  }
                  disabled={isOutOfStock}
                  style={{
                    minHeight: "54px",
                    border:
                      "1px solid #111",
                    background:
                      isOutOfStock
                        ? "#ddd"
                        : "#111",
                    color:
                      isOutOfStock
                        ? "#888"
                        : "#fff",
                    borderRadius: "10px",
                    cursor: isOutOfStock
                      ? "not-allowed"
                      : "pointer",
                    fontSize: "14px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    gap: "9px",
                  }}
                >
                  Buy Now

                  {!isOutOfStock && (
                    <Icon
                      icon="solar:arrow-right-linear"
                      width="19"
                    />
                  )}
                </button>
              </div>

              {/* BENEFITS */}

              <div
                style={{
                  borderTop:
                    "1px solid #e8e8e8",
                  borderBottom:
                    "1px solid #e8e8e8",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "14px",
                    padding: "17px 0",
                    borderBottom:
                      "1px solid #eee",
                  }}
                >
                  <Icon
                    icon="solar:delivery-linear"
                    width="22"
                    style={{
                      flexShrink: 0,
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#111",
                        marginBottom:
                          "3px",
                      }}
                    >
                      Fast & Secure
                      Delivery
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#777",
                      }}
                    >
                      Carefully packed
                      and delivered to
                      your doorstep.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "14px",
                    padding: "17px 0",
                    borderBottom:
                      "1px solid #eee",
                  }}
                >
                  <Icon
                    icon="solar:shield-check-linear"
                    width="22"
                    style={{
                      flexShrink: 0,
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#111",
                        marginBottom:
                          "3px",
                      }}
                    >
                      Quality Assured
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#777",
                      }}
                    >
                      Products selected
                      with quality and
                      reliability in mind.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    gap: "14px",
                    padding: "17px 0",
                  }}
                >
                  <Icon
                    icon="solar:refresh-circle-linear"
                    width="22"
                    style={{
                      flexShrink: 0,
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#111",
                        marginBottom:
                          "3px",
                      }}
                    >
                      Easy Returns
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#777",
                      }}
                    >
                      Simple return
                      process for eligible
                      products.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT INFORMATION */}

        <section
          style={{
            background: "#FAF8F5",
            borderTop: "1px solid #e9e3db",
            padding: "70px 24px",
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                textAlign: "center",
                marginBottom: "40px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform:
                    "uppercase",
                  letterSpacing: "2px",
                  color: "#777",
                }}
              >
                Product Information
              </span>

              <h2
                style={{
                  margin: "10px 0 0",
                  fontSize: "32px",
                  fontWeight: 700,
                  color: "#111",
                  letterSpacing:
                    "-0.7px",
                }}
              >
                Designed for Everyday
                Style
              </h2>
            </div>

            <div
              className="product-info-cards"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, 1fr)",
                gap: "18px",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: "26px",
                  border: "1px solid #eee",
                }}
              >
                <Icon
                  icon="solar:stars-minimalistic-linear"
                  width="28"
                  style={{
                    marginBottom: "15px",
                  }}
                />

                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    margin: "0 0 8px",
                    color: "#111",
                  }}
                >
                  Premium Design
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    lineHeight: 1.7,
                    color: "#777",
                  }}
                >
                  A minimal and
                  timeless design
                  created to fit
                  effortlessly into your
                  everyday wardrobe.
                </p>
              </div>

              <div
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: "26px",
                  border: "1px solid #eee",
                }}
              >
                <Icon
                  icon="solar:tag-price-linear"
                  width="28"
                  style={{
                    marginBottom: "15px",
                  }}
                />

                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    margin: "0 0 8px",
                    color: "#111",
                  }}
                >
                  Great Value
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    lineHeight: 1.7,
                    color: "#777",
                  }}
                >
                  Thoughtfully priced
                  products without
                  compromising on style
                  and everyday usability.
                </p>
              </div>

              <div
                style={{
                  background: "#fff",
                  borderRadius: "14px",
                  padding: "26px",
                  border: "1px solid #eee",
                }}
              >
                <Icon
                  icon="solar:heart-linear"
                  width="28"
                  style={{
                    marginBottom: "15px",
                  }}
                />

                <h3
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    margin: "0 0 8px",
                    color: "#111",
                  }}
                >
                  Made to Last
                </h3>

                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    lineHeight: 1.7,
                    color: "#777",
                  }}
                >
                  Carefully selected
                  materials and designs
                  made for repeated
                  everyday use.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* RESPONSIVE */}

      <style jsx>{`
        .product-gallery-thumbnails {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-height: 650px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #c9c1b7 transparent;
        }

        .product-gallery-thumbnails button {
          flex: 0 0 auto;
        }

        .product-main-image img {
          transition: opacity 180ms ease;
        }

        .product-image-zoom-preview {
          position: absolute;
          z-index: 5;
          top: 14px;
          right: 14px;
          width: min(58%, 300px);
          aspect-ratio: 4 / 5;
          border: 1px solid rgba(23, 23, 23, 0.22);
          background-color: #FAF8F5;
          background-repeat: no-repeat;
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.16);
          pointer-events: none;
        }

        .product-image-zoom-label {
          position: absolute;
          right: 8px;
          bottom: 8px;
          padding: 5px 7px;
          color: #fff;
          background: rgba(23, 23, 23, 0.82);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        @media (max-width: 900px) {
          .product-gallery-layout {
            grid-template-columns: 72px minmax(0, 1fr) !important;
            gap: 12px !important;
          }

          .product-gallery-thumbnails {
            max-height: 560px;
          }

          .product-details-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }

          .product-info-cards {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          .product-image-zoom-preview {
            display: none;
          }

          .product-gallery-layout {
            display: flex !important;
            flex-direction: column-reverse !important;
            gap: 10px !important;
          }

          .product-gallery-thumbnails {
            width: 100%;
            max-height: none;
            flex-direction: row;
            overflow-x: auto;
            overflow-y: hidden;
            padding-bottom: 4px;
          }

          .product-gallery-thumbnails button {
            width: 68px !important;
            min-width: 68px;
          }

          .product-main-image {
            aspect-ratio: 4 / 5 !important;
          }

          .product-details-grid {
            gap: 30px !important;
          }

          .product-action-buttons {
            grid-template-columns: 1fr !important;
          }

          .product-info-cards {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 480px) {
          .product-details-grid {
            gap: 25px !important;
          }
        }
      `}</style>
    </>
  );
}