"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

/* =========================================================
   TYPES
========================================================= */

type Product = {
  _id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  images?: string[];
  stock: number;
  status: "active" | "draft" | "out_of_stock";
  featured?: boolean;
  newArrival?: boolean;
  category?:
    | string
    | {
        _id: string;
        name: string;
        slug: string;
      }
    | null;
};

type Order = {
  _id: string;
  orderNumber?: string;
  status?: string;
  totalAmount?: number;
  total?: number;
  createdAt?: string;
  customer?: {
    name?: string;
    email?: string;
  };
  user?: {
    name?: string;
    email?: string;
  };
};

type Customer = {
  _id: string;
  name?: string;
  email?: string;
  createdAt?: string;
};

type Category = {
  _id: string;
  name: string;
  status?: string;
};

/* =========================================================
   HELPERS
========================================================= */

const formatPrice = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const formatDate = (date?: string) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCategoryName = (category: Product["category"]) => {
  if (!category) return "Uncategorized";

  if (typeof category === "string") {
    return category;
  }

  return category.name || "Uncategorized";
};

const getOrderCustomer = (order: Order) => {
  return (
    order.customer?.name ||
    order.user?.name ||
    order.customer?.email ||
    order.user?.email ||
    "Guest Customer"
  );
};

const getOrderTotal = (order: Order) => {
  return Number(order.totalAmount ?? order.total ?? 0);
};

const getOrderStatus = (status?: string) => {
  if (!status) return "Pending";

  return status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

/* =========================================================
   DASHBOARD
========================================================= */

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
          fetch("/api/admin/products", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }),

          fetch("/api/admin/orders", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }),

          fetch("/api/admin/customers", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }),

          fetch("/api/admin/categories", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        /* -----------------------------------------------
           PRODUCTS
        ----------------------------------------------- */

        const productsResult = results[0];

        if (productsResult.status === "fulfilled") {
          try {
            const data = await productsResult.value.json();

            if (productsResult.value.ok) {
              setProducts(data.products || []);
            }
          } catch {
            console.error("Unable to parse products response");
          }
        }

        /* -----------------------------------------------
           ORDERS
        ----------------------------------------------- */

        const ordersResult = results[1];

        if (ordersResult.status === "fulfilled") {
          try {
            const data = await ordersResult.value.json();

            if (ordersResult.value.ok) {
              setOrders(data.orders || []);
            }
          } catch {
            console.error("Unable to parse orders response");
          }
        }

        /* -----------------------------------------------
           CUSTOMERS
        ----------------------------------------------- */

        const customersResult = results[2];

        if (customersResult.status === "fulfilled") {
          try {
            const data = await customersResult.value.json();

            if (customersResult.value.ok) {
              setCustomers(data.customers || []);
            }
          } catch {
            console.error("Unable to parse customers response");
          }
        }

        /* -----------------------------------------------
           CATEGORIES
        ----------------------------------------------- */

        const categoriesResult = results[3];

        if (categoriesResult.status === "fulfilled") {
          try {
            const data = await categoriesResult.value.json();

            if (categoriesResult.value.ok) {
              setCategories(data.categories || []);
            }
          } catch {
            console.error("Unable to parse categories response");
          }
        }
      } catch (requestError) {
        console.error("Dashboard loading error:", requestError);

        setError(
          "Unable to load some dashboard information."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  /* =======================================================
     STATISTICS
  ======================================================= */

  const statistics = useMemo(() => {
    const totalProducts = products.length;

    const activeProducts = products.filter(
      (product) => product.status === "active"
    ).length;

    const lowStockProducts = products.filter(
      (product) =>
        product.stock > 0 &&
        product.stock <= 5
    );

    const outOfStockProducts = products.filter(
      (product) =>
        product.stock <= 0 ||
        product.status === "out_of_stock"
    );

    const totalRevenue = orders.reduce(
      (total, order) =>
        total + getOrderTotal(order),
      0
    );

    const pendingOrders = orders.filter((order) => {
      const status = String(order.status || "").toLowerCase();

      return (
        status === "pending" ||
        status === "placed" ||
        status === "confirmed"
      );
    }).length;

    const processingOrders = orders.filter((order) => {
      const status = String(order.status || "").toLowerCase();

      return (
        status === "processing" ||
        status === "packed"
      );
    }).length;

    const shippedOrders = orders.filter((order) => {
      const status = String(order.status || "").toLowerCase();

      return status === "shipped";
    }).length;

    const deliveredOrders = orders.filter((order) => {
      const status = String(order.status || "").toLowerCase();

      return status === "delivered";
    }).length;

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalRevenue,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
    };
  }, [products, orders]);

  /* =======================================================
     RECENT ORDERS
  ======================================================= */

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const first = new Date(
          a.createdAt || 0
        ).getTime();

        const second = new Date(
          b.createdAt || 0
        ).getTime();

        return second - first;
      })
      .slice(0, 6);
  }, [orders]);

  /* =======================================================
     LOW STOCK
  ======================================================= */

  const lowStockProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          product.stock <= 5
      )
      .sort(
        (a, b) =>
          a.stock - b.stock
      )
      .slice(0, 5);
  }, [products]);

  /* =======================================================
     MONTHLY REVENUE
     
     Uses available order data.
  ======================================================= */

  const revenueData = useMemo(() => {
    const now = new Date();

    const months = Array.from(
      { length: 6 },
      (_, index) => {
        const date = new Date(
          now.getFullYear(),
          now.getMonth() - (5 - index),
          1
        );

        return {
          month: date.toLocaleDateString(
            "en-IN",
            {
              month: "short",
            }
          ),
          monthIndex: date.getMonth(),
          year: date.getFullYear(),
          amount: 0,
        };
      }
    );

    orders.forEach((order) => {
      if (!order.createdAt) return;

      const date = new Date(order.createdAt);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const month = months.find(
        (item) =>
          item.monthIndex === date.getMonth() &&
          item.year === date.getFullYear()
      );

      if (month) {
        month.amount += getOrderTotal(order);
      }
    });

    const max = Math.max(
      ...months.map(
        (item) => item.amount
      ),
      1
    );

    return months.map((item) => ({
      ...item,
      height:
        item.amount === 0
          ? 4
          : Math.max(
              8,
              (item.amount / max) * 100
            ),
    }));
  }, [orders]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="dashboard-page">

        <div className="dashboard-loading">

          <div className="loading-mark">
            <span />
            <span />
            <span />
          </div>

          <p>
            Preparing your dashboard...
          </p>

        </div>

        <style jsx>{dashboardStyles}</style>
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="dashboard-header">

        <div>

          <div className="dashboard-eyebrow">
            HOUSE OF ORIVE / OVERVIEW
          </div>

          <h1>
            Dashboard
          </h1>

          <p>
            A clear view of your store,
            orders and performance.
          </p>

        </div>

        <div className="dashboard-date">

          <Icon
            icon="solar:calendar-linear"
            width={17}
            height={17}
          />

          <span>
            {new Date().toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }
            )}
          </span>

        </div>

      </section>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="dashboard-alert">

          <Icon
            icon="solar:danger-circle-linear"
            width={19}
            height={19}
          />

          <span>
            {error}
          </span>

        </div>
      )}


      {/* =================================================
          MAIN STATISTICS
      ================================================= */}

      <section className="stats-grid">

        {/* REVENUE */}

        <div className="stat-card stat-card-dark">

          <div className="stat-top">

            <span className="stat-label">
              TOTAL REVENUE
            </span>

            <div className="stat-icon stat-icon-light">
              <Icon
                icon="solar:wallet-money-linear"
                width={19}
                height={19}
              />
            </div>

          </div>

          <div className="stat-value">
            {formatPrice(
              statistics.totalRevenue
            )}
          </div>

          <div className="stat-bottom">
            From {orders.length} total orders
          </div>

        </div>


        {/* ORDERS */}

        <div className="stat-card">

          <div className="stat-top">

            <span className="stat-label">
              TOTAL ORDERS
            </span>

            <div className="stat-icon">
              <Icon
                icon="solar:bag-check-linear"
                width={19}
                height={19}
              />
            </div>

          </div>

          <div className="stat-value">
            {orders.length}
          </div>

          <div className="stat-bottom">
            {statistics.pendingOrders} pending orders
          </div>

        </div>


        {/* CUSTOMERS */}

        <div className="stat-card">

          <div className="stat-top">

            <span className="stat-label">
              CUSTOMERS
            </span>

            <div className="stat-icon">
              <Icon
                icon="solar:users-group-rounded-linear"
                width={19}
                height={19}
              />
            </div>

          </div>

          <div className="stat-value">
            {customers.length}
          </div>

          <div className="stat-bottom">
            Registered customers
          </div>

        </div>


        {/* PRODUCTS */}

        <div className="stat-card">

          <div className="stat-top">

            <span className="stat-label">
              PRODUCTS
            </span>

            <div className="stat-icon">
              <Icon
                icon="solar:box-linear"
                width={19}
                height={19}
              />
            </div>

          </div>

          <div className="stat-value">
            {statistics.totalProducts}
          </div>

          <div className="stat-bottom">
            {statistics.activeProducts} active products
          </div>

        </div>

      </section>


      {/* =================================================
          SECONDARY STATISTICS
      ================================================= */}

      <section className="mini-stats">

        <Link
          href="/admin/orders"
          className="mini-stat"
        >

          <div className="mini-stat-icon">
            <Icon
              icon="solar:clock-circle-linear"
              width={18}
              height={18}
            />
          </div>

          <div>

            <strong>
              {statistics.pendingOrders}
            </strong>

            <span>
              Pending orders
            </span>

          </div>

          <Icon
            icon="solar:arrow-right-linear"
            width={17}
            height={17}
            className="mini-arrow"
          />

        </Link>


        <Link
          href="/admin/orders"
          className="mini-stat"
        >

          <div className="mini-stat-icon">
            <Icon
              icon="solar:delivery-linear"
              width={18}
              height={18}
            />
          </div>

          <div>

            <strong>
              {statistics.shippedOrders}
            </strong>

            <span>
              Shipped orders
            </span>

          </div>

          <Icon
            icon="solar:arrow-right-linear"
            width={17}
            height={17}
            className="mini-arrow"
          />

        </Link>


        <Link
          href="/admin/products"
          className="mini-stat"
        >

          <div className="mini-stat-icon">
            <Icon
              icon="solar:danger-triangle-linear"
              width={18}
              height={18}
            />
          </div>

          <div>

            <strong>
              {statistics.lowStockProducts.length}
            </strong>

            <span>
              Low stock
            </span>

          </div>

          <Icon
            icon="solar:arrow-right-linear"
            width={17}
            height={17}
            className="mini-arrow"
          />

        </Link>


        <Link
          href="/admin/products"
          className="mini-stat"
        >

          <div className="mini-stat-icon">
            <Icon
              icon="solar:close-circle-linear"
              width={18}
              height={18}
            />
          </div>

          <div>

            <strong>
              {statistics.outOfStockProducts.length}
            </strong>

            <span>
              Out of stock
            </span>

          </div>

          <Icon
            icon="solar:arrow-right-linear"
            width={17}
            height={17}
            className="mini-arrow"
          />

        </Link>

      </section>


      {/* =================================================
          MAIN GRID
      ================================================= */}

      <section className="dashboard-main-grid">

        {/* =================================================
            REVENUE
        ================================================= */}

        <div className="dashboard-card revenue-card">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                PERFORMANCE
              </span>

              <h2>
                Revenue overview
              </h2>

            </div>

            <span className="card-period">
              Last 6 months
            </span>

          </div>


          <div className="revenue-chart">

            <div className="chart-values">

              <span>
                {formatPrice(
                  Math.max(
                    ...revenueData.map(
                      (item) => item.amount
                    ),
                    0
                  )
                )}
              </span>

            </div>


            <div className="chart-bars">

              {revenueData.map(
                (item, index) => (
                  <div
                    className="chart-column"
                    key={`${item.year}-${item.monthIndex}`}
                  >

                    <div className="chart-bar-area">

                      <div
                        className={
                          "chart-bar" +
                          (index ===
                          revenueData.length - 1
                            ? " chart-bar-current"
                            : "")
                        }
                        style={{
                          height:
                            `${item.height}%`,
                        }}
                        title={formatPrice(
                          item.amount
                        )}
                      />

                    </div>

                    <span className="chart-month">
                      {item.month}
                    </span>

                  </div>
                )
              )}

            </div>

          </div>

        </div>


        {/* =================================================
            ORDER STATUS
        ================================================= */}

        <div className="dashboard-card status-card">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                ORDERS
              </span>

              <h2>
                Order status
              </h2>

            </div>

            <Link
              href="/admin/orders"
              className="card-link"
            >
              View all
              <Icon
                icon="solar:arrow-right-linear"
                width={15}
                height={15}
              />
            </Link>

          </div>


          <div className="status-list">

            <div className="status-row">

              <div className="status-row-left">

                <span className="status-dot pending" />

                <span>
                  Pending
                </span>

              </div>

              <strong>
                {statistics.pendingOrders}
              </strong>

            </div>


            <div className="status-row">

              <div className="status-row-left">

                <span className="status-dot processing" />

                <span>
                  Processing
                </span>

              </div>

              <strong>
                {statistics.processingOrders}
              </strong>

            </div>


            <div className="status-row">

              <div className="status-row-left">

                <span className="status-dot shipped" />

                <span>
                  Shipped
                </span>

              </div>

              <strong>
                {statistics.shippedOrders}
              </strong>

            </div>


            <div className="status-row">

              <div className="status-row-left">

                <span className="status-dot delivered" />

                <span>
                  Delivered
                </span>

              </div>

              <strong>
                {statistics.deliveredOrders}
              </strong>

            </div>

          </div>


          <div className="order-total">

            <span>
              Total orders
            </span>

            <strong>
              {orders.length}
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          LOWER GRID
      ================================================= */}

      <section className="dashboard-lower-grid">

        {/* =================================================
            RECENT ORDERS
        ================================================= */}

        <div className="dashboard-card recent-orders-card">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                ACTIVITY
              </span>

              <h2>
                Recent orders
              </h2>

            </div>

            <Link
              href="/admin/orders"
              className="card-link"
            >
              View all
              <Icon
                icon="solar:arrow-right-linear"
                width={15}
                height={15}
              />
            </Link>

          </div>


          {recentOrders.length === 0 ? (

            <div className="empty-state">

              <div className="empty-state-icon">
                <Icon
                  icon="solar:bag-4-linear"
                  width={22}
                  height={22}
                />
              </div>

              <p>
                No orders yet.
              </p>

            </div>

          ) : (

            <div className="recent-orders-list">

              {recentOrders.map(
                (order) => {

                  const status =
                    String(
                      order.status || ""
                    ).toLowerCase();

                  return (
                    <div
                      className="recent-order"
                      key={order._id}
                    >

                      <div className="order-number">

                        <span className="order-icon">
                          <Icon
                            icon="solar:bag-linear"
                            width={17}
                            height={17}
                          />
                        </span>

                        <div>

                          <strong>
                            {order.orderNumber ||
                              `#${order._id.slice(-6).toUpperCase()}`}
                          </strong>

                          <span>
                            {getOrderCustomer(
                              order
                            )}
                          </span>

                        </div>

                      </div>


                      <div className="order-date">
                        {formatDate(
                          order.createdAt
                        )}
                      </div>


                      <div className="order-price">
                        {formatPrice(
                          getOrderTotal(order)
                        )}
                      </div>


                      <span
                        className={`order-status status-${status}`}
                      >
                        {getOrderStatus(
                          order.status
                        )}
                      </span>


                      <Link
                        href="/admin/orders"
                        className="order-view"
                        aria-label="View order"
                      >
                        <Icon
                          icon="solar:arrow-right-linear"
                          width={17}
                          height={17}
                        />
                      </Link>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </div>


        {/* =================================================
            LOW STOCK
        ================================================= */}

        <div className="dashboard-card stock-card">

          <div className="card-header">

            <div>

              <span className="card-eyebrow">
                INVENTORY
              </span>

              <h2>
                Low stock
              </h2>

            </div>

            <Link
              href="/admin/products"
              className="card-link"
            >
              Manage
              <Icon
                icon="solar:arrow-right-linear"
                width={15}
                height={15}
              />
            </Link>

          </div>


          {lowStockProducts.length === 0 ? (

            <div className="empty-state">

              <div className="empty-state-icon stock-ok">
                <Icon
                  icon="solar:check-circle-linear"
                  width={22}
                  height={22}
                />
              </div>

              <p>
                Inventory looks healthy.
              </p>

            </div>

          ) : (

            <div className="stock-list">

              {lowStockProducts.map(
                (product) => (

                  <Link
                    href={`/admin/products/${product._id}/edit`}
                    className="stock-item"
                    key={product._id}
                  >

                    <div className="stock-product">

                      <div className="stock-image">

                        {product.images?.[0] ? (

                          <img
                            src={
                              product.images[0]
                            }
                            alt={product.name}
                          />

                        ) : (

                          <Icon
                            icon="solar:gallery-linear"
                            width={20}
                            height={20}
                          />

                        )}

                      </div>


                      <div className="stock-info">

                        <strong>
                          {product.name}
                        </strong>

                        <span>
                          {getCategoryName(
                            product.category
                          )}
                        </span>

                      </div>

                    </div>


                    <div
                      className={
                        "stock-count" +
                        (product.stock === 0
                          ? " stock-danger"
                          : "")
                      }
                    >
                      {product.stock === 0
                        ? "Out"
                        : `${product.stock} left`}
                    </div>

                  </Link>

                )
              )}

            </div>

          )}

        </div>

      </section>


      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <section className="quick-section">

        <div className="quick-heading">

          <div>

            <span className="card-eyebrow">
              SHORTCUTS
            </span>

            <h2>
              Quick actions
            </h2>

          </div>

        </div>


        <div className="quick-grid">

          <Link
            href="/admin/products/new"
            className="quick-action"
          >

            <span className="quick-action-icon">
              <Icon
                icon="solar:add-circle-linear"
                width={23}
                height={23}
              />
            </span>

            <span className="quick-action-content">

              <strong>
                Add product
              </strong>

              <small>
                Create a new catalog item
              </small>

            </span>

            <Icon
              icon="solar:arrow-right-up-linear"
              width={18}
              height={18}
              className="quick-action-arrow"
            />

          </Link>


          <Link
            href="/admin/categories"
            className="quick-action"
          >

            <span className="quick-action-icon">
              <Icon
                icon="solar:widget-5-linear"
                width={23}
                height={23}
              />
            </span>

            <span className="quick-action-content">

              <strong>
                Categories
              </strong>

              <small>
                Organize your collection
              </small>

            </span>

            <Icon
              icon="solar:arrow-right-up-linear"
              width={18}
              height={18}
              className="quick-action-arrow"
            />

          </Link>


          <Link
            href="/admin/orders"
            className="quick-action"
          >

            <span className="quick-action-icon">
              <Icon
                icon="solar:bag-check-linear"
                width={23}
                height={23}
              />
            </span>

            <span className="quick-action-content">

              <strong>
                Manage orders
              </strong>

              <small>
                Review and update orders
              </small>

            </span>

            <Icon
              icon="solar:arrow-right-up-linear"
              width={18}
              height={18}
              className="quick-action-arrow"
            />

          </Link>


          <Link
            href="/admin/customers"
            className="quick-action"
          >

            <span className="quick-action-icon">
              <Icon
                icon="solar:users-group-rounded-linear"
                width={23}
                height={23}
              />
            </span>

            <span className="quick-action-content">

              <strong>
                Customers
              </strong>

              <small>
                View your customer base
              </small>

            </span>

            <Icon
              icon="solar:arrow-right-up-linear"
              width={18}
              height={18}
              className="quick-action-arrow"
            />

          </Link>

        </div>

      </section>


      {/* =================================================
          FOOTER NOTE
      ================================================= */}

      <div className="dashboard-footer">

        <span>
          HOUSE OF ORIVE
        </span>

        <span>
          ADMINISTRATION
        </span>

      </div>


      <style jsx>{dashboardStyles}</style>

    </div>
  );
}


/* =========================================================
   STYLES
========================================================= */

const dashboardStyles = `

  /* =======================================================
     PAGE
  ======================================================= */

  .dashboard-page {
    width: 100%;
    max-width: 1500px;
    margin: 0 auto;
    padding: 4px 0 50px;
    box-sizing: border-box;
    color: #111111;
  }


  /* =======================================================
     HEADER
  ======================================================= */

  .dashboard-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 30px;
    margin-bottom: 30px;
  }


  .dashboard-eyebrow {
    margin-bottom: 9px;
    color: #999999;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.2em;
    line-height: 1;
  }


  .dashboard-header h1 {
    margin: 0;
    color: #111111;
    font-family:
      var(--font-bodoni),
      "Bodoni Moda",
      Didot,
      serif;
    font-size: 42px;
    font-weight: 500;
    line-height: 0.95;
    letter-spacing: -0.035em;
  }


  .dashboard-header p {
    margin: 10px 0 0;
    color: #777777;
    font-family:
      var(--font-dm-sans),
      Arial,
      sans-serif;
    font-size: 12px;
    line-height: 1.5;
  }


  .dashboard-date {
    min-height: 38px;
    padding: 0 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    border: 1px solid #e6e6e6;
    background: #ffffff;
    color: #666666;
    font-size: 10px;
    white-space: nowrap;
  }


  /* =======================================================
     ALERT
  ======================================================= */

  .dashboard-alert {
    min-height: 48px;
    margin-bottom: 20px;
    padding: 12px 15px;
    display: flex;
    align-items: center;
    gap: 10px;
    box-sizing: border-box;
    border: 1px solid #ead3d3;
    background: #fff7f7;
    color: #a33a3a;
    font-size: 12px;
  }


  /* =======================================================
     STATS
  ======================================================= */

  .stats-grid {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 12px;
  }


  .stat-card {
    min-height: 164px;
    padding: 20px;
    box-sizing: border-box;
    border: 1px solid #e7e7e7;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }


  .stat-card-dark {
    border-color: #111111;
    background: #111111;
    color: #ffffff;
  }


  .stat-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }


  .stat-label {
    color: #999999;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.15em;
  }


  .stat-card-dark .stat-label {
    color: #777777;
  }


  .stat-icon {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e7e7e7;
    background: #fafafa;
    color: #222222;
  }


  .stat-icon-light {
    border-color: #333333;
    background: #222222;
    color: #ffffff;
  }


  .stat-value {
    margin-top: 14px;
    color: #111111;
    font-family:
      var(--font-bodoni),
      "Bodoni Moda",
      Didot,
      serif;
    font-size: 31px;
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.025em;
  }


  .stat-card-dark .stat-value {
    color: #ffffff;
  }


  .stat-bottom {
    margin-top: 10px;
    color: #999999;
    font-size: 10px;
  }


  .stat-card-dark .stat-bottom {
    color: #777777;
  }


  /* =======================================================
     MINI STATS
  ======================================================= */

  .mini-stats {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 30px;
  }


  .mini-stat {
    min-height: 72px;
    padding: 13px 14px;
    display: flex;
    align-items: center;
    gap: 11px;
    box-sizing: border-box;
    border: 1px solid #e8e8e8;
    background: #ffffff;
    color: #111111;
    text-decoration: none;
    transition:
      border-color 0.2s ease,
      transform 0.2s ease;
  }


  .mini-stat:hover {
    border-color: #bbbbbb;
    transform: translateY(-1px);
  }


  .mini-stat-icon {
    width: 35px;
    height: 35px;
    min-width: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    color: #333333;
  }


  .mini-stat > div:nth-child(2) {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }


  .mini-stat strong {
    color: #222222;
    font-size: 15px;
    font-weight: 600;
  }


  .mini-stat span {
    color: #999999;
    font-size: 9px;
  }


  .mini-arrow {
    color: #aaaaaa;
  }


  /* =======================================================
     CARDS
  ======================================================= */

  .dashboard-main-grid {
    display: grid;
    grid-template-columns:
      minmax(0, 1.7fr)
      minmax(300px, 0.9fr);
    gap: 12px;
    margin-bottom: 12px;
  }


  .dashboard-card {
    min-width: 0;
    border: 1px solid #e7e7e7;
    background: #ffffff;
  }


  .revenue-card {
    min-height: 370px;
  }


  .card-header {
    padding: 21px 22px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    border-bottom: 1px solid #eeeeee;
  }


  .card-eyebrow {
    display: block;
    margin-bottom: 7px;
    color: #a0a0a0;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.18em;
  }


  .card-header h2 {
    margin: 0;
    color: #222222;
    font-family:
      var(--font-bodoni),
      "Bodoni Moda",
      Didot,
      serif;
    font-size: 23px;
    font-weight: 500;
    line-height: 1;
    letter-spacing: -0.02em;
  }


  .card-period {
    color: #aaaaaa;
    font-size: 9px;
    white-space: nowrap;
  }


  .card-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: #555555;
    font-size: 9px;
    text-decoration: none;
    white-space: nowrap;
  }


  .card-link:hover {
    color: #111111;
  }


  /* =======================================================
     REVENUE CHART
  ======================================================= */

  .revenue-chart {
    height: 270px;
    padding: 22px 25px 18px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }


  .chart-values {
    height: 20px;
    display: flex;
    justify-content: flex-end;
    color: #aaaaaa;
    font-size: 9px;
  }


  .chart-bars {
    flex: 1;
    display: grid;
    grid-template-columns:
      repeat(6, minmax(0, 1fr));
    gap: 14px;
    align-items: stretch;
  }


  .chart-column {
    min-width: 0;
    display: flex;
    flex-direction: column;
  }


  .chart-bar-area {
    position: relative;
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    border-bottom: 1px solid #eeeeee;
    background:
      linear-gradient(
        to bottom,
        transparent 24.5%,
        #f3f3f3 25%,
        transparent 25.5%,
        transparent 49.5%,
        #f3f3f3 50%,
        transparent 50.5%,
        transparent 74.5%,
        #f3f3f3 75%,
        transparent 75.5%
      );
  }


  .chart-bar {
    width: 46%;
    min-height: 4px;
    background: #d5d5d5;
    transition:
      height 0.4s ease,
      background 0.2s ease;
  }


  .chart-bar-current {
    background: #111111;
  }


  .chart-column:hover .chart-bar {
    background: #777777;
  }


  .chart-column:hover .chart-bar-current {
    background: #111111;
  }


  .chart-month {
    margin-top: 10px;
    color: #999999;
    text-align: center;
    font-size: 9px;
  }


  /* =======================================================
     ORDER STATUS
  ======================================================= */

  .status-card {
    min-height: 370px;
  }


  .status-list {
    padding: 13px 22px;
  }


  .status-row {
    min-height: 55px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #f0f0f0;
  }


  .status-row:last-child {
    border-bottom: none;
  }


  .status-row-left {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #666666;
    font-size: 11px;
  }


  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #aaaaaa;
  }


  .status-dot.pending {
    background: #b38a42;
  }


  .status-dot.processing {
    background: #777777;
  }


  .status-dot.shipped {
    background: #555555;
  }


  .status-dot.delivered {
    background: #333333;
  }


  .status-row strong {
    color: #222222;
    font-size: 12px;
    font-weight: 600;
  }


  .order-total {
    margin: 0 22px;
    padding: 16px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #eeeeee;
    color: #999999;
    font-size: 10px;
  }


  .order-total strong {
    color: #222222;
    font-size: 13px;
  }


  /* =======================================================
     LOWER GRID
  ======================================================= */

  .dashboard-lower-grid {
    display: grid;
    grid-template-columns:
      minmax(0, 1.45fr)
      minmax(300px, 0.9fr);
    gap: 12px;
    margin-bottom: 30px;
  }


  /* =======================================================
     RECENT ORDERS
  ======================================================= */

  .recent-orders-list {
    width: 100%;
  }


  .recent-order {
    min-height: 70px;
    padding: 10px 20px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns:
      minmax(190px, 1.6fr)
      90px
      90px
      105px
      28px;
    align-items: center;
    gap: 12px;
    border-bottom: 1px solid #eeeeee;
  }


  .recent-order:last-child {
    border-bottom: none;
  }


  .order-number {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }


  .order-icon {
    width: 35px;
    height: 35px;
    min-width: 35px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f6f6f6;
    color: #555555;
  }


  .order-number > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }


  .order-number strong {
    color: #222222;
    font-size: 11px;
    font-weight: 600;
  }


  .order-number span {
    overflow: hidden;
    color: #999999;
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }


  .order-date {
    color: #999999;
    font-size: 9px;
  }


  .order-price {
    color: #222222;
    font-size: 10px;
    font-weight: 600;
  }


  .order-status {
    min-height: 23px;
    padding: 0 7px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    font-size: 8px;
    font-weight: 600;
    white-space: nowrap;
  }


  .order-status.status-pending,
  .order-status.status-placed,
  .order-status.status-confirmed {
    background: #fff7e9;
    color: #9b702c;
  }


  .order-status.status-processing,
  .order-status.status-packed {
    background: #f2f2f2;
    color: #666666;
  }


  .order-status.status-shipped {
    background: #eeeeee;
    color: #444444;
  }


  .order-status.status-delivered {
    background: #edf5ef;
    color: #397144;
  }


  .order-view {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999999;
    text-decoration: none;
  }


  .order-view:hover {
    color: #111111;
  }


  /* =======================================================
     STOCK
  ======================================================= */

  .stock-list {
    padding: 5px 20px 8px;
  }


  .stock-item {
    min-height: 65px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    border-bottom: 1px solid #eeeeee;
    text-decoration: none;
  }


  .stock-item:last-child {
    border-bottom: none;
  }


  .stock-product {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }


  .stock-image {
    width: 42px;
    height: 48px;
    min-width: 42px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    color: #aaaaaa;
  }


  .stock-image img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }


  .stock-info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }


  .stock-info strong {
    overflow: hidden;
    color: #333333;
    font-size: 10px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }


  .stock-info span {
    color: #aaaaaa;
    font-size: 8px;
  }


  .stock-count {
    flex-shrink: 0;
    color: #9b702c;
    font-size: 9px;
    font-weight: 600;
  }


  .stock-danger {
    color: #a33a3a;
  }


  /* =======================================================
     EMPTY
  ======================================================= */

  .empty-state {
    min-height: 210px;
    padding: 25px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999999;
    text-align: center;
  }


  .empty-state-icon {
    width: 50px;
    height: 50px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    color: #999999;
  }


  .empty-state-icon.stock-ok {
    background: #edf5ef;
    color: #397144;
  }


  .empty-state p {
    margin: 0;
    font-size: 10px;
  }


  /* =======================================================
     QUICK ACTIONS
  ======================================================= */

  .quick-section {
    margin-bottom: 35px;
  }


  .quick-heading {
    margin-bottom: 13px;
  }


  .quick-heading h2 {
    margin: 0;
    color: #222222;
    font-family:
      var(--font-bodoni),
      "Bodoni Moda",
      Didot,
      serif;
    font-size: 23px;
    font-weight: 500;
    line-height: 1;
  }


  .quick-grid {
    display: grid;
    grid-template-columns:
      repeat(4, minmax(0, 1fr));
    gap: 10px;
  }


  .quick-action {
    min-height: 100px;
    padding: 17px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;
    border: 1px solid #e7e7e7;
    background: #ffffff;
    color: #111111;
    text-decoration: none;
    transition:
      border-color 0.2s ease,
      transform 0.2s ease;
  }


  .quick-action:hover {
    border-color: #999999;
    transform: translateY(-2px);
  }


  .quick-action-icon {
    width: 42px;
    height: 42px;
    min-width: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #111111;
    color: #ffffff;
  }


  .quick-action-content {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }


  .quick-action-content strong {
    color: #222222;
    font-size: 11px;
    font-weight: 600;
  }


  .quick-action-content small {
    color: #999999;
    font-size: 8px;
    line-height: 1.4;
  }


  .quick-action-arrow {
    color: #999999;
  }


  /* =======================================================
     FOOTER
  ======================================================= */

  .dashboard-footer {
    padding-top: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #eeeeee;
    color: #aaaaaa;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.16em;
  }


  /* =======================================================
     LOADING
  ======================================================= */

  .dashboard-loading {
    min-height: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }


  .loading-mark {
    display: flex;
    align-items: center;
    gap: 5px;
  }


  .loading-mark span {
    width: 5px;
    height: 5px;
    display: block;
    border-radius: 50%;
    background: #111111;
    animation: dashboardPulse 1s infinite ease-in-out;
  }


  .loading-mark span:nth-child(2) {
    animation-delay: 0.15s;
  }


  .loading-mark span:nth-child(3) {
    animation-delay: 0.3s;
  }


  .dashboard-loading p {
    margin: 14px 0 0;
    color: #999999;
    font-size: 10px;
  }


  @keyframes dashboardPulse {

    0%,
    100% {
      opacity: 0.25;
      transform: translateY(0);
    }

    50% {
      opacity: 1;
      transform: translateY(-3px);
    }

  }


  /* =======================================================
     TABLET
  ======================================================= */

  @media (max-width: 1100px) {

    .stats-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }


    .mini-stats {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }


    .dashboard-main-grid,
    .dashboard-lower-grid {
      grid-template-columns:
        1fr;
    }


    .quick-grid {
      grid-template-columns:
        repeat(2, minmax(0, 1fr));
    }

  }


  /* =======================================================
     MOBILE
  ======================================================= */

  @media (max-width: 700px) {

    .dashboard-page {
      padding-bottom: 30px;
    }


    .dashboard-header {
      align-items: flex-start;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 22px;
    }


    .dashboard-header h1 {
      font-size: 34px;
    }


    .dashboard-date {
      width: 100%;
    }


    .stats-grid {
      grid-template-columns:
        1fr 1fr;
      gap: 8px;
    }


    .stat-card {
      min-height: 145px;
      padding: 15px;
    }


    .stat-value {
      font-size: 24px;
    }


    .stat-icon {
      width: 32px;
      height: 32px;
    }


    .mini-stats {
      grid-template-columns:
        1fr 1fr;
      gap: 8px;
      margin-bottom: 20px;
    }


    .mini-stat {
      min-height: 65px;
      padding: 10px;
    }


    .mini-stat-icon {
      width: 31px;
      height: 31px;
      min-width: 31px;
    }


    .dashboard-card {
      width: 100%;
    }


    .card-header {
      padding: 17px;
    }


    .card-header h2 {
      font-size: 20px;
    }


    .revenue-chart {
      height: 240px;
      padding: 18px 15px 15px;
    }


    .chart-bars {
      gap: 8px;
    }


    .chart-bar {
      width: 60%;
    }


    .recent-order {
      grid-template-columns:
        minmax(0, 1fr)
        auto
        28px;
      gap: 8px;
      padding: 12px 15px;
    }


    .order-date,
    .order-price {
      display: none;
    }


    .order-status {
      display: none;
    }


    .quick-grid {
      grid-template-columns:
        1fr;
      gap: 8px;
    }


    .quick-action {
      min-height: 82px;
    }

  }


  /* =======================================================
     SMALL MOBILE
  ======================================================= */

  @media (max-width: 420px) {

    .stats-grid {
      grid-template-columns:
        1fr;
    }


    .mini-stats {
      grid-template-columns:
        1fr;
    }


    .stat-card {
      min-height: 135px;
    }


    .dashboard-header h1 {
      font-size: 31px;
    }


    .dashboard-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

  }

`;