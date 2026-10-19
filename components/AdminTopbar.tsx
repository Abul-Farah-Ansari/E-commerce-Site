
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";

type AdminTopbarProps = {
  onMenuClick: () => void;
};

type AdminNotification = {
  _id: string;
  type:
    | "new_customer"
    | "new_order"
    | "order_status"
    | "payment_status"
    | "low_stock"
    | "customer_cancellation";
  title: string;
  message: string;
  orderId?: string | { _id?: string };
  isRead: boolean;
  createdAt: string;
};

export default function AdminTopbar({
  onMenuClick,
}: AdminTopbarProps) {
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // FETCH ADMIN NOTIFICATIONS
  // ==========================================

  const fetchNotifications = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setNotificationsLoading(true);
    }

    try {
      const response = await fetch("/api/admin/notifications", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load notifications.");
      }

      setNotifications(data.notifications || []);
      setUnreadCount(Number(data.unreadCount) || 0);
      setNotificationError("");
    } catch (error) {
      console.error("ADMIN NOTIFICATIONS FETCH ERROR:", error);

      if (showLoader) {
        setNotificationError(
          error instanceof Error
            ? error.message
            : "Unable to load notifications."
        );
      }
    } finally {
      if (showLoader) {
        setNotificationsLoading(false);
      }
    }
  }, []);

  // ==========================================
  // INITIAL FETCH AND AUTOMATIC REFRESH
  // ==========================================

  useEffect(() => {
    void fetchNotifications(true);

    const intervalId = window.setInterval(() => {
      void fetchNotifications();
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fetchNotifications]);

  // ==========================================
  // CLOSE DROPDOWNS ON OUTSIDE CLICK / ESCAPE
  // ==========================================

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        profileRef.current &&
        !profileRef.current.contains(target)
      ) {
        setAdminMenuOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAdminMenuOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ==========================================
  // MARK NOTIFICATION AS READ
  // ==========================================

  const markAsRead = async (notificationId: string) => {
    const notification = notifications.find(
      (item) => item._id === notificationId
    );

    if (!notification || notification.isRead) {
      return;
    }

    setMarkingReadId(notificationId);

    try {
      const response = await fetch(
        `/api/admin/notifications/${notificationId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to mark notification as read."
        );
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notificationId
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
      setNotificationError("");
    } catch (error) {
      console.error("MARK NOTIFICATION READ ERROR:", error);

      setNotificationError(
        error instanceof Error
          ? error.message
          : "Unable to mark notification as read."
      );
    } finally {
      setMarkingReadId(null);
    }
  };

  // ==========================================
  // MARK ALL NOTIFICATIONS AS READ
  // ==========================================

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (item) => !item.isRead
    );

    if (unreadNotifications.length === 0) {
      return;
    }

    for (const notification of unreadNotifications) {
      try {
        const response = await fetch(
          `/api/admin/notifications/${notification._id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const data = await response.json().catch(() => null);

          throw new Error(
            data?.message ||
              `Unable to mark ${notification._id} as read.`
          );
        }

        setNotifications((previous) =>
          previous.map((item) =>
            item._id === notification._id
              ? { ...item, isRead: true }
              : item
          )
        );

        setUnreadCount((previous) => Math.max(0, previous - 1));
      } catch (error) {
        console.error("MARK ALL NOTIFICATIONS READ ERROR:", error);

        setNotificationError(
          error instanceof Error
            ? error.message
            : "Some notifications could not be marked as read."
        );

        break;
      }
    }

    await fetchNotifications();
  };

  // ==========================================
  // FORMAT NOTIFICATION DATE
  // ==========================================

  const formatNotificationDate = (date: string) => {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsedDate);
  };

  // ==========================================
  // GET NOTIFICATION ICON
  // ==========================================

  const getNotificationIcon = (
    type: AdminNotification["type"]
  ) => {
    switch (type) {
      case "new_customer":
        return "solar:user-plus-linear";

      case "new_order":
        return "solar:bag-4-linear";

      case "customer_cancellation":
        return "solar:close-circle-linear";

      case "order_status":
        return "solar:delivery-linear";

      case "payment_status":
        return "solar:card-linear";

      case "low_stock":
        return "solar:box-minimalistic-linear";

      default:
        return "solar:bell-linear";
    }
  };

  // ==========================================
  // GET ORDER LINK
  // ==========================================

  const getOrderId = (notification: AdminNotification) => {
    if (!notification.orderId) {
      return null;
    }

    if (typeof notification.orderId === "string") {
      return notification.orderId;
    }

    return notification.orderId._id || null;
  };

  // ==========================================
  // RENDER TOPBAR
  // ==========================================

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button
          type="button"
          className="admin-menu-button"
          onClick={onMenuClick}
          aria-label="Open admin menu"
        >
          <Icon
            icon="solar:hamburger-menu-linear"
            width={21}
            height={21}
          />
        </button>

        <div className="admin-topbar-heading">
          <span className="admin-topbar-eyebrow">ADMIN PANEL</span>
          <h1>Dashboard</h1>
        </div>
      </div>

      <div className="admin-topbar-right">
        {/* NOTIFICATION BELL */}

        <div
          className="admin-notification-wrapper"
          ref={notificationRef}
        >
          <button
            type="button"
            className="admin-topbar-icon-button"
            aria-label={`Notifications${
              unreadCount > 0 ? `, ${unreadCount} unread` : ""
            }`}
            aria-expanded={notificationsOpen}
            aria-haspopup="dialog"
            title="Notifications"
            onClick={() => {
              setNotificationsOpen((previous) => !previous);
              setAdminMenuOpen(false);

              if (!notificationsOpen) {
                void fetchNotifications(true);
              }
            }}
          >
            <Icon icon="solar:bell-linear" width={20} height={20} />

            {unreadCount > 0 && (
              <span className="admin-notification-count">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div
              className="admin-notifications-dropdown"
              role="dialog"
              aria-label="Admin notifications"
            >
              <div className="admin-notifications-header">
                <div>
                  <h2>Notifications</h2>
                  <p>
                    {unreadCount > 0
                      ? `${unreadCount} unread notification${
                          unreadCount === 1 ? "" : "s"
                        }`
                      : "You're all caught up"}
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-notification-refresh"
                  title="Refresh notifications"
                  aria-label="Refresh notifications"
                  onClick={() => void fetchNotifications(true)}
                >
                  <Icon
                    icon="solar:refresh-linear"
                    width={18}
                    height={18}
                  />
                </button>
              </div>

              {unreadCount > 0 && (
                <div className="admin-notifications-actions">
                  <button
                    type="button"
                    onClick={() => void markAllAsRead()}
                    disabled={markingReadId !== null}
                  >
                    Mark all as read
                  </button>
                </div>
              )}

              {notificationError && (
                <div className="admin-notification-error">
                  <span>{notificationError}</span>
                  <button
                    type="button"
                    onClick={() => void fetchNotifications(true)}
                  >
                    Retry
                  </button>
                </div>
              )}

              <div className="admin-notifications-list">
                {notificationsLoading && notifications.length === 0 ? (
                  <div className="admin-notifications-state">
                    <Icon
                      icon="solar:refresh-linear"
                      width={22}
                      height={22}
                      className="admin-loading-icon"
                    />
                    <span>Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="admin-notifications-state">
                    <span className="admin-empty-icon">
                      <Icon
                        icon="solar:bell-off-linear"
                        width={27}
                        height={27}
                      />
                    </span>
                    <strong>No notifications yet</strong>
                    <p>
                      New customers, orders, cancellations, and order or
                      payment updates will appear here when the corresponding
                      notification APIs create them.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => {
                    const orderId = getOrderId(notification);

                    return (
                      <div
                        key={notification._id}
                        className={`admin-notification-item ${
                          notification.isRead ? "is-read" : "is-unread"
                        }`}
                      >
                        <span className="admin-notification-item-icon">
                          <Icon
                            icon={getNotificationIcon(notification.type)}
                            width={19}
                            height={19}
                          />
                        </span>

                        <div className="admin-notification-content">
                          <div className="admin-notification-item-heading">
                            <strong>{notification.title}</strong>

                            {!notification.isRead && (
                              <span className="admin-notification-unread-dot" />
                            )}
                          </div>

                          <p>{notification.message}</p>

                          <div className="admin-notification-meta">
                            <span>
                              {formatNotificationDate(notification.createdAt)}
                            </span>

                            {!notification.isRead && (
                              <button
                                type="button"
                                disabled={
                                  markingReadId === notification._id
                                }
                                onClick={() =>
                                  void markAsRead(notification._id)
                                }
                              >
                                {markingReadId === notification._id
                                  ? "Saving..."
                                  : "Mark read"}
                              </button>
                            )}
                          </div>

                          {orderId && (
                            <Link
                              href={`/admin/orders/${orderId}`}
                              className="admin-notification-order-link"
                              onClick={() => {
                                if (!notification.isRead) {
                                  void markAsRead(notification._id);
                                }

                                setNotificationsOpen(false);
                              }}
                            >
                              View order
                              <Icon
                                icon="solar:arrow-right-linear"
                                width={14}
                                height={14}
                              />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="admin-notifications-footer">
                <span>Automatically refreshes every 15 seconds</span>
              </div>
            </div>
          )}
        </div>

        <div className="admin-topbar-divider" />

        {/* ADMIN PROFILE DROPDOWN */}

        <div
          className="admin-topbar-profile-wrapper"
          ref={profileRef}
        >
          <button
            type="button"
            className="admin-topbar-profile"
            onClick={() => {
              setAdminMenuOpen((previous) => !previous);
              setNotificationsOpen(false);
            }}
            aria-expanded={adminMenuOpen}
            aria-haspopup="menu"
          >
            <span className="admin-topbar-avatar">A</span>

            <span className="admin-topbar-user-info">
              <span className="admin-topbar-user-name">Admin</span>
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
              className="admin-profile-chevron"
            />
          </button>

          {adminMenuOpen && (
            <div className="admin-topbar-dropdown" role="menu">
              <div className="admin-dropdown-header">
                <div className="admin-dropdown-avatar">A</div>

                <div className="admin-dropdown-user">
                  <div className="admin-dropdown-name">Admin</div>
                  <div className="admin-dropdown-email">
                    Administrator account
                  </div>
                </div>
              </div>

              <div className="admin-dropdown-divider" />

              <Link
                href="/admin/settings/profile"
                className="admin-dropdown-item"
                role="menuitem"
                onClick={() => setAdminMenuOpen(false)}
              >
                <Icon icon="solar:user-linear" width={18} height={18} />
                <span>My Profile</span>
              </Link>

              <Link
                href="/admin/settings"
                className="admin-dropdown-item"
                role="menuitem"
                onClick={() => setAdminMenuOpen(false)}
              >
                <Icon
                  icon="solar:settings-linear"
                  width={18}
                  height={18}
                />
                <span>Settings</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .admin-topbar {
          position: sticky;
          top: 0;
          z-index: 900;
          width: 100%;
          min-width: 0;
          height: 68px;
          padding: 0 22px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: #faf8f5;
          border-bottom: 1px solid #eeeeee;
        }

        .admin-topbar-left,
        .admin-topbar-right {
          display: flex;
          align-items: center;
          min-width: 0;
        }

        .admin-topbar-left {
          gap: 14px;
        }

        .admin-topbar-heading {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .admin-topbar-eyebrow {
          display: block;
          margin-bottom: 4px;
          color: #999;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.16em;
          line-height: 1;
        }

        .admin-topbar-heading h1 {
          margin: 0;
          padding: 0;
          color: #111;
          font-size: 19px;
          font-weight: 600;
          letter-spacing: -0.025em;
          line-height: 1.2;
        }

        .admin-menu-button {
          display: none;
          flex: 0 0 36px;
          width: 36px;
          height: 36px;
          padding: 0;
          align-items: center;
          justify-content: center;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          background: #faf8f5;
          color: #111;
          cursor: pointer;
        }

        .admin-topbar-right {
          flex: 0 0 auto;
          justify-content: flex-end;
          gap: 12px;
        }

        .admin-notification-wrapper {
          position: relative;
          flex: 0 0 auto;
        }

        .admin-topbar-icon-button {
          position: relative;
          flex: 0 0 36px;
          width: 36px;
          height: 36px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 50%;
          background: transparent;
          color: #333;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .admin-topbar-icon-button:hover {
          background: #f0eeeb;
        }

        .admin-notification-count {
          position: absolute;
          top: -3px;
          right: -4px;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #faf8f5;
          border-radius: 999px;
          background: #111;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          line-height: 1;
        }

        .admin-topbar-divider {
          width: 1px;
          height: 28px;
          background: #e9e6e2;
        }

        .admin-topbar-profile-wrapper {
          position: relative;
          flex: 0 0 auto;
        }

        .admin-topbar-profile {
          min-height: 42px;
          padding: 0 2px 0 0;
          display: flex;
          align-items: center;
          gap: 9px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #111;
          cursor: pointer;
        }

        .admin-topbar-profile:hover {
          background: #f2f0ed;
        }

        .admin-topbar-avatar,
        .admin-dropdown-avatar {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #111;
          color: #fff;
          font-weight: 700;
        }

        .admin-topbar-avatar {
          width: 34px;
          height: 34px;
          font-size: 12px;
        }

        .admin-topbar-user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
        }

        .admin-topbar-user-name {
          color: #111;
          font-size: 12px;
          font-weight: 600;
          line-height: 1;
        }

        .admin-topbar-user-role {
          color: #999;
          font-size: 10px;
          line-height: 1;
        }

        .admin-profile-chevron {
          flex: 0 0 auto;
          margin-left: 2px;
        }

        .admin-topbar-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 248px;
          overflow: hidden;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          background: #faf8f5;
          box-shadow: 0 16px 38px rgba(0, 0, 0, 0.12);
          z-index: 2000;
        }

        .admin-dropdown-header {
          padding: 15px;
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .admin-dropdown-avatar {
          width: 38px;
          height: 38px;
          font-size: 12px;
        }

        .admin-dropdown-user {
          min-width: 0;
        }

        .admin-dropdown-name {
          color: #111;
          font-size: 13px;
          font-weight: 600;
        }

        .admin-dropdown-email {
          margin-top: 4px;
          color: #888;
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .admin-dropdown-divider {
          width: 100%;
          height: 1px;
          background: #eee;
        }

        .admin-dropdown-item {
          width: 100%;
          min-height: 42px;
          padding: 0 15px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 0;
          background: #faf8f5;
          color: #222;
          text-align: left;
          text-decoration: none;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .admin-dropdown-item:hover {
          background: #f0eeeb;
        }

        /* NOTIFICATION DROPDOWN */

        .admin-notifications-dropdown {
          position: absolute;
          top: calc(100% + 14px);
          right: -8px;
          z-index: 2100;
          width: 390px;
          max-width: calc(100vw - 24px);
          overflow: hidden;
          border: 1px solid #e5e5e5;
          border-radius: 14px;
          background: #fff;
          color: #111;
          box-shadow: 0 18px 48px rgba(0, 0, 0, 0.14);
        }

        .admin-notifications-header {
          padding: 17px 17px 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid #eee;
        }

        .admin-notifications-header h2 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .admin-notifications-header p {
          margin: 5px 0 0;
          color: #888;
          font-size: 11px;
        }

        .admin-notification-refresh {
          flex: 0 0 34px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e8e8e8;
          border-radius: 9px;
          background: #fff;
          color: #333;
          cursor: pointer;
        }

        .admin-notification-refresh:hover {
          background: #f5f5f5;
        }

        .admin-notifications-actions {
          padding: 8px 16px;
          display: flex;
          justify-content: flex-end;
          border-bottom: 1px solid #f0f0f0;
        }

        .admin-notifications-actions button,
        .admin-notification-meta button {
          padding: 4px 0;
          border: 0;
          background: transparent;
          color: #333;
          font-family: inherit;
          font-size: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .admin-notifications-actions button:hover,
        .admin-notification-meta button:hover {
          text-decoration: underline;
        }

        .admin-notifications-actions button:disabled,
        .admin-notification-meta button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .admin-notifications-list {
          max-height: min(440px, calc(100vh - 190px));
          overflow-y: auto;
          overscroll-behavior: contain;
        }

        .admin-notification-item {
          padding: 14px 15px;
          display: flex;
          align-items: flex-start;
          gap: 11px;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.15s ease;
        }

        .admin-notification-item:last-child {
          border-bottom: 0;
        }

        .admin-notification-item.is-unread {
          background: #faf9f7;
        }

        .admin-notification-item:hover {
          background: #f5f4f2;
        }

        .admin-notification-item-icon {
          flex: 0 0 35px;
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          background: #fff;
          color: #222;
        }

        .admin-notification-content {
          flex: 1;
          min-width: 0;
        }

        .admin-notification-item-heading {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .admin-notification-item-heading strong {
          color: #161616;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.4;
        }

        .admin-notification-unread-dot {
          flex: 0 0 6px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #111;
        }

        .admin-notification-content > p {
          margin: 6px 0 8px;
          color: #666;
          font-size: 11px;
          line-height: 1.6;
          overflow-wrap: anywhere;
        }

        .admin-notification-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .admin-notification-meta > span {
          color: #999;
          font-size: 10px;
        }

        .admin-notification-order-link {
          width: fit-content;
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #111;
          font-size: 10px;
          font-weight: 700;
          text-decoration: none;
        }

        .admin-notification-order-link:hover {
          text-decoration: underline;
        }

        .admin-notifications-state {
          min-height: 170px;
          padding: 24px 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #888;
          text-align: center;
          font-size: 11px;
        }

        .admin-notifications-state strong {
          color: #222;
          font-size: 12px;
        }

        .admin-notifications-state p {
          max-width: 260px;
          margin: 0;
          color: #888;
          font-size: 11px;
          line-height: 1.6;
        }

        .admin-empty-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #eee;
          border-radius: 50%;
          color: #777;
        }

        .admin-loading-icon {
          animation: admin-spin 1s linear infinite;
        }

        .admin-notification-error {
          padding: 10px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #fff7f7;
          color: #a32222;
          font-size: 10px;
          line-height: 1.5;
        }

        .admin-notification-error button {
          flex: 0 0 auto;
          padding: 5px 8px;
          border: 1px solid #e5caca;
          border-radius: 6px;
          background: #fff;
          color: #8c2020;
          font-size: 10px;
          cursor: pointer;
        }

        .admin-notifications-footer {
          padding: 10px 15px;
          border-top: 1px solid #eee;
          background: #faf9f7;
          color: #999;
          font-size: 9px;
          text-align: center;
        }

        @keyframes admin-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1100px) {
          .admin-topbar {
            padding: 0 18px;
          }
        }

        @media (max-width: 900px) {
          .admin-topbar {
            height: 64px;
            padding: 0 16px;
          }

          .admin-menu-button {
            display: flex;
          }

          .admin-topbar-left {
            gap: 10px;
          }

          .admin-topbar-heading h1 {
            font-size: 17px;
          }

          .admin-topbar-right {
            gap: 8px;
          }
        }

        @media (max-width: 520px) {
          .admin-topbar {
            height: 60px;
            padding: 0 10px;
            gap: 8px;
          }

          .admin-topbar-left {
            gap: 8px;
          }

          .admin-menu-button {
            flex-basis: 34px;
            width: 34px;
            height: 34px;
          }

          .admin-topbar-eyebrow {
            font-size: 7px;
            margin-bottom: 3px;
          }

          .admin-topbar-heading h1 {
            font-size: 15px;
          }

          .admin-topbar-right {
            gap: 4px;
          }

          .admin-topbar-icon-button {
            flex-basis: 32px;
            width: 32px;
            height: 32px;
          }

          .admin-notification-count {
            top: -2px;
            right: -3px;
          }

          .admin-topbar-divider {
            display: none;
          }

          .admin-topbar-user-info,
          .admin-profile-chevron {
            display: none;
          }

          .admin-topbar-profile {
            min-height: 36px;
            padding: 0;
          }

          .admin-topbar-avatar {
            width: 32px;
            height: 32px;
          }

          .admin-topbar-dropdown {
            position: fixed;
            top: 66px;
            left: 10px;
            right: 10px;
            width: auto;
          }

          .admin-notifications-dropdown {
            position: fixed;
            top: 66px;
            left: 10px;
            right: 10px;
            width: auto;
            max-width: none;
          }

          .admin-notifications-list {
            max-height: calc(100vh - 180px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </header>
  );
}
