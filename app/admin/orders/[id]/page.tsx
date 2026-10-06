"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

const trackingSteps = [
  {
    key: "pending",
    label: "Order Placed",
    description: "Order has been received.",
    icon: "solar:bag-4-bold",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    description: "Order has been confirmed.",
    icon: "solar:check-circle-bold",
  },
  {
    key: "processing",
    label: "Processing",
    description: "Order is being prepared.",
    icon: "solar:settings-bold",
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "Order is on the way.",
    icon: "solar:delivery-bold",
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Order has been delivered.",
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

const statusOptions: {
  value: OrderStatus;
  label: string;
}[] = [
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "confirmed",
    label: "Confirmed",
  },
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "shipped",
    label: "Shipped",
  },
  {
    value: "delivered",
    label: "Delivered",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

type PaymentStatus = Order["paymentStatus"];

const paymentStatusOptions: {
  value: PaymentStatus;
  label: string;
}[] = [
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "paid",
    label: "Paid",
  },
  {
    value: "failed",
    label: "Failed",
  },
];

export default function AdminOrderDetailPage() {
  const params = useParams();

  const orderId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatus>("pending");

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [statusMessage, setStatusMessage] =
    useState("");

  const [statusError, setStatusError] =
    useState("");

  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState<PaymentStatus>("pending");

  const [updatingPaymentStatus, setUpdatingPaymentStatus] =
    useState(false);

  const [paymentMessage, setPaymentMessage] =
    useState("");

  const [paymentError, setPaymentError] =
    useState("");

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
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
              "Unable to load order."
          );
        }

        const foundOrder = (
          data.orders || []
        ).find(
          (item: Order) =>
            item._id === orderId
        );

        if (!foundOrder) {
          setError("Order not found.");
          return;
        }

        setOrder(foundOrder);

        setSelectedStatus(
          foundOrder.orderStatus
        );

        setSelectedPaymentStatus(
          foundOrder.paymentStatus
        );
      } catch (error) {
        console.error(
          "ADMIN ORDER DETAIL ERROR:",
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

    fetchOrder();
  }, [orderId]);

  const formatCurrency = (
    amount: number
  ) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (
    date: string
  ) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getStatusLabel = (
    status: OrderStatus
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

  const currentTrackingIndex =
    useMemo(() => {
      if (!order) return -1;

      return statusOrder.indexOf(
        order.orderStatus
      );
    }, [order]);

  const handleUpdateStatus = async () => {
    if (!order) return;

    if (
      selectedStatus ===
      order.orderStatus
    ) {
      return;
    }

    const isFinalOrder =
      order.orderStatus ===
        "delivered" ||
      order.orderStatus ===
        "cancelled";

    if (isFinalOrder) {
      setStatusError(
        `A ${order.orderStatus} order cannot be changed.`
      );

      return;
    }

    const confirmed = window.confirm(
      `Change order status from "${getStatusLabel(
        order.orderStatus
      )}" to "${getStatusLabel(
        selectedStatus
      )}"?`
    );

    if (!confirmed) return;

    try {
      setUpdatingStatus(true);
      setStatusMessage("");
      setStatusError("");

      const response = await fetch(
        `/api/admin/orders/${order._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            orderStatus:
              selectedStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update order status."
        );
      }

      setOrder((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          orderStatus:
            data.order.orderStatus,
          updatedAt:
            data.order.updatedAt ||
            previous.updatedAt,
        };
      });

      setSelectedStatus(
        data.order.orderStatus
      );

      setStatusMessage(
        data.message ||
          "Order status updated successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      setStatusError(
        error instanceof Error
          ? error.message
          : "Unable to update order status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    if (!order) return;

    if (
      selectedPaymentStatus ===
      order.paymentStatus
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Change payment status from "${getPaymentLabel(
        order.paymentStatus
      )}" to "${getPaymentLabel(
        selectedPaymentStatus
      )}"?`
    );

    if (!confirmed) return;

    try {
      setUpdatingPaymentStatus(true);
      setPaymentMessage("");
      setPaymentError("");

      const response = await fetch(
        `/api/admin/orders/${order._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            paymentStatus:
              selectedPaymentStatus,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to update payment status."
        );
      }

      setOrder((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          paymentStatus:
            data.order.paymentStatus,
          updatedAt:
            data.order.updatedAt ||
            previous.updatedAt,
        };
      });

      setSelectedPaymentStatus(
        data.order.paymentStatus
      );

      setPaymentMessage(
        data.message ||
          "Payment status updated successfully."
      );
    } catch (error) {
      console.error(
        "UPDATE PAYMENT STATUS ERROR:",
        error
      );

      setPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to update payment status."
      );
    } finally {
      setUpdatingPaymentStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-order-page">
        <div className="loading-state">
          <div className="loading-spinner">
            <Icon
              icon="solar:refresh-bold"
              width="28"
            />
          </div>

          <p>Loading order...</p>
        </div>

        <style jsx>{`
          .admin-order-page {
            min-height: 100vh;
            padding: 32px;
            background: #f7f7f7;
          }

          .loading-state {
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
            .admin-order-page {
              padding: 20px 14px;
            }
          }
        `}</style>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="admin-order-page">
        <div className="error-state">
          <div className="error-icon">
            <Icon
              icon="solar:danger-circle-bold"
              width="34"
            />
          </div>

          <h2>
            {error || "Order not found"}
          </h2>

          <p>
            The requested order could not
            be loaded.
          </p>

          <Link
            href="/admin/orders"
            className="back-button"
          >
            <Icon
              icon="solar:alt-arrow-left-linear"
              width="17"
            />

            Back to Orders
          </Link>
        </div>

        <style jsx>{`
          .admin-order-page {
            min-height: 100vh;
            padding: 32px;
            background: #f7f7f7;
          }

          .error-state {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }

          .error-icon {
            width: 68px;
            height: 68px;
            border-radius: 50%;
            background: #f2f2f2;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #555;
            margin-bottom: 5px;
          }

          .error-state h2 {
            margin: 0;
            font-size: 20px;
          }

          .error-state p {
            margin: 0;
            color: #888;
            font-size: 13px;
          }

          .back-button {
            margin-top: 10px;
            height: 40px;
            padding: 0 15px;
            background: #111;
            color: white;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            gap: 7px;
            text-decoration: none;
            font-size: 12px;
          }

          @media (max-width: 768px) {
            .admin-order-page {
              padding: 20px 14px;
            }
          }
        `}</style>
      </div>
    );
  }

  const totalItems = order.items.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );

  const isFinalOrder =
    order.orderStatus ===
      "delivered" ||
    order.orderStatus ===
      "cancelled";

  return (
    <div className="admin-order-page">
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

            <Link href="/admin/orders">
              Orders
            </Link>

            <Icon
              icon="solar:alt-arrow-right-linear"
              width="14"
            />

            <span>
              Order #
              {order._id
                .slice(-8)
                .toUpperCase()}
            </span>
          </div>

          <div className="header-title-row">
            <div>
              <h1>
                Order #
                {order._id
                  .slice(-8)
                  .toUpperCase()}
              </h1>

              <p>
                Placed on{" "}
                {formatDate(
                  order.createdAt
                )}
              </p>
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
        </div>
      </div>

      <div className="order-id-bar">
        <div>
          <span>Order ID</span>

          <strong>
            {order._id}
          </strong>
        </div>

        <div>
          <span>Customer ID</span>

          <strong>
            {order.userId}
          </strong>
        </div>
      </div>

      {/* ORDER STATUS */}

      <div className="status-control-card">
        <div className="status-control-info">
          <div className="status-control-icon">
            <Icon
              icon="solar:refresh-circle-bold"
              width="22"
            />
          </div>

          <div>
            <h2>
              Update Order Status
            </h2>

            <p>
              Change the fulfillment status
              of this order.
            </p>
          </div>
        </div>

        <div className="status-control-form">
          <div className="status-select-wrapper">
            <span>
              Current Status
            </span>

            <select
              value={selectedStatus}
              onChange={(event) => {
                setSelectedStatus(
                  event.target
                    .value as OrderStatus
                );

                setStatusMessage("");
                setStatusError("");
              }}
              disabled={
                updatingStatus ||
                isFinalOrder
              }
            >
              {statusOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="button"
            className="update-status-button"
            onClick={
              handleUpdateStatus
            }
            disabled={
              updatingStatus ||
              selectedStatus ===
                order.orderStatus ||
              isFinalOrder
            }
          >
            {updatingStatus ? (
              <>
                <Icon
                  icon="solar:refresh-bold"
                  width="17"
                  className="button-spinner"
                />

                Updating...
              </>
            ) : (
              <>
                <Icon
                  icon="solar:check-circle-bold"
                  width="17"
                />

                Update Status
              </>
            )}
          </button>
        </div>

        {isFinalOrder && (
          <div className="final-order-warning">
            <Icon
              icon="solar:info-circle-bold"
              width="17"
            />

            <span>
              This order is{" "}
              <strong>
                {order.orderStatus}
              </strong>{" "}
              and can no longer be changed.
            </span>
          </div>
        )}

        {statusMessage && (
          <div className="status-success-message">
            <Icon
              icon="solar:check-circle-bold"
              width="17"
            />

            {statusMessage}
          </div>
        )}

        {statusError && (
          <div className="status-error-message">
            <Icon
              icon="solar:danger-circle-bold"
              width="17"
            />

            {statusError}
          </div>
        )}
      </div>

      {/* PAYMENT STATUS */}

      <div className="status-control-card payment-control-card">
        <div className="status-control-info">
          <div className="status-control-icon payment-control-icon">
            <Icon
              icon="solar:card-bold"
              width="22"
            />
          </div>

          <div>
            <h2>
              Update Payment Status
            </h2>

            <p>
              Change the payment status of this order.
            </p>
          </div>
        </div>

        <div className="status-control-form">
          <div className="status-select-wrapper">
            <span>
              Payment Status
            </span>

            <select
              value={selectedPaymentStatus}
              onChange={(event) => {
                setSelectedPaymentStatus(
                  event.target
                    .value as PaymentStatus
                );

                setPaymentMessage("");
                setPaymentError("");
              }}
              disabled={
                updatingPaymentStatus
              }
            >
              {paymentStatusOptions.map(
                (option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="button"
            className="update-status-button"
            onClick={
              handleUpdatePaymentStatus
            }
            disabled={
              updatingPaymentStatus ||
              selectedPaymentStatus ===
                order.paymentStatus
            }
          >
            {updatingPaymentStatus ? (
              <>
                <Icon
                  icon="solar:refresh-bold"
                  width="17"
                  className="button-spinner"
                />

                Updating...
              </>
            ) : (
              <>
                <Icon
                  icon="solar:check-circle-bold"
                  width="17"
                />

                Update Payment
              </>
            )}
          </button>
        </div>

        {paymentMessage && (
          <div className="status-success-message">
            <Icon
              icon="solar:check-circle-bold"
              width="17"
            />

            {paymentMessage}
          </div>
        )}

        {paymentError && (
          <div className="status-error-message">
            <Icon
              icon="solar:danger-circle-bold"
              width="17"
            />

            {paymentError}
          </div>
        )}
      </div>

      {/* TRACKING */}

      <div className="section-card tracking-card">
        <div className="section-header">
          <div>
            <h2>
              Order Progress
            </h2>

            <p>
              Current order fulfillment
              status.
            </p>
          </div>
        </div>

        {order.orderStatus ===
        "cancelled" ? (
          <div className="cancelled-state">
            <div className="cancelled-icon">
              <Icon
                icon="solar:close-circle-bold"
                width="25"
              />
            </div>

            <div>
              <strong>
                Order Cancelled
              </strong>

              <span>
                This order has been
                cancelled.
              </span>
            </div>
          </div>
        ) : (
          <div className="tracking">
            {trackingSteps.map(
              (step, index) => {
                const completed =
                  index <=
                  currentTrackingIndex;

                const active =
                  index ===
                  currentTrackingIndex;

                return (
                  <div
                    className={`tracking-step ${
                      completed
                        ? "completed"
                        : ""
                    } ${
                      active
                        ? "active"
                        : ""
                    }`}
                    key={step.key}
                  >
                    <div className="tracking-icon">
                      <Icon
                        icon={
                          completed
                            ? "solar:check-bold"
                            : step.icon
                        }
                        width="18"
                      />
                    </div>

                    <div className="tracking-content">
                      <strong>
                        {step.label}
                      </strong>

                      <span>
                        {
                          step.description
                        }
                      </span>
                    </div>

                    {index <
                      trackingSteps.length -
                        1 && (
                      <div
                        className={`tracking-line ${
                          index <
                          currentTrackingIndex
                            ? "completed"
                            : ""
                        }`}
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>

      {/* MAIN GRID */}

      <div className="main-grid">
        <div className="left-column">
          {/* PRODUCTS */}

          <div className="section-card">
            <div className="section-header">
              <div>
                <h2>
                  Order Items
                </h2>

                <p>
                  {totalItems}{" "}
                  {totalItems === 1
                    ? "item"
                    : "items"}{" "}
                  in this order.
                </p>
              </div>
            </div>

            <div className="items-list">
              {order.items.map(
                (item, index) => (
                  <div
                    className="order-item"
                    key={`${item.productId}-${index}`}
                  >
                    <div className="product-image">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                        />
                      ) : (
                        <Icon
                          icon="solar:bag-4-bold"
                          width="25"
                        />
                      )}
                    </div>

                    <div className="product-info">
                      <h3>
                        {item.name}
                      </h3>

                      <div className="product-meta">
                        <span>
                          Qty:{" "}
                          {item.quantity}
                        </span>

                        {item.size && (
                          <span>
                            Size:{" "}
                            {item.size}
                          </span>
                        )}

                        {item.color && (
                          <span>
                            Color:{" "}
                            {item.color}
                          </span>
                        )}
                      </div>

                      <span className="product-id">
                        Product ID:{" "}
                        {item.productId}
                      </span>
                    </div>

                    <div className="item-price">
                      <strong>
                        {formatCurrency(
                          item.price *
                            item.quantity
                        )}
                      </strong>

                      <span>
                        {formatCurrency(
                          item.price
                        )}{" "}
                        ×{" "}
                        {item.quantity}
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>

            <div className="price-summary">
              <div>
                <span>
                  Subtotal
                </span>

                <strong>
                  {formatCurrency(
                    order.subtotal
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Shipping
                </span>

                <strong>
                  {order.shipping ===
                  0
                    ? "Free"
                    : formatCurrency(
                        order.shipping
                      )}
                </strong>
              </div>

              <div className="grand-total">
                <span>
                  Total
                </span>

                <strong>
                  {formatCurrency(
                    order.total
                  )}
                </strong>
              </div>
            </div>
          </div>

          {/* CUSTOMER */}

          <div className="section-card">
            <div className="section-header">
              <div>
                <h2>
                  Customer Information
                </h2>

                <p>
                  Customer details for
                  this order.
                </p>
              </div>
            </div>

            <div className="customer-grid">
              <div className="info-box">
                <span>
                  <Icon
                    icon="solar:user-bold"
                    width="15"
                  />

                  Name
                </span>

                <strong>
                  {order.customer.name}
                </strong>
              </div>

              <div className="info-box">
                <span>
                  <Icon
                    icon="solar:letter-bold"
                    width="15"
                  />

                  Email
                </span>

                <strong>
                  {order.customer.email}
                </strong>
              </div>

              <div className="info-box">
                <span>
                  <Icon
                    icon="solar:phone-bold"
                    width="15"
                  />

                  Phone
                </span>

                <strong>
                  {order.customer.phone ||
                    "Not provided"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}

        <div className="right-column">
          {/* SHIPPING */}

          <div className="section-card">
            <div className="section-header">
              <div>
                <h2>
                  Shipping Address
                </h2>

                <p>
                  Delivery information.
                </p>
              </div>

              <div className="section-icon">
                <Icon
                  icon="solar:map-point-bold"
                  width="20"
                />
              </div>
            </div>

            <div className="address-box">
              <strong>
                {order.customer.name}
              </strong>

              <p>
                {
                  order.shippingAddress
                    .address
                }
              </p>

              <p>
                {
                  order.shippingAddress
                    .city
                }
                ,{" "}
                {
                  order.shippingAddress
                    .state
                }
              </p>

              <p>
                PIN:{" "}
                {
                  order.shippingAddress
                    .pincode
                }
              </p>

              {order.customer.phone && (
                <p>
                  Phone:{" "}
                  {order.customer.phone}
                </p>
              )}
            </div>
          </div>

          {/* PAYMENT */}

          <div className="section-card">
            <div className="section-header">
              <div>
                <h2>
                  Payment
                </h2>

                <p>
                  Payment information.
                </p>
              </div>

              <div className="section-icon">
                <Icon
                  icon="solar:card-bold"
                  width="20"
                />
              </div>
            </div>

            <div className="payment-info">
              <div>
                <span>
                  Payment Method
                </span>

                <strong>
                  {order.paymentMethod ===
                  "cod"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </strong>
              </div>

              <div>
                <span>
                  Payment Status
                </span>

                <span
                  className={`payment-status payment-${order.paymentStatus}`}
                >
                  {getPaymentLabel(
                    order.paymentStatus
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* DELIVERY */}

          <div className="section-card">
            <div className="section-header">
              <div>
                <h2>
                  Delivery
                </h2>

                <p>
                  Selected delivery
                  method.
                </p>
              </div>

              <div className="section-icon">
                <Icon
                  icon="solar:delivery-bold"
                  width="20"
                />
              </div>
            </div>

            <div className="delivery-box">
              <span>
                Delivery Method
              </span>

              <strong>
                {order.deliveryMethod}
              </strong>
            </div>
          </div>

          {/* TIMESTAMPS */}

          <div className="section-card">
            <div className="section-header">
              <div>
                <h2>
                  Order Information
                </h2>

                <p>
                  Order timestamps.
                </p>
              </div>
            </div>

            <div className="timestamp-list">
              <div>
                <span>
                  Created
                </span>

                <strong>
                  {formatDate(
                    order.createdAt
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Last Updated
                </span>

                <strong>
                  {formatDate(
                    order.updatedAt
                  )}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BACK BUTTON */}

      <div className="bottom-actions">
        <Link
          href="/admin/orders"
          className="back-button"
        >
          <Icon
            icon="solar:alt-arrow-left-linear"
            width="17"
          />

          Back to Orders
        </Link>
      </div>

      <style jsx>{`
        .admin-order-page {
          min-height: 100vh;
          padding: 32px;
          background: #f7f7f7;
          color: #111;
        }

        .page-header {
          margin-bottom: 20px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 12px;
          font-size: 12px;
          color: #999;
          flex-wrap: wrap;
        }

        .breadcrumb a {
          color: #777;
          text-decoration: none;
        }

        .breadcrumb a:hover {
          color: #111;
        }

        .header-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 20px;
        }

        .header-title-row h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.8px;
        }

        .header-title-row p {
          margin: 7px 0 0;
          color: #777;
          font-size: 13px;
        }

        .order-id-bar {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 40px;
          margin-bottom: 18px;
        }

        .order-id-bar div {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .order-id-bar span {
          font-size: 10px;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .order-id-bar strong {
          font-size: 11px;
          font-weight: 600;
          word-break: break-all;
        }

        .status-control-card {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 18px;
          margin-bottom: 18px;
        }

        .payment-control-card {
          margin-bottom: 18px;
        }

        .payment-control-icon {
          color: #333;
        }

        .status-control-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .status-control-icon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #f2f2f2;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #111;
        }

        .status-control-info h2 {
          margin: 0;
          font-size: 15px;
        }

        .status-control-info p {
          margin: 4px 0 0;
          color: #888;
          font-size: 11px;
        }

        .status-control-form {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          margin-top: 17px;
        }

        .status-select-wrapper {
          width: 240px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .status-select-wrapper span {
          font-size: 10px;
          color: #888;
        }

        .status-select-wrapper select {
          width: 100%;
          height: 42px;
          padding: 0 11px;
          border: 1px solid #dedede;
          border-radius: 8px;
          background: white;
          color: #111;
          outline: none;
          font-size: 12px;
          cursor: pointer;
        }

        .status-select-wrapper select:focus {
          border-color: #111;
        }

        .status-select-wrapper select:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          color: #999;
        }

        .update-status-button {
          height: 42px;
          padding: 0 17px;
          border: 0;
          border-radius: 8px;
          background: #111;
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .update-status-button:hover:not(:disabled) {
          background: #333;
        }

        .update-status-button:disabled {
          background: #d7d7d7;
          color: #999;
          cursor: not-allowed;
        }

        .button-spinner {
          animation: spin 1s linear infinite;
        }

        .final-order-warning,
        .status-success-message,
        .status-error-message {
          margin-top: 12px;
          min-height: 38px;
          padding: 9px 11px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
        }

        .final-order-warning {
          background: #f5f5f5;
          color: #666;
        }

        .status-success-message {
          background: #e9f7ef;
          color: #287a4b;
        }

        .status-error-message {
          background: #fcecec;
          color: #a33a3a;
        }

        .section-card {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 20px;
        }

        .tracking-card {
          margin-bottom: 18px;
        }

        .section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }

        .section-header p {
          margin: 5px 0 0;
          color: #888;
          font-size: 11px;
        }

        .section-icon {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: #f3f3f3;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          flex-shrink: 0;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border-radius: 7px;
          font-size: 11px;
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

        .tracking {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          position: relative;
        }

        .tracking-step {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-width: 0;
        }

        .tracking-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #f1f1f1;
          color: #999;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          border: 3px solid white;
          box-shadow: 0 0 0 1px #e5e5e5;
        }

        .tracking-step.completed .tracking-icon {
          background: #111;
          color: white;
          box-shadow: 0 0 0 1px #111;
        }

        .tracking-step.active .tracking-icon {
          box-shadow:
            0 0 0 1px #111,
            0 0 0 5px #eeeeee;
        }

        .tracking-content {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 0 6px;
        }

        .tracking-content strong {
          font-size: 11px;
        }

        .tracking-content span {
          color: #999;
          font-size: 9px;
          line-height: 1.4;
        }

        .tracking-line {
          position: absolute;
          height: 2px;
          background: #e5e5e5;
          top: 21px;
          left: calc(50% + 21px);
          width: calc(100% - 42px);
          z-index: 1;
        }

        .tracking-line.completed {
          background: #111;
        }

        .cancelled-state {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 9px;
          background: #fcecec;
          color: #a33a3a;
        }

        .cancelled-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cancelled-state div:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .cancelled-state strong {
          font-size: 13px;
        }

        .cancelled-state span {
          font-size: 11px;
        }

        .main-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 1.65fr)
            minmax(300px, 0.9fr);
          gap: 18px;
          align-items: start;
        }

        .left-column,
        .right-column {
          display: flex;
          flex-direction: column;
          gap: 18px;
          min-width: 0;
        }

        .items-list {
          display: flex;
          flex-direction: column;
        }

        .order-item {
          display: grid;
          grid-template-columns:
            72px
            minmax(0, 1fr)
            auto;
          gap: 14px;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #eeeeee;
        }

        .order-item:first-child {
          padding-top: 0;
        }

        .order-item:last-child {
          border-bottom: 0;
        }

        .product-image {
          width: 72px;
          height: 72px;
          border-radius: 8px;
          overflow: hidden;
          background: #f2f2f2;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #aaa;
          flex-shrink: 0;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .product-info h3 {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
        }

        .product-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .product-meta span {
          background: #f5f5f5;
          padding: 4px 7px;
          border-radius: 5px;
          color: #666;
          font-size: 9px;
        }

        .product-id {
          color: #aaa;
          font-size: 9px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .item-price {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .item-price strong {
          font-size: 13px;
          white-space: nowrap;
        }

        .item-price span {
          color: #999;
          font-size: 10px;
          white-space: nowrap;
        }

        .price-summary {
          border-top: 1px solid #eeeeee;
          margin-top: 8px;
          padding-top: 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .price-summary > div {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }

        .price-summary span {
          color: #777;
          font-size: 12px;
        }

        .price-summary strong {
          font-size: 12px;
        }

        .price-summary .grand-total {
          border-top: 1px solid #eeeeee;
          margin-top: 3px;
          padding-top: 13px;
        }

        .price-summary .grand-total span,
        .price-summary .grand-total strong {
          color: #111;
          font-size: 15px;
          font-weight: 700;
        }

        .customer-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .info-box {
          border: 1px solid #eeeeee;
          border-radius: 8px;
          padding: 12px;
          min-width: 0;
        }

        .info-box span {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #999;
          font-size: 10px;
          margin-bottom: 6px;
        }

        .info-box strong {
          display: block;
          font-size: 11px;
          word-break: break-word;
        }

        .address-box {
          border: 1px solid #eeeeee;
          border-radius: 9px;
          padding: 14px;
          background: #fafafa;
        }

        .address-box strong {
          display: block;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .address-box p {
          margin: 3px 0;
          color: #666;
          font-size: 11px;
          line-height: 1.5;
        }

        .payment-info {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .payment-info > div {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .payment-info span:first-child {
          color: #888;
          font-size: 11px;
        }

        .payment-info strong {
          font-size: 11px;
          text-align: right;
        }

        .payment-status {
          display: inline-flex;
          width: fit-content;
          padding: 5px 8px;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 600;
        }

        .payment-pending {
          background: #f3f3f3;
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

        .delivery-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 13px;
          background: #fafafa;
          border: 1px solid #eeeeee;
          border-radius: 8px;
        }

        .delivery-box span {
          color: #888;
          font-size: 11px;
        }

        .delivery-box strong {
          font-size: 11px;
          text-align: right;
        }

        .timestamp-list {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .timestamp-list > div {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }

        .timestamp-list span {
          color: #888;
          font-size: 11px;
        }

        .timestamp-list strong {
          font-size: 10px;
          text-align: right;
        }

        .bottom-actions {
          margin-top: 18px;
        }

        .back-button {
          height: 40px;
          padding: 0 15px;
          background: #111;
          color: white;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          text-decoration: none;
          font-size: 12px;
          transition: 0.2s ease;
        }

        .back-button:hover {
          background: #333;
        }

        @media (max-width: 1050px) {
          .admin-order-page {
            padding: 26px;
          }

          .main-grid {
            grid-template-columns: 1fr;
          }

          .right-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .right-column
            .section-card:first-child {
            grid-column: span 2;
          }
        }

        @media (max-width: 800px) {
          .admin-order-page {
            padding: 22px 18px;
          }

          .tracking-content span {
            display: none;
          }

          .tracking-content {
            margin-top: 8px;
          }

          .customer-grid {
            grid-template-columns: 1fr;
          }

          .right-column {
            grid-template-columns: 1fr;
          }

          .right-column
            .section-card:first-child {
            grid-column: auto;
          }

          .status-control-form {
            align-items: stretch;
            flex-direction: column;
          }

          .status-select-wrapper {
            width: 100%;
          }

          .update-status-button {
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .admin-order-page {
            padding: 18px 13px;
          }

          .header-title-row {
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
          }

          .header-title-row h1 {
            font-size: 24px;
          }

          .header-title-row p {
            font-size: 11px;
          }

          .order-id-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            padding: 13px;
          }

          .status-control-card {
            padding: 15px;
            border-radius: 10px;
          }

          .section-card {
            padding: 15px;
            border-radius: 10px;
          }

          .tracking-card {
            overflow: hidden;
          }

          .tracking {
            display: flex;
            justify-content: space-between;
            gap: 0;
          }

          .tracking-step {
            flex: 1;
          }

          .tracking-icon {
            width: 34px;
            height: 34px;
          }

          .tracking-content strong {
            font-size: 9px;
          }

          .tracking-line {
            top: 17px;
            left: calc(50% + 17px);
            width: calc(100% - 34px);
          }

          .order-item {
            grid-template-columns:
              58px
              minmax(0, 1fr);
            gap: 10px;
            position: relative;
            padding: 13px 0;
          }

          .product-image {
            width: 58px;
            height: 58px;
          }

          .product-info h3 {
            font-size: 12px;
          }

          .product-meta span {
            font-size: 8px;
          }

          .product-id {
            max-width: 180px;
          }

          .item-price {
            grid-column: 2;
            align-items: flex-start;
            margin-top: -2px;
          }

          .item-price strong {
            font-size: 12px;
          }

          .item-price span {
            font-size: 9px;
          }

          .customer-grid {
            gap: 8px;
          }

          .info-box {
            padding: 11px;
          }

          .payment-info > div,
          .delivery-box,
          .timestamp-list > div {
            align-items: flex-start;
          }

          .status-badge {
            font-size: 10px;
            padding: 6px 8px;
          }
        }

        @media (max-width: 380px) {
          .admin-order-page {
            padding: 15px 10px;
          }

          .tracking-content strong {
            font-size: 8px;
          }

          .tracking-icon {
            width: 30px;
            height: 30px;
          }

          .tracking-line {
            top: 15px;
            left: calc(50% + 15px);
            width: calc(100% - 30px);
          }

          .order-item {
            grid-template-columns:
              50px
              minmax(0, 1fr);
          }

          .product-image {
            width: 50px;
            height: 50px;
          }

          .product-id {
            max-width: 150px;
          }

          .status-control-info {
            align-items: flex-start;
          }

          .status-control-icon {
            width: 38px;
            height: 38px;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}