"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
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
  courierName?: string;
  awbCode?: string;
  trackingUrl?: string;
  shipmentStatus?: string;
}

interface OrdersApiResponse {
  success?: boolean;
  message?: string;
  orders?: Order[];
}

type OrderFilter = "all" | Order["orderStatus"];

const FILTERS: { value: OrderFilter; label: string }[] = [
  { value: "all", label: "All orders" },
  { value: "pending", label: "Placed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_LABELS: Record<Order["orderStatus"], string> = {
  pending: "Order placed",
  confirmed: "Confirmed",
  processing: "Preparing order",
  shipped: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_ICONS: Record<Order["orderStatus"], string> = {
  pending: "solar:clock-circle-linear",
  confirmed: "solar:check-circle-linear",
  processing: "solar:box-linear",
  shipped: "solar:delivery-linear",
  delivered: "solar:verified-check-linear",
  cancelled: "solar:close-circle-linear",
};

function formatPrice(value: number) {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPaymentLabel(order: Order) {
  if (order.paymentMethod === "cod") {
    return order.paymentStatus === "paid" ? "Paid" : "Cash on delivery";
  }

  if (order.paymentStatus === "paid") return "Paid online";
  if (order.paymentStatus === "failed") return "Payment failed";
  return "Payment pending";
}

function getOrderReference(id: string) {
  return id.slice(-8).toUpperCase();
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/orders", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      const responseText = await response.text();
      let data: OrdersApiResponse = {};

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText) as OrdersApiResponse;
        } catch {
          throw new Error(
            `The server returned an invalid response (${response.status}). Please try again.`
          );
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            data.message || "Your session has expired. Please log in again."
          );
        }
        throw new Error(
          data.message || `Unable to load orders. Server status: ${response.status}.`
        );
      }

      if (!Array.isArray(data.orders)) {
        throw new Error(data.message || "The server did not return a valid order list.");
      }

      setOrders(data.orders);
    } catch (fetchError) {
      console.error("Fetch orders error:", fetchError);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to load your orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const counts = useMemo(() => {
    const result: Record<OrderFilter, number> = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((order) => {
      result[order.orderStatus] += 1;
    });
    return result;
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...orders]
      .filter((order) => activeFilter === "all" || order.orderStatus === activeFilter)
      .filter((order) => {
        if (!query) return true;
        const searchable = [
          order._id,
          getOrderReference(order._id),
          ...order.items.map((item) => item.name),
          order.orderStatus,
          order.courierName || "",
          order.awbCode || "",
        ]
          .join(" ")
          .toLowerCase();
        return searchable.includes(query);
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [orders, activeFilter, search]);

  const activeOrders = orders.filter((order) =>
    ["pending", "confirmed", "processing", "shipped"].includes(order.orderStatus)
  ).length;
  const deliveredOrders = counts.delivered;
  const totalOrderValue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const renderPageShell = (content: ReactNode) => (
    <>
      <Navbar />
      {content}
      <Footer />
    </>
  );

  if (loading) {
    return renderPageShell(
      <main className="orive-orders-page">
        <div className="orive-orders-wrap">
          <div className="orive-loading-card">
            <span className="orive-loader" />
            <p>Gathering your order history</p>
            <span>Just a moment...</span>
          </div>
        </div>
        <OrdersStyles />
      </main>
    );
  }

  if (error) {
    const needsLogin = /session|login/i.test(error);
    return renderPageShell(
      <main className="orive-orders-page">
        <div className="orive-orders-wrap">
          <div className="orive-state-card">
            <div className="orive-state-icon">
              <Icon icon={needsLogin ? "solar:lock-keyhole-linear" : "solar:danger-triangle-linear"} />
            </div>
            <p className="orive-eyebrow">HOUSE OF ORIVE · ACCOUNT</p>
            <h1>{needsLogin ? "Please sign in" : "We couldn't load your orders"}</h1>
            <p className="orive-state-copy">{error}</p>
            <div className="orive-state-actions">
              <button className="orive-button orive-button-dark" onClick={() => void fetchOrders()} type="button">
                Try again <Icon icon="solar:refresh-linear" />
              </button>
              {needsLogin && (
                <Link className="orive-button orive-button-light" href="/login?redirect=/orders">
                  Sign in <Icon icon="solar:arrow-up-right-linear" />
                </Link>
              )}
            </div>
          </div>
        </div>
        <OrdersStyles />
      </main>
    );
  }

  return renderPageShell(
    <main className="orive-orders-page">
      <div className="orive-orders-wrap">
        <div className="orive-breadcrumb">
          <Link href="/account"><Icon icon="solar:alt-arrow-left-linear" /> My account</Link>
          <span>/</span>
          <span>Orders</span>
        </div>

        <header className="orive-orders-hero">
          <div>
            <p className="orive-eyebrow">YOUR HOUSE OF ORIVE ACCOUNT</p>
            <h1>My <em>orders.</em></h1>
            <p className="orive-hero-copy">Every order, thoughtfully kept in one place. Follow your purchases from checkout to your door.</p>
          </div>
          <div className="orive-hero-mark" aria-hidden="true">
            <span>H</span>
            <small>ORIVE / 01</small>
          </div>
        </header>

        <section className="orive-order-stats" aria-label="Order overview">
          <article className="orive-stat-card">
            <span className="orive-stat-label">TOTAL ORDERS</span>
            <strong>{orders.length.toString().padStart(2, "0")}</strong>
            <span className="orive-stat-foot">Your purchase history</span>
          </article>
          <article className="orive-stat-card">
            <span className="orive-stat-label">IN PROGRESS</span>
            <strong>{activeOrders.toString().padStart(2, "0")}</strong>
            <span className="orive-stat-foot">Orders being fulfilled</span>
          </article>
          <article className="orive-stat-card">
            <span className="orive-stat-label">DELIVERED</span>
            <strong>{deliveredOrders.toString().padStart(2, "0")}</strong>
            <span className="orive-stat-foot">Successfully received</span>
          </article>
          <article className="orive-stat-card orive-stat-spend">
            <span className="orive-stat-label">ORDER VALUE</span>
            <strong>₹{formatPrice(totalOrderValue)}</strong>
            <span className="orive-stat-foot">Combined value of all orders</span>
          </article>
        </section>

        <section className="orive-orders-section">
          <div className="orive-list-heading">
            <div>
              <p className="orive-eyebrow">THE DETAILS</p>
              <h2>Order history <span>({orders.length})</span></h2>
            </div>
            <label className="orive-search">
              <Icon icon="solar:magnifer-linear" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search order or product"
                aria-label="Search orders by order number or product"
              />
              {search && (
                <button type="button" onClick={() => setSearch("")} aria-label="Clear search">
                  <Icon icon="solar:close-circle-linear" />
                </button>
              )}
            </label>
          </div>

          <div className="orive-filter-row" role="tablist" aria-label="Filter orders by status">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                role="tab"
                aria-selected={activeFilter === filter.value}
                className={`orive-filter ${activeFilter === filter.value ? "is-active" : ""}`}
                onClick={() => setActiveFilter(filter.value)}
              >
                {filter.label}
                <span>{counts[filter.value]}</span>
              </button>
            ))}
          </div>

          {orders.length === 0 ? (
            <div className="orive-empty-card">
              <div className="orive-empty-symbol"><Icon icon="solar:bag-4-linear" /></div>
              <p className="orive-eyebrow">A NEW CHAPTER</p>
              <h2>Your story starts here.</h2>
              <p>You haven't placed an order yet. Discover pieces selected for your everyday wardrobe.</p>
              <Link href="/products" className="orive-button orive-button-dark">Explore the collection <Icon icon="solar:arrow-right-linear" /></Link>
            </div>
          ) : visibleOrders.length === 0 ? (
            <div className="orive-no-results">
              <Icon icon="solar:magnifer-linear" />
              <h3>No matching orders</h3>
              <p>Try another search term or select a different order status.</p>
              <button type="button" onClick={() => { setSearch(""); setActiveFilter("all"); }}>Clear filters</button>
            </div>
          ) : (
            <div className="orive-order-list">
              {visibleOrders.map((order) => {
                const itemCount = order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
                const previewItems = order.items.slice(0, 3);
                return (
                  <article className="orive-order-card" key={order._id}>
                    <div className="orive-order-card-top">
                      <div>
                        <span className="orive-card-kicker">ORDER REFERENCE</span>
                        <h3>#{getOrderReference(order._id)}</h3>
                        <p>Placed on {formatDate(order.createdAt)}</p>
                      </div>
                      <span className={`orive-status status-${order.orderStatus}`}>
                        <Icon icon={STATUS_ICONS[order.orderStatus]} />
                        {STATUS_LABELS[order.orderStatus]}
                      </span>
                    </div>

                    <div className="orive-order-card-middle">
                      <div className="orive-product-preview">
                        <div className="orive-thumb-stack">
                          {previewItems.map((item, index) => (
                            <div className="orive-thumb" key={`${order._id}-${item.productId}-${index}`} style={{ zIndex: previewItems.length - index }}>
                              {item.image ? <img src={item.image} alt={item.name} /> : <Icon icon="solar:gallery-linear" />}
                            </div>
                          ))}
                          {order.items.length > 3 && <span className="orive-thumb-more">+{order.items.length - 3}</span>}
                        </div>
                        <div className="orive-product-summary">
                          <strong>{order.items[0]?.name || "Your order"}</strong>
                          {order.items.length > 1 && <span>and {order.items.length - 1} other {order.items.length === 2 ? "item" : "items"}</span>}
                          <small>{itemCount} {itemCount === 1 ? "piece" : "pieces"} in this order</small>
                        </div>
                      </div>
                      <div className="orive-card-meta">
                        <span>PAYMENT</span>
                        <strong>{getPaymentLabel(order)}</strong>
                        <small>{order.paymentMethod === "cod" ? "Cash on delivery" : "Online payment"}</small>
                      </div>
                      <div className="orive-card-total">
                        <span>ORDER TOTAL</span>
                        <strong>₹{formatPrice(order.total)}</strong>
                        <small>{order.shipping === 0 ? "Complimentary shipping" : `Shipping ₹${formatPrice(order.shipping)}`}</small>
                      </div>
                    </div>

                    <div className="orive-order-card-bottom">
                      <div className="orive-delivery-hint">
                        <Icon icon="solar:map-point-linear" />
                        <span>{[order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(", ") || "Delivery address on file"}</span>
                        {order.awbCode && <small>AWB {order.awbCode}</small>}
                      </div>
                      <Link href={`/orders/${order._id}`} className="orive-view-order">
                        View order <Icon icon="solar:arrow-up-right-linear" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <div className="orive-help-strip">
          <div className="orive-help-icon"><Icon icon="solar:chat-round-line-linear" /></div>
          <div><strong>Need a hand with an order?</strong><span>Our team is happy to help with delivery, payment or product questions.</span></div>
          <Link href="/contact">Contact us <Icon icon="solar:arrow-up-right-linear" /></Link>
        </div>
      </div>
      <OrdersStyles />
    </main>
  );
}

function OrdersStyles() {
  return (
    <style jsx global>{`
      .orive-orders-page { background: #f7f6f3; color: #171715; min-height: 72vh; padding: 38px 24px 100px; }
      .orive-orders-wrap { width: min(1180px, 100%); margin: 0 auto; }
      .orive-breadcrumb { display:flex; align-items:center; gap:10px; color:#99958e; font-size:11px; letter-spacing:.03em; margin-bottom:38px; }
      .orive-breadcrumb a { display:inline-flex; align-items:center; gap:7px; color:#77736d; text-decoration:none; transition:color .2s; }
      .orive-breadcrumb a:hover { color:#111; }
      .orive-breadcrumb svg { font-size:15px; }
      .orive-orders-hero { display:flex; justify-content:space-between; align-items:flex-end; gap:30px; padding:0 0 38px; border-bottom:1px solid #dedbd5; }
      .orive-eyebrow { margin:0; color:#89847b; font-size:9px; font-weight:700; letter-spacing:.22em; line-height:1.5; }
      .orive-orders-hero h1 { margin:14px 0 0; font-family:Georgia, 'Times New Roman', serif; font-size:clamp(48px, 7vw, 78px); font-weight:400; letter-spacing:-.065em; line-height:.95; }
      .orive-orders-hero h1 em { font-weight:400; color:#8b8174; }
      .orive-hero-copy { max-width:490px; margin:18px 0 0; color:#77736d; font-size:13px; line-height:1.8; }
      .orive-hero-mark { width:104px; height:104px; border:1px solid #d8d4cd; border-radius:50%; display:flex; flex-direction:column; justify-content:center; align-items:center; flex-shrink:0; color:#777167; }
      .orive-hero-mark span { font-family:Georgia,serif; font-size:49px; line-height:1; }
      .orive-hero-mark small { margin-top:5px; font-size:7px; letter-spacing:.18em; }
      .orive-order-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin:24px 0 66px; }
      .orive-stat-card { min-height:126px; padding:20px 22px; background:#fff; border:1px solid #ebe8e2; }
      .orive-stat-label { display:block; color:#969087; font-size:8px; letter-spacing:.17em; font-weight:700; }
      .orive-stat-card strong { display:block; margin-top:13px; font-family:Georgia,serif; font-size:32px; font-weight:400; letter-spacing:-.04em; line-height:1; }
      .orive-stat-spend strong { font-size:28px; }
      .orive-stat-foot { display:block; margin-top:9px; color:#99948c; font-size:10px; }
      .orive-orders-section { min-width:0; }
      .orive-list-heading { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:23px; }
      .orive-list-heading h2 { margin:8px 0 0; font-family:Georgia,serif; font-size:32px; font-weight:400; letter-spacing:-.04em; }
      .orive-list-heading h2 span { color:#aaa49a; font-family:Arial,sans-serif; font-size:13px; letter-spacing:0; }
      .orive-search { width:min(330px,100%); height:46px; padding:0 14px; display:flex; align-items:center; gap:10px; background:#fff; border:1px solid #e4e0d9; }
      .orive-search > svg { color:#8d887f; font-size:17px; flex-shrink:0; }
      .orive-search input { width:100%; min-width:0; border:0; outline:0; background:transparent; color:#222; font-size:11px; }
      .orive-search input::placeholder { color:#a8a39a; }
      .orive-search button { display:grid; place-items:center; padding:2px; border:0; background:transparent; color:#888; cursor:pointer; font-size:17px; }
      .orive-filter-row { display:flex; align-items:center; gap:7px; overflow-x:auto; padding:0 0 13px; margin-bottom:14px; scrollbar-width:thin; }
      .orive-filter { white-space:nowrap; display:inline-flex; align-items:center; gap:9px; min-height:36px; padding:0 13px; border:1px solid #e3dfd8; border-radius:999px; background:transparent; color:#77736d; font-size:10px; cursor:pointer; transition:all .2s; }
      .orive-filter span { display:grid; place-items:center; min-width:18px; height:18px; padding:0 4px; background:#ece9e3; border-radius:20px; color:#6d685f; font-size:9px; }
      .orive-filter:hover { border-color:#aaa39a; color:#171715; }
      .orive-filter.is-active { background:#171715; border-color:#171715; color:#fff; }
      .orive-filter.is-active span { background:#44413c; color:#fff; }
      .orive-order-list { display:grid; gap:12px; }
      .orive-order-card { padding:23px 25px 0; background:#fff; border:1px solid #eae7e1; transition:border-color .2s, transform .2s; }
      .orive-order-card:hover { border-color:#c9c3b9; transform:translateY(-1px); }
      .orive-order-card-top { display:flex; justify-content:space-between; align-items:flex-start; gap:20px; padding-bottom:19px; border-bottom:1px solid #efede8; }
      .orive-card-kicker { color:#9a958c; font-size:8px; font-weight:700; letter-spacing:.18em; }
      .orive-order-card-top h3 { margin:6px 0 4px; font-size:14px; font-weight:700; letter-spacing:.04em; }
      .orive-order-card-top p { margin:0; color:#99948c; font-size:10px; }
      .orive-status { display:inline-flex; align-items:center; gap:7px; padding:8px 11px; border-radius:2px; font-size:9px; font-weight:700; letter-spacing:.02em; white-space:nowrap; }
      .orive-status svg { font-size:14px; }
      .status-pending { background:#f2eee7; color:#78664c; }
      .status-confirmed { background:#eeefe9; color:#5e694e; }
      .status-processing { background:#f0eee8; color:#776747; }
      .status-shipped { background:#edf0f2; color:#536575; }
      .status-delivered { background:#eaf0e9; color:#536c51; }
      .status-cancelled { background:#f3eaea; color:#8c5c5c; }
      .orive-order-card-middle { display:grid; grid-template-columns:minmax(0,1.6fr) minmax(145px,.8fr) minmax(140px,.7fr); align-items:center; gap:22px; padding:20px 0; }
      .orive-product-preview { min-width:0; display:flex; align-items:center; gap:16px; }
      .orive-thumb-stack { display:flex; align-items:center; padding-left:0; flex-shrink:0; }
      .orive-thumb { position:relative; display:grid; place-items:center; width:51px; height:59px; margin-left:-9px; overflow:hidden; border:2px solid #fff; background:#f1efeb; color:#a6a095; }
      .orive-thumb:first-child { margin-left:0; }
      .orive-thumb img { width:100%; height:100%; object-fit:cover; }
      .orive-thumb svg { font-size:20px; }
      .orive-thumb-more { display:grid; place-items:center; width:39px; height:49px; margin-left:-9px; border:2px solid #fff; background:#e9e6df; color:#5e5a53; font-size:10px; font-weight:700; z-index:5; }
      .orive-product-summary { min-width:0; display:grid; gap:5px; }
      .orive-product-summary strong { overflow:hidden; color:#292824; font-size:12px; font-weight:650; text-overflow:ellipsis; white-space:nowrap; }
      .orive-product-summary span { color:#77736b; font-size:10px; }
      .orive-product-summary small { color:#a29c92; font-size:9px; }
      .orive-card-meta, .orive-card-total { min-width:0; display:grid; gap:6px; padding-left:20px; border-left:1px solid #efede8; }
      .orive-card-meta > span, .orive-card-total > span { color:#a09a91; font-size:8px; font-weight:700; letter-spacing:.16em; }
      .orive-card-meta strong { color:#393731; font-size:11px; font-weight:600; }
      .orive-card-meta small, .orive-card-total small { overflow:hidden; color:#a09a91; font-size:9px; text-overflow:ellipsis; white-space:nowrap; }
      .orive-card-total strong { font-family:Georgia,serif; font-size:23px; font-weight:400; letter-spacing:-.03em; }
      .orive-order-card-bottom { display:flex; align-items:center; justify-content:space-between; gap:16px; min-height:52px; border-top:1px solid #efede8; }
      .orive-delivery-hint { min-width:0; display:flex; align-items:center; gap:8px; color:#858077; font-size:9px; }
      .orive-delivery-hint svg { flex-shrink:0; font-size:15px; }
      .orive-delivery-hint span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .orive-delivery-hint small { margin-left:8px; color:#aaa39a; font-size:8px; white-space:nowrap; }
      .orive-view-order { flex-shrink:0; display:inline-flex; align-items:center; gap:7px; color:#171715; text-decoration:none; font-size:10px; font-weight:700; transition:gap .2s; }
      .orive-view-order:hover { gap:11px; }
      .orive-view-order svg { font-size:15px; }
      .orive-empty-card, .orive-no-results, .orive-state-card, .orive-loading-card { background:#fff; border:1px solid #eae7e1; text-align:center; }
      .orive-empty-card { padding:76px 24px; }
      .orive-empty-symbol, .orive-state-icon { display:grid; place-items:center; width:67px; height:67px; margin:0 auto 25px; border:1px solid #e5e0d8; border-radius:50%; color:#746e63; font-size:28px; }
      .orive-empty-card h2, .orive-state-card h1 { margin:12px 0 10px; font-family:Georgia,serif; font-size:34px; font-weight:400; letter-spacing:-.04em; }
      .orive-empty-card > p:not(.orive-eyebrow), .orive-state-copy { max-width:410px; margin:0 auto; color:#858077; font-size:11px; line-height:1.8; }
      .orive-button { min-height:44px; display:inline-flex; align-items:center; justify-content:center; gap:12px; padding:0 19px; border:1px solid #171715; text-decoration:none; font-size:10px; font-weight:700; cursor:pointer; transition:background .2s, color .2s; }
      .orive-button svg { font-size:16px; }
      .orive-button-dark { margin-top:24px; background:#171715; color:#fff; }
      .orive-button-dark:hover { background:#393731; }
      .orive-button-light { background:#fff; color:#171715; }
      .orive-button-light:hover { background:#f1efeb; }
      .orive-no-results { padding:54px 20px; color:#77736d; }
      .orive-no-results > svg { font-size:25px; }
      .orive-no-results h3 { margin:13px 0 7px; color:#25241f; font-family:Georgia,serif; font-size:25px; font-weight:400; }
      .orive-no-results p { margin:0; font-size:11px; }
      .orive-no-results button { margin-top:18px; padding:8px 0; border:0; border-bottom:1px solid #171715; background:transparent; color:#171715; font-size:10px; font-weight:700; cursor:pointer; }
      .orive-help-strip { display:flex; align-items:center; gap:15px; margin-top:48px; padding:19px 22px; border:1px solid #e1ddd5; }
      .orive-help-icon { display:grid; place-items:center; width:39px; height:39px; background:#e9e6df; color:#5f5a50; font-size:19px; }
      .orive-help-strip > div:nth-child(2) { display:grid; gap:4px; flex:1; }
      .orive-help-strip strong { font-size:10px; }
      .orive-help-strip span { color:#888279; font-size:9px; }
      .orive-help-strip a { display:inline-flex; align-items:center; gap:6px; color:#171715; text-decoration:none; font-size:9px; font-weight:700; white-space:nowrap; }
      .orive-help-strip a svg { font-size:14px; }
      .orive-loading-card { width:min(390px,100%); margin:45px auto; padding:52px 20px; }
      .orive-loading-card p { margin:18px 0 5px; font-family:Georgia,serif; font-size:23px; }
      .orive-loading-card > span:last-child { color:#99948c; font-size:10px; }
      .orive-loader { display:block; width:28px; height:28px; margin:auto; border:1px solid #d3cec5; border-top-color:#171715; border-radius:50%; animation:orive-spin .8s linear infinite; }
      @keyframes orive-spin { to { transform:rotate(360deg); } }
      .orive-state-card { width:min(500px,100%); margin:35px auto; padding:55px 28px; }
      .orive-state-card h1 { font-size:31px; }
      .orive-state-actions { display:flex; justify-content:center; flex-wrap:wrap; gap:10px; }
      .orive-state-actions .orive-button-dark { margin-top:23px; }
      @media (max-width:900px) {
        .orive-order-card-middle { grid-template-columns:minmax(0,1.4fr) minmax(130px,.8fr); }
        .orive-card-total { grid-column:2; grid-row:2; padding-top:4px; }
      }
      @media (max-width:650px) {
        .orive-orders-page { padding:25px 15px 65px; }
        .orive-breadcrumb { margin-bottom:28px; }
        .orive-orders-hero { padding-bottom:27px; }
        .orive-orders-hero h1 { font-size:55px; }
        .orive-hero-mark { width:72px; height:72px; }
        .orive-hero-mark span { font-size:35px; }
        .orive-hero-mark small { font-size:6px; }
        .orive-order-stats { grid-template-columns:repeat(2,minmax(0,1fr)); margin:17px 0 47px; gap:8px; }
        .orive-stat-card { min-height:107px; padding:15px; }
        .orive-stat-card strong { font-size:27px; }
        .orive-stat-spend strong { font-size:24px; }
        .orive-list-heading { display:grid; align-items:stretch; gap:16px; }
        .orive-search { width:100%; box-sizing:border-box; }
        .orive-order-card { padding:18px 16px 0; }
        .orive-order-card-top { gap:10px; }
        .orive-order-card-top h3 { font-size:12px; }
        .orive-status { padding:7px 8px; font-size:8px; }
        .orive-order-card-middle { grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:15px 10px; }
        .orive-product-preview { grid-column:1 / -1; }
        .orive-card-meta, .orive-card-total { padding-left:12px; }
        .orive-card-total { grid-column:auto; grid-row:auto; }
        .orive-thumb { width:45px; height:53px; }
        .orive-product-summary strong { white-space:normal; }
        .orive-order-card-bottom { min-height:58px; }
        .orive-delivery-hint { flex-wrap:wrap; gap:5px; }
        .orive-delivery-hint small { margin-left:0; }
        .orive-help-strip { align-items:flex-start; flex-wrap:wrap; margin-top:32px; padding:16px; }
        .orive-help-strip > div:nth-child(2) { min-width:calc(100% - 58px); }
        .orive-help-strip a { margin-left:54px; }
      }
      @media (max-width:390px) {
        .orive-orders-hero h1 { font-size:47px; }
        .orive-hero-mark { display:none; }
        .orive-order-card-top { display:grid; }
        .orive-status { justify-self:start; }
        .orive-order-card-bottom { align-items:flex-start; flex-direction:column; padding:12px 0; }
        .orive-view-order { align-self:flex-end; }
      }
    `}</style>
  );
}
