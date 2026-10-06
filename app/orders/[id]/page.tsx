"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

const trackingSteps = [
  {
    status: "pending",
    title: "Order Placed",
    description:
      "Your order has been successfully placed.",
    icon: "solar:bag-4-bold",
  },
  {
    status: "confirmed",
    title: "Order Confirmed",
    description:
      "Your order has been confirmed.",
    icon: "solar:check-circle-bold",
  },
  {
    status: "processing",
    title: "Processing",
    description:
      "Your order is being prepared.",
    icon: "solar:box-bold",
  },
  {
    status: "shipped",
    title: "Shipped",
    description:
      "Your order has been handed over to the courier.",
    icon: "solar:delivery-bold",
  },
  {
    status: "delivered",
    title: "Delivered",
    description:
      "Your order has been delivered successfully.",
    icon: "solar:home-2-bold",
  },
];

const statusOrder = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

export default function OrderDetailsPage() {
  const params = useParams();

  const orderId = params.id as string;

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* =========================================
     FETCH ORDER
  ========================================= */

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/orders/${orderId}`,
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
            "Unable to load order."
        );
      }

      setOrder(data.order);
    } catch (error) {
      console.error(
        "FETCH ORDER ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load order."
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
        month: "long",
        year: "numeric",
      }
    );
  };

  /* =========================================
     FORMAT PRICE
  ========================================= */

  const formatPrice = (
    price: number
  ) => {
    return Number(
      price || 0
    ).toLocaleString("en-IN");
  };

  /* =========================================
     STATUS LABEL
  ========================================= */

  const getStatusLabel = (
    status: string
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
     STATUS ICON
  ========================================= */

  const getStatusIcon = (
    status: string
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
     TRACKING STEP STATE
  ========================================= */

  const getStepState = (
    status: string
  ) => {
    if (!order) {
      return "upcoming";
    }

    if (
      order.orderStatus ===
      "cancelled"
    ) {
      return "cancelled";
    }

    const currentIndex =
      statusOrder.indexOf(
        order.orderStatus
      );

    const stepIndex =
      statusOrder.indexOf(status);

    if (
      stepIndex <= currentIndex
    ) {
      return "completed";
    }

    return "upcoming";
  };

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {
    return (
      <>
        <Navbar />

        <main
          className="order-loading"
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
              width="42"
              height="42"
              style={{
                animation:
                  "spin 1s linear infinite",
              }}
            />

            <p
              style={{
                marginTop: "15px",
                color: "#777",
                fontSize: "13px",
              }}
            >
              Loading order...
            </p>
          </div>
        </main>

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

        <Footer />
      </>
    );
  }

  /* =========================================
     ERROR / NOT FOUND
  ========================================= */

  if (error || !order) {
    return (
      <>
        <Navbar />

        <main
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            padding: "60px 20px",
            background: "#f7f7f5",
          }}
        >
          <div
            className="error-card"
            style={{
              width: "100%",
              maxWidth: "500px",
              background: "#ffffff",
              borderRadius: "20px",
              padding:
                "50px 25px",
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
                background:
                  "#f2f2f2",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              <Icon
                icon="solar:danger-circle-bold"
                width="34"
                height="34"
              />
            </div>

            <h2
              style={{
                fontSize: "24px",
                marginTop: "20px",
                marginBottom:
                  "10px",
                color: "#111",
              }}
            >
              Order Not Found
            </h2>

            <p
              style={{
                color: "#777",
                fontSize: "13px",
                lineHeight: 1.7,
                marginBottom:
                  "25px",
              }}
            >
              {error ||
                "We couldn't find this order."}
            </p>

            <Link
              href="/orders"
              style={{
                display:
                  "inline-flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                gap: "8px",
                background: "#111",
                color: "#fff",
                padding:
                  "13px 22px",
                borderRadius:
                  "999px",
                textDecoration:
                  "none",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              <Icon
                icon="solar:arrow-left-linear"
                width="17"
              />

              Back to Orders
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
        className="order-details-page"
        style={{
          minHeight: "70vh",
          background: "#f7f7f5",
          padding:
            "60px 20px 100px",
        }}
      >
        <div
          className="order-details-container"
          style={{
            width: "100%",
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          {/* =================================
              BACK
          ================================= */}

          <Link
            href="/orders"
            style={{
              display:
                "inline-flex",
              alignItems:
                "center",
              gap: "7px",
              color: "#666",
              textDecoration:
                "none",
              fontSize: "12px",
              marginBottom:
                "25px",
            }}
          >
            <Icon
              icon="solar:arrow-left-linear"
              width="17"
            />

            Back to Orders
          </Link>

          {/* =================================
              ORDER HEADER
          ================================= */}

          <section
            className="order-main-header"
            style={{
              background: "#fff",
              borderRadius:
                "20px",
              padding: "30px",
              marginBottom:
                "20px",
              boxShadow:
                "0 8px 30px rgba(0,0,0,0.04)",
            }}
          >
            <div
              className="order-header-content"
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "flex-start",
                gap: "20px",
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
                    fontSize: "9px",
                    fontWeight: 600,
                    letterSpacing:
                      "0.18em",
                    textTransform:
                      "uppercase",
                    color: "#999",
                  }}
                >
                  Order
                </span>

                <h1
                  style={{
                    margin:
                      "8px 0",
                    fontSize:
                      "clamp(22px, 4vw, 30px)",
                    fontWeight: 600,
                    letterSpacing:
                      "-0.03em",
                    color: "#111",
                    wordBreak:
                      "break-all",
                  }}
                >
                  #{order._id}
                </h1>

                <p
                  style={{
                    margin: 0,
                    color: "#777",
                    fontSize: "12px",
                  }}
                >
                  Placed on{" "}
                  {formatDate(
                    order.createdAt
                  )}
                </p>
              </div>

              <div
                className={`order-status status-${order.orderStatus}`}
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: "7px",
                  padding:
                    "9px 14px",
                  borderRadius:
                    "999px",
                  fontSize: "11px",
                  fontWeight: 600,
                  whiteSpace:
                    "nowrap",
                }}
              >
                <Icon
                  icon={getStatusIcon(
                    order.orderStatus
                  )}
                  width="17"
                />

                {getStatusLabel(
                  order.orderStatus
                )}
              </div>
            </div>
          </section>

          {/* =================================
              ORDER TRACKING
          ================================= */}

          <section
            className="tracking-card"
            style={{
              background: "#fff",
              borderRadius:
                "20px",
              padding: "30px",
              marginBottom:
                "20px",
              boxShadow:
                "0 8px 30px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "10px",
                marginBottom:
                  "30px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius:
                    "12px",
                  background:
                    "#f3f3f3",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <Icon
                  icon="solar:map-arrow-right-linear"
                  width="21"
                />
              </div>

              <h2
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: 600,
                  color: "#111",
                }}
              >
                Order Tracking
              </h2>
            </div>

            {order.orderStatus ===
            "cancelled" ? (
              <div
                className="cancelled-box"
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  gap: "14px",
                  padding: "20px",
                  borderRadius:
                    "12px",
                  background:
                    "#f5f5f5",
                }}
              >
                <div
                  style={{
                    width: "42px",
                    height: "42px",
                    minWidth: "42px",
                    borderRadius:
                      "50%",
                    background:
                      "#e8e8e8",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <Icon
                    icon="solar:close-circle-bold"
                    width="22"
                  />
                </div>

                <div>
                  <strong
                    style={{
                      fontSize:
                        "14px",
                      color:
                        "#111",
                    }}
                  >
                    Order Cancelled
                  </strong>

                  <p
                    style={{
                      margin:
                        "5px 0 0",
                      color:
                        "#777",
                      fontSize:
                        "12px",
                      lineHeight:
                        1.5,
                    }}
                  >
                    This order has
                    been cancelled.
                  </p>
                </div>
              </div>
            ) : (
              <div className="tracking-list">
                {trackingSteps.map(
                  (
                    step,
                    index
                  ) => {
                    const state =
                      getStepState(
                        step.status
                      );

                    return (
                      <div
                        key={
                          step.status
                        }
                        className="tracking-step"
                        style={{
                          display:
                            "flex",
                          gap: "16px",
                          position:
                            "relative",
                          paddingBottom:
                            index ===
                            trackingSteps.length -
                              1
                              ? "0"
                              : "28px",
                        }}
                      >
                        {/* CONNECTING LINE */}

                        {index !==
                          trackingSteps.length -
                            1 && (
                          <div
                            className={
                              state ===
                              "completed"
                                ? "tracking-line active"
                                : "tracking-line"
                            }
                          />
                        )}

                        {/* ICON */}

                        <div
                          className={`tracking-icon ${
                            state ===
                            "completed"
                              ? "completed"
                              : ""
                          }`}
                        >
                          <Icon
                            icon={
                              step.icon
                            }
                            width="18"
                            height="18"
                          />
                        </div>

                        {/* CONTENT */}

                        <div
                          style={{
                            paddingTop:
                              "2px",
                          }}
                        >
                          <strong
                            style={{
                              display:
                                "block",
                              fontSize:
                                "14px",
                              color:
                                state ===
                                "completed"
                                  ? "#111"
                                  : "#999",
                            }}
                          >
                            {
                              step.title
                            }
                          </strong>

                          <p
                            style={{
                              margin:
                                "5px 0 0",
                              color:
                                "#888",
                              fontSize:
                                "12px",
                              lineHeight:
                                1.6,
                            }}
                          >
                            {
                              step.description
                            }
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>

          {/* =================================
              MAIN GRID
          ================================= */}

          <div
            className="order-grid"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1.5fr) minmax(280px, 1fr)",
              gap: "20px",
            }}
          >
            {/* =================================
                ITEMS
            ================================= */}

            <section
              className="items-card"
              style={{
                background: "#fff",
                borderRadius:
                  "20px",
                padding: "25px",
                boxShadow:
                  "0 8px 30px rgba(0,0,0,0.04)",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  marginBottom:
                    "20px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize:
                      "20px",
                    fontWeight:
                      600,
                  }}
                >
                  Items
                </h2>

                <span
                  style={{
                    fontSize:
                      "11px",
                    color:
                      "#888",
                  }}
                >
                  {order.items.length}{" "}
                  {order.items.length ===
                  1
                    ? "item"
                    : "items"}
                </span>
              </div>

              <div
                style={{
                  display:
                    "grid",
                  gap: "18px",
                }}
              >
                {order.items.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="detail-item"
                      style={{
                        display:
                          "flex",
                        gap: "15px",
                        paddingBottom:
                          index ===
                          order.items
                            .length -
                            1
                            ? "0"
                            : "18px",
                        borderBottom:
                          index ===
                          order.items
                            .length -
                            1
                            ? "none"
                            : "1px solid #eee",
                      }}
                    >
                      {/* IMAGE */}

                      <div
                        className="detail-item-image"
                        style={{
                          width:
                            "85px",
                          height:
                            "95px",
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
                              color="#aaa"
                            />
                          </div>
                        )}
                      </div>

                      {/* INFO */}

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <h3
                          style={{
                            fontSize:
                              "14px",
                            fontWeight:
                              600,
                            margin:
                              "0 0 7px",
                            color:
                              "#111",
                          }}
                        >
                          {
                            item.name
                          }
                        </h3>

                        <p
                          style={{
                            margin:
                              "0 0 5px",
                            color:
                              "#777",
                            fontSize:
                              "12px",
                          }}
                        >
                          Quantity:{" "}
                          {
                            item.quantity
                          }
                        </p>

                        {item.size && (
                          <p
                            style={{
                              margin:
                                "0 0 5px",
                              color:
                                "#777",
                              fontSize:
                                "12px",
                            }}
                          >
                            Size:{" "}
                            {
                              item.size
                            }
                          </p>
                        )}

                        {item.color && (
                          <p
                            style={{
                              margin:
                                0,
                              color:
                                "#777",
                              fontSize:
                                "12px",
                            }}
                          >
                            Color:{" "}
                            {
                              item.color
                            }
                          </p>
                        )}
                      </div>

                      {/* PRICE */}

                      <strong
                        style={{
                          fontSize:
                            "13px",
                          whiteSpace:
                            "nowrap",
                          color:
                            "#111",
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
            </section>

            {/* =================================
                RIGHT COLUMN
            ================================= */}

            <div
              style={{
                display: "grid",
                gap: "20px",
                alignContent:
                  "start",
              }}
            >
              {/* =================================
                  ORDER SUMMARY
              ================================= */}

              <section
                className="side-card"
                style={{
                  background:
                    "#fff",
                  borderRadius:
                    "20px",
                  padding:
                    "25px",
                  boxShadow:
                    "0 8px 30px rgba(0,0,0,0.04)",
                }}
              >
                <h2
                  style={{
                    fontSize:
                      "19px",
                    margin:
                      "0 0 20px",
                    fontWeight:
                      600,
                  }}
                >
                  Order Summary
                </h2>

                <div
                  style={{
                    display:
                      "grid",
                    gap: "12px",
                  }}
                >
                  <div className="summary-row">
                    <span>
                      Subtotal
                    </span>

                    <span>
                      ₹
                      {formatPrice(
                        order.subtotal
                      )}
                    </span>
                  </div>

                  <div className="summary-row">
                    <span>
                      Shipping
                    </span>

                    <span>
                      {order.shipping ===
                      0
                        ? "FREE"
                        : `₹${formatPrice(
                            order.shipping
                          )}`}
                    </span>
                  </div>

                  <div
                    className="summary-total"
                  >
                    <span>
                      Total
                    </span>

                    <span>
                      ₹
                      {formatPrice(
                        order.total
                      )}
                    </span>
                  </div>
                </div>
              </section>

              {/* =================================
                  DELIVERY ADDRESS
              ================================= */}

              <section
                className="side-card"
                style={{
                  background:
                    "#fff",
                  borderRadius:
                    "20px",
                  padding:
                    "25px",
                  boxShadow:
                    "0 8px 30px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "9px",
                    marginBottom:
                      "20px",
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
                      icon="solar:map-point-linear"
                      width="19"
                    />
                  </div>

                  <h2
                    style={{
                      fontSize:
                        "19px",
                      margin: 0,
                      fontWeight:
                        600,
                    }}
                  >
                    Delivery Address
                  </h2>
                </div>

                <p
                  style={{
                    margin:
                      "0 0 5px",
                    fontWeight:
                      600,
                    fontSize:
                      "13px",
                    color:
                      "#111",
                  }}
                >
                  {
                    order.customer
                      .name
                  }
                </p>

                <p
                  style={{
                    margin: 0,
                    color:
                      "#666",
                    fontSize:
                      "12px",
                    lineHeight:
                      1.8,
                  }}
                >
                  {
                    order
                      .shippingAddress
                      .address
                  }
                  <br />

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
                  }
                  <br />

                  PIN:{" "}
                  {
                    order
                      .shippingAddress
                      .pincode
                  }
                </p>

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "7px",
                    marginTop:
                      "14px",
                    paddingTop:
                      "14px",
                    borderTop:
                      "1px solid #eee",
                  }}
                >
                  <Icon
                    icon="solar:phone-linear"
                    width="16"
                    color="#777"
                  />

                  <span
                    style={{
                      fontSize:
                        "12px",
                      color:
                        "#666",
                    }}
                  >
                    {
                      order.customer
                        .phone
                    }
                  </span>
                </div>
              </section>

              {/* =================================
                  PAYMENT
              ================================= */}

              <section
                className="side-card"
                style={{
                  background:
                    "#fff",
                  borderRadius:
                    "20px",
                  padding:
                    "25px",
                  boxShadow:
                    "0 8px 30px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "9px",
                    marginBottom:
                      "18px",
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
                      icon={
                        order.paymentMethod ===
                        "cod"
                          ? "solar:hand-money-linear"
                          : "solar:card-linear"
                      }
                      width="19"
                    />
                  </div>

                  <h2
                    style={{
                      fontSize:
                        "19px",
                      margin: 0,
                      fontWeight:
                        600,
                    }}
                  >
                    Payment
                  </h2>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize:
                      "13px",
                    fontWeight:
                      600,
                    color:
                      "#111",
                  }}
                >
                  {order.paymentMethod ===
                  "cod"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </p>

                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "space-between",
                    gap: "10px",
                    marginTop:
                      "12px",
                    paddingTop:
                      "12px",
                    borderTop:
                      "1px solid #eee",
                  }}
                >
                  <span
                    style={{
                      color:
                        "#777",
                      fontSize:
                        "11px",
                    }}
                  >
                    Payment Status
                  </span>

                  <span
                    className={`payment-status payment-${order.paymentStatus}`}
                  >
                    {order.paymentStatus
                      .charAt(0)
                      .toUpperCase() +
                      order.paymentStatus.slice(
                        1
                      )}
                  </span>
                </div>
              </section>

              {/* =================================
                  DELIVERY METHOD
              ================================= */}

              <section
                className="side-card"
                style={{
                  background:
                    "#fff",
                  borderRadius:
                    "20px",
                  padding:
                    "25px",
                  boxShadow:
                    "0 8px 30px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap: "9px",
                    marginBottom:
                      "15px",
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
                      icon="solar:delivery-linear"
                      width="19"
                    />
                  </div>

                  <h2
                    style={{
                      fontSize:
                        "19px",
                      margin: 0,
                      fontWeight:
                        600,
                    }}
                  >
                    Delivery
                  </h2>
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize:
                      "13px",
                    color:
                      "#666",
                  }}
                >
                  {order.deliveryMethod ||
                    "Standard Delivery"}
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* =========================================
          STYLES
      ========================================= */}

      <style jsx>{`
        .status-pending {
          background: #f1f1f1;
          color: #555;
        }

        .status-confirmed {
          background: #eaeaea;
          color: #222;
        }

        .status-processing {
          background: #e7e7e7;
          color: #222;
        }

        .status-shipped {
          background: #e4e4e4;
          color: #111;
        }

        .status-delivered {
          background: #dedede;
          color: #111;
        }

        .status-cancelled {
          background: #eeeeee;
          color: #777;
        }

        .tracking-step {
          min-height: 35px;
        }

        .tracking-line {
          position: absolute;
          left: 17px;
          top: 35px;
          bottom: 0;
          width: 1px;
          background: #dddddd;
        }

        .tracking-line.active {
          background: #111111;
        }

        .tracking-icon {
          width: 35px;
          height: 35px;
          min-width: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eeeeee;
          color: #999999;
          position: relative;
          z-index: 1;
        }

        .tracking-icon.completed {
          background: #111111;
          color: #ffffff;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          font-size: 13px;
          color: #666666;
        }

        .summary-total {
          border-top: 1px solid #eeeeee;
          padding-top: 15px;
          margin-top: 5px;
          display: flex;
          justify-content: space-between;
          gap: 15px;
          font-size: 18px;
          font-weight: 600;
          color: #111111;
        }

        .payment-status {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 600;
        }

        .payment-pending {
          background: #f1f1f1;
          color: #666666;
        }

        .payment-paid {
          background: #e8e8e8;
          color: #111111;
        }

        .payment-failed {
          background: #ededed;
          color: #777777;
        }

        @media (max-width: 800px) {
          .order-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          .order-details-page {
            padding:
              45px 15px 70px !important;
          }

          .order-main-header,
          .tracking-card,
          .items-card,
          .side-card {
            border-radius:
              16px !important;
          }

          .order-main-header {
            padding: 22px !important;
          }

          .tracking-card,
          .items-card,
          .side-card {
            padding: 20px !important;
          }

          .order-header-content {
            flex-direction: column !important;
          }

          .order-status {
            align-self: flex-start;
          }

          .detail-item {
            gap: 12px !important;
          }

          .detail-item-image {
            width: 70px !important;
            height: 80px !important;
          }

          .detail-item h3 {
            font-size: 13px !important;
          }

          .detail-item p {
            font-size: 11px !important;
          }

          .tracking-card {
            padding:
              22px 18px !important;
          }

          .cancelled-box {
            align-items:
              flex-start !important;
          }
        }

        @media (max-width: 420px) {
          .order-details-page {
            padding:
              40px 12px 60px !important;
          }

          .order-main-header,
          .tracking-card,
          .items-card,
          .side-card {
            padding: 17px !important;
          }

          .detail-item {
            display: grid !important;
            grid-template-columns:
              60px minmax(0, 1fr) !important;
          }

          .detail-item-image {
            width: 60px !important;
            height: 70px !important;
          }

          .detail-item > strong {
            grid-column: 2;
            grid-row: 2;
            margin-top: -8px;
          }

          .tracking-step {
            gap: 12px !important;
          }
        }

        @media (max-width: 359px) {
          .order-details-page {
            padding:
              35px 10px 55px !important;
          }

          .order-main-header,
          .tracking-card,
          .items-card,
          .side-card {
            padding: 15px !important;
          }

          .order-main-header h1 {
            font-size: 20px !important;
          }

          .tracking-card h2,
          .items-card h2,
          .side-card h2 {
            font-size: 17px !important;
          }
        }
      `}</style>
    </>
  );
}