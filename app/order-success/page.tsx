"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { Suspense } from "react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");

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
            boxShadow:
              "0 15px 50px rgba(0,0,0,0.06)",
            boxSizing: "border-box",
          }}
        >
          {/* SUCCESS ICON */}

          <div
            style={{
              width: "82px",
              height: "82px",
              margin: "0 auto",
              borderRadius: "50%",
              background: "#111111",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              icon="solar:check-circle-bold"
              width="45"
              height="45"
            />
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
            Order Confirmed
          </span>

          {/* TITLE */}

          <h1
            style={{
              margin: "9px 0 0",
              fontSize:
                "clamp(36px, 7vw, 48px)",
              lineHeight: "1",
              fontWeight: 600,
              letterSpacing: "-0.05em",
              color: "#111111",
            }}
          >
            Thank You!
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
            Your order has been placed
            successfully. We will process your
            order and prepare it for delivery.
          </p>

          {/* ORDER ID */}

          {orderId && (
            <div
              style={{
                marginTop: "30px",
                padding: "18px 20px",
                border:
                  "1px solid #e7e7e7",
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

          {/* COD INFORMATION */}

          <div
            style={{
              marginTop: "18px",
              padding: "18px",
              borderRadius: "13px",
              background: "#f7f7f7",
              textAlign: "left",
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
                  icon="solar:hand-money-linear"
                  width="20"
                  height="20"
                />
              </div>

              Cash on Delivery
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
              Your payment will be collected
              when your order is delivered.
              Please keep the required amount
              ready.
            </p>
          </div>

          {/* ORDER STATUS */}

          <div
            className="status-row"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "10px",
              marginTop: "18px",
            }}
          >
            {/* CONFIRMED */}

            <div
              style={{
                padding: "15px 10px",
                border:
                  "1px solid #eeeeee",
                borderRadius: "12px",
              }}
            >
              <Icon
                icon="solar:check-circle-bold"
                width="21"
                height="21"
              />

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#333333",
                }}
              >
                Confirmed
              </p>
            </div>

            {/* PROCESSING */}

            <div
              style={{
                padding: "15px 10px",
                border:
                  "1px solid #eeeeee",
                borderRadius: "12px",
              }}
            >
              <Icon
                icon="solar:box-linear"
                width="21"
                height="21"
              />

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#333333",
                }}
              >
                Processing
              </p>
            </div>

            {/* DELIVERY */}

            <div
              style={{
                padding: "15px 10px",
                border:
                  "1px solid #eeeeee",
                borderRadius: "12px",
              }}
            >
              <Icon
                icon="solar:delivery-linear"
                width="21"
                height="21"
              />

              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#333333",
                }}
              >
                Delivery
              </p>
            </div>
          </div>

          {/* ACTIONS */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "11px",
              marginTop: "30px",
            }}
          >
            {/* ACCOUNT */}

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

            {/* PRODUCTS */}

            <Link
              href="/products"
              style={{
                width: "100%",
                minHeight: "53px",
                borderRadius: "999px",
                border:
                  "1px solid #dddddd",
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

          {/* SMALL NOTE */}

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

            Your order information is securely
            saved.
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
            grid-template-columns: 1fr !important;
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
                animation:
                  "spin 1s linear infinite",
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