"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

interface Order {
  _id: string;

  items: OrderItem[];

  customer: {
    name: string;
    email: string;
    phone: string;
  };

  shippingAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };

  deliveryMethod: string;

  paymentMethod: "cod" | "online";

  paymentStatus:
    | "pending"
    | "paid"
    | "failed";

  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

  subtotal: number;
  shipping: number;
  total: number;

  createdAt: string;
  updatedAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =========================================
     FETCH ORDERS
  ========================================= */

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/orders",
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load orders."
        );
      }

      setOrders(
        Array.isArray(data.orders)
          ? data.orders
          : []
      );
    } catch (error) {
      console.error(
        "Fetch orders error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load your orders."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     FORMAT DATE
  ========================================= */

  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =========================================
     FORMAT CURRENCY
  ========================================= */

  const formatPrice = (
    price: number
  ) => {
    return Number(
      price || 0
    ).toLocaleString("en-IN");
  };

  /* =========================================
     STATUS ICON
  ========================================= */

  const getStatusIcon = (
    status: Order["orderStatus"]
  ) => {
    switch (status) {
      case "delivered":
        return "solar:check-circle-bold";

      case "shipped":
        return "solar:delivery-bold";

      case "processing":
        return "solar:box-bold";

      case "confirmed":
        return "solar:check-circle-bold";

      case "cancelled":
        return "solar:close-circle-bold";

      default:
        return "solar:clock-circle-bold";
    }
  };

  /* =========================================
     STATUS LABEL
  ========================================= */

  const getStatusLabel = (
    status: Order["orderStatus"]
  ) => {
    switch (status) {
      case "pending":
        return "Order Placed";

      case "confirmed":
        return "Confirmed";

      case "processing":
        return "Processing";

      case "shipped":
        return "Shipped";

      case "delivered":
        return "Delivered";

      case "cancelled":
        return "Cancelled";

      default:
        return status;
    }
  };

  /* =========================================
     PAYMENT STATUS
  ========================================= */

  const getPaymentLabel = (
    status: Order["paymentStatus"]
  ) => {
    switch (status) {
      case "paid":
        return "Paid";

      case "failed":
        return "Failed";

      default:
        return "Pending";
    }
  };

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <>
        <Navbar />

        <main
          className="orders-loading"
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            background: "#f7f7f5",
            padding: "60px 20px",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <Icon
              icon="solar:refresh-circle-bold"
              width="40"
              height="40"
              style={{
                animation:
                  "spin 1s linear infinite",
              }}
            />

            <p
              style={{
                marginTop: "15px",
                color: "#777777",
                fontSize: "13px",
              }}
            >
              Loading your orders...
            </p>
          </div>

          <style jsx>{`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }

              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </main>

        <Footer />
      </>
    );
  }

  /* =========================================
     ERROR
  ========================================= */

  if (error) {
    return (
      <>
        <Navbar />

        <main
          style={{
            minHeight: "70vh",
            background: "#f7f7f5",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            padding: "60px 20px",
          }}
        >
          <div
            className="error-card"
            style={{
              width: "100%",
              maxWidth: "470px",
              background: "#ffffff",
              borderRadius: "20px",
              padding: "45px 30px",
              textAlign: "center",
              boxShadow:
                "0 10px 35px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                width: "65px",
                height: "65px",
                margin: "0 auto",
                borderRadius:
                  "50%",
                background: "#f3f3f3",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <Icon
                icon="solar:lock-keyhole-linear"
                width="30"
                height="30"
              />
            </div>

            <h2
              style={{
                margin:
                  "20px 0 10px",
                fontSize: "25px",
                fontWeight: 600,
                color: "#111111",
              }}
            >
              Please Login
            </h2>

            <p
              style={{
                margin: 0,
                color: "#777777",
                fontSize: "13px",
                lineHeight: "1.7",
              }}
            >
              {error}
            </p>

            <Link
              href="/login"
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: "8px",
                marginTop: "25px",
                height: "48px",
                padding:
                  "0 25px",
                borderRadius:
                  "999px",
                background:
                  "#111111",
                color: "#ffffff",
                textDecoration:
                  "none",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Go to Login

              <Icon
                icon="solar:arrow-right-linear"
                width="17"
              />
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  /* =========================================
     MAIN PAGE
  ========================================= */

  return (
    <>
      <Navbar />

      <main
        className="orders-page"
        style={{
          minHeight: "70vh",
          background: "#f7f7f5",
          padding:
            "70px 20px 100px",
        }}
      >
        <div
          className="orders-container"
          style={{
            width: "100%",
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          {/* =================================
              HEADER
          ================================= */}

          <div
            className="orders-header"
            style={{
              marginBottom: "40px",
            }}
          >
            <Link
              href="/account"
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: "7px",
                color: "#666666",
                textDecoration:
                  "none",
                fontSize: "12px",
                marginBottom:
                  "20px",
              }}
            >
              <Icon
                icon="solar:arrow-left-linear"
                width="16"
              />

              Back to Account
            </Link>

            <span
              style={{
                display: "block",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing:
                  "0.2em",
                textTransform:
                  "uppercase",
                color: "#888888",
              }}
            >
              Purchase History
            </span>

            <h1
              className="orders-title"
              style={{
                margin:
                  "8px 0 0",
                fontSize:
                  "clamp(36px, 5vw, 50px)",
                lineHeight: 1,
                fontWeight: 600,
                letterSpacing:
                  "-0.045em",
                color: "#111111",
              }}
            >
              My Orders
            </h1>

            <p
              style={{
                margin:
                  "14px 0 0",
                color: "#777777",
                fontSize: "13px",
              }}
            >
              View and track your
              recent purchases.
            </p>
          </div>

          {/* =================================
              EMPTY STATE
          ================================= */}

          {orders.length === 0 ? (
            <div
              className="empty-orders"
              style={{
                background:
                  "#ffffff",
                borderRadius:
                  "20px",
                padding:
                  "75px 25px",
                textAlign:
                  "center",
                boxShadow:
                  "0 8px 30px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  width: "75px",
                  height: "75px",
                  margin:
                    "0 auto",
                  borderRadius:
                    "50%",
                  background:
                    "#f3f3f3",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <Icon
                  icon="solar:bag-4-linear"
                  width="35"
                  height="35"
                />
              </div>

              <h2
                style={{
                  margin:
                    "22px 0 10px",
                  fontSize:
                    "25px",
                  fontWeight: 600,
                  color:
                    "#111111",
                }}
              >
                No Orders Yet
              </h2>

              <p
                style={{
                  margin: 0,
                  color:
                    "#777777",
                  fontSize:
                    "13px",
                }}
              >
                You haven't placed
                any orders yet.
              </p>

              <Link
                href="/products"
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: "8px",
                  marginTop:
                    "25px",
                  height: "48px",
                  padding:
                    "0 25px",
                  borderRadius:
                    "999px",
                  background:
                    "#111111",
                  color:
                    "#ffffff",
                  textDecoration:
                    "none",
                  fontSize:
                    "12px",
                  fontWeight: 600,
                }}
              >
                Start Shopping

                <Icon
                  icon="solar:arrow-right-linear"
                  width="17"
                />
              </Link>
            </div>
          ) : (
            <div
              className="orders-list"
              style={{
                display: "grid",
                gap: "20px",
              }}
            >
              {orders.map(
                (order) => (
                  <div
                    key={order._id}
                    className="order-card"
                    style={{
                      background:
                        "#ffffff",
                      borderRadius:
                        "20px",
                      padding:
                        "28px",
                      boxShadow:
                        "0 8px 30px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* =================================
                        ORDER HEADER
                    ================================= */}

                    <div
                      className="order-header"
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "flex-start",
                        justifyContent:
                          "space-between",
                        gap: "20px",
                        paddingBottom:
                          "22px",
                        borderBottom:
                          "1px solid #eeeeee",
                      }}
                    >
                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            display:
                              "block",
                            fontSize:
                              "9px",
                            fontWeight:
                              600,
                            letterSpacing:
                              "0.15em",
                            textTransform:
                              "uppercase",
                            color:
                              "#999999",
                          }}
                        >
                          Order ID
                        </span>

                        <strong
                          style={{
                            display:
                              "block",
                            marginTop:
                              "7px",
                            fontSize:
                              "13px",
                            fontWeight:
                              600,
                            color:
                              "#111111",
                            wordBreak:
                              "break-all",
                          }}
                        >
                          #{order._id}
                        </strong>

                        <span
                          style={{
                            display:
                              "block",
                            marginTop:
                              "7px",
                            fontSize:
                              "11px",
                            color:
                              "#888888",
                          }}
                        >
                          {formatDate(
                            order.createdAt
                          )}
                        </span>
                      </div>

                      {/* STATUS */}

                      <div
                        className={`order-status status-${order.orderStatus}`}
                        style={{
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          gap: "7px",
                          padding:
                            "9px 13px",
                          borderRadius:
                            "999px",
                          fontSize:
                            "11px",
                          fontWeight:
                            600,
                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        <Icon
                          icon={getStatusIcon(
                            order.orderStatus
                          )}
                          width="16"
                          height="16"
                        />

                        {getStatusLabel(
                          order.orderStatus
                        )}
                      </div>
                    </div>

                    {/* =================================
                        PRODUCTS
                    ================================= */}

                    <div
                      className="order-products"
                      style={{
                        display:
                          "grid",
                        gap: "15px",
                        padding:
                          "22px 0",
                      }}
                    >
                      {order.items.map(
                        (
                          item,
                          index
                        ) => (
                          <div
                            key={`${order._id}-${index}`}
                            className="order-product"
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "15px",
                            }}
                          >
                            {/* IMAGE */}

                            <div
                              className="order-product-image"
                              style={{
                                width:
                                  "78px",
                                height:
                                  "88px",
                                flexShrink:
                                  0,
                                borderRadius:
                                  "10px",
                                overflow:
                                  "hidden",
                                background:
                                  "#f4f4f4",
                              }}
                            >
                              {item.image ? (
                                <img
                                  src={
                                    item.image
                                  }
                                  alt={
                                    item.name
                                  }
                                  style={{
                                    width:
                                      "100%",
                                    height:
                                      "100%",
                                    objectFit:
                                      "cover",
                                    display:
                                      "block",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width:
                                      "100%",
                                    height:
                                      "100%",
                                    display:
                                      "flex",
                                    alignItems:
                                      "center",
                                    justifyContent:
                                      "center",
                                  }}
                                >
                                  <Icon
                                    icon="solar:gallery-linear"
                                    width="25"
                                    color="#aaaaaa"
                                  />
                                </div>
                              )}
                            </div>

                            {/* PRODUCT INFO */}

                            <div
                              style={{
                                flex:
                                  1,
                                minWidth:
                                  0,
                              }}
                            >
                              <h3
                                style={{
                                  margin:
                                    0,
                                  fontSize:
                                    "14px",
                                  fontWeight:
                                    600,
                                  color:
                                    "#111111",
                                }}
                              >
                                {
                                  item.name
                                }
                              </h3>

                              <p
                                style={{
                                  margin:
                                    "7px 0 0",
                                  fontSize:
                                    "11px",
                                  color:
                                    "#777777",
                                  lineHeight:
                                    "1.6",
                                }}
                              >
                                Qty:{" "}
                                {
                                  item.quantity
                                }

                                {item.size &&
                                  ` · Size: ${item.size}`}

                                {item.color &&
                                  ` · ${item.color}`}
                              </p>

                              <p
                                style={{
                                  margin:
                                    "6px 0 0",
                                  fontSize:
                                    "11px",
                                  color:
                                    "#999999",
                                }}
                              >
                                ₹
                                {formatPrice(
                                  item.price
                                )}{" "}
                                / item
                              </p>
                            </div>

                            {/* ITEM TOTAL */}

                            <strong
                              className="item-total"
                              style={{
                                fontSize:
                                  "13px",
                                fontWeight:
                                  600,
                                whiteSpace:
                                  "nowrap",
                                color:
                                  "#111111",
                              }}
                            >
                              ₹
                              {formatPrice(
                                item.price *
                                  item.quantity
                              )}
                            </strong>
                          </div>
                        )
                      )}
                    </div>

                    {/* =================================
                        SHIPPING ADDRESS
                    ================================= */}

                    <div
                      className="shipping-box"
                      style={{
                        padding:
                          "18px",
                        borderRadius:
                          "12px",
                        background:
                          "#f7f7f5",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "8px",
                          fontSize:
                            "11px",
                          fontWeight:
                            600,
                          textTransform:
                            "uppercase",
                          letterSpacing:
                            "0.08em",
                          color:
                            "#555555",
                        }}
                      >
                        <Icon
                          icon="solar:map-point-linear"
                          width="17"
                        />

                        Delivery Address
                      </div>

                      <p
                        style={{
                          margin:
                            "9px 0 0",
                          fontSize:
                            "12px",
                          lineHeight:
                            "1.6",
                          color:
                            "#777777",
                        }}
                      >
                        {
                          order
                            .shippingAddress
                            .address
                        }
                        ,{" "}
                        {
                          order
                            .shippingAddress
                            .city
                        }
                        ,{" "}
                        {
                          order
                            .shippingAddress
                            .state
                        }{" "}
                        -{" "}
                        {
                          order
                            .shippingAddress
                            .pincode
                        }
                      </p>
                    </div>

                    {/* =================================
                        ORDER FOOTER
                    ================================= */}

                    <div
                      className="order-footer"
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        gap: "20px",
                        flexWrap:
                          "wrap",
                        marginTop:
                          "20px",
                        paddingTop:
                          "20px",
                        borderTop:
                          "1px solid #eeeeee",
                      }}
                    >
                      {/* PAYMENT */}

                      <div
                        className="payment-info"
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            width:
                              "38px",
                            height:
                              "38px",
                            borderRadius:
                              "10px",
                            background:
                              "#f5f5f5",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                          }}
                        >
                          <Icon
                            icon={
                              order.paymentMethod ===
                              "cod"
                                ? "solar:hand-money-linear"
                                : "solar:card-linear"
                            }
                            width="19"
                          />
                        </div>

                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize:
                                "9px",
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.1em",
                              color:
                                "#999999",
                            }}
                          >
                            Payment
                          </p>

                          <strong
                            style={{
                              display:
                                "block",
                              marginTop:
                                "4px",
                              fontSize:
                                "11px",
                              color:
                                "#333333",
                            }}
                          >
                            {order.paymentMethod ===
                            "cod"
                              ? "Cash on Delivery"
                              : "Online Payment"}
                          </strong>

                          <span
                            style={{
                              display:
                                "block",
                              marginTop:
                                "3px",
                              fontSize:
                                "10px",
                              color:
                                order.paymentStatus ===
                                "failed"
                                  ? "#b00020"
                                  : "#777777",
                            }}
                          >
                            {getPaymentLabel(
                              order.paymentStatus
                            )}
                          </span>
                        </div>
                      </div>

                      {/* TOTAL + VIEW */}

                      <div
                        className="order-footer-right"
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "20px",
                        }}
                      >
                        <div
                          className="order-total"
                          style={{
                            textAlign:
                              "right",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "block",
                              fontSize:
                                "9px",
                              textTransform:
                                "uppercase",
                              letterSpacing:
                                "0.1em",
                              color:
                                "#999999",
                            }}
                          >
                            Total
                          </span>

                          <strong
                            style={{
                              display:
                                "block",
                              marginTop:
                                "4px",
                              fontSize:
                                "20px",
                              fontWeight:
                                600,
                              color:
                                "#111111",
                            }}
                          >
                            ₹
                            {formatPrice(
                              order.total
                            )}
                          </strong>
                        </div>

                        <Link
                          href={`/orders/${order._id}`}
                          className="view-order-button"
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            gap: "7px",
                            minHeight:
                              "42px",
                            padding:
                              "0 17px",
                            borderRadius:
                              "999px",
                            background:
                              "#111111",
                            color:
                              "#ffffff",
                            textDecoration:
                              "none",
                            fontSize:
                              "11px",
                            fontWeight:
                              600,
                            whiteSpace:
                              "nowrap",
                            boxSizing:
                              "border-box",
                          }}
                        >
                          View Order

                          <Icon
                            icon="solar:arrow-right-linear"
                            width="16"
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* =================================
          RESPONSIVE
      ================================= */}

      <style jsx>{`
        .status-pending {
          background: #f5f5f5;
          color: #555555;
        }

        .status-confirmed {
          background: #f1f1f1;
          color: #222222;
        }

        .status-processing {
          background: #eeeeee;
          color: #333333;
        }

        .status-shipped {
          background: #e9e9e9;
          color: #222222;
        }

        .status-delivered {
          background: #e7e7e7;
          color: #111111;
        }

        .status-cancelled {
          background: #f1f1f1;
          color: #777777;
        }

        .view-order-button {
          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }

        .view-order-button:hover {
          transform: translateY(-1px);
          opacity: 0.88;
        }

        @media (max-width: 700px) {
          .orders-page {
            padding:
              50px 15px 70px !important;
          }

          .order-card {
            padding: 20px !important;
            border-radius:
              16px !important;
          }

          .order-header {
            flex-direction: column !important;
            gap: 15px !important;
          }

          .order-status {
            align-self: flex-start;
          }

          .order-footer {
            align-items:
              flex-start !important;
          }

          .order-footer-right {
            width: 100%;
            justify-content:
              space-between;
          }
        }

        @media (max-width: 480px) {
          .orders-header {
            margin-bottom:
              28px !important;
          }

          .order-product {
            align-items:
              flex-start !important;
          }

          .order-product-image {
            width: 65px !important;
            height: 75px !important;
          }

          .item-total {
            font-size:
              12px !important;
          }

          .shipping-box {
            padding: 15px !important;
          }

          .order-footer {
            flex-direction:
              column !important;
            align-items:
              stretch !important;
          }

          .payment-info {
            width: 100%;
          }

          .order-footer-right {
            width: 100%;
            display: grid !important;
            grid-template-columns:
              1fr auto;
            align-items:
              center !important;
            gap: 12px !important;
          }

          .order-total {
            text-align:
              left !important;
          }

          .view-order-button {
            min-width:
              125px;
          }
        }

        @media (max-width: 359px) {
          .orders-page {
            padding:
              40px 12px 60px !important;
          }

          .order-card {
            padding: 17px !important;
          }

          .order-product-image {
            width: 58px !important;
            height: 68px !important;
          }

          .order-product h3 {
            font-size:
              12px !important;
          }

          .order-product p {
            font-size:
              10px !important;
          }

          .order-footer-right {
            grid-template-columns:
              1fr !important;
          }

          .view-order-button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}