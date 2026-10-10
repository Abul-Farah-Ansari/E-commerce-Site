"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@iconify/react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "solar:widget-2-linear",
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: "solar:bag-4-linear",
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: "solar:layers-linear",
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: "solar:clipboard-list-linear",
  },
  {
    label: "Customers",
    href: "/admin/customers",
    icon: "solar:users-group-rounded-linear",
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: "solar:settings-linear",
  },
];

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AdminSidebar({
  isOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      <div
        className={`admin-sidebar-overlay ${
          isOpen ? "admin-sidebar-overlay-show" : ""
        }`}
        onClick={onClose}
      />

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside
        className={`admin-sidebar ${
          isOpen ? "admin-sidebar-open" : ""
        }`}
      >
        {/* =========================================
            LOGO
        ========================================= */}

        <div className="admin-sidebar-logo">
          <Link
            href="/admin"
            onClick={onClose}
            style={{
              display: "flex",
              flexDirection: "column",
              textDecoration: "none",
            }}
          >
            <span className="admin-logo-main">
              HOUSE OF ORIVE
            </span>

            <span className="admin-logo-sub">
              ADMIN PANEL
            </span>
          </Link>

          <button
            type="button"
            className="admin-mobile-close"
            onClick={onClose}
            aria-label="Close admin menu"
          >
            <Icon
              icon="solar:close-circle-linear"
              width={24}
              height={24}
            />
          </button>
        </div>

        {/* =========================================
            MAIN MENU
        ========================================= */}

        <div className="admin-sidebar-section">
          <span className="admin-sidebar-label">
            MAIN MENU
          </span>

          <nav className="admin-sidebar-nav">
            {menuItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`admin-nav-item ${
                    active
                      ? "admin-nav-item-active"
                      : ""
                  }`}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    width: "100%",
                    minHeight: "50px",
                    gap: "15px",
                    padding: "0 14px",
                    boxSizing: "border-box",
                    whiteSpace: "nowrap",
                  }}
                >
                  {/* ICON */}

                  <span
                    className="admin-nav-icon"
                    style={{
                      width: "24px",
                      minWidth: "24px",
                      height: "24px",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon
                      icon={item.icon}
                      width={21}
                      height={21}
                    />
                  </span>

                  {/* TEXT */}

                  <span
                    className="admin-nav-text"
                    style={{
                      display: "block",
                      margin: 0,
                      padding: 0,
                      whiteSpace: "nowrap",
                      lineHeight: 1,
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* =========================================
            SIDEBAR BOTTOM
        ========================================= */}

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-version">
            <span>ADMIN</span>
            <span>v1.0</span>
          </div>
        </div>
      </aside>

      <style jsx>{`
        /* =========================================
           SIDEBAR
        ========================================= */

        .admin-sidebar {
          position: fixed;

          top: 0;
          left: 0;

          width: 250px;
          height: 100vh;

          background: #111111;
          color: #ffffff;

          z-index: 1000;

          display: flex;
          flex-direction: column;

          border-right: 1px solid #222222;

          overflow-y: auto;
          overflow-x: hidden;
        }

        /* =========================================
           LOGO
        ========================================= */

        .admin-sidebar-logo {
          width: 100%;

          height: 90px;
          min-height: 90px;

          padding: 0 26px;

          display: flex;
          flex-direction: row;

          align-items: center;
          justify-content: space-between;

          box-sizing: border-box;

          border-bottom: 1px solid #242424;
        }

        .admin-logo-main {
          display: block;

          color: #ffffff;

          font-size: 18px;
          font-weight: 700;

          letter-spacing: 0.08em;

          line-height: 1;
        }

        .admin-logo-sub {
          display: block;

          margin-top: 6px;

          color: #888888;

          font-size: 12px;

          letter-spacing: 0.22em;

          line-height: 1;
        }

        /* =========================================
           SIDEBAR SECTION
        ========================================= */

        .admin-sidebar-section {
          width: 100%;

          padding: 38px 16px 30px;

          flex: 1;

          box-sizing: border-box;
        }

        /* =========================================
           MAIN MENU LABEL
        ========================================= */

        .admin-sidebar-label {
          display: block;

          padding: 0 12px;

          margin-bottom: 22px;

          color: #777777;

          font-size: 9px;
          font-weight: 600;

          letter-spacing: 0.22em;
        }

        /* =========================================
           NAVIGATION

           IMPORTANT:
           The vertical gap is controlled here.
        ========================================= */

        .admin-sidebar-nav {
          width: 100%;

          display: flex;
          flex-direction: column;

          gap: 14px;
        }

        /* =========================================
           NAV ITEM
        ========================================= */

        .admin-nav-item {
          color: #999999;

          text-decoration: none;

          font-size: 14px;

          font-weight: 500;

          border-radius: 11px;

          white-space: nowrap;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease;
        }

        /* =========================================
           HOVER
        ========================================= */

        .admin-nav-item:hover {
          background: #1c1c1c;

          color: #ffffff;

          transform: translateX(2px);
        }

        /* =========================================
           ACTIVE
        ========================================= */

        .admin-nav-item-active {
          background: #FAF8F5;

          color: #111111;

          box-shadow:
            0 6px 18px
            rgba(0, 0, 0, 0.18);
        }

        .admin-nav-item-active:hover {
          background: #FAF8F5;

          color: #111111;

          transform: none;
        }

        /* =========================================
           ICON
        ========================================= */

        .admin-nav-icon {
          color: inherit;
        }

        .admin-nav-icon :global(svg) {
          display: block;

          flex-shrink: 0;
        }

        /* =========================================
           TEXT
        ========================================= */

        .admin-nav-text {
          color: inherit;
        }

        /* =========================================
           SIDEBAR BOTTOM
        ========================================= */

        .admin-sidebar-bottom {
          width: 100%;

          padding: 20px 24px;

          box-sizing: border-box;

          border-top: 1px solid #242424;
        }

        .admin-sidebar-version {
          display: flex;

          flex-direction: row;

          align-items: center;

          justify-content: space-between;

          color: #666666;

          font-size: 9px;

          letter-spacing: 0.12em;
        }

        /* =========================================
           MOBILE CLOSE
        ========================================= */

        .admin-mobile-close {
          display: none;

          width: 34px;
          height: 34px;

          padding: 0;

          border: none;

          background: transparent;

          color: #ffffff;

          align-items: center;
          justify-content: center;

          cursor: pointer;
        }

        /* =========================================
           MOBILE OVERLAY
        ========================================= */

        .admin-sidebar-overlay {
          display: none;
        }

        /* =========================================
           TABLET / MOBILE
        ========================================= */

        @media (max-width: 900px) {
          .admin-sidebar {
            transform: translateX(-100%);

            transition:
              transform 0.3s ease;
          }

          .admin-sidebar-open {
            transform: translateX(0);
          }

          .admin-mobile-close {
            display: flex;
          }

          .admin-sidebar-overlay {
            position: fixed;

            inset: 0;

            display: block;

            background: rgba(
              0,
              0,
              0,
              0.45
            );

            z-index: 999;

            opacity: 0;

            visibility: hidden;

            transition:
              opacity 0.3s ease,
              visibility 0.3s ease;
          }

          .admin-sidebar-overlay-show {
            opacity: 1;

            visibility: visible;
          }
        }

        /* =========================================
           SMALL MOBILE
        ========================================= */

        @media (max-width: 480px) {
          .admin-sidebar {
            width: min(
              280px,
              86vw
            );
          }

          .admin-sidebar-logo {
            padding: 0 20px;
          }

          .admin-sidebar-section {
            padding: 32px 14px 26px;
          }

          .admin-sidebar-label {
            padding: 0 12px;

            margin-bottom: 20px;
          }

          .admin-sidebar-nav {
            gap: 12px;
          }

          .admin-nav-item {
            min-height: 48px !important;

            padding: 0 12px !important;

            gap: 14px !important;
          }
        }
      `}</style>
    </>
  );
}