"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

type AdminTopbarProps = {
  onMenuClick: () => void;
};

export default function AdminTopbar({
  onMenuClick,
}: AdminTopbarProps) {
  const [adminMenuOpen, setAdminMenuOpen] =
    useState(false);

  return (
    <>
      <header className="admin-topbar">

        {/* LEFT SIDE */}

        <div className="admin-topbar-left">

          <button
            type="button"
            className="admin-menu-button"
            onClick={onMenuClick}
            aria-label="Open admin menu"
          >
            <Icon
              icon="solar:hamburger-menu-linear"
              width={23}
              height={23}
            />
          </button>

          <div className="admin-topbar-heading">
            <span className="admin-topbar-eyebrow">
              ADMIN PANEL
            </span>

            <h1>Dashboard</h1>
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="admin-topbar-right">

          {/* NOTIFICATION */}

          <button
            type="button"
            className="admin-topbar-icon-button"
            aria-label="Notifications"
          >
            <Icon
              icon="solar:bell-linear"
              width={21}
              height={21}
            />

            <span className="admin-notification-dot" />
          </button>

          {/* DIVIDER */}

          <div className="admin-topbar-divider" />

          {/* ADMIN PROFILE */}

          <div className="admin-topbar-profile-wrapper">

            <button
              type="button"
              className="admin-topbar-profile"
              onClick={() =>
                setAdminMenuOpen(
                  (previous) => !previous
                )
              }
            >
              <span className="admin-topbar-avatar">
                A
              </span>

              <span className="admin-topbar-user-info">
                <span className="admin-topbar-user-name">
                  Admin
                </span>

                <span className="admin-topbar-user-role">
                  Administrator
                </span>
              </span>

              <Icon
                icon={
                  adminMenuOpen
                    ? "solar:alt-arrow-up-linear"
                    : "solar:alt-arrow-down-linear"
                }
                width={15}
                height={15}
              />
            </button>

            {/* PROFILE DROPDOWN */}

            {adminMenuOpen && (
              <div className="admin-topbar-dropdown">

                <div className="admin-dropdown-header">

                  <div className="admin-dropdown-avatar">
                    A
                  </div>

                  <div>
                    <div className="admin-dropdown-name">
                      Admin
                    </div>

                    <div className="admin-dropdown-email">
                      admin@example.com
                    </div>
                  </div>

                </div>

                <div className="admin-dropdown-divider" />

                <button
                  type="button"
                  className="admin-dropdown-item"
                  onClick={() =>
                    setAdminMenuOpen(false)
                  }
                >
                  <Icon
                    icon="solar:user-linear"
                    width={19}
                    height={19}
                  />

                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  className="admin-dropdown-item"
                  onClick={() =>
                    setAdminMenuOpen(false)
                  }
                >
                  <Icon
                    icon="solar:settings-linear"
                    width={19}
                    height={19}
                  />

                  <span>Settings</span>
                </button>

              </div>
            )}

          </div>
        </div>
      </header>

      <style jsx>{`
        .admin-topbar {
          position: sticky;
          top: 0;

          width: 100%;
          height: 76px;

          padding: 0 30px;

          box-sizing: border-box;

          display: flex;
          flex-direction: row;

          align-items: center;
          justify-content: space-between;

          background: #FAF8F5;

          border-bottom: 1px solid #eeeeee;

          z-index: 900;
        }

        .admin-topbar-left {
          display: flex;
          flex-direction: row;

          align-items: center;

          gap: 18px;
        }

        .admin-topbar-heading {
          display: flex;
          flex-direction: column;

          justify-content: center;
        }

        .admin-topbar-eyebrow {
          display: block;

          margin-bottom: 4px;

          color: #999999;

          font-size: 8px;
          font-weight: 600;

          letter-spacing: 0.18em;

          line-height: 1;
        }

        .admin-topbar-heading h1 {
          margin: 0;
          padding: 0;

          color: #111111;

          font-size: 20px;
          font-weight: 600;

          letter-spacing: -0.02em;

          line-height: 1.2;
        }

        /* MENU BUTTON */

        .admin-menu-button {
          display: none;

          width: 40px;
          height: 40px;

          padding: 0;

          border: 1px solid #e5e5e5;

          border-radius: 9px;

          background: #FAF8F5;

          color: #111111;

          align-items: center;
          justify-content: center;

          cursor: pointer;
        }

        /* RIGHT SIDE */

        .admin-topbar-right {
          display: flex;
          flex-direction: row;

          align-items: center;

          gap: 14px;
        }

        /* NOTIFICATION */

        .admin-topbar-icon-button {
          position: relative;

          width: 40px;
          height: 40px;

          padding: 0;

          display: flex;
          flex-direction: row;

          align-items: center;
          justify-content: center;

          border: none;

          border-radius: 50%;

          background: transparent;

          color: #333333;

          cursor: pointer;

          transition:
            background 0.2s ease;
        }

        .admin-topbar-icon-button:hover {
          background: #f5f5f5;
        }

        .admin-notification-dot {
          position: absolute;

          top: 8px;
          right: 8px;

          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #111111;

          border: 2px solid #ffffff;
        }

        /* DIVIDER */

        .admin-topbar-divider {
          width: 1px;
          height: 32px;

          background: #eeeeee;
        }

        /* PROFILE */

        .admin-topbar-profile-wrapper {
          position: relative;
        }

        .admin-topbar-profile {
          height: 48px;

          padding: 0 4px;

          display: flex;
          flex-direction: row;

          align-items: center;

          gap: 10px;

          border: none;

          background: transparent;

          color: #111111;

          cursor: pointer;
        }

        .admin-topbar-avatar {
          width: 36px;
          height: 36px;

          min-width: 36px;

          display: flex;
          flex-direction: row;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #111111;

          color: #ffffff;

          font-size: 12px;
          font-weight: 700;
        }

        .admin-topbar-user-info {
          display: flex;
          flex-direction: column;

          align-items: flex-start;

          gap: 3px;
        }

        .admin-topbar-user-name {
          color: #111111;

          font-size: 13px;
          font-weight: 600;

          line-height: 1;
        }

        .admin-topbar-user-role {
          color: #999999;

          font-size: 10px;

          line-height: 1;
        }

        /* DROPDOWN */

        .admin-topbar-dropdown {
          position: absolute;

          top: 58px;
          right: 0;

          width: 270px;

          background: #FAF8F5;

          border: 1px solid #e5e5e5;

          border-radius: 14px;

          overflow: hidden;

          box-shadow:
            0 18px 45px
            rgba(0, 0, 0, 0.12);

          z-index: 2000;
        }

        .admin-dropdown-header {
          padding: 17px;

          display: flex;
          flex-direction: row;

          align-items: center;

          gap: 12px;
        }

        .admin-dropdown-avatar {
          width: 42px;
          height: 42px;

          min-width: 42px;

          display: flex;
          flex-direction: row;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #111111;

          color: #ffffff;

          font-size: 13px;
          font-weight: 700;
        }

        .admin-dropdown-name {
          color: #111111;

          font-size: 14px;
          font-weight: 600;
        }

        .admin-dropdown-email {
          margin-top: 4px;

          color: #888888;

          font-size: 11px;
        }

        .admin-dropdown-divider {
          width: 100%;
          height: 1px;

          background: #eeeeee;
        }

        .admin-dropdown-item {
          width: 100%;

          min-height: 46px;

          padding: 0 17px;

          box-sizing: border-box;

          display: flex;
          flex-direction: row;

          align-items: center;

          gap: 12px;

          border: none;

          background: #FAF8F5;

          color: #222222;

          text-align: left;

          font-family: inherit;

          font-size: 13px;

          cursor: pointer;

          transition:
            background 0.2s ease;
        }

        .admin-dropdown-item:hover {
          background: #f7f7f7;
        }

        /* TABLET */

        @media (max-width: 900px) {
          .admin-topbar {
            height: 68px;

            padding: 0 20px;
          }

          .admin-menu-button {
            display: flex;
          }

          .admin-topbar-heading h1 {
            font-size: 18px;
          }
        }

        /* MOBILE */

        @media (max-width: 480px) {
          .admin-topbar {
            height: 64px;

            padding: 0 14px;
          }

          .admin-topbar-left {
            gap: 11px;
          }

          .admin-menu-button {
            width: 37px;
            height: 37px;
          }

          .admin-topbar-eyebrow {
            font-size: 7px;
          }

          .admin-topbar-heading h1 {
            font-size: 16px;
          }

          .admin-topbar-right {
            gap: 5px;
          }

          .admin-topbar-icon-button {
            width: 36px;
            height: 36px;
          }

          .admin-topbar-divider {
            display: none;
          }

          .admin-topbar-user-info {
            display: none;
          }

          .admin-topbar-profile {
            padding: 0;
          }

          .admin-topbar-profile > svg {
            display: none;
          }

          .admin-topbar-avatar {
            width: 34px;
            height: 34px;

            min-width: 34px;
          }

          .admin-topbar-dropdown {
            position: fixed;

            top: 70px;

            left: 12px;
            right: 12px;

            width: auto;
          }
        }
      `}</style>
    </>
  );
}