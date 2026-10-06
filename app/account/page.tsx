"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (response.ok && data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to load account:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /* =================================
     LOADING
  ================================= */

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f7f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#777777",
          fontSize: "13px",
        }}
      >
        Loading account...
      </main>
    );
  }

  /* =================================
     NOT LOGGED IN
  ================================= */

  if (!user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#f7f7f5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "30px 20px",
        }}
      >
        <div
          className="login-required-card"
          style={{
            width: "100%",
            maxWidth: "430px",
            background: "#ffffff",
            borderRadius: "20px",
            padding: "45px",
            textAlign: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              width: "65px",
              height: "65px",
              margin: "0 auto 20px",
              borderRadius: "50%",
              background: "#f3f3f3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon
              icon="solar:user-linear"
              width="30"
              height="30"
              color="#333333"
            />
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 600,
              color: "#111111",
            }}
          >
            Login Required
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              fontSize: "13px",
              lineHeight: "1.6",
              color: "#777777",
            }}
          >
            Please login to view your account.
          </p>

          <Link
            href="/login"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              height: "50px",
              marginTop: "25px",
              borderRadius: "999px",
              background: "#111111",
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Go to Login

            <Icon
              icon="solar:arrow-right-linear"
              width="18"
              height="18"
            />
          </Link>

          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "20px",
              color: "#777777",
              textDecoration: "none",
              fontSize: "11px",
            }}
          >
            <Icon
              icon="solar:arrow-left-linear"
              width="15"
              height="15"
            />

            Back to Store
          </Link>
        </div>

        <style jsx>{`
          @media (max-width: 480px) {
            .login-required-card {
              padding: 35px 22px !important;
              border-radius: 16px !important;
            }
          }

          @media (max-width: 359px) {
            .login-required-card {
              padding: 30px 18px !important;
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main
      className="account-page"
      style={{
        minHeight: "100vh",
        background: "#f7f7f5",
        padding: "70px 20px",
      }}
    >
      <div
        className="account-container"
        style={{
          width: "100%",
          maxWidth: "1050px",
          margin: "0 auto",
        }}
      >
        {/* =================================
            HEADER
        ================================= */}

        <div
          className="account-header"
          style={{
            marginBottom: "35px",
          }}
        >
          <span
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#888888",
            }}
          >
            My Account
          </span>

          <h1
            className="account-title"
            style={{
              margin: "8px 0 0",
              fontSize: "42px",
              lineHeight: "1.1",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              color: "#111111",
            }}
          >
            Welcome, {user.name.split(" ")[0]}
          </h1>

          <p
            className="account-subtitle"
            style={{
              margin: "12px 0 0",
              fontSize: "13px",
              color: "#777777",
            }}
          >
            Manage your profile, orders and account settings.
          </p>
        </div>

        {/* =================================
            MAIN GRID
        ================================= */}

        <div
          className="account-grid"
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.5fr) minmax(280px, 0.7fr)",
            gap: "22px",
            alignItems: "start",
          }}
        >
          {/* =================================
              PROFILE
          ================================= */}

          <section
            className="profile-card"
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              padding: "32px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.04)",
              minWidth: 0,
            }}
          >
            {/* PROFILE HEADER */}

            <div
              className="profile-header"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                paddingBottom: "25px",
                borderBottom: "1px solid #eeeeee",
              }}
            >
              <div
                className="profile-avatar"
                style={{
                  width: "58px",
                  height: "58px",
                  flexShrink: 0,
                  borderRadius: "50%",
                  background: "#111111",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 600,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div style={{ minWidth: 0 }}>
                <h2
                  className="profile-heading"
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: 600,
                    color: "#111111",
                  }}
                >
                  Personal Information
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: "11px",
                    color: "#888888",
                  }}
                >
                  Your registered account details
                </p>
              </div>
            </div>

            {/* NAME */}

            <div style={detailRowStyle}>
              <div style={detailIconStyle}>
                <Icon
                  icon="solar:user-linear"
                  width="19"
                  height="19"
                />
              </div>

              <div className="detail-content">
                <div style={detailLabelStyle}>Full Name</div>

                <div
                  className="detail-value"
                  style={detailValueStyle}
                >
                  {user.name}
                </div>
              </div>
            </div>

            {/* EMAIL */}

            <div style={detailRowStyle}>
              <div style={detailIconStyle}>
                <Icon
                  icon="solar:letter-linear"
                  width="19"
                  height="19"
                />
              </div>

              <div className="detail-content">
                <div style={detailLabelStyle}>Email Address</div>

                <div
                  className="detail-value"
                  style={detailValueStyle}
                >
                  {user.email}
                </div>
              </div>
            </div>

            {/* PHONE */}

            <div
              style={{
                ...detailRowStyle,
                borderBottom: "none",
              }}
            >
              <div style={detailIconStyle}>
                <Icon
                  icon="solar:phone-linear"
                  width="19"
                  height="19"
                />
              </div>

              <div className="detail-content">
                <div style={detailLabelStyle}>Phone Number</div>

                <div
                  className="detail-value"
                  style={detailValueStyle}
                >
                  {user.phone}
                </div>
              </div>
            </div>
          </section>

          {/* =================================
              RIGHT SIDE
          ================================= */}

          <div
            className="account-sidebar"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "22px",
              minWidth: 0,
            }}
          >
            {/* =================================
                MY ORDERS
            ================================= */}

            <Link
              href="/orders"
              className="orders-card"
              style={{
                display: "block",
                background: "#111111",
                borderRadius: "18px",
                padding: "28px",
                color: "#ffffff",
                textDecoration: "none",
                minWidth: 0,
              }}
            >
              <div
                className="orders-icon"
                style={{
                  width: "45px",
                  height: "45px",
                  borderRadius: "12px",
                  background: "#ffffff",
                  color: "#111111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "22px",
                }}
              >
                <Icon
                  icon="solar:bag-4-linear"
                  width="23"
                  height="23"
                />
              </div>

              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 600,
                }}
              >
                My Orders
              </h3>

              <p
                className="orders-description"
                style={{
                  margin: "7px 0 0",
                  fontSize: "11px",
                  lineHeight: "1.6",
                  color: "#bbbbbb",
                }}
              >
                View your order history and track your purchases.
              </p>

              <div
                style={{
                  marginTop: "22px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                View Orders

                <Icon
                  icon="solar:arrow-right-linear"
                  width="16"
                  height="16"
                />
              </div>
            </Link>
          </div>
        </div>

        {/* =================================
            CONTINUE SHOPPING
        ================================= */}

        <Link
          href="/products"
          className="continue-shopping"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            marginTop: "30px",
            color: "#555555",
            textDecoration: "none",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          <Icon
            icon="solar:arrow-left-linear"
            width="17"
            height="17"
          />

          Continue Shopping
        </Link>
      </div>

      {/* =================================
          RESPONSIVE CSS
      ================================= */}

      <style jsx>{`
        /* =================================
           LARGE TABLET
           1001px - 1150px
        ================================= */

        @media (min-width: 1001px) and (max-width: 1150px) {
          .account-page {
            padding: 60px 25px !important;
          }

          .account-grid {
            grid-template-columns:
              minmax(0, 1.4fr)
              minmax(260px, 0.8fr) !important;

            gap: 18px !important;
          }

          .profile-card {
            padding: 28px !important;
          }

          .orders-card {
            padding: 25px !important;
          }
        }

        /* =================================
           TABLET
           769px - 1000px
        ================================= */

        @media (min-width: 769px) and (max-width: 1000px) {
          .account-page {
            padding: 55px 25px !important;
          }

          .account-header {
            margin-bottom: 28px !important;
          }

          .account-title {
            font-size: 38px !important;
          }

          .account-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }

          .account-sidebar {
            display: grid !important;
            grid-template-columns: 1fr !important;
          }

          .orders-card {
            padding: 28px !important;
          }
        }

        /* =================================
           MOBILE
           768px and below
        ================================= */

        @media (max-width: 768px) {
          .account-page {
            padding: 45px 20px !important;
          }

          .account-container {
            max-width: 100% !important;
          }

          .account-header {
            margin-bottom: 25px !important;
          }

          .account-title {
            font-size: 34px !important;
            line-height: 1.1 !important;
          }

          .account-subtitle {
            font-size: 12px !important;
            line-height: 1.6 !important;
          }

          .account-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 18px !important;
            width: 100% !important;
          }

          .profile-card {
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 24px !important;
            border-radius: 16px !important;
          }

          .profile-header {
            padding-bottom: 20px !important;
            gap: 13px !important;
          }

          .profile-avatar {
            width: 52px !important;
            height: 52px !important;
            font-size: 18px !important;
          }

          .profile-heading {
            font-size: 18px !important;
          }

          .account-sidebar {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 18px !important;
          }

          .orders-card {
            width: 100% !important;
            box-sizing: border-box !important;
            padding: 24px !important;
            border-radius: 16px !important;
          }

          .orders-icon {
            width: 44px !important;
            height: 44px !important;
            margin-bottom: 18px !important;
          }

          .orders-description {
            max-width: 300px;
          }

          .continue-shopping {
            margin-top: 24px !important;
          }
        }

        /* =================================
           SMALL MOBILE
           480px and below
        ================================= */

        @media (max-width: 480px) {
          .account-page {
            padding: 35px 16px !important;
          }

          .account-header {
            margin-bottom: 22px !important;
          }

          .account-title {
            font-size: 30px !important;
            letter-spacing: -0.035em !important;
          }

          .account-subtitle {
            margin-top: 9px !important;
            font-size: 11px !important;
          }

          .profile-card {
            padding: 20px !important;
            border-radius: 15px !important;
          }

          .profile-header {
            padding-bottom: 18px !important;
          }

          .profile-avatar {
            width: 48px !important;
            height: 48px !important;
            font-size: 17px !important;
          }

          .profile-heading {
            font-size: 16px !important;
          }

          .profile-header p {
            font-size: 10px !important;
          }

          .orders-card {
            padding: 21px !important;
            border-radius: 15px !important;
          }

          .orders-icon {
            width: 42px !important;
            height: 42px !important;
            margin-bottom: 17px !important;
          }

          .orders-card h3 {
            font-size: 17px !important;
          }

          .orders-description {
            font-size: 10px !important;
          }

          .detail-row {
            gap: 12px !important;
          }

          .continue-shopping {
            margin-top: 22px !important;
            font-size: 11px !important;
          }
        }

        /* =================================
           VERY SMALL MOBILE
           359px and below
        ================================= */

        @media (max-width: 359px) {
          .account-page {
            padding: 30px 13px !important;
          }

          .account-title {
            font-size: 27px !important;
          }

          .account-subtitle {
            font-size: 10px !important;
          }

          .profile-card {
            padding: 17px !important;
            border-radius: 14px !important;
          }

          .profile-header {
            gap: 10px !important;
            padding-bottom: 16px !important;
          }

          .profile-avatar {
            width: 44px !important;
            height: 44px !important;
            font-size: 16px !important;
          }

          .profile-heading {
            font-size: 14px !important;
          }

          .profile-header p {
            font-size: 9px !important;
          }

          .orders-card {
            padding: 18px !important;
          }

          .orders-icon {
            width: 40px !important;
            height: 40px !important;
            margin-bottom: 15px !important;
          }

          .orders-card h3 {
            font-size: 16px !important;
          }

          .orders-description {
            font-size: 9px !important;
          }

          .detail-row {
            gap: 10px !important;
            padding: 18px 0 !important;
          }

          .detail-icon {
            width: 38px !important;
            height: 38px !important;
          }

          .detail-icon :global(svg) {
            width: 17px !important;
            height: 17px !important;
          }

          .detail-label {
            font-size: 9px !important;
          }

          .detail-value {
            font-size: 11px !important;
            word-break: break-word;
          }

          .continue-shopping {
            font-size: 10px !important;
          }
        }
      `}</style>
    </main>
  );
}

/* =================================
   DETAIL ROW STYLES
================================= */

const detailRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  padding: "22px 0",
  borderBottom: "1px solid #eeeeee",
};

const detailIconStyle = {
  width: "42px",
  height: "42px",
  flexShrink: 0,
  borderRadius: "10px",
  background: "#f5f5f5",
  color: "#555555",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const detailLabelStyle = {
  fontSize: "10px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "#999999",
  marginBottom: "5px",
};

const detailValueStyle = {
  fontSize: "13px",
  fontWeight: 500,
  color: "#222222",
};