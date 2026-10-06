"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

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
  _id: string;
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

  createdAt: string;
  updatedAt: string;
};

type StatusFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type PaymentFilter =
  | "all"
  | "pending"
  | "paid"
  | "failed";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [paymentFilter, setPaymentFilter] =
    useState<PaymentFilter>("all");

  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest"
  >("newest");

  // ==========================================
  // FETCH ORDERS
  // ==========================================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/admin/orders",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to load orders."
          );
        }

        setOrders(data.orders || []);
      } catch (error) {
        console.error(
          "ADMIN ORDERS FETCH ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // ==========================================
  // STATUS LABEL
  // ==========================================

  const getStatusLabel = (
    status: Order["orderStatus"]
  ) => {
    switch (status) {
      case "pending":
        return "Pending";

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

  // ==========================================
  // PAYMENT LABEL
  // ==========================================

  const getPaymentLabel = (
    status: Order["paymentStatus"]
  ) => {
    switch (status) {
      case "pending":
        return "Pending";

      case "paid":
        return "Paid";

      case "failed":
        return "Failed";

      default:
        return status;
    }
  };

  // ==========================================
  // FILTERED ORDERS
  // ==========================================

  const filteredOrders = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    const filtered = orders.filter((order) => {
      const matchesSearch =
        !searchValue ||
        order._id
          .toLowerCase()
          .includes(searchValue) ||
        order.customer.name
          .toLowerCase()
          .includes(searchValue) ||
        order.customer.email
          .toLowerCase()
          .includes(searchValue) ||
        order.customer.phone
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        order.orderStatus === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        order.paymentStatus === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(
        a.createdAt
      ).getTime();

      const dateB = new Date(
        b.createdAt
      ).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });
  }, [
    orders,
    search,
    statusFilter,
    paymentFilter,
    sortOrder,
  ]);

  // ==========================================
  // SUMMARY COUNTS
  // ==========================================

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.orderStatus === "pending"
  ).length;

  const processingOrders = orders.filter(
    (order) =>
      order.orderStatus === "processing"
  ).length;

  const shippedOrders = orders.filter(
    (order) =>
      order.orderStatus === "shipped"
  ).length;

  const deliveredOrders = orders.filter(
    (order) =>
      order.orderStatus === "delivered"
  ).length;

  const cancelledOrders = orders.filter(
    (order) =>
      order.orderStatus === "cancelled"
  ).length;

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="admin-orders-page">
        <div className="admin-orders-loading">
          <div className="loading-spinner">
            <Icon
              icon="solar:refresh-bold"
              width="28"
            />
          </div>

          <p>Loading orders...</p>
        </div>

        <style jsx>{`
          .admin-orders-page {
            min-height: 100vh;
            padding: 32px;
            background: #f7f7f7;
          }

          .admin-orders-loading {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 12px;
            color: #777;
            font-size: 14px;
          }

          .loading-spinner {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 768px) {
            .admin-orders-page {
              padding: 20px 14px;
            }
          }
        `}</style>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="admin-orders-page">
        <div className="error-card">
          <div className="error-icon">
            <Icon
              icon="solar:danger-circle-bold"
              width="32"
            />
          </div>

          <h2>Unable to load orders</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            <Icon
              icon="solar:refresh-bold"
              width="18"
            />

            Try Again
          </button>
        </div>

        <style jsx>{`
          .admin-orders-page {
            min-height: 100vh;
            padding: 32px;
            background: #f7f7f7;
          }

          .error-card {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .error-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #f3f3f3;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #111;
          }

          .error-card h2 {
            margin: 8px 0 0;
            font-size: 20px;
            color: #111;
          }

          .error-card p {
            margin: 0;
            color: #777;
            font-size: 14px;
          }

          .error-card button {
            margin-top: 10px;
            border: 0;
            background: #111;
            color: white;
            padding: 11px 18px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
          }

          @media (max-width: 768px) {
            .admin-orders-page {
              padding: 20px 14px;
            }
          }
        `}</style>
      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="admin-orders-page">
      {/* ======================================
          HEADER
      ======================================= */}

      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <Link href="/admin">
              Dashboard
            </Link>

            <Icon
              icon="solar:alt-arrow-right-linear"
              width="14"
            />

            <span>Orders</span>
          </div>

          <h1>Orders</h1>

          <p>
            Manage and monitor customer orders.
          </p>
        </div>
      </div>

      {/* ======================================
          SUMMARY CARDS
      ======================================= */}

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon">
            <Icon
              icon="solar:bag-4-bold"
              width="22"
            />
          </div>

          <div>
            <span>Total Orders</span>
            <strong>{totalOrders}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <Icon
              icon="solar:clock-circle-bold"
              width="22"
            />
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingOrders}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <Icon
              icon="solar:settings-bold"
              width="22"
            />
          </div>

          <div>
            <span>Processing</span>
            <strong>{processingOrders}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <Icon
              icon="solar:delivery-bold"
              width="22"
            />
          </div>

          <div>
            <span>Shipped</span>
            <strong>{shippedOrders}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <Icon
              icon="solar:check-circle-bold"
              width="22"
            />
          </div>

          <div>
            <span>Delivered</span>
            <strong>{deliveredOrders}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <Icon
              icon="solar:close-circle-bold"
              width="22"
            />
          </div>

          <div>
            <span>Cancelled</span>
            <strong>{cancelledOrders}</strong>
          </div>
        </div>
      </div>

      {/* ======================================
          FILTER BAR
      ======================================= */}

      <div className="filter-card">
        <div className="search-box">
          <Icon
            icon="solar:magnifer-linear"
            width="19"
          />

          <input
            type="text"
            placeholder="Search order ID, customer, email or phone..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <Icon
                icon="solar:close-circle-bold"
                width="18"
              />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as StatusFilter
            )
          }
        >
          <option value="all">
            All Order Status
          </option>
          <option value="pending">
            Pending
          </option>
          <option value="confirmed">
            Confirmed
          </option>
          <option value="processing">
            Processing
          </option>
          <option value="shipped">
            Shipped
          </option>
          <option value="delivered">
            Delivered
          </option>
          <option value="cancelled">
            Cancelled
          </option>
        </select>

        <select
          value={paymentFilter}
          onChange={(event) =>
            setPaymentFilter(
              event.target.value as PaymentFilter
            )
          }
        >
          <option value="all">
            All Payment Status
          </option>
          <option value="pending">
            Pending
          </option>
          <option value="paid">
            Paid
          </option>
          <option value="failed">
            Failed
          </option>
        </select>

        <select
          value={sortOrder}
          onChange={(event) =>
            setSortOrder(
              event.target.value as
                | "newest"
                | "oldest"
            )
          }
        >
          <option value="newest">
            Newest First
          </option>

          <option value="oldest">
            Oldest First
          </option>
        </select>
      </div>

      {/* ======================================
          RESULTS HEADER
      ======================================= */}

      <div className="results-header">
        <div>
          <strong>
            {filteredOrders.length}
          </strong>{" "}
          {filteredOrders.length === 1
            ? "order"
            : "orders"}{" "}
          found
        </div>

        {(search ||
          statusFilter !== "all" ||
          paymentFilter !== "all") && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setPaymentFilter("all");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ======================================
          EMPTY STATE
      ======================================= */}

      {filteredOrders.length === 0 ? (
        <div className="empty-card">
          <div className="empty-icon">
            <Icon
              icon="solar:bag-4-bold"
              width="34"
            />
          </div>

          <h2>
            {orders.length === 0
              ? "No orders yet"
              : "No matching orders"}
          </h2>

          <p>
            {orders.length === 0
              ? "Customer orders will appear here once they are placed."
              : "Try changing your search or filters."}
          </p>
        </div>
      ) : (
        /* ====================================
           ORDERS TABLE
        ===================================== */

        <div className="orders-card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(
                  (order) => (
                    <tr key={order._id}>
                      {/* ORDER */}

                      <td>
                        <div className="order-id">
                          #{order._id.slice(-8).toUpperCase()}
                        </div>

                        <div className="order-full-id">
                          {order._id}
                        </div>
                      </td>

                      {/* CUSTOMER */}

                      <td>
                        <div className="customer-info">
                          <strong>
                            {order.customer.name}
                          </strong>

                          <span>
                            {order.customer.email}
                          </span>

                          <span>
                            {order.customer.phone}
                          </span>
                        </div>
                      </td>

                      {/* ITEMS */}

                      <td>
                        <div className="items-cell">
                          <div className="item-images">
                            {order.items
                              .slice(0, 3)
                              .map(
                                (
                                  item,
                                  index
                                ) => (
                                  <div
                                    className="item-image"
                                    key={`${item.productId}-${index}`}
                                  >
                                    {item.image ? (
                                      <img
                                        src={
                                          item.image
                                        }
                                        alt={
                                          item.name
                                        }
                                      />
                                    ) : (
                                      <Icon
                                        icon="solar:bag-4-bold"
                                        width="18"
                                      />
                                    )}
                                  </div>
                                )
                              )}
                          </div>

                          <span>
                            {order.items.reduce(
                              (
                                total,
                                item
                              ) =>
                                total +
                                item.quantity,
                              0
                            )}{" "}
                            item
                            {order.items.reduce(
                              (
                                total,
                                item
                              ) =>
                                total +
                                item.quantity,
                              0
                            ) !== 1
                              ? "s"
                              : ""}
                          </span>
                        </div>
                      </td>

                      {/* TOTAL */}

                      <td>
                        <strong className="total">
                          {formatCurrency(
                            order.total
                          )}
                        </strong>
                      </td>

                      {/* PAYMENT */}

                      <td>
                        <div className="payment-cell">
                          <span className="payment-method">
                            {order.paymentMethod ===
                            "cod"
                              ? "Cash on Delivery"
                              : "Online"}
                          </span>

                          <span
                            className={`payment-status payment-${order.paymentStatus}`}
                          >
                            {getPaymentLabel(
                              order.paymentStatus
                            )}
                          </span>
                        </div>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`status-badge status-${order.orderStatus}`}
                        >
                          <span className="status-dot" />

                          {getStatusLabel(
                            order.orderStatus
                          )}
                        </span>
                      </td>

                      {/* DATE */}

                      <td>
                        <div className="date-cell">
                          {formatDate(
                            order.createdAt
                          )}
                        </div>
                      </td>

                      {/* ACTION */}

                      <td>
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className="view-button"
                        >
                          View
                          <Icon
                            icon="solar:alt-arrow-right-linear"
                            width="16"
                          />
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE ORDER CARDS */}

          <div className="mobile-orders">
            {filteredOrders.map(
              (order) => {
                const itemCount =
                  order.items.reduce(
                    (total, item) =>
                      total +
                      item.quantity,
                    0
                  );

                return (
                  <div
                    className="mobile-order-card"
                    key={order._id}
                  >
                    <div className="mobile-order-top">
                      <div>
                        <strong>
                          #
                          {order._id
                            .slice(-8)
                            .toUpperCase()}
                        </strong>

                        <span>
                          {formatDate(
                            order.createdAt
                          )}
                        </span>
                      </div>

                      <span
                        className={`status-badge status-${order.orderStatus}`}
                      >
                        <span className="status-dot" />

                        {getStatusLabel(
                          order.orderStatus
                        )}
                      </span>
                    </div>

                    <div className="mobile-customer">
                      <strong>
                        {order.customer.name}
                      </strong>

                      <span>
                        {order.customer.email}
                      </span>

                      <span>
                        {order.customer.phone}
                      </span>
                    </div>

                    <div className="mobile-order-details">
                      <div>
                        <span>Items</span>
                        <strong>
                          {itemCount}
                        </strong>
                      </div>

                      <div>
                        <span>Payment</span>
                        <strong>
                          {order.paymentMethod ===
                          "cod"
                            ? "COD"
                            : "Online"}
                        </strong>
                      </div>

                      <div>
                        <span>Total</span>
                        <strong>
                          {formatCurrency(
                            order.total
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="mobile-order-bottom">
                      <span
                        className={`payment-status payment-${order.paymentStatus}`}
                      >
                        Payment{" "}
                        {getPaymentLabel(
                          order.paymentStatus
                        )}
                      </span>

                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="view-button"
                      >
                        View Order
                        <Icon
                          icon="solar:alt-arrow-right-linear"
                          width="16"
                        />
                      </Link>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-orders-page {
          min-height: 100vh;
          padding: 32px;
          background: #f7f7f7;
          color: #111;
        }

        /* HEADER */

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 28px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 10px;
          font-size: 12px;
          color: #999;
        }

        .breadcrumb a {
          color: #777;
          text-decoration: none;
        }

        .breadcrumb a:hover {
          color: #111;
        }

        .page-header h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.8px;
        }

        .page-header p {
          margin: 7px 0 0;
          color: #777;
          font-size: 14px;
        }

        /* SUMMARY */

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(
            6,
            minmax(0, 1fr)
          );
          gap: 12px;
          margin-bottom: 18px;
        }

        .summary-card {
          min-width: 0;
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 17px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .summary-icon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #f3f3f3;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #111;
        }

        .summary-card div:last-child {
          min-width: 0;
        }

        .summary-card span {
          display: block;
          color: #888;
          font-size: 11px;
          margin-bottom: 4px;
          white-space: nowrap;
        }

        .summary-card strong {
          display: block;
          font-size: 22px;
          line-height: 1;
        }

        /* FILTERS */

        .filter-card {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 13px;
          display: grid;
          grid-template-columns:
            minmax(250px, 1fr)
            180px
            180px
            160px;
          gap: 10px;
          margin-bottom: 14px;
        }

        .search-box {
          min-width: 0;
          height: 44px;
          border: 1px solid #e2e2e2;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          color: #888;
          background: #fff;
        }

        .search-box:focus-within {
          border-color: #111;
        }

        .search-box input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 13px;
          color: #111;
        }

        .search-box input::placeholder {
          color: #aaa;
        }

        .search-box button {
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
          color: #999;
          display: flex;
        }

        .filter-card select {
          width: 100%;
          height: 44px;
          border: 1px solid #e2e2e2;
          border-radius: 8px;
          padding: 0 11px;
          outline: none;
          background: white;
          color: #333;
          font-size: 13px;
          cursor: pointer;
        }

        .filter-card select:focus {
          border-color: #111;
        }

        /* RESULTS */

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 17px 2px 10px;
          font-size: 13px;
          color: #777;
        }

        .results-header strong {
          color: #111;
        }

        .results-header button {
          border: 0;
          background: transparent;
          color: #111;
          font-size: 12px;
          cursor: pointer;
          text-decoration: underline;
        }

        /* TABLE */

        .orders-card {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          overflow: hidden;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 1180px;
          border-collapse: collapse;
        }

        th {
          background: #fafafa;
          border-bottom: 1px solid #e8e8e8;
          padding: 13px 15px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          white-space: nowrap;
        }

        td {
          padding: 15px;
          border-bottom: 1px solid #eeeeee;
          vertical-align: middle;
          font-size: 13px;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        tbody tr:hover {
          background: #fcfcfc;
        }

        .order-id {
          font-weight: 700;
          font-size: 13px;
          margin-bottom: 4px;
          white-space: nowrap;
        }

        .order-full-id {
          color: #aaa;
          font-size: 10px;
          max-width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .customer-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 150px;
        }

        .customer-info strong {
          font-size: 13px;
        }

        .customer-info span {
          font-size: 11px;
          color: #888;
          white-space: nowrap;
        }

        .items-cell {
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #777;
          font-size: 11px;
        }

        .item-images {
          display: flex;
          align-items: center;
        }

        .item-image {
          width: 34px;
          height: 34px;
          border-radius: 6px;
          border: 2px solid white;
          background: #f1f1f1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: #aaa;
          margin-left: -7px;
        }

        .item-image:first-child {
          margin-left: 0;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .total {
          white-space: nowrap;
          font-size: 13px;
        }

        .payment-cell {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 100px;
        }

        .payment-method {
          font-size: 11px;
          color: #555;
          white-space: nowrap;
        }

        .payment-status {
          display: inline-flex;
          width: fit-content;
          font-size: 10px;
          font-weight: 600;
          padding: 4px 7px;
          border-radius: 5px;
          white-space: nowrap;
        }

        .payment-pending {
          background: #f4f4f4;
          color: #666;
        }

        .payment-paid {
          background: #e9f7ef;
          color: #287a4b;
        }

        .payment-failed {
          background: #fcecec;
          color: #a33a3a;
        }

        /* STATUS */

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .status-pending {
          background: #f2f2f2;
          color: #666;
        }

        .status-confirmed {
          background: #eef1f4;
          color: #46515c;
        }

        .status-processing {
          background: #eeeeee;
          color: #333;
        }

        .status-shipped {
          background: #e8edf1;
          color: #3f505d;
        }

        .status-delivered {
          background: #e9f7ef;
          color: #287a4b;
        }

        .status-cancelled {
          background: #fcecec;
          color: #a33a3a;
        }

        .date-cell {
          color: #777;
          font-size: 11px;
          white-space: nowrap;
        }

        .view-button {
          height: 34px;
          padding: 0 10px;
          border-radius: 7px;
          background: #111;
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          text-decoration: none;
          font-size: 11px;
          white-space: nowrap;
          transition: 0.2s ease;
        }

        .view-button:hover {
          background: #333;
        }

        /* EMPTY */

        .empty-card {
          min-height: 350px;
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          padding: 30px;
        }

        .empty-icon {
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: #f2f2f2;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #555;
          margin-bottom: 14px;
        }

        .empty-card h2 {
          margin: 0 0 7px;
          font-size: 18px;
        }

        .empty-card p {
          margin: 0;
          color: #888;
          font-size: 13px;
        }

        /* MOBILE */

        .mobile-orders {
          display: none;
        }

        /* TABLET */

        @media (max-width: 1200px) {
          .admin-orders-page {
            padding: 26px;
          }

          .summary-grid {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            );
          }

          .filter-card {
            grid-template-columns:
              minmax(220px, 1fr)
              1fr
              1fr;
          }

          .filter-card
            select:last-child {
            grid-column: span 1;
          }
        }

        /* SMALL TABLET */

        @media (max-width: 850px) {
          .admin-orders-page {
            padding: 22px 18px;
          }

          .summary-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .filter-card {
            grid-template-columns: 1fr 1fr;
          }

          .search-box {
            grid-column: span 2;
          }
        }

        /* MOBILE */

        @media (max-width: 700px) {
          .admin-orders-page {
            padding: 18px 13px;
          }

          .page-header {
            margin-bottom: 20px;
          }

          .page-header h1 {
            font-size: 25px;
          }

          .page-header p {
            font-size: 12px;
          }

          .summary-grid {
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }

          .summary-card {
            padding: 13px;
            gap: 9px;
          }

          .summary-icon {
            width: 36px;
            height: 36px;
            border-radius: 8px;
          }

          .summary-card span {
            font-size: 9px;
          }

          .summary-card strong {
            font-size: 18px;
          }

          .filter-card {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .search-box {
            grid-column: auto;
          }

          .results-header {
            margin-top: 13px;
          }

          .table-wrapper {
            display: none;
          }

          .mobile-orders {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 10px;
          }

          .mobile-order-card {
            border: 1px solid #e9e9e9;
            border-radius: 10px;
            padding: 14px;
            background: #fff;
          }

          .mobile-order-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 13px;
          }

          .mobile-order-top > div {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .mobile-order-top strong {
            font-size: 13px;
          }

          .mobile-order-top span {
            color: #999;
            font-size: 10px;
          }

          .mobile-customer {
            display: flex;
            flex-direction: column;
            gap: 3px;
            padding-bottom: 13px;
            border-bottom: 1px solid #eeeeee;
          }

          .mobile-customer strong {
            font-size: 13px;
          }

          .mobile-customer span {
            color: #888;
            font-size: 11px;
          }

          .mobile-order-details {
            display: grid;
            grid-template-columns: repeat(
              3,
              1fr
            );
            gap: 8px;
            padding: 13px 0;
          }

          .mobile-order-details div {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .mobile-order-details span {
            color: #999;
            font-size: 10px;
          }

          .mobile-order-details strong {
            font-size: 12px;
          }

          .mobile-order-bottom {
            padding-top: 12px;
            border-top: 1px solid #eeeeee;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }

          .mobile-order-bottom
            .view-button {
            height: 32px;
            padding: 0 9px;
          }
        }

        @media (max-width: 380px) {
          .admin-orders-page {
            padding: 15px 10px;
          }

          .summary-card {
            padding: 11px;
          }

          .summary-icon {
            width: 32px;
            height: 32px;
          }

          .summary-card strong {
            font-size: 16px;
          }

          .mobile-order-details {
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
}