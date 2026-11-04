"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartContext";
import sizeGuideImage from "@/assets/size-guide.png";

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
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  useEffect(() => {
    if (!sizeGuideOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSizeGuideOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sizeGuideOpen]);

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
                        onClick={() => setSizeGuideOpen(true)}
                        aria-haspopup="dialog"
                        aria-expanded={sizeGuideOpen}
                        aria-label="Open size guide"
                        style={{
                          border: "none",
                          padding: "4px 0",
                          background: "none",
                          color: "#777",
                          fontSize: "12px",
                          cursor: "pointer",
                          textDecoration: "underline",
                          textUnderlineOffset: "4px",
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
                 

                  <div>
                   

                  
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

      {sizeGuideOpen && (
        <div
          className="size-guide-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSizeGuideOpen(false);
            }
          }}
        >
          <section
            className="size-guide-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-guide-title"
            aria-describedby="size-guide-description"
          >
            <header className="size-guide-header">
              <div>
                <p className="size-guide-eyebrow">HOUSE OF ORIVE · FIT GUIDE</p>
                <h2 id="size-guide-title">Find your perfect fit</h2>
                <p id="size-guide-description">Use the measuring guide below, then compare your measurements with the garment size chart.</p>
              </div>

              <button
                type="button"
                className="size-guide-close"
                onClick={() => setSizeGuideOpen(false)}
                aria-label="Close size guide"
              >
                <Icon icon="solar:close-linear" width={22} height={22} />
              </button>
            </header>

            <div className="size-guide-body">
              <div className="size-guide-measure-layout">
                <div className="size-guide-instructions">
                  <div className="size-guide-section-heading">
                    <span>01 / MEASUREMENT</span>
                    <h3>How to measure</h3>
                    <p>Keep the measuring tape level and comfortably snug, not tight.</p>
                  </div>

                  <div className="size-guide-instruction-list">
                    <article>
                      <span className="size-guide-step">01</span>
                      <div>
                        <h4>Chest / Bust</h4>
                        <p>Measure around the fullest part of your bust, keeping the tape parallel to the floor.</p>
                      </div>
                    </article>
                    <article>
                      <span className="size-guide-step">02</span>
                      <div>
                        <h4>Waist</h4>
                        <p>Measure around the narrowest point of your waist, with the tape level.</p>
                      </div>
                    </article>
                    <article>
                      <span className="size-guide-step">03</span>
                      <div>
                        <h4>Low waist</h4>
                        <p>Measure around the lower waistline, below your natural waist.</p>
                      </div>
                    </article>
                    <article>
                      <span className="size-guide-step">04</span>
                      <div>
                        <h4>Hip</h4>
                        <p>Measure around the fullest part of your hips while standing naturally.</p>
                      </div>
                    </article>
                    <article>
                      <span className="size-guide-step">05</span>
                      <div>
                        <h4>Inseam</h4>
                        <p>Measure along the inside of your leg, from the crotch to the ankle.</p>
                      </div>
                    </article>
                  </div>
                </div>

                <div className="size-guide-figure-panel">
                  <span className="size-guide-figure-label">HOUSE OF ORIVE SIZE GUIDE</span>
                  <img
                    className="size-guide-figure"
                    src={sizeGuideImage.src}
                    alt="House Of Orive body measurement reference showing chest, waist, low waist, hip and inseam positions"
                    loading="eager"
                    decoding="async"
                  />
                  <p>Use this guide to locate each measurement point. Measure over light clothing with the tape kept level.</p>
                </div>
              </div>

              <div className="size-guide-chart-section">
                <div className="size-guide-section-heading size-guide-chart-heading">
                  <span>02 / SIZE CHART</span>
                  <h3>Garment measurements</h3>
                  <p>All garment measurements below are in inches.</p>
                </div>

                <div className="size-guide-table-scroll">
                  <table className="size-guide-table">
                    <thead>
                      <tr>
                        <th>Size</th>
                        <th>Chest</th>
                        <th>Waist</th>
                        <th>Hip</th>
                        <th>Kurta length</th>
                        <th>Shalwar length</th>
                        <th>Shalwar (elastic)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { size: "XS", chest: 38, waist: 36, hip: 42, kurta: 32, shalwar: 39, elastic: 26 },
                        { size: "S", chest: 40, waist: 38, hip: 44, kurta: 32, shalwar: 39, elastic: 28 },
                        { size: "M", chest: 42, waist: 40, hip: 46, kurta: 32, shalwar: 39, elastic: 30 },
                        { size: "L", chest: 44, waist: 42, hip: 48, kurta: 32, shalwar: 39, elastic: 32 },
                        { size: "XL", chest: 46, waist: 44, hip: 50, kurta: 32, shalwar: 39, elastic: 34 },
                      ].map((row) => (
                        <tr key={row.size}>
                          <th scope="row">{row.size}</th>
                          <td>{row.chest}</td>
                          <td>{row.waist}</td>
                          <td>{row.hip}</td>
                          <td>{row.kurta}</td>
                          <td>{row.shalwar}</td>
                          <td>{row.elastic}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="size-guide-note">
                  <Icon icon="solar:info-circle-linear" width={18} height={18} />
                  <p>For XXL or help choosing between sizes, please contact our team before placing your order.</p>
                </div>
              </div>
            </div>

            <footer className="size-guide-footer">
              <span>HOUSE OF ORIVE</span>
              <span>Thoughtfully made. Made to fit.</span>
            </footer>
          </section>
        </div>
      )}

      <Footer />

      {/* RESPONSIVE */}

      <style jsx>{`
        .size-guide-backdrop {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(18, 17, 15, 0.68);
          -webkit-backdrop-filter: none;
          backdrop-filter: none;
        }

        .size-guide-dialog {
          display: flex;
          flex-direction: column;
          width: min(1120px, 100%);
          max-height: min(92vh, 940px);
          overflow: hidden;
          border: 0;
          border-radius: 0;
          background: #fbfaf7;
          color: #171613;
          box-shadow: 0 28px 90px rgba(0, 0, 0, 0.28);
        }

        .size-guide-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          padding: 28px 32px 24px;
          border-bottom: 1px solid #e7e2d9;
        }

        .size-guide-eyebrow,
        .size-guide-section-heading > span,
        .size-guide-figure-label {
          margin: 0;
          color: #8b7a64;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }

        .size-guide-header h2 {
          margin: 9px 0 7px;
          color: #171613;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(27px, 3.3vw, 40px);
          font-weight: 400;
          letter-spacing: -0.045em;
          line-height: 1.05;
        }

        .size-guide-header > div > p:last-child {
          margin: 0;
          color: #77716a;
          font-size: 12px;
          line-height: 1.65;
        }

        .size-guide-close {
          display: flex;
          flex: 0 0 38px;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border: 1px solid #e4ded5;
          border-radius: 0;
          background: #fff;
          color: #222;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .size-guide-close:hover {
          background: #171613;
          color: #fff;
        }

        .size-guide-body {
          overflow-y: auto;
          padding: 26px 32px 30px;
          overscroll-behavior: contain;
        }

        .size-guide-measure-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(330px, 0.95fr);
          gap: 30px;
          align-items: stretch;
          padding-bottom: 30px;
          border-bottom: 1px solid #e7e2d9;
        }

        .size-guide-section-heading h3 {
          margin: 8px 0 7px;
          color: #171613;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 25px;
          font-weight: 400;
          letter-spacing: -0.035em;
        }

        .size-guide-section-heading > p {
          margin: 0;
          color: #77716a;
          font-size: 12px;
          line-height: 1.7;
        }

        .size-guide-instruction-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px 22px;
          margin-top: 25px;
        }

        .size-guide-instruction-list article {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          min-width: 0;
        }

        .size-guide-step {
          display: inline-flex;
          flex: 0 0 27px;
          width: 27px;
          height: 27px;
          align-items: center;
          justify-content: center;
          border: 1px solid #ded6ca;
          border-radius: 0;
          color: #887965;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 11px;
        }

        .size-guide-instruction-list h4 {
          margin: 1px 0 5px;
          color: #24211d;
          font-size: 12px;
          font-weight: 700;
        }

        .size-guide-instruction-list p {
          margin: 0;
          color: #77716a;
          font-size: 11px;
          line-height: 1.7;
        }

        .size-guide-figure-panel {
          display: flex;
          min-width: 0;
          min-height: 0;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 0;
          border: 0;
          border-radius: 0;
          background: transparent;
          text-align: center;
        }

        .size-guide-figure {
          display: block;
          width: 100%;
          max-width: 520px;
          height: 500px;
          margin: 12px auto 14px;
          border: 0;
          border-radius: 0;
          object-fit: contain;
          object-position: center;
          background: transparent;
        }

        .size-guide-figure-panel > p {
          max-width: 340px;
          margin: 0;
          color: #82796e;
          font-size: 11px;
          line-height: 1.65;
        }

        .size-guide-image-fallback {
          display: flex;
          width: 100%;
          min-height: 410px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #77716a;
          text-align: center;
        }

        .size-guide-image-fallback p {
          margin: 0;
          color: #24211d;
          font-size: 14px;
          font-weight: 600;
        }

        .size-guide-image-fallback span {
          max-width: 260px;
          font-size: 11px;
          line-height: 1.6;
        }

        .size-guide-chart-section {
          padding-top: 27px;
        }

        .size-guide-chart-heading {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 0 15px;
          margin-bottom: 17px;
        }

        .size-guide-chart-heading > span {
          width: 100%;
        }

        .size-guide-chart-heading h3 {
          margin-bottom: 0;
        }

        .size-guide-chart-heading > p {
          font-size: 11px;
        }

        .size-guide-table-scroll {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #ded9d0;
          border-radius: 0;
          background: #fff;
          -webkit-overflow-scrolling: touch;
        }

        .size-guide-table {
          width: 100%;
          min-width: 790px;
          border-collapse: collapse;
          text-align: center;
        }

        .size-guide-table th,
        .size-guide-table td {
          padding: 13px 12px;
          border-right: 1px solid #e7e2d9;
          border-bottom: 1px solid #e7e2d9;
          font-size: 11px;
          white-space: nowrap;
        }

        .size-guide-table thead th {
          background: #171613;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .size-guide-table tbody th {
          background: #f7f5f1;
          color: #25221d;
          font-weight: 700;
        }

        .size-guide-table tbody td {
          color: #55504a;
        }

        .size-guide-table tr:last-child th,
        .size-guide-table tr:last-child td {
          border-bottom: 0;
        }

        .size-guide-table th:last-child,
        .size-guide-table td:last-child {
          border-right: 0;
        }

        .size-guide-note {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-top: 15px;
          padding: 12px 14px;
          border: 1px solid #e5ddd0;
          border-radius: 0;
          background: #f4f0e8;
          color: #6f6251;
        }

        .size-guide-note :global(svg) {
          flex: 0 0 auto;
          margin-top: 1px;
        }

        .size-guide-note p {
          margin: 0;
          font-size: 11px;
          line-height: 1.6;
        }

        .size-guide-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 13px 32px;
          border-top: 1px solid #e7e2d9;
          background: #f6f3ed;
          color: #8b7a64;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .size-guide-footer span:last-child {
          color: #8b857c;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-align: right;
        }

        @media (max-width: 760px) {
          .size-guide-backdrop {
            align-items: flex-end;
            padding: 10px;
          }

          .size-guide-dialog {
            width: 100%;
            max-height: 94vh;
            border-radius: 0;
          }

          .size-guide-header {
            padding: 21px 19px 18px;
          }

          .size-guide-header h2 {
            font-size: 29px;
          }

          .size-guide-body {
            padding: 20px 19px 23px;
          }

          .size-guide-measure-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .size-guide-instruction-list {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .size-guide-figure-panel {
            min-height: 0;
            padding: 0;
          }

          .size-guide-figure {
            width: 100%;
            max-width: 440px;
            height: 400px;
            margin: 10px auto 12px;
          }

          .size-guide-image-fallback {
            min-height: 320px;
          }

          .size-guide-footer {
            padding: 12px 19px;
            font-size: 7px;
          }
        }

        @media (max-width: 420px) {
          .size-guide-backdrop {
            padding: 0;
          }

          .size-guide-dialog {
            max-height: 96vh;
            border-radius: 0;
          }

          .size-guide-header {
            gap: 10px;
            padding: 18px 15px 15px;
          }

          .size-guide-close {
            flex-basis: 34px;
            width: 34px;
            height: 34px;
          }

          .size-guide-body {
            padding: 18px 15px 20px;
          }

          .size-guide-figure-panel {
            min-height: 0;
          }

          .size-guide-figure {
            height: 340px;
          }

          .size-guide-image-fallback {
            min-height: 285px;
          }

          .size-guide-footer {
            padding: 11px 15px;
          }
        }


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