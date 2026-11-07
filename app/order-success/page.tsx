
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Suspense, useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type CustomerOrder = {
  _id: string;
  paymentMethod: "cod" | "online";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
};

const ORDER_STEPS = [
  {
    key: "pending",
    label: "Order Placed",
    icon: "solar:bag-4-linear",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: "solar:check-circle-linear",
  },
  {
    key: "processing",
    label: "Processing",
    icon: "solar:box-linear",
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: "solar:delivery-linear",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: "solar:verified-check-linear",
  },
];

const ORDER_STATUS_ORDER = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setOrderError("Order ID is missing.");
      setOrderLoading(false);
      return;
    }

    let cancelled = false;

    const loadOrder = async () => {
      try {
        setOrderLoading(true);
        setOrderError("");

        const response = await fetch("/api/orders", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load order details."
          );
        }

        const matchingOrder = Array.isArray(data.orders)
          ? data.orders.find(
              (item: CustomerOrder) =>
                String(item._id) === orderId
            )
          : null;

        if (!matchingOrder) {
          throw new Error(
            "We could not find this order in your account."
          );
        }

        if (!cancelled) {
          setOrder(matchingOrder);
        }
      } catch (error) {
        if (!cancelled) {
          setOrder(null);
          setOrderError(
            error instanceof Error
              ? error.message
              : "Unable to load order details."
          );
        }
      } finally {
        if (!cancelled) {
          setOrderLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const isOnlinePayment = order?.paymentMethod === "online";
  const isPaymentPaid = order?.paymentStatus === "paid";
  const isPaymentFailed = order?.paymentStatus === "failed";
  const isCancelled = order?.orderStatus === "cancelled";

  const isPaymentPending =
    isOnlinePayment && !isPaymentPaid && !isPaymentFailed;

  // PAYMENT TITLE
  const paymentTitle = orderLoading
    ? "Loading payment details..."
    : orderError
      ? "Payment details unavailable"
      : isOnlinePayment
        ? isPaymentPaid
          ? "Payment Successful"
          : isPaymentFailed
            ? "Payment Failed"
            : "Payment Awaiting Confirmation"
        : "Cash on Delivery";

  // PAYMENT DESCRIPTION
  const paymentDescription = orderLoading
    ? "Please wait while we retrieve your payment information."
    : orderError
      ? orderError
      : isCancelled
        ? "This order has been cancelled. Please contact support if you need assistance."
        : isOnlinePayment
          ? isPaymentPaid
            ? "Your payment has been received and verified successfully. No payment is due on delivery."
            : isPaymentFailed
              ? "Your payment was not completed. You can try paying again."
              : "Your payment is awaiting confirmation. Please check your payment status before trying again."
          : "Your order has been placed. Payment will be collected when your order is delivered.";

  // MAIN HEADING
  const pageLabel = orderLoading
    ? "ORDER STATUS"
    : orderError
      ? "ORDER INFORMATION"
      : isCancelled
        ? "ORDER CANCELLED"
        : isOnlinePayment && !isPaymentPaid
          ? "PAYMENT STATUS"
          : "ORDER CONFIRMED";

  const pageTitle = orderLoading
    ? "Loading..."
    : orderError
      ? "Order Unavailable"
      : isCancelled
        ? "Order Cancelled"
        : isOnlinePayment && isPaymentFailed
          ? "Payment Unsuccessful"
          : isPaymentPending
            ? "Payment Pending"
            : "Thank You!";

  // MAIN ICON
  const mainIcon = orderLoading
    ? "solar:refresh-circle-bold"
    : orderError || isPaymentFailed
      ? "solar:close-circle-bold"
      : isPaymentPending
        ? "solar:clock-circle-bold"
        : "solar:check-circle-bold";

  const mainIconBackground =
    orderError || isPaymentFailed
      ? "#b42318"
      : isPaymentPending
        ? "#9a6700"
        : "#111111";

  const currentStatus = order?.orderStatus || "pending";
  const activeIndex = ORDER_STATUS_ORDER.indexOf(currentStatus);

  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: "70vh",
          background: "#f7f7f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "70px 20px 90px",
        }}
      >
        <div
          className="success-card"
          style={{
            width: "100%",
            maxWidth: "600px",
            background: "#ffffff",
            borderRadius: "24px",
            padding: "55px 45px",
            textAlign: "center",
            boxShadow: "0 15px 50px rgba(0,0,0,0.06)",
            boxSizing: "border-box",
          }}
        >
          {/* DYNAMIC STATUS ICON */}
          <div
            style={{
              width: "82px",
              height: "82px",
              margin: "0 auto",
              borderRadius: "50%",
              background: mainIconBackground,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon icon={mainIcon} width="45" height="45" />
          </div>

          {/* LABEL */}
          <span
            style={{
              display: "block",
              marginTop: "28px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#888888",
            }}
          >
            {pageLabel}
          </span>

          {/* TITLE */}
          <h1
            style={{
              margin: "9px 0 0",
              fontSize: "clamp(32px, 7vw, 48px)",
              lineHeight: "1.1",
              fontWeight: 600,
              letterSpacing: "-0.05em",
              color: "#111111",
            }}
          >
            {pageTitle}
          </h1>

          <p
            style={{
              maxWidth: "440px",
              margin: "18px auto 0",
              fontSize: "14px",
              lineHeight: "1.8",
              color: "#777777",
            }}
          >
            {orderLoading
              ? "Please wait while we retrieve your order."
              : orderError
                ? orderError
                : isCancelled
                  ? "Your order is no longer active."
                  : isOnlinePayment && !isPaymentPaid
                    ? "Please check your payment status before proceeding."
                    : "Your order has been placed successfully. We will process your order and prepare it for delivery."}
          </p>

          {/* ORDER ID */}
          {orderId && (
            <div
              style={{
                marginTop: "30px",
                padding: "18px 20px",
                border: "1px solid #e7e7e7",
                borderRadius: "13px",
                background: "#fafafa",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.13em",
                  color: "#999999",
                }}
              >
                <Icon
                  icon="solar:document-text-linear"
                  width="16"
                />
                Order ID
              </div>

              <div
                style={{
                  marginTop: "9px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#222222",
                  wordBreak: "break-all",
                }}
              >
                {orderId}
              </div>
            </div>
          )}

          {/* PAYMENT INFORMATION */}
          <div
            style={{
              marginTop: "18px",
              padding: "18px",
              borderRadius: "13px",
              background: "#f7f7f7",
              textAlign: "left",
              border: "1px solid #eeeeee",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#222222",
              }}
            >
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "9px",
                  background: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon
                  icon={
                    orderLoading
                      ? "solar:refresh-circle-linear"
                      : orderError || isPaymentFailed
                        ? "solar:close-circle-linear"
                        : isOnlinePayment
                          ? isPaymentPaid
                            ? "solar:card-bold"
                            : "solar:clock-circle-linear"
                          : "solar:hand-money-linear"
                  }
                  width="20"
                  height="20"
                />
              </div>

              {paymentTitle}
            </div>

            <p
              style={{
                margin: "10px 0 0",
                paddingLeft: "45px",
                fontSize: "12px",
                lineHeight: "1.7",
                color: "#777777",
              }}
            >
              {paymentDescription}
            </p>
          </div>

          {/* DYNAMIC ORDER STATUS */}
          <div
            className="status-row"
            style={{
              marginTop: "18px",
              padding: "22px 12px",
              border: "1px solid #eeeeee",
              borderRadius: "14px",
              background: "#ffffff",
            }}
          >
            {isCancelled ? (
              <div
                style={{
                  padding: "14px",
                  background: "#fff1f0",
                  color: "#b42318",
                  borderRadius: "10px",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                <Icon
                  icon="solar:close-circle-bold"
                  width="20"
                  style={{
                    verticalAlign: "middle",
                    marginRight: "7px",
                  }}
                />
                This order has been cancelled.
              </div>
            ) : (
              <div
                className="timeline-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                  gap: "5px",
                }}
              >
                {ORDER_STEPS.map((step, index) => {
                  const completed = activeIndex >= index;
                  const current = activeIndex === index;

                  return (
                    <div
                      key={step.key}
                      style={{
                        textAlign: "center",
                        color: completed ? "#111111" : "#aaaaaa",
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "38px",
                          height: "38px",
                          margin: "0 auto",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: completed ? "#111111" : "#f4f4f4",
                          color: completed ? "#ffffff" : "#999999",
                          border: current
                            ? "2px solid #a49a89"
                            : "1px solid #eeeeee",
                          boxSizing: "border-box",
                        }}
                      >
                        <Icon
                          icon={step.icon}
                          width="19"
                          height="19"
                        />
                      </div>

                      <p
                        style={{
                          margin: "9px 0 0",
                          fontSize: "10px",
                          lineHeight: "1.4",
                          fontWeight: completed ? 600 : 400,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RETRY PAYMENT NOTICE */}
          {isOnlinePayment &&
            !isPaymentPaid &&
            !isCancelled &&
            !orderLoading &&
            !orderError && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "16px",
                  background: "#fff9e9",
                  border: "1px solid #f1e2b9",
                  borderRadius: "12px",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#8a6200",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  <Icon
                    icon="solar:info-circle-linear"
                    width="19"
                  />
                  Payment needs attention
                </div>

                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "12px",
                    lineHeight: "1.7",
                    color: "#806b42",
                  }}
                >
                  If your payment was unsuccessful, you can retry from
                  your order once the secure retry-payment option is
                  available. If money was deducted, check your payment
                  status before attempting another payment.
                </p>
              </div>
            )}

          {/* ACTIONS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "11px",
              marginTop: "30px",
            }}
          >
            <Link
              href="/account"
              style={{
                width: "100%",
                minHeight: "53px",
                borderRadius: "999px",
                background: "#111111",
                color: "#ffffff",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "9px",
                fontSize: "13px",
                fontWeight: 600,
                boxSizing: "border-box",
              }}
            >
              View My Account
              <Icon
                icon="solar:arrow-right-linear"
                width="18"
                height="18"
              />
            </Link>

            <Link
              href="/products"
              style={{
                width: "100%",
                minHeight: "53px",
                borderRadius: "999px",
                border: "1px solid #dddddd",
                background: "#ffffff",
                color: "#333333",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "9px",
                fontSize: "13px",
                fontWeight: 600,
                boxSizing: "border-box",
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

          {/* SECURITY NOTE */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              marginTop: "25px",
              color: "#999999",
              fontSize: "11px",
            }}
          >
            <Icon
              icon="solar:shield-check-linear"
              width="16"
            />
            Your order information is securely saved.
          </div>
        </div>
      </main>

      <Footer />

      {/* RESPONSIVE */}
      <style jsx>{`
        @media (max-width: 600px) {
          .success-card {
            padding: 40px 20px !important;
            border-radius: 18px !important;
          }

          .status-row {
            padding: 18px 5px !important;
          }

          .timeline-grid {
            gap: 2px !important;
          }

          .timeline-grid p {
            font-size: 9px !important;
          }
        }

        @media (max-width: 400px) {
          .success-card {
            padding: 35px 16px !important;
          }
        }
      `}</style>
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f7f7f5",
            color: "#777777",
            fontSize: "13px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Icon
              icon="solar:refresh-circle-bold"
              width="20"
              style={{
                animation: "spin 1s linear infinite",
              }}
            />
            Loading...
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
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
