"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/components/CartContext";

export default function CartPage() {
  const {
    cartItems,
    cartTotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  /*
  |--------------------------------------------------------------------------
  | EMPTY CART
  |--------------------------------------------------------------------------
  */

  if (cartItems.length === 0) {
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
            background: "#ffffff",
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
                width: "85px",
                height: "85px",
                margin: "0 auto 25px",
                borderRadius: "50%",
                background: "#f5f5f3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon
                icon="solar:cart-large-2-linear"
                width="38"
                height="38"
                style={{
                  color: "#111111",
                }}
              />
            </div>

            <h1
              style={{
                margin: 0,
                fontSize: "40px",
                lineHeight: "1.1",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                color: "#111111",
              }}
            >
              Your Cart is Empty
            </h1>

            <p
              style={{
                margin: "15px 0 28px",
                fontSize: "14px",
                lineHeight: "1.7",
                color: "#777777",
              }}
            >
              Looks like you haven't added anything to
              your cart yet.
            </p>

            <Link
              href="/products"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                padding: "14px 25px",
                borderRadius: "999px",
                background: "#111111",
                color: "#ffffff",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              Continue Shopping

              <Icon
                icon="solar:arrow-right-linear"
                width="18"
                height="18"
              />
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | CART PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <>
      <Navbar />

      <main
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "#ffffff",
          paddingBottom: "100px",
        }}
      >
        <section
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "70px 40px",
          }}
        >
          {/* HEADER */}

          <div
            className="cart-header"
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
                    display: "block",
                    background: "#111111",
                  }}
                />

                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    color: "#777777",
                  }}
                >
                  Shopping Bag
                </span>
              </div>

              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(42px, 5vw, 58px)",
                  lineHeight: "1",
                  fontWeight: 600,
                  letterSpacing: "-0.045em",
                  color: "#111111",
                }}
              >
                Your Cart
              </h1>
            </div>

            <span
              style={{
                fontSize: "13px",
                color: "#777777",
              }}
            >
              {cartItems.length}{" "}
              {cartItems.length === 1
                ? "Item"
                : "Items"}
            </span>
          </div>

          {/* CART CONTENT */}

          <div
            className="cart-content-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1fr) 380px",
              gap: "50px",
              alignItems: "start",
            }}
          >
            {/* CART ITEMS */}

            <div>
              {cartItems.map((item) => {
                const product = item.product as any;

                const productImage =
                  product.images?.[0] ||
                  product.image ||
                  "";

                const categoryName =
                  typeof product.category ===
                  "string"
                    ? product.category
                    : product.category?.name ||
                      "Product";

                const stock =
                  typeof product.stock ===
                  "number"
                    ? product.stock
                    : null;

                const canIncrease =
                  stock === null ||
                  item.quantity < stock;

                return (
                  <div
                    key={`${product.id}-${item.size}-${item.color}`}
                    className="cart-item"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "130px minmax(0, 1fr) auto",
                      gap: "22px",
                      padding: "20px 0",
                      borderBottom:
                        "1px solid #eeeeee",
                    }}
                  >
                    {/* PRODUCT IMAGE */}

                    <Link
                      href={`/products/${product.slug}`}
                      style={{
                        display: "block",
                        width: "130px",
                        height: "155px",
                        overflow: "hidden",
                        borderRadius: "12px",
                        background: "#f3f3f1",
                      }}
                    >
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            color: "#999999",
                          }}
                        >
                          <Icon
                            icon="solar:gallery-linear"
                            width="32"
                          />
                        </div>
                      )}
                    </Link>

                    {/* PRODUCT INFO */}

                    <div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 500,
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            "0.16em",
                          color: "#888888",
                        }}
                      >
                        {categoryName}
                      </span>

                      <Link
                        href={`/products/${product.slug}`}
                        style={{
                          display: "block",
                          marginTop: "7px",
                          color: "#111111",
                          textDecoration:
                            "none",
                          fontSize: "17px",
                          lineHeight: "1.4",
                          fontWeight: 600,
                        }}
                      >
                        {product.name}
                      </Link>

                      {/* SIZE */}

                      {item.size && (
                        <p
                          style={{
                            margin:
                              "10px 0 0",
                            fontSize: "12px",
                            color: "#777777",
                          }}
                        >
                          Size: {item.size}
                        </p>
                      )}

                      {/* COLOR */}

                      {item.color && (
                        <p
                          style={{
                            margin:
                              "5px 0 0",
                            fontSize: "12px",
                            color: "#777777",
                          }}
                        >
                          Color: {item.color}
                        </p>
                      )}

                      {/* QUANTITY */}

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          width: "115px",
                          height: "40px",
                          marginTop: "18px",
                          border:
                            "1px solid #dddddd",
                          borderRadius: "7px",
                          overflow: "hidden",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              product.id,
                              Math.max(
                                1,
                                item.quantity -
                                  1
                              ),
                              item.size,
                              item.color
                            )
                          }
                          disabled={
                            item.quantity <= 1
                          }
                          style={{
                            ...quantityButtonStyle,
                            cursor:
                              item.quantity <=
                              1
                                ? "not-allowed"
                                : "pointer",
                            color:
                              item.quantity <=
                              1
                                ? "#bbbbbb"
                                : "#111111",
                          }}
                          aria-label="Decrease quantity"
                        >
                          <Icon
                            icon="solar:minus-linear"
                            width="15"
                            height="15"
                          />
                        </button>

                        <span
                          style={{
                            flex: 1,
                            textAlign: "center",
                            fontSize: "13px",
                            fontWeight: 600,
                          }}
                        >
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            if (!canIncrease) {
                              return;
                            }

                            updateQuantity(
                              product.id,
                              item.quantity +
                                1,
                              item.size,
                              item.color
                            );
                          }}
                          disabled={!canIncrease}
                          style={{
                            ...quantityButtonStyle,
                            cursor:
                              !canIncrease
                                ? "not-allowed"
                                : "pointer",
                            color:
                              !canIncrease
                                ? "#bbbbbb"
                                : "#111111",
                          }}
                          aria-label="Increase quantity"
                        >
                          <Icon
                            icon="solar:add-linear"
                            width="15"
                            height="15"
                          />
                        </button>
                      </div>

                      {/* STOCK MESSAGE */}

                      {stock !== null &&
                        stock > 0 &&
                        stock <= 5 && (
                          <p
                            style={{
                              margin:
                                "8px 0 0",
                              fontSize: "11px",
                              color: "#9a6b00",
                            }}
                          >
                            Only {stock} left
                            in stock
                          </p>
                        )}

                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(
                            product.id,
                            item.size,
                            item.color
                          )
                        }
                        style={{
                          marginTop: "13px",
                          padding: 0,
                          border: "none",
                          background:
                            "none",
                          color: "#888888",
                          fontSize: "11px",
                          textDecoration:
                            "underline",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>

                    {/* ITEM TOTAL */}

                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#111111",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      ₹
                      {(
                        Number(
                          product.price || 0
                        ) * item.quantity
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORDER SUMMARY */}

            <div
              className="cart-summary"
              style={{
                position: "sticky",
                top: "30px",
                padding: "30px",
                borderRadius: "18px",
                background: "#f7f7f5",
                boxSizing: "border-box",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#111111",
                }}
              >
                Order Summary
              </h2>

              {/* DIVIDER */}

              <div
                style={{
                  height: "1px",
                  background: "#e3e3e1",
                  margin: "25px 0",
                }}
              />

              {/* SUBTOTAL */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  fontSize: "14px",
                  color: "#666666",
                }}
              >
                <span>Subtotal</span>

                <span>
                  ₹
                  {cartTotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              {/* SHIPPING */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  marginTop: "14px",
                  fontSize: "14px",
                  color: "#666666",
                }}
              >
                <span>Shipping</span>

                <span
                  style={{
                    color: "#111111",
                    fontWeight: 600,
                  }}
                >
                  Free
                </span>
              </div>

              {/* DIVIDER */}

              <div
                style={{
                  height: "1px",
                  background: "#e3e3e1",
                  margin: "25px 0",
                }}
              />

              {/* TOTAL */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#111111",
                }}
              >
                <span>Total</span>

                <span>
                  ₹
                  {cartTotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              {/* CHECKOUT */}

              <Link
                href="/checkout"
                style={{
                  width: "100%",
                  height: "62px",
                  marginTop: "30px",
                  borderRadius: "40px",
                  background: "#111111",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  boxSizing: "border-box",
                  textDecoration: "none",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Proceed to Checkout
              </Link>

              {/* CONTINUE SHOPPING */}

              <Link
                href="/products"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  gap: "8px",
                  color: "#555555",
                  textDecoration: "none",
                  fontSize: "14px",
                  marginTop: "22px",
                }}
              >
                <Icon
                  icon="solar:arrow-left-linear"
                  width="18"
                />

                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* RESPONSIVE */}

      <style jsx>{`
        @media (max-width: 1000px) {
          .cart-content-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }

          .cart-summary {
            position: static !important;
          }
        }

        @media (max-width: 700px) {
          .cart-header {
            align-items: flex-start !important;
            flex-direction: column !important;
            gap: 15px !important;
            margin-bottom: 30px !important;
          }

          .cart-item {
            grid-template-columns:
              95px minmax(0, 1fr) !important;
            gap: 15px !important;
          }

          .cart-item > a {
            width: 95px !important;
            height: 120px !important;
          }

          .cart-item
            > div:last-child {
            grid-column: 2;
            grid-row: 1;
          }
        }

        @media (max-width: 520px) {
          .cart-header h1 {
            font-size: 42px !important;
          }

          .cart-item {
            grid-template-columns:
              82px minmax(0, 1fr) !important;
            gap: 12px !important;
          }

          .cart-item > a {
            width: 82px !important;
            height: 105px !important;
          }

          .cart-item
            > div:last-child {
            font-size: 14px !important;
          }

          .cart-summary {
            padding: 22px !important;
            border-radius: 14px !important;
          }
        }
      `}</style>
    </>
  );
}

/*
|--------------------------------------------------------------------------
| QUANTITY BUTTON
|--------------------------------------------------------------------------
*/

const quantityButtonStyle = {
  width: "35px",
  height: "35px",
  flexShrink: 0,
  border: "none",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#111111",
};