"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

type AccountStatus = "active" | "disabled";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  accountStatus: AccountStatus;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string | null;
  updatedAt: string | null;

  statistics: {
    totalOrders: number;
    activeOrders: number;
    cancelledOrders: number;
    totalSpent: number;
    latestOrderDate: string | null;
  };
};

type OrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
};

type Order = {
  id: string;
  userId: string;
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
  paymentStatus: "pending" | "paid" | "failed";

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

  createdAt: string | null;
  updatedAt: string | null;
};

export default function AdminCustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(
    null
  );

  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [orderFilter, setOrderFilter] = useState<
    "all" | "active" | "cancelled"
  >("all");

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [showStatusModal, setShowStatusModal] =
    useState(false);

  useEffect(() => {
    if (!customerId) return;

    fetchCustomer();
  }, [customerId]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/customers/${customerId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load customer."
        );
      }

      setCustomer(data.customer);
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load customer details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAccountStatusChange = async () => {
    if (!customer) return;

    try {
      setUpdatingStatus(true);

      const newStatus: AccountStatus =
        customer.accountStatus === "active"
          ? "disabled"
          : "active";

      const response = await fetch(
        `/api/admin/customers/${customer.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accountStatus: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to update account status."
        );
      }

      setCustomer((previous) =>
        previous
          ? {
              ...previous,
              accountStatus:
                data.customer.accountStatus,
            }
          : previous
      );

      setShowStatusModal(false);
    } catch (err) {
      console.error(err);

      alert(
        err instanceof Error
          ? err.message
          : "Unable to update account status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStatusLabel = (
    status: Order["orderStatus"]
  ) => {
    const labels: Record<
      Order["orderStatus"],
      string
    > = {
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    return labels[status];
  };

  const getPaymentLabel = (
    status: Order["paymentStatus"]
  ) => {
    const labels: Record<
      Order["paymentStatus"],
      string
    > = {
      pending: "Pending",
      paid: "Paid",
      failed: "Failed",
    };

    return labels[status];
  };

  const filteredOrders = orders.filter((order) => {
    if (orderFilter === "active") {
      return order.orderStatus !== "cancelled";
    }

    if (orderFilter === "cancelled") {
      return order.orderStatus === "cancelled";
    }

    return true;
  });

  if (loading) {
    return (
      <main className="customer-page">
        <div className="loading-card">
          <div className="spinner" />

          <p>Loading customer details...</p>
        </div>

        <style jsx>{`
          .customer-page {
            min-height: 100vh;
            background: #f7f7f7;
            padding: 40px;
          }

          .loading-card {
            min-height: 500px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #fff;
            border: 1px solid #e8e8e8;
            border-radius: 20px;
            color: #777;
          }

          .spinner {
            width: 34px;
            height: 34px;
            border: 3px solid #e5e5e5;
            border-top-color: #111;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 15px;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 768px) {
            .customer-page {
              padding: 20px;
            }
          }
        `}</style>
      </main>
    );
  }

  if (error || !customer) {
    return (
      <main className="customer-page">
        <div className="error-card">
          <div className="error-icon">
            <Icon icon="solar:user-cross-linear" />
          </div>

          <h2>Customer Not Found</h2>

          <p>
            {error ||
              "The customer you are looking for does not exist."}
          </p>

          <button
            onClick={() =>
              router.push("/admin/customers")
            }
          >
            <Icon icon="solar:arrow-left-linear" />
            Back to Customers
          </button>
        </div>

        <style jsx>{`
          .customer-page {
            min-height: 100vh;
            background: #f7f7f7;
            padding: 40px;
          }

          .error-card {
            min-height: 500px;
            background: #fff;
            border: 1px solid #e8e8e8;
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 30px;
          }

          .error-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            margin-bottom: 20px;
          }

          .error-card h2 {
            margin: 0 0 8px;
            font-size: 24px;
            color: #111;
          }

          .error-card p {
            margin: 0 0 25px;
            color: #777;
          }

          .error-card button {
            border: 0;
            background: #111;
            color: #fff;
            padding: 12px 18px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 14px;
          }

          @media (max-width: 768px) {
            .customer-page {
              padding: 20px;
            }
          }
        `}</style>
      </main>
    );
  }

  const isActive = customer.accountStatus === "active";

  return (
    <main className="customer-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <Link
            href="/admin/customers"
            className="back-link"
          >
            <Icon icon="solar:arrow-left-linear" />
            Back to Customers
          </Link>

          <div className="title-row">
            <div className="customer-avatar">
              {customer.name
                ?.charAt(0)
                .toUpperCase() || "C"}
            </div>

            <div>
              <h1>{customer.name}</h1>

              <div className="customer-meta">
                <p>
                  Customer since{" "}
                  {formatDate(customer.createdAt)}
                </p>

                <span
                  className={`account-status ${
                    isActive ? "active" : "disabled"
                  }`}
                >
                  <span className="status-dot" />
                  {isActive ? "Active" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div className="header-badge">
            <Icon icon="solar:verified-check-linear" />
            Customer
          </div>

          <button
            className={`account-control ${
              isActive ? "disable" : "enable"
            }`}
            onClick={() => setShowStatusModal(true)}
          >
            <Icon
              icon={
                isActive
                  ? "solar:lock-keyhole-linear"
                  : "solar:lock-keyhole-unlocked-linear"
              }
            />

            {isActive
              ? "Disable Account"
              : "Enable Account"}
          </button>
        </div>
      </div>

      {/* DISABLED ACCOUNT NOTICE */}
      {!isActive && (
        <div className="disabled-notice">
          <div className="disabled-notice-icon">
            <Icon icon="solar:shield-warning-linear" />
          </div>

          <div>
            <strong>Account is disabled</strong>

            <p>
              This customer cannot log in until the
              account is enabled again.
            </p>
          </div>

          <button
            onClick={() => setShowStatusModal(true)}
          >
            Enable Account
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Icon icon="solar:bag-4-linear" />
          </div>

          <div>
            <span>Total Orders</span>

            <strong>
              {customer.statistics.totalOrders}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Icon icon="solar:wallet-money-linear" />
          </div>

          <div>
            <span>Total Spent</span>

            <strong>
              {formatCurrency(
                customer.statistics.totalSpent
              )}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Icon icon="solar:box-linear" />
          </div>

          <div>
            <span>Active Orders</span>

            <strong>
              {customer.statistics.activeOrders}
            </strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Icon icon="solar:close-circle-linear" />
          </div>

          <div>
            <span>Cancelled</span>

            <strong>
              {customer.statistics.cancelledOrders}
            </strong>
          </div>
        </div>
      </section>

      {/* CUSTOMER INFORMATION */}
      <section className="content-grid">
        <div className="info-card">
          <div className="card-header">
            <div>
              <span className="eyebrow">PROFILE</span>

              <h2>Customer Information</h2>
            </div>

            <div className="card-header-icon">
              <Icon icon="solar:user-linear" />
            </div>
          </div>

          <div className="info-list">
            <div className="info-row">
              <div className="info-label">
                <Icon icon="solar:user-linear" />
                Name
              </div>

              <strong>{customer.name}</strong>
            </div>

            <div className="info-row">
              <div className="info-label">
                <Icon icon="solar:letter-linear" />
                Email
              </div>

              <strong>{customer.email}</strong>
            </div>

            <div className="info-row">
              <div className="info-label">
                <Icon icon="solar:phone-linear" />
                Phone
              </div>

              <strong>{customer.phone}</strong>
            </div>

            <div className="info-row">
              <div className="info-label">
                <Icon icon="solar:calendar-linear" />
                Joined
              </div>

              <strong>
                {formatDate(customer.createdAt)}
              </strong>
            </div>

            <div className="info-row">
              <div className="info-label">
                <Icon icon="solar:shield-check-linear" />
                Account Status
              </div>

              <span
                className={`table-status ${
                  isActive ? "active" : "disabled"
                }`}
              >
                <span className="status-dot" />
                {isActive ? "Active" : "Disabled"}
              </span>
            </div>

            <div className="info-row">
              <div className="info-label">
                <Icon icon="solar:refresh-linear" />
                Last Updated
              </div>

              <strong>
                {formatDateTime(customer.updatedAt)}
              </strong>
            </div>
          </div>
        </div>

        <div className="info-card">
          <div className="card-header">
            <div>
              <span className="eyebrow">ADDRESS</span>

              <h2>Shipping Address</h2>
            </div>

            <div className="card-header-icon">
              <Icon icon="solar:map-point-linear" />
            </div>
          </div>

          <div className="address-box">
            <div className="address-icon">
              <Icon icon="solar:map-point-linear" />
            </div>

            <div>
              <strong>{customer.name}</strong>

              <p>
                {customer.address ||
                  "No address provided"}
              </p>

              {(customer.city ||
                customer.state ||
                customer.pincode) && (
                <p>
                  {[
                    customer.city,
                    customer.state,
                    customer.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* LATEST ORDER */}
      <section className="latest-card">
        <div className="latest-content">
          <div className="latest-icon">
            <Icon icon="solar:bag-4-bold" />
          </div>

          <div>
            <span>Latest Order</span>

            {customer.statistics.latestOrderDate ? (
              <strong>
                {formatDateTime(
                  customer.statistics.latestOrderDate
                )}
              </strong>
            ) : (
              <strong>No orders yet</strong>
            )}
          </div>
        </div>

        {orders.length > 0 && (
          <Link
            href={`/admin/orders/${orders[0].id}`}
            className="latest-button"
          >
            View Latest Order
            <Icon icon="solar:arrow-right-linear" />
          </Link>
        )}
      </section>

      {/* ORDER HISTORY */}
      <section className="orders-card">
        <div className="orders-header">
          <div>
            <span className="eyebrow">ORDERS</span>

            <h2>Order History</h2>

            <p>
              All orders placed by this customer
            </p>
          </div>

          <div className="filter-tabs">
            <button
              className={
                orderFilter === "all" ? "active" : ""
              }
              onClick={() => setOrderFilter("all")}
            >
              All
              <span>{orders.length}</span>
            </button>

            <button
              className={
                orderFilter === "active"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setOrderFilter("active")
              }
            >
              Active
              <span>
                {customer.statistics.activeOrders}
              </span>
            </button>

            <button
              className={
                orderFilter === "cancelled"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setOrderFilter("cancelled")
              }
            >
              Cancelled
              <span>
                {customer.statistics.cancelledOrders}
              </span>
            </button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">
              <Icon icon="solar:bag-4-linear" />
            </div>

            <h3>No Orders Found</h3>

            <p>
              This customer has no orders in the
              selected category.
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div
                className="order-row"
                key={order.id}
              >
                <div className="order-main">
                  <div className="order-icon">
                    <Icon icon="solar:bag-4-linear" />
                  </div>

                  <div>
                    <strong>
                      #{order.id
                        .slice(-8)
                        .toUpperCase()}
                    </strong>

                    <span>
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  <span>
                    {order.items.length}{" "}
                    {order.items.length === 1
                      ? "item"
                      : "items"}
                  </span>

                  <small>
                    {order.items.reduce(
                      (sum, item) =>
                        sum + item.quantity,
                      0
                    )}{" "}
                    total units
                  </small>
                </div>

                <div className="order-payment">
                  <span
                    className={`payment-status ${order.paymentStatus}`}
                  >
                    {getPaymentLabel(
                      order.paymentStatus
                    )}
                  </span>

                  <small>
                    {order.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Online"}
                  </small>
                </div>

                <div className="order-status">
                  <span
                    className={`status-badge ${order.orderStatus}`}
                  >
                    {getStatusLabel(
                      order.orderStatus
                    )}
                  </span>
                </div>

                <div className="order-total">
                  <strong>
                    {formatCurrency(order.total)}
                  </strong>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    aria-label="View order"
                  >
                    <Icon icon="solar:arrow-right-linear" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ACCOUNT STATUS MODAL */}
      {showStatusModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!updatingStatus) {
              setShowStatusModal(false);
            }
          }}
        >
          <div
            className="status-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className={`modal-icon ${
                isActive ? "danger" : "success"
              }`}
            >
              <Icon
                icon={
                  isActive
                    ? "solar:lock-keyhole-linear"
                    : "solar:lock-keyhole-unlocked-linear"
                }
              />
            </div>

            <h2>
              {isActive
                ? "Disable Customer Account?"
                : "Enable Customer Account?"}
            </h2>

            <p>
              {isActive
                ? `Are you sure you want to disable ${customer.name}'s account? They will not be able to log in until the account is enabled again.`
                : `Are you sure you want to enable ${customer.name}'s account? They will be able to log in again.`}
            </p>

            <div className="modal-actions">
              <button
                className="cancel-button"
                disabled={updatingStatus}
                onClick={() =>
                  setShowStatusModal(false)
                }
              >
                Cancel
              </button>

              <button
                className={`confirm-button ${
                  isActive ? "danger" : "success"
                }`}
                disabled={updatingStatus}
                onClick={handleAccountStatusChange}
              >
                {updatingStatus ? (
                  <>
                    <span className="button-spinner" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Icon
                      icon={
                        isActive
                          ? "solar:lock-keyhole-linear"
                          : "solar:lock-keyhole-unlocked-linear"
                      }
                    />

                    {isActive
                      ? "Disable Account"
                      : "Enable Account"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .customer-page {
          min-height: 100vh;
          background: #f7f7f7;
          padding: 34px;
          color: #111;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
          margin-bottom: 28px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #777;
          text-decoration: none;
          font-size: 13px;
          margin-bottom: 18px;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: #111;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .customer-avatar {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 700;
        }

        .title-row h1 {
          margin: 0;
          font-size: 30px;
          line-height: 1.1;
          font-weight: 700;
          letter-spacing: -0.8px;
        }

        .customer-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .title-row p {
          margin: 0;
          color: #777;
          font-size: 13px;
        }

        .account-status,
        .table-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 700;
        }

        .account-status.active,
        .table-status.active {
          background: #e7f7ed;
          color: #18703b;
        }

        .account-status.disabled,
        .table-status.disabled {
          background: #fce9e9;
          color: #b42323;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #111;
          color: #fff;
          padding: 10px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }

        .account-control {
          border: 1px solid transparent;
          padding: 10px 14px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .account-control.disable {
          background: #fff;
          border-color: #e5e5e5;
          color: #b42323;
        }

        .account-control.disable:hover {
          background: #fff4f4;
          border-color: #f1caca;
        }

        .account-control.enable {
          background: #111;
          color: #fff;
        }

        .account-control.enable:hover {
          background: #292929;
        }

        .disabled-notice {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px 18px;
          background: #fff5f5;
          border: 1px solid #f2d0d0;
          border-radius: 15px;
          margin-bottom: 18px;
        }

        .disabled-notice-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #fde4e4;
          color: #b42323;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .disabled-notice strong {
          display: block;
          font-size: 13px;
          margin-bottom: 3px;
        }

        .disabled-notice p {
          margin: 0;
          color: #777;
          font-size: 11px;
        }

        .disabled-notice button {
          margin-left: auto;
          border: 0;
          background: #111;
          color: #fff;
          border-radius: 8px;
          padding: 9px 12px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 18px;
        }

        .stat-card {
          background: #fff;
          border: 1px solid #e7e7e7;
          border-radius: 17px;
          padding: 19px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 13px;
          background: #f3f3f3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
        }

        .stat-card span {
          display: block;
          font-size: 12px;
          color: #858585;
          margin-bottom: 5px;
        }

        .stat-card strong {
          display: block;
          font-size: 20px;
          letter-spacing: -0.3px;
        }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          margin-bottom: 18px;
        }

        .info-card,
        .orders-card {
          background: #fff;
          border: 1px solid #e7e7e7;
          border-radius: 18px;
          overflow: hidden;
        }

        .info-card {
          padding: 23px;
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 20px;
        }

        .eyebrow {
          display: block;
          color: #999;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.2px;
          margin-bottom: 5px;
        }

        .card-header h2,
        .orders-header h2 {
          margin: 0;
          font-size: 18px;
          letter-spacing: -0.3px;
        }

        .card-header-icon {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: #f4f4f4;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
        }

        .info-list {
          border-top: 1px solid #eeeeee;
        }

        .info-row {
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid #eeeeee;
        }

        .info-row:last-child {
          border-bottom: 0;
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #777;
          font-size: 13px;
        }

        .info-label :global(svg) {
          font-size: 17px;
        }

        .info-row strong {
          text-align: right;
          font-size: 13px;
          word-break: break-word;
        }

        .address-box {
          min-height: 155px;
          padding: 20px;
          background: #f8f8f8;
          border-radius: 14px;
          display: flex;
          gap: 14px;
        }

        .address-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
        }

        .address-box strong {
          display: block;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .address-box p {
          margin: 0 0 5px;
          color: #666;
          font-size: 13px;
          line-height: 1.6;
        }

        .latest-card {
          background: #111;
          color: #fff;
          border-radius: 18px;
          padding: 19px 22px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .latest-content {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .latest-icon {
          width: 43px;
          height: 43px;
          border-radius: 12px;
          background: #242424;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .latest-content span {
          display: block;
          color: #aaa;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .latest-content strong {
          display: block;
          font-size: 14px;
        }

        .latest-button {
          color: #111;
          background: #fff;
          text-decoration: none;
          padding: 10px 14px;
          border-radius: 9px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .orders-header {
          padding: 23px;
          border-bottom: 1px solid #eeeeee;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .orders-header p {
          margin: 5px 0 0;
          color: #888;
          font-size: 12px;
        }

        .filter-tabs {
          display: flex;
          gap: 4px;
          background: #f4f4f4;
          padding: 4px;
          border-radius: 10px;
        }

        .filter-tabs button {
          border: 0;
          background: transparent;
          color: #777;
          padding: 8px 10px;
          border-radius: 7px;
          cursor: pointer;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .filter-tabs button span {
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          border-radius: 50%;
          background: #e3e3e3;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
        }

        .filter-tabs button.active {
          background: #111;
          color: #fff;
        }

        .filter-tabs button.active span {
          background: #333;
          color: #fff;
        }

        .orders-list {
          width: 100%;
        }

        .order-row {
          min-height: 82px;
          padding: 15px 22px;
          display: grid;
          grid-template-columns: 1.5fr 0.7fr 0.9fr 0.8fr 0.8fr;
          align-items: center;
          gap: 15px;
          border-bottom: 1px solid #eeeeee;
        }

        .order-row:last-child {
          border-bottom: 0;
        }

        .order-main {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .order-icon {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #f3f3f3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .order-main strong,
        .order-main span {
          display: block;
        }

        .order-main strong {
          font-size: 12px;
          margin-bottom: 4px;
        }

        .order-main span {
          font-size: 10px;
          color: #888;
        }

        .order-items span,
        .order-payment small {
          display: block;
          font-size: 11px;
          color: #555;
        }

        .order-items small {
          display: block;
          color: #999;
          font-size: 10px;
          margin-top: 4px;
        }

        .payment-status,
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }

        .payment-status.pending {
          background: #fff4d6;
          color: #956d00;
        }

        .payment-status.paid {
          background: #e5f8ed;
          color: #19703c;
        }

        .payment-status.failed {
          background: #fde8e8;
          color: #b42323;
        }

        .order-payment small {
          margin-top: 5px;
          color: #999;
        }

        .status-badge.pending {
          background: #fff4d6;
          color: #956d00;
        }

        .status-badge.confirmed,
        .status-badge.processing {
          background: #e8efff;
          color: #315fae;
        }

        .status-badge.shipped {
          background: #efe8ff;
          color: #6941a5;
        }

        .status-badge.delivered {
          background: #e5f8ed;
          color: #19703c;
        }

        .status-badge.cancelled {
          background: #fde8e8;
          color: #b42323;
        }

        .order-total {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 10px;
        }

        .order-total strong {
          font-size: 13px;
        }

        .order-total a {
          width: 31px;
          height: 31px;
          border-radius: 8px;
          background: #f3f3f3;
          color: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .order-total a:hover {
          background: #111;
          color: #fff;
        }

        .empty-orders {
          padding: 70px 20px;
          text-align: center;
        }

        .empty-icon {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #f4f4f4;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 15px;
          font-size: 25px;
        }

        .empty-orders h3 {
          margin: 0 0 7px;
          font-size: 16px;
        }

        .empty-orders p {
          margin: 0;
          color: #888;
          font-size: 12px;
        }

        /* ---------------------------------
           STATUS MODAL
        --------------------------------- */

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .status-modal {
          width: min(430px, 100%);
          background: #fff;
          border-radius: 20px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.2);
          animation: modalIn 0.2s ease;
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-icon {
          width: 58px;
          height: 58px;
          border-radius: 16px;
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 27px;
        }

        .modal-icon.danger {
          background: #fde8e8;
          color: #b42323;
        }

        .modal-icon.success {
          background: #e6f7ed;
          color: #19703c;
        }

        .status-modal h2 {
          margin: 0 0 10px;
          font-size: 20px;
          letter-spacing: -0.3px;
        }

        .status-modal p {
          margin: 0 auto;
          max-width: 350px;
          color: #777;
          font-size: 13px;
          line-height: 1.65;
        }

        .modal-actions {
          display: flex;
          justify-content: center;
          gap: 9px;
          margin-top: 25px;
        }

        .cancel-button,
        .confirm-button {
          min-height: 42px;
          border-radius: 10px;
          padding: 0 16px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid transparent;
        }

        .cancel-button {
          background: #f3f3f3;
          border-color: #e6e6e6;
          color: #555;
        }

        .confirm-button {
          color: #fff;
        }

        .confirm-button.danger {
          background: #b42323;
        }

        .confirm-button.success {
          background: #111;
        }

        .cancel-button:disabled,
        .confirm-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .button-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .order-row {
            grid-template-columns: 1.4fr 0.7fr 0.9fr 0.8fr;
          }

          .order-total {
            justify-content: flex-start;
          }
        }

        @media (max-width: 900px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .orders-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .order-row {
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }

          .order-total {
            justify-content: flex-end;
          }
        }

        @media (max-width: 640px) {
          .customer-page {
            padding: 20px 14px;
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
          }

          .header-badge,
          .account-control {
            justify-content: center;
          }

          .title-row h1 {
            font-size: 24px;
          }

          .customer-avatar {
            width: 50px;
            height: 50px;
            border-radius: 14px;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .stat-card {
            padding: 14px;
            gap: 10px;
          }

          .stat-icon {
            width: 38px;
            height: 38px;
            font-size: 18px;
          }

          .stat-card strong {
            font-size: 16px;
          }

          .stat-card span {
            font-size: 10px;
          }

          .disabled-notice {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .disabled-notice button {
            width: 100%;
            margin-left: 0;
          }

          .info-card {
            padding: 17px;
          }

          .info-row {
            align-items: flex-start;
            flex-direction: column;
            gap: 5px;
            padding: 11px 0;
          }

          .info-row strong {
            text-align: left;
          }

          .latest-card {
            align-items: flex-start;
            flex-direction: column;
          }

          .latest-button {
            width: 100%;
            justify-content: center;
          }

          .orders-header {
            padding: 18px;
          }

          .filter-tabs {
            width: 100%;
            overflow-x: auto;
          }

          .filter-tabs button {
            flex: 1;
            justify-content: center;
            white-space: nowrap;
          }

          .order-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            padding: 17px;
          }

          .order-main {
            grid-column: 1 / -1;
          }

          .order-payment {
            text-align: right;
          }

          .order-status {
            display: flex;
            align-items: center;
          }

          .order-total {
            grid-column: 1 / -1;
            justify-content: space-between;
            padding-top: 8px;
            border-top: 1px solid #eee;
          }

          .status-modal {
            padding: 25px 20px;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .cancel-button,
          .confirm-button {
            width: 100%;
          }
        }

        @media (max-width: 380px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .filter-tabs button {
            padding: 8px 7px;
            font-size: 10px;
          }
        }
      `}</style>
    </main>
  );
}