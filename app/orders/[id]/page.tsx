
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

interface ShipmentEvent {
  status: string;
  statusCode?: string;
  description?: string;
  eventDate: string;
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

  paymentMethod: "cod" | "online";
  paymentStatus: "pending" | "paid" | "failed";

  orderStatus: string;

  subtotal: number;
  shipping: number;
  total: number;

  createdAt: string;
  updatedAt: string;

  shiprocketOrderId?: number;
  shiprocketShipmentId?: number;
  courierName?: string;
  courierCompanyId?: number;
  awbCode?: string;
  trackingUrl?: string;

  shipmentStatus?: string;
  shipmentStatusCode?: string;
  shipmentEvents?: ShipmentEvent[];

  pickupScheduledAt?: string;
  pickupTokenNumber?: string;

  shippingLabelUrl?: string;
  manifestUrl?: string;
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  order?: Order;
}

function formatPrice(value: number) {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getReference(id: string) {
  return id.slice(-8).toUpperCase();
}

function getPaymentLabel(order: Order) {
  if (order.paymentMethod === "cod") {
    return order.paymentStatus === "paid"
      ? "Paid"
      : "Cash on Delivery";
  }

  if (order.paymentStatus === "paid") return "Paid Online";
  if (order.paymentStatus === "failed") return "Payment Failed";

  return "Payment Pending";
}

const ORDER_STEPS = [
  { status: "pending", label: "Order Placed", icon: "solar:bag-4-linear" },
  { status: "confirmed", label: "Confirmed", icon: "solar:check-circle-linear" },
  { status: "processing", label: "Preparing Order", icon: "solar:box-linear" },
  { status: "shipped", label: "Shipped", icon: "solar:delivery-linear" },
  { status: "delivered", label: "Delivered", icon: "solar:verified-check-linear" },
];

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const refreshShipmentTracking = async () => {
  const response = await fetch(
    `/api/orders/${orderId}/tracking`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to refresh tracking.");
  }

  return data;
};

 const fetchOrder = useCallback(async (showRefresh = false) => {
  try {
    if (showRefresh) {
      setRefreshing(true);

      // First refresh Shiprocket tracking.
      try {
        await refreshShipmentTracking();
      } catch (trackingError) {
        console.warn("Tracking refresh:", trackingError);
      }
    } else {
      setLoading(true);
    }

    setError("");

    // Then fetch the latest saved order details.
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success || !data.order) {
      throw new Error(data.message || "Unable to load order details.");
    }

    setOrder(data.order);
  } catch (err) {
    console.error("Order details error:", err);

    setError(
      err instanceof Error
        ? err.message
        : "Unable to load order details."
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [orderId]);

  useEffect(() => {
    if (orderId) {
      void fetchOrder();
    }
  }, [orderId, fetchOrder]);

  const currentStep = ORDER_STEPS.findIndex(
    (step) => step.status === order?.orderStatus
  );

  const isCancelled = order?.orderStatus === "cancelled";

  return (
    <>
      <Navbar />

      <main className="orive-detail-page">
        <div className="orive-detail-container">

          <div className="orive-detail-breadcrumb">
            <Link href="/account">My Account</Link>
            <span>/</span>
            <Link href="/orders">My Orders</Link>
            <span>/</span>
            <span>Order Details</span>
          </div>

          {loading ? (
            <div className="orive-detail-state">
              <span className="orive-detail-loader" />
              <h2>Loading your order</h2>
              <p>Please wait while we retrieve your order details.</p>
            </div>
          ) : error ? (
            <div className="orive-detail-state">
              <Icon icon="solar:danger-triangle-linear" />
              <h2>Unable to load order</h2>
              <p>{error}</p>

              <button
                type="button"
                onClick={() => void fetchOrder()}
                className="orive-detail-button dark"
              >
                Try Again
              </button>

              <Link href="/orders" className="orive-detail-back">
                Back to My Orders
              </Link>
            </div>
          ) : order ? (
            <>
              <header className="orive-detail-header">
                <div>
                  <p className="orive-detail-eyebrow">
                    HOUSE OF ORIVE / ORDER DETAILS
                  </p>

                  <h1>
                    Your order <em>details.</em>
                  </h1>

                  <p className="orive-detail-reference">
                    Order #{getReference(order._id)}
                  </p>
                </div>

                <button
                  type="button"
                  className="orive-detail-refresh"
                  disabled={refreshing}
                  onClick={() => void fetchOrder(true)}
                >
                  <Icon
                    icon="solar:refresh-linear"
                    className={refreshing ? "orive-refreshing" : ""}
                  />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </header>

              {/* ORDER STATUS */}
              <section className="orive-detail-card">
                <div className="orive-detail-section-heading">
                  <div>
                    <p className="orive-detail-eyebrow">ORDER PROGRESS</p>
                    <h2>Track your order</h2>
                  </div>

                  <span className={`orive-detail-status ${isCancelled ? "cancelled" : ""}`}>
                    {order.orderStatus.replace(/_/g, " ")}
                  </span>
                </div>

                {isCancelled ? (
                  <div className="orive-cancelled-message">
                    <Icon icon="solar:close-circle-linear" />
                    <div>
                      <strong>This order has been cancelled.</strong>
                      <p>Please contact our team if you need assistance.</p>
                    </div>
                  </div>
                ) : (
                  <div className="orive-order-progress">
                    {ORDER_STEPS.map((step, index) => {
                      const completed =
                        currentStep >= 0 && index <= currentStep;

                      return (
                        <div
                          key={step.status}
                          className={`orive-progress-step ${completed ? "completed" : ""}`}
                        >
                          <div className="orive-progress-icon">
                            <Icon icon={step.icon} />
                          </div>

                          <span>{step.label}</span>

                          {index !== ORDER_STEPS.length - 1 && (
                            <div className="orive-progress-line" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* SHIPROCKET TRACKING */}
              <section className="orive-detail-card">
                <div className="orive-detail-section-heading">
                  <div>
                    <p className="orive-detail-eyebrow">
                      DELIVERY INFORMATION
                    </p>
                    <h2>Shipment tracking</h2>
                  </div>

                  {order.awbCode && (
                    <span className="orive-awb-badge">AWB ASSIGNED</span>
                  )}
                </div>

                {order.shipmentStatus || order.awbCode ? (
                  <>
                    <div className="orive-shipment-overview">
                      <div>
                        <span>SHIPMENT STATUS</span>
                        <strong>
                          {order.shipmentStatus || "Shipment processing"}
                        </strong>
                      </div>

                      <div>
                        <span>COURIER PARTNER</span>
                        <strong>
                          {order.courierName || "Awaiting assignment"}
                        </strong>
                      </div>

                      <div>
                        <span>AWB NUMBER</span>
                        <strong>{order.awbCode || "Not generated"}</strong>
                      </div>
                    </div>

                    {order.trackingUrl && order.awbCode && (
                      <a
                        href={order.trackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="orive-detail-button dark"
                      >
                        Track on Shiprocket
                        <Icon icon="solar:arrow-up-right-linear" />
                      </a>
                    )}

                    {order.pickupScheduledAt && (
                      <p className="orive-pickup-info">
                        <Icon icon="solar:calendar-linear" />
                        Pickup scheduled: {formatDate(order.pickupScheduledAt)}
                      </p>
                    )}

                    <div className="orive-shipment-events">
                      <h3>Shipment activity</h3>

                      {order.shipmentEvents?.length ? (
                        [...order.shipmentEvents]
                          .sort(
                            (a, b) =>
                              new Date(b.eventDate).getTime() -
                              new Date(a.eventDate).getTime()
                          )
                          .map((event, index) => (
                            <div
                              className="orive-shipment-event"
                              key={`${event.status}-${event.eventDate}-${index}`}
                            >
                              <span className="orive-event-dot" />

                              <div>
                                <strong>{event.status}</strong>
                                {event.description && (
                                  <p>{event.description}</p>
                                )}
                                <small>{formatDate(event.eventDate)}</small>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="orive-no-events">
                          No shipment updates are available yet.
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="orive-shipment-pending">
                    <Icon icon="solar:delivery-linear" />
                    <div>
                      <strong>Your shipment is being prepared.</strong>
                      <p>
                        Tracking details will appear here once your order
                        has been handed over for shipping.
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* PRODUCTS */}
              <section className="orive-detail-card">
                <div className="orive-detail-section-heading">
                  <div>
                    <p className="orive-detail-eyebrow">YOUR PURCHASE</p>
                    <h2>Items in this order</h2>
                  </div>

                  <span className="orive-item-count">
                    {order.items.length} {order.items.length === 1 ? "ITEM" : "ITEMS"}
                  </span>
                </div>

                <div className="orive-detail-products">
                  {order.items.map((item, index) => (
                    <article
                      className="orive-detail-product"
                      key={`${item.productId}-${index}`}
                    >
                      <div className="orive-detail-product-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <Icon icon="solar:gallery-linear" />
                        )}
                      </div>

                      <div className="orive-detail-product-info">
                        <strong>{item.name}</strong>

                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}

                        <small>
                          ₹{formatPrice(item.price)} × {item.quantity}
                        </small>
                      </div>

                      <strong className="orive-detail-product-total">
                        ₹{formatPrice(item.price * item.quantity)}
                      </strong>
                    </article>
                  ))}
                </div>
              </section>

              <div className="orive-detail-grid">

                {/* DELIVERY ADDRESS */}
                <section className="orive-detail-card">
                  <p className="orive-detail-eyebrow">DELIVERY ADDRESS</p>
                  <h2>Shipping details</h2>

                  <div className="orive-address-content">
                    <strong>{order.customer.name}</strong>
                    <p>{order.shippingAddress.address}</p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state} -{" "}
                      {order.shippingAddress.pincode}
                    </p>
                    <p>{order.customer.phone}</p>
                    <p>{order.customer.email}</p>
                  </div>
                </section>

                {/* PAYMENT */}
                <section className="orive-detail-card">
                  <p className="orive-detail-eyebrow">PAYMENT INFORMATION</p>
                  <h2>Payment summary</h2>

                  <div className="orive-payment-info">
                    <div>
                      <span>Payment method</span>
                      <strong>
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Online Payment"}
                      </strong>
                    </div>

                    <div>
                      <span>Payment status</span>
                      <strong>{getPaymentLabel(order)}</strong>
                    </div>
                  </div>

                  <div className="orive-price-summary">
                    <div>
                      <span>Subtotal</span>
                      <span>₹{formatPrice(order.subtotal)}</span>
                    </div>

                    <div>
                      <span>Shipping</span>
                      <span>
                        {order.shipping === 0
                          ? "FREE"
                          : `₹${formatPrice(order.shipping)}`}
                      </span>
                    </div>

                    <div className="orive-grand-total">
                      <strong>Total</strong>
                      <strong>₹{formatPrice(order.total)}</strong>
                    </div>
                  </div>
                </section>
              </div>

              {/* ORDER INFORMATION */}
              <section className="orive-detail-card orive-order-meta">
                <div>
                  <span>ORDER NUMBER</span>
                  <strong>#{getReference(order._id)}</strong>
                </div>

                <div>
                  <span>ORDER DATE</span>
                  <strong>{formatDate(order.createdAt)}</strong>
                </div>

                <div>
                  <span>LAST UPDATED</span>
                  <strong>{formatDate(order.updatedAt)}</strong>
                </div>
              </section>

              <div className="orive-detail-footer">
                <Link href="/orders">
                  <Icon icon="solar:arrow-left-linear" />
                  Back to My Orders
                </Link>

                <Link href="/contact">
                  Need help with your order?
                  <Icon icon="solar:arrow-up-right-linear" />
                </Link>
              </div>
            </>
          ) : null}
        </div>
      </main>

      <Footer />

      <OrderDetailsStyles />
    </>
  );
}

function OrderDetailsStyles() {
  return (
    <style jsx global>{`
      .orive-detail-page {
        min-height: 75vh;
        padding: 38px 24px 90px;
        background: #f7f6f3;
        color: #171715;
      }

      .orive-detail-container {
        width: min(1100px, 100%);
        margin: auto;
      }

      .orive-detail-breadcrumb {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 38px;
        color: #99948c;
        font-size: 10px;
      }

      .orive-detail-breadcrumb a {
        color: #77736d;
        text-decoration: none;
      }

      .orive-detail-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 20px;
        padding-bottom: 32px;
        border-bottom: 1px solid #dedbd5;
        margin-bottom: 25px;
      }

      .orive-detail-eyebrow {
        margin: 0 0 9px;
        color: #969087;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: .18em;
      }

      .orive-detail-header h1 {
        margin: 0;
        font-family: Georgia, serif;
        font-size: clamp(42px, 6vw, 65px);
        font-weight: 400;
        letter-spacing: -.05em;
      }

      .orive-detail-header h1 em {
        color: #898074;
      }

      .orive-detail-reference {
        margin: 12px 0 0;
        color: #77736d;
        font-size: 11px;
      }

      .orive-detail-refresh {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 11px 15px;
        border: 1px solid #dedbd5;
        background: #fff;
        color: #171715;
        font-size: 10px;
        cursor: pointer;
      }

      .orive-detail-refresh:disabled {
        opacity: .6;
        cursor: wait;
      }

      .orive-refreshing {
        animation: orive-detail-spin .8s linear infinite;
      }

      .orive-detail-card {
        padding: 25px;
        margin-bottom: 16px;
        border: 1px solid #e9e6df;
        background: #fff;
      }

      .orive-detail-section-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
        margin-bottom: 25px;
      }

      .orive-detail-section-heading h2,
      .orive-detail-card h2 {
        margin: 0;
        font-family: Georgia, serif;
        font-size: 25px;
        font-weight: 400;
        letter-spacing: -.03em;
      }

      .orive-detail-status,
      .orive-awb-badge,
      .orive-item-count {
        padding: 8px 11px;
        background: #eeefe9;
        color: #59644d;
        font-size: 9px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .orive-detail-status.cancelled {
        background: #f3eaea;
        color: #8c5c5c;
      }

      .orive-awb-badge {
        background: #edf0f2;
        color: #536575;
      }

      .orive-order-progress {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;
      }

      .orive-progress-step {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        color: #aaa49a;
        font-size: 10px;
        text-align: center;
      }

      .orive-progress-icon {
        z-index: 1;
        display: grid;
        place-items: center;
        width: 39px;
        height: 39px;
        border: 1px solid #e5e1d9;
        border-radius: 50%;
        background: #fff;
        font-size: 18px;
      }

      .orive-progress-step.completed {
        color: #536c51;
      }

      .orive-progress-step.completed .orive-progress-icon {
        border-color: #64745b;
        background: #64745b;
        color: #fff;
      }

      .orive-progress-line {
        position: absolute;
        top: 19px;
        left: calc(50% + 25px);
        width: calc(100% - 30px);
        height: 1px;
        background: #e5e1d9;
      }

      .orive-progress-step.completed .orive-progress-line {
        background: #64745b;
      }

      .orive-cancelled-message,
      .orive-shipment-pending {
        display: flex;
        align-items: flex-start;
        gap: 13px;
        padding: 18px;
        background: #f7f6f3;
        color: #77736d;
        font-size: 12px;
      }

      .orive-cancelled-message > svg,
      .orive-shipment-pending > svg {
        flex-shrink: 0;
        font-size: 22px;
      }

      .orive-cancelled-message strong,
      .orive-shipment-pending strong {
        color: #292824;
      }

      .orive-cancelled-message p,
      .orive-shipment-pending p {
        margin: 6px 0 0;
        line-height: 1.7;
      }

      .orive-shipment-overview {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin-bottom: 20px;
      }

      .orive-shipment-overview > div {
        display: grid;
        gap: 8px;
        padding: 15px;
        background: #f7f6f3;
        min-width: 0;
      }

      .orive-shipment-overview span,
      .orive-order-meta span {
        color: #969087;
        font-size: 8px;
        font-weight: 700;
        letter-spacing: .12em;
      }

      .orive-shipment-overview strong {
        overflow-wrap: anywhere;
        font-size: 11px;
      }

      .orive-detail-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        min-height: 43px;
        padding: 0 17px;
        border: 1px solid #171715;
        text-decoration: none;
        font-size: 10px;
        font-weight: 700;
      }

      .orive-detail-button.dark {
        background: #171715;
        color: #fff;
      }

      .orive-pickup-info {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 16px 0 0;
        color: #77736d;
        font-size: 10px;
      }

      .orive-shipment-events {
        margin-top: 30px;
        padding-top: 23px;
        border-top: 1px solid #efede8;
      }

      .orive-shipment-events h3 {
        margin: 0 0 22px;
        font-family: Georgia, serif;
        font-size: 19px;
        font-weight: 400;
      }

      .orive-shipment-event {
        position: relative;
        display: flex;
        gap: 15px;
        padding: 0 0 23px 3px;
      }

      .orive-event-dot {
        flex-shrink: 0;
        width: 10px;
        height: 10px;
        margin-top: 4px;
        border: 2px solid #64745b;
        border-radius: 50%;
        background: #fff;
      }

      .orive-shipment-event strong {
        font-size: 11px;
      }

      .orive-shipment-event p {
        margin: 5px 0;
        color: #77736d;
        font-size: 10px;
        line-height: 1.6;
      }

      .orive-shipment-event small {
        color: #a09a91;
        font-size: 9px;
      }

      .orive-no-events {
        color: #99948c;
        font-size: 11px;
      }

      .orive-detail-products {
        display: grid;
      }

      .orive-detail-product {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 17px 0;
        border-top: 1px solid #efede8;
      }

      .orive-detail-product-image {
        display: grid;
        place-items: center;
        width: 76px;
        height: 90px;
        flex-shrink: 0;
        overflow: hidden;
        background: #f2f0ec;
        color: #aaa49a;
        font-size: 22px;
      }

      .orive-detail-product-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .orive-detail-product-info {
        display: grid;
        gap: 5px;
        flex: 1;
        min-width: 0;
      }

      .orive-detail-product-info strong {
        font-size: 12px;
      }

      .orive-detail-product-info span,
      .orive-detail-product-info small {
        color: #888279;
        font-size: 10px;
      }

      .orive-detail-product-total {
        font-family: Georgia, serif;
        font-size: 17px;
        font-weight: 400;
        white-space: nowrap;
      }

      .orive-detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .orive-address-content {
        margin-top: 20px;
        color: #77736d;
        font-size: 11px;
        line-height: 1.8;
      }

      .orive-address-content strong {
        color: #292824;
      }

      .orive-address-content p {
        margin: 4px 0;
        overflow-wrap: anywhere;
      }

      .orive-payment-info {
        display: grid;
        gap: 15px;
        margin-top: 22px;
      }

      .orive-payment-info > div,
      .orive-price-summary > div {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 10px;
      }

      .orive-payment-info span,
      .orive-price-summary span {
        color: #888279;
      }

      .orive-payment-info strong {
        text-align: right;
      }

      .orive-price-summary {
        display: grid;
        gap: 13px;
        margin-top: 22px;
        padding-top: 17px;
        border-top: 1px solid #efede8;
      }

      .orive-price-summary .orive-grand-total {
        padding-top: 14px;
        border-top: 1px solid #dedbd5;
        font-size: 13px;
      }

      .orive-grand-total strong:last-child {
        font-family: Georgia, serif;
        font-size: 21px;
        font-weight: 400;
      }

      .orive-order-meta {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }

      .orive-order-meta > div {
        display: grid;
        gap: 8px;
      }

      .orive-order-meta strong {
        font-size: 10px;
        overflow-wrap: anywhere;
      }

      .orive-detail-footer {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 15px;
        margin-top: 28px;
      }

      .orive-detail-footer a,
      .orive-detail-back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #292824;
        text-decoration: none;
        font-size: 10px;
        font-weight: 700;
      }

      .orive-detail-state {
        display: grid;
        justify-items: center;
        gap: 13px;
        width: min(500px, 100%);
        margin: 55px auto;
        padding: 55px 25px;
        border: 1px solid #e9e6df;
        background: #fff;
        text-align: center;
      }

      .orive-detail-state > svg {
        font-size: 32px;
      }

      .orive-detail-state h2 {
        margin: 0;
        font-family: Georgia, serif;
        font-size: 27px;
        font-weight: 400;
      }

      .orive-detail-state p {
        margin: 0;
        color: #888279;
        font-size: 11px;
        line-height: 1.7;
      }

      .orive-detail-back {
        margin-top: 10px;
      }

      .orive-detail-loader {
        width: 27px;
        height: 27px;
        border: 2px solid #ddd8cf;
        border-top-color: #171715;
        border-radius: 50%;
        animation: orive-detail-spin .8s linear infinite;
      }

      @keyframes orive-detail-spin {
        to { transform: rotate(360deg); }
      }

      @media (max-width: 700px) {
        .orive-detail-page {
          padding: 25px 15px 65px;
        }

        .orive-detail-header {
          align-items: flex-start;
        }

        .orive-detail-header h1 {
          font-size: 43px;
        }

        .orive-detail-card {
          padding: 19px 16px;
        }

        .orive-order-progress {
          grid-template-columns: 1fr;
          gap: 15px;
        }

        .orive-progress-step {
          flex-direction: row;
          justify-content: flex-start;
          text-align: left;
        }

        .orive-progress-line {
          display: none;
        }

        .orive-shipment-overview {
          grid-template-columns: 1fr;
        }

        .orive-detail-grid {
          grid-template-columns: 1fr;
          gap: 0;
        }

        .orive-order-meta {
          grid-template-columns: 1fr;
          gap: 15px;
        }

        .orive-detail-product-image {
          width: 61px;
          height: 75px;
        }

        .orive-detail-product-total {
          font-size: 14px;
        }
      }

      @media (max-width: 420px) {
        .orive-detail-header {
          flex-direction: column;
        }

        .orive-detail-section-heading {
          align-items: flex-start;
        }

        .orive-detail-footer {
          flex-direction: column;
        }
      }
    `}</style>
  );
}
