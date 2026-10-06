"use client";

import { useEffect, useMemo, useState } from "react";

import { Icon } from "@iconify/react";

import Link from "next/link";

type Product = {

  _id: string;

  name: string;

  slug: string;

  description: string;

  category:

    | string

    | {

        _id: string;

        name: string;

        slug: string;

      };

  price: number;

  compareAtPrice?: number;

  images: string[];

  sizes: string[];

  colors: string[];

  sku: string;

  stock: number;

  lowStockThreshold: number;

  status: "active" | "draft" | "out_of_stock";

  featured: boolean;

  newArrival: boolean;

  createdAt: string;

  updatedAt: string;

};

export default function AdminProductsPage() {

  const [products, setProducts] = useState<Product[]>(

    []

  );

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =

    useState("all");

  const [inventoryFilter, setInventoryFilter] =

    useState("all");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deleteError, setDeleteError] =

    useState("");

  const [deletingId, setDeletingId] =

    useState<string | null>(null);

  const [stockUpdatingId, setStockUpdatingId] =

    useState<string | null>(null);

  const loadProducts = async () => {

    try {

      setLoading(true);

      setError("");

      const response = await fetch(

        "/api/admin/products",

        {

          method: "GET",

          credentials: "include",

          cache: "no-store",

        }

      );

      const data = await response.json();

      if (!response.ok) {

        setError(

          data.message ||

            "Unable to load products."

        );

        return;

      }

      setProducts(data.products || []);

    } catch (requestError) {

      console.error(

        "Load products error:",

        requestError

      );

      setError(

        "Something went wrong while loading products."

      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadProducts();

  }, []);

const getCategoryId = (product: Product) => {
  if (typeof product.category === "string") {
    return product.category;
  }

  if (
    product.category &&
    typeof product.category === "object" &&
    typeof product.category._id === "string"
  ) {
    return product.category._id;
  }

  return "";
};

const getCategoryName = (product: Product) => {
  if (typeof product.category === "string") {
    return product.category || "Uncategorized";
  }

  if (
    product.category &&
    typeof product.category === "object" &&
    typeof product.category.name === "string"
  ) {
    return product.category.name || "Uncategorized";
  }

  return "Uncategorized";
};

const getSafeErrorMessage = (
  value: unknown,
  fallback: string
) => {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (
    value &&
    typeof value === "object" &&
    "message" in value &&
    typeof (value as { message?: unknown }).message === "string"
  ) {
    return (value as { message: string }).message;
  }

  return fallback;
};

const normalizeProduct = (product: Product): Product => {
  if (
    product.category &&
    typeof product.category === "object"
  ) {
    return {
      ...product,
      category: {
        _id:
          typeof product.category._id === "string"
            ? product.category._id
            : "",
        name:
          typeof product.category.name === "string"
            ? product.category.name
            : "Uncategorized",
        slug:
          typeof product.category.slug === "string"
            ? product.category.slug
            : "",
      },
    };
  }

  return {
    ...product,
    category:
      typeof product.category === "string"
        ? product.category
        : "",
  };
};

const getInventoryStatus = (product: Product) => {

    const threshold = product.lowStockThreshold ?? 5;

    if (product.stock <= 0) {

      return {

        label: "Out of Stock",

        className: "inventory-out",

      };

    }

    if (product.stock <= threshold) {

      return {

        label: "Low Stock",

        className: "inventory-low",

      };

    }

    return {

      label: "In Stock",

      className: "inventory-good",

    };

  };

  const filteredProducts = useMemo(() => {

    const searchValue = search

      .trim()

      .toLowerCase();

    return products.filter((product) => {

      const matchesSearch =

        !searchValue ||

        product.name

          .toLowerCase()

          .includes(searchValue) ||

        product.sku

          .toLowerCase()

          .includes(searchValue) ||

        getCategoryName(product)

            .toLowerCase()

            .includes(searchValue);

      const matchesStatus =

        statusFilter === "all" ||

        product.status === statusFilter;

      const inventoryStatus = getInventoryStatus(product);

      const matchesInventory =

        inventoryFilter === "all" ||

        (inventoryFilter === "in_stock" &&

          inventoryStatus.label === "In Stock") ||

        (inventoryFilter === "low_stock" &&

          inventoryStatus.label === "Low Stock") ||

        (inventoryFilter === "out_of_stock" &&

          inventoryStatus.label === "Out of Stock");

      return (

        matchesSearch &&

        matchesStatus &&

        matchesInventory

      );

    });

  }, [products, search, statusFilter, inventoryFilter]);

  const inventorySummary = useMemo(() => {

    let inStock = 0;

    let lowStock = 0;

    let outOfStock = 0;

    products.forEach((product) => {

      const threshold = product.lowStockThreshold ?? 5;

      if (product.stock <= 0) {

        outOfStock++;

      } else if (product.stock <= threshold) {

        lowStock++;

      } else {

        inStock++;

      }

    });

    return {

      total: products.length,

      inStock,

      lowStock,

      outOfStock,

    };

  }, [products]);

  const formatPrice = (price: number) => {

    return new Intl.NumberFormat("en-IN", {

      style: "currency",

      currency: "INR",

      maximumFractionDigits: 0,

    }).format(price);

  };

  const getStatusLabel = (

    status: Product["status"]

  ) => {

    if (status === "active") {

      return "Active";

    }

    if (status === "out_of_stock") {

      return "Out of Stock";

    }

    return "Draft";

  };

const handleDelete = async (

    product: Product

  ) => {

    const confirmed = window.confirm(

      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`

    );

    if (!confirmed) {

      return;

    }

    try {

      setDeletingId(product._id);

      setDeleteError("");

      const response = await fetch(

        `/api/admin/products/${product._id}`,

        {

          method: "DELETE",

          credentials: "include",

        }

      );

      const data = await response.json();

      if (!response.ok) {

        setDeleteError(

          data.message ||

            "Unable to delete product."

        );

        return;

      }

      setProducts((previousProducts) =>

        previousProducts.filter(

          (item) =>

            item._id !== product._id

        )

      );

    } catch (requestError) {

      console.error(

        "Delete product error:",

        requestError

      );

      setDeleteError(

        "Something went wrong while deleting the product."

      );

    } finally {

      setDeletingId(null);

    }

  };

  const handleStockAdjustment = async (

    product: Product,

    direction: "increase" | "decrease"

  ) => {

    if (stockUpdatingId === product._id) {

      return;

    }

    const nextStock =

      direction === "increase"

        ? product.stock + 1

        : Math.max(0, product.stock - 1);

    if (nextStock === product.stock) {

      return;

    }

    try {

      setStockUpdatingId(product._id);

      setError("");

      const response = await fetch(

        `/api/admin/products/${product._id}`,

        {

          method: "PUT",

          credentials: "include",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify({

            name: product.name,

            description: product.description,

            category: getCategoryId(product),

              price: product.price,

            compareAtPrice: product.compareAtPrice,

            images: product.images,

            sizes: product.sizes,

            colors: product.colors,

            sku: product.sku,

            stock: nextStock,

            lowStockThreshold: product.lowStockThreshold ?? 5,

            status: product.status,

            featured: product.featured,

            newArrival: product.newArrival,

          }),

        }

      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(

          data.message || "Unable to update stock."

        );

      }

      setProducts((previousProducts) =>

        previousProducts.map((item) =>

          item._id === product._id

            ? {

                ...item,

                stock:

                  typeof data.product?.stock === "number"

                    ? data.product.stock

                    : nextStock,

              }

            : item

        )

      );

    } catch (requestError) {

      console.error(

        "Stock adjustment error:",

        requestError

      );

      setError(

        requestError instanceof Error

          ? requestError.message

          : "Something went wrong while updating stock."

      );

    } finally {

      setStockUpdatingId(null);

    }

  };

  const clearFilters = () => {

    setSearch("");

    setStatusFilter("all");

    setInventoryFilter("all");

  };

  return (

    <div className="products-page">

      {/* HEADER */}

      <div className="products-header">

        <div>

          <div className="products-eyebrow">

            CATALOG

          </div>

          <h1>Products</h1>

          <p>

            Manage your store products,

            inventory and visibility.

          </p>

        </div>

        <Link

          href="/admin/products/new"

          className="add-product-button"

        >

          <Icon

            icon="solar:add-circle-linear"

            width={19}

            height={19}

          />

          <span>Add Product</span>

        </Link>

      </div>

      {/* DELETE ERROR */}

      {deleteError && (

        <div className="products-alert">

          <Icon

            icon="solar:danger-circle-linear"

            width={19}

            height={19}

          />

          <span>{deleteError}</span>

          <button

            type="button"

            onClick={() =>

              setDeleteError("")

            }

            aria-label="Close error"

          >

            <Icon

              icon="solar:close-circle-linear"

              width={18}

              height={18}

            />

          </button>

        </div>

      )}

      {/* TOOLBAR */}

      <div className="products-toolbar">

        <div className="search-box">

          <Icon

            icon="solar:magnifer-linear"

            width={19}

            height={19}

          />

          <input

            type="text"

            placeholder="Search products, SKU or category..."

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

                icon="solar:close-circle-linear"

                width={18}

                height={18}

              />

            </button>

          )}

        </div>

        <div className="filter-box">

          <Icon

            icon="solar:filter-linear"

            width={18}

            height={18}

          />

          <select

            value={statusFilter}

            onChange={(event) =>

              setStatusFilter(

                event.target.value

              )

            }

          >

            <option value="all">

              All Status

            </option>

            <option value="active">

              Active

            </option>

            <option value="draft">

              Draft

            </option>

            <option value="out_of_stock">

              Out of Stock

            </option>

          </select>

        </div>

        <div className="filter-box">

          <Icon

            icon="solar:box-linear"

            width={18}

            height={18}

          />

          <select

            value={inventoryFilter}

            onChange={(event) =>

              setInventoryFilter(event.target.value)

            }

          >

            <option value="all">

              All Inventory

            </option>

            <option value="in_stock">

              In Stock

            </option>

            <option value="low_stock">

              Low Stock

            </option>

            <option value="out_of_stock">

              Out of Stock

            </option>

          </select>

        </div>

      </div>

      {/* INVENTORY SUMMARY */}

      <div className="inventory-summary-grid">

        <div className="inventory-summary-card">

          <div className="inventory-summary-icon inventory-summary-icon-total">

            <Icon icon="solar:box-linear" width={20} height={20} />

          </div>

          <div className="inventory-summary-content">

            <span>Total Products</span>

            <strong>{inventorySummary.total}</strong>

          </div>

        </div>

        <div className="inventory-summary-card">

          <div className="inventory-summary-icon inventory-summary-icon-good">

            <Icon icon="solar:check-circle-linear" width={20} height={20} />

          </div>

          <div className="inventory-summary-content">

            <span>In Stock</span>

            <strong>{inventorySummary.inStock}</strong>

          </div>

        </div>

        <div className="inventory-summary-card">

          <div className="inventory-summary-icon inventory-summary-icon-low">

            <Icon icon="solar:danger-circle-linear" width={20} height={20} />

          </div>

          <div className="inventory-summary-content">

            <span>Low Stock</span>

            <strong>{inventorySummary.lowStock}</strong>

          </div>

        </div>

        <div className="inventory-summary-card">

          <div className="inventory-summary-icon inventory-summary-icon-out">

            <Icon icon="solar:close-circle-linear" width={20} height={20} />

          </div>

          <div className="inventory-summary-content">

            <span>Out of Stock</span>

            <strong>{inventorySummary.outOfStock}</strong>

          </div>

        </div>

      </div>

      {/* SUMMARY */}

      <div className="products-summary">

        <div>

          <strong>

            {filteredProducts.length}

          </strong>

          <span>

            {filteredProducts.length === 1

              ? " product"

              : " products"}

          </span>

          {(search ||

            statusFilter !== "all") && (

            <span className="filtered-label">

              filtered

            </span>

          )}

        </div>

        {(search ||

          statusFilter !== "all") && (

          <button

            type="button"

            onClick={clearFilters}

            className="clear-filters"

          >

            Clear filters

          </button>

        )}

      </div>

      {/* LOADING */}

      {loading && (

        <div className="products-loading">

          <Icon

            icon="solar:refresh-linear"

            width={28}

            height={28}

          />

          <p>Loading products...</p>

        </div>

      )}

      {/* ERROR */}

      {!loading && error && (

        <div className="products-error">

          <div className="error-icon">

            <Icon

              icon="solar:danger-circle-linear"

              width={30}

              height={30}

            />

          </div>

          <h2>

            Unable to load products

          </h2>

          <p>{error}</p>

          <button

            type="button"

            onClick={loadProducts}

            className="retry-button"

          >

            <Icon

              icon="solar:refresh-linear"

              width={17}

              height={17}

            />

            Try Again

          </button>

        </div>

      )}

      {/* EMPTY */}

      {!loading &&

        !error &&

        filteredProducts.length ===

          0 && (

          <div className="products-empty">

            <div className="empty-icon">

              <Icon

                icon="solar:box-linear"

                width={34}

                height={34}

              />

            </div>

            <h2>

              {products.length === 0

                ? "No products yet"

                : "No products found"}

            </h2>

            <p>

              {products.length === 0

                ? "Start building your catalog by adding your first product."

                : "Try changing your search or filter."}

            </p>

            {products.length === 0 ? (

              <Link

                href="/admin/products/new"

                className="empty-add-button"

              >

                <Icon

                  icon="solar:add-circle-linear"

                  width={18}

                  height={18}

                />

                Add Your First Product

              </Link>

            ) : (

              <button

                type="button"

                onClick={clearFilters}

                className="empty-add-button"

              >

                Clear Filters

              </button>

            )}

          </div>

        )}

      {/* PRODUCTS TABLE */}

      {!loading &&

        !error &&

        filteredProducts.length > 0 && (

          <div className="products-table-card">

            <div className="products-table-wrapper">

              <table className="products-table">

                <thead>

                  <tr>

                    <th>Product</th>

                    <th>Category</th>

                    <th>Price</th>

                    <th>Stock</th>

                    <th>Status</th>

                    <th>Features</th>

                    <th className="action-column">

                      Action

                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredProducts.map(

                    (product) => (

                      <tr key={product._id}>

                        <td>

                          <div className="product-cell">

                            <div className="product-image">

                              {product.images?.[0] ? (

                                <img

                                  src={

                                    product.images[0]

                                  }

                                  alt={

                                    product.name

                                  }

                                />

                              ) : (

                                <Icon

                                  icon="solar:gallery-linear"

                                  width={24}

                                  height={24}

                                />

                              )}

                            </div>

                            <div className="product-info">

                              <strong>

                                {product.name}

                              </strong>

                              <span>

                                {product.sku}

                              </span>

                            </div>

                          </div>

                        </td>

                        <td>

                          <span className="category-text">

                            {getCategoryName(product)}

                          </span>

                        </td>

                        <td>

                          <div className="price-cell">

                            <strong>

                              {formatPrice(

                                product.price

                              )}

                            </strong>

                            {product.compareAtPrice &&

                              product.compareAtPrice >

                                product.price && (

                                <span>

                                  {formatPrice(

                                    product.compareAtPrice

                                  )}

                                </span>

                              )}

                          </div>

                        </td>

                        <td>

                          <div className="stock-cell">

                            <div className="stock-control">

                              <button

                                type="button"

                                className="stock-adjust-button"

                                onClick={() =>

                                  handleStockAdjustment(

                                    product,

                                    "decrease"

                                  )

                                }

                                disabled={

                                  stockUpdatingId === product._id ||

                                  product.stock <= 0

                                }

                                aria-label={`Decrease stock for ${product.name}`}

                              >

                                {stockUpdatingId === product._id ? (

                                  <Icon

                                    icon="solar:refresh-linear"

                                    width={13}

                                    height={13}

                                    className="stock-adjust-spin"

                                  />

                                ) : (

                                  <Icon

                                    icon="solar:minus-linear"

                                    width={13}

                                    height={13}

                                  />

                                )}

                              </button>

                              <strong className="stock-number">

                                {product.stock}

                              </strong>

                              <button

                                type="button"

                                className="stock-adjust-button"

                                onClick={() =>

                                  handleStockAdjustment(

                                    product,

                                    "increase"

                                  )

                                }

                                disabled={

                                  stockUpdatingId === product._id

                                }

                                aria-label={`Increase stock for ${product.name}`}

                              >

                                <Icon

                                  icon="solar:add-linear"

                                  width={13}

                                  height={13}

                                />

                              </button>

                            </div>

                            <span

                              className={`inventory-badge ${

                                getInventoryStatus(product).className

                              }`}

                            >

                              <span className="inventory-dot" />

                              {getInventoryStatus(product).label}

                            </span>

                          </div>

                        </td>

                        <td>

                          <span

                            className={`status-badge status-${product.status}`}

                          >

                            <span className="status-dot" />

                            {getStatusLabel(

                              product.status

                            )}

                          </span>

                        </td>

                        <td>

                          <div className="feature-list">

                            {product.featured && (

                              <span className="feature-badge">

                                Featured

                              </span>

                            )}

                            {product.newArrival && (

                              <span className="feature-badge">

                                New

                              </span>

                            )}

                            {!product.featured &&

                              !product.newArrival && (

                                <span className="no-feature">

                                  —

                                </span>

                              )}

                          </div>

                        </td>

                        <td>

                          <div className="action-buttons">

                            <Link

                              href={`/admin/products/${product._id}/edit`}

                              className="action-button edit-button"

                            >

                              <Icon

                                icon="solar:pen-linear"

                                width={17}

                                height={17}

                              />

                              <span>Edit</span>

                            </Link>

                            <button

                              type="button"

                              className="action-button delete-button"

                              disabled={

                                deletingId ===

                                product._id

                              }

                              onClick={() =>

                                handleDelete(

                                  product

                                )

                              }

                            >

                              {deletingId ===

                              product._id ? (

                                <Icon

                                  icon="solar:refresh-linear"

                                  width={17}

                                  height={17}

                                  className="delete-spin"

                                />

                              ) : (

                                <Icon

                                  icon="solar:trash-bin-trash-linear"

                                  width={17}

                                  height={17}

                                />

                              )}

                              <span>

                                {deletingId ===

                                product._id

                                  ? "Deleting..."

                                  : "Delete"}

                              </span>

                            </button>

                          </div>

                        </td>

                      </tr>

                    )

                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      <style jsx>{`

        .products-page {

          width: 100%;

          max-width: 1500px;

          margin: 0 auto;

        }

        .products-header {

          margin-bottom: 28px;

          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          gap: 20px;

        }

        .products-eyebrow {

          margin-bottom: 7px;

          color: #999999;

          font-size: 9px;

          font-weight: 700;

          letter-spacing: 0.18em;

        }

        .products-header h1 {

          margin: 0;

          color: #111111;

          font-size: 30px;

          font-weight: 600;

          letter-spacing: -0.03em;

        }

        .products-header p {

          margin: 8px 0 0;

          color: #777777;

          font-size: 13px;

        }

        .add-product-button {

          min-height: 44px;

          padding: 0 17px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          border: 1px solid #111111;

          border-radius: 9px;

          background: #111111;

          color: #ffffff;

          text-decoration: none;

          font-size: 12px;

          font-weight: 600;

          transition: background 0.2s ease;

        }

        .add-product-button:hover {

          background: #292929;

        }

        .products-alert {

          min-height: 48px;

          margin-bottom: 18px;

          padding: 12px 14px;

          display: flex;

          align-items: center;

          gap: 10px;

          box-sizing: border-box;

          border: 1px solid #f0d5d5;

          border-radius: 10px;

          background: #fff4f4;

          color: #a33a3a;

          font-size: 12px;

        }

        .products-alert span {

          flex: 1;

        }

        .products-alert button {

          padding: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border: none;

          background: transparent;

          color: inherit;

        }

        .products-toolbar {

          margin-bottom: 15px;

          display: flex;

          align-items: center;

          gap: 12px;

        }

        .search-box,

        .filter-box {

          height: 44px;

          box-sizing: border-box;

          display: flex;

          align-items: center;

          border: 1px solid #e3e3e3;

          border-radius: 9px;

          background: #ffffff;

          color: #888888;

        }

        .search-box {

          flex: 1;

          padding: 0 13px;

          gap: 9px;

        }

        .search-box input {

          width: 100%;

          height: 100%;

          padding: 0;

          border: none;

          outline: none;

          background: transparent;

          color: #222222;

          font-size: 12px;

        }

        .search-box input::placeholder {

          color: #aaaaaa;

        }

        .search-box button {

          padding: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border: none;

          background: transparent;

          color: #999999;

        }

        .filter-box {

          min-width: 180px;

          padding: 0 12px;

          gap: 8px;

        }

        .filter-box select {

          width: 100%;

          height: 100%;

          border: none;

          outline: none;

          background: transparent;

          color: #444444;

          font-size: 12px;

          cursor: pointer;

        }

        .inventory-summary-grid {

          margin-bottom: 18px;

          display: grid;

          grid-template-columns: repeat(4, minmax(0, 1fr));

          gap: 12px;

        }

        .inventory-summary-card {

          min-height: 86px;

          padding: 16px;

          box-sizing: border-box;

          display: flex;

          align-items: center;

          gap: 12px;

          border: 1px solid #e8e8e8;

          border-radius: 12px;

          background: #ffffff;

        }

        .inventory-summary-icon {

          width: 38px;

          height: 38px;

          min-width: 38px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 9px;

        }

        .inventory-summary-icon-total {

          background: #f5f5f5;

          color: #555555;

        }

        .inventory-summary-icon-good {

          background: #eff8f1;

          color: #397144;

        }

        .inventory-summary-icon-low {

          background: #fff8ed;

          color: #a36b22;

        }

        .inventory-summary-icon-out {

          background: #fff3f3;

          color: #a33a3a;

        }

        .inventory-summary-content {

          min-width: 0;

          display: flex;

          flex-direction: column;

          gap: 5px;

        }

        .inventory-summary-content span {

          color: #888888;

          font-size: 10px;

          font-weight: 500;

        }

        .inventory-summary-content strong {

          color: #222222;

          font-size: 21px;

          line-height: 1;

          font-weight: 600;

        }

        .products-summary {

          margin-bottom: 13px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          color: #888888;

          font-size: 11px;

        }

        .products-summary strong {

          color: #222222;

          font-size: 12px;

        }

        .filtered-label {

          margin-left: 5px;

          color: #aaaaaa;

        }

        .clear-filters {

          padding: 0;

          border: none;

          background: transparent;

          color: #555555;

          font-size: 11px;

          text-decoration: underline;

        }

        .products-table-card {

          overflow: hidden;

          border: 1px solid #e8e8e8;

          border-radius: 14px;

          background: #ffffff;

          box-shadow: 0 5px 20px

            rgba(0, 0, 0, 0.025);

        }

        .products-table-wrapper {

          width: 100%;

          overflow-x: auto;

        }

        .products-table {

          width: 100%;

          min-width: 1050px;

          border-collapse: collapse;

        }

        .products-table th {

          height: 48px;

          padding: 0 18px;

          border-bottom: 1px solid #eeeeee;

          background: #fafafa;

          color: #888888;

          text-align: left;

          font-size: 9px;

          font-weight: 700;

          letter-spacing: 0.08em;

          text-transform: uppercase;

          white-space: nowrap;

        }

        .products-table td {

          padding: 15px 18px;

          border-bottom: 1px solid #eeeeee;

          color: #333333;

          font-size: 12px;

          vertical-align: middle;

        }

        .products-table tbody tr:last-child td {

          border-bottom: none;

        }

        .products-table tbody tr:hover {

          background: #fcfcfc;

        }

        .product-cell {

          min-width: 250px;

          display: flex;

          align-items: center;

          gap: 12px;

        }

        .product-image {

          width: 52px;

          height: 52px;

          min-width: 52px;

          overflow: hidden;

          display: flex;

          align-items: center;

          justify-content: center;

          border: 1px solid #eeeeee;

          border-radius: 8px;

          background: #f7f7f7;

          color: #aaaaaa;

        }

        .product-image img {

          width: 100%;

          height: 100%;

          display: block;

          object-fit: cover;

        }

        .product-info {

          min-width: 0;

          display: flex;

          flex-direction: column;

          gap: 5px;

        }

        .product-info strong {

          max-width: 230px;

          overflow: hidden;

          color: #222222;

          font-size: 12px;

          font-weight: 600;

          text-overflow: ellipsis;

          white-space: nowrap;

        }

        .product-info span {

          color: #999999;

          font-size: 10px;

          letter-spacing: 0.04em;

        }

        .category-text {

          color: #555555;

          white-space: nowrap;

        }

        .price-cell {

          display: flex;

          flex-direction: column;

          gap: 3px;

        }

        .price-cell strong {

          color: #222222;

          font-size: 12px;

          font-weight: 600;

        }

        .price-cell span {

          color: #aaaaaa;

          font-size: 10px;

          text-decoration: line-through;

        }

        .stock-cell {

          display: flex;

          flex-direction: column;

          align-items: flex-start;

          gap: 6px;

        }

        .stock-control {

          display: inline-flex;

          align-items: center;

          gap: 7px;

          min-height: 30px;

        }

        .stock-adjust-button {

          width: 25px;

          height: 25px;

          padding: 0;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          border: 1px solid #dedede;

          border-radius: 6px;

          background: #ffffff;

          color: #444444;

          cursor: pointer;

          transition:

            background 0.2s ease,

            border-color 0.2s ease,

            color 0.2s ease,

            opacity 0.2s ease;

        }

        .stock-adjust-button:hover:not(:disabled) {

          background: #f5f5f5;

          border-color: #cfcfcf;

          color: #111111;

        }

        .stock-adjust-button:disabled {

          cursor: not-allowed;

          opacity: 0.45;

        }

        .stock-adjust-spin {

          animation: stockAdjustSpin 0.75s linear infinite;

        }

        .stock-number {

          min-width: 24px;

          color: #222222;

          font-size: 12px;

          font-weight: 600;

          text-align: center;

        }

        .inventory-badge {

          min-height: 23px;

          padding: 0 8px;

          display: inline-flex;

          align-items: center;

          gap: 5px;

          border-radius: 999px;

          font-size: 9px;

          font-weight: 600;

          white-space: nowrap;

        }

        .inventory-dot {

          width: 5px;

          height: 5px;

          border-radius: 50%;

          flex-shrink: 0;

        }

        .inventory-good {

          background: #eff8f1;

          color: #397144;

        }

        .inventory-good .inventory-dot {

          background: #397144;

        }

        .inventory-low {

          background: #fff8ed;

          color: #a36b22;

        }

        .inventory-low .inventory-dot {

          background: #a36b22;

        }

        .inventory-out {

          background: #fff3f3;

          color: #a33a3a;

        }

        .inventory-out .inventory-dot {

          background: #a33a3a;

        }

        .status-badge {

          min-height: 25px;

          padding: 0 9px;

          display: inline-flex;

          align-items: center;

          gap: 6px;

          border-radius: 999px;

          font-size: 10px;

          font-weight: 600;

          white-space: nowrap;

        }

        .status-dot {

          width: 5px;

          height: 5px;

          border-radius: 50%;

        }

        .status-active {

          background: #eff8f1;

          color: #397144;

        }

        .status-active .status-dot {

          background: #397144;

        }

        .status-draft {

          background: #f5f5f5;

          color: #777777;

        }

        .status-draft .status-dot {

          background: #999999;

        }

        .status-out_of_stock {

          background: #fff3f3;

          color: #a33a3a;

        }

        .status-out_of_stock .status-dot {

          background: #a33a3a;

        }

        .feature-list {

          display: flex;

          align-items: center;

          gap: 5px;

          flex-wrap: wrap;

        }

        .feature-badge {

          padding: 5px 7px;

          border: 1px solid #e3e3e3;

          border-radius: 5px;

          background: #fafafa;

          color: #555555;

          font-size: 9px;

          font-weight: 600;

        }

        .no-feature {

          color: #bbbbbb;

        }

        .action-column {

          text-align: right !important;

        }

        .action-buttons {

          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 7px;

        }

        .action-button {

          min-height: 34px;

          padding: 0 10px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 6px;

          border-radius: 7px;

          font-size: 10px;

          font-weight: 600;

          text-decoration: none;

          transition:

            background 0.2s ease,

            border-color 0.2s ease,

            opacity 0.2s ease;

        }

        .edit-button {

          border: 1px solid #dedede;

          background: #ffffff;

          color: #333333;

        }

        .edit-button:hover {

          background: #f5f5f5;

          border-color: #cfcfcf;

        }

        .delete-button {

          border: 1px solid #ead6d6;

          background: #fff8f8;

          color: #a33a3a;

        }

        .delete-button:hover {

          background: #fff0f0;

          border-color: #dfbcbc;

        }

        .delete-button:disabled {

          cursor: not-allowed;

          opacity: 0.55;

        }

        .delete-spin {

          animation: deleteSpin 0.8s linear infinite;

        }

        @keyframes stockAdjustSpin {

          from {

            transform: rotate(0deg);

          }

          to {

            transform: rotate(360deg);

          }

        }

        @keyframes deleteSpin {

          from {

            transform: rotate(0deg);

          }

          to {

            transform: rotate(360deg);

          }

        }

        .products-loading {

          min-height: 350px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          color: #888888;

        }

        .products-loading svg {

          color: #111111;

          animation: deleteSpin 0.9s linear infinite;

        }

        .products-loading p {

          margin: 12px 0 0;

          font-size: 12px;

        }

        .products-error,

        .products-empty {

          min-height: 380px;

          padding: 40px 20px;

          box-sizing: border-box;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          border: 1px solid #e8e8e8;

          border-radius: 14px;

          background: #ffffff;

        }

        .error-icon,

        .empty-icon {

          width: 64px;

          height: 64px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

        }

        .error-icon {

          background: #fff3f3;

          color: #a33a3a;

        }

        .empty-icon {

          background: #f5f5f5;

          color: #999999;

        }

        .products-error h2,

        .products-empty h2 {

          margin: 17px 0 7px;

          color: #222222;

          font-size: 18px;

          font-weight: 600;

        }

        .products-error p,

        .products-empty p {

          max-width: 430px;

          margin: 0;

          color: #888888;

          font-size: 12px;

          line-height: 1.6;

        }

        .retry-button,

        .empty-add-button {

          margin-top: 20px;

          min-height: 42px;

          padding: 0 16px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          border-radius: 8px;

          font-size: 11px;

          font-weight: 600;

        }

        .retry-button {

          border: 1px solid #111111;

          background: #111111;

          color: #ffffff;

        }

        .empty-add-button {

          border: 1px solid #111111;

          background: #111111;

          color: #ffffff;

          text-decoration: none;

        }

        @media (max-width: 1000px) {

          .inventory-summary-grid {

            grid-template-columns: repeat(2, minmax(0, 1fr));

          }

        }

        @media (max-width: 700px) {

          .products-header {

            align-items: flex-start;

            flex-direction: column;

          }

          .add-product-button {

            width: 100%;

          }

          .products-toolbar {

            flex-direction: column;

            align-items: stretch;

          }

          .search-box,

          .filter-box {

            width: 100%;

          }

          .filter-box {

            min-width: 0;

          }

          .products-summary {

            margin-bottom: 10px;

          }

        }

        @media (max-width: 480px) {

          .inventory-summary-grid {

            grid-template-columns: 1fr;

          }

          .inventory-summary-card {

            min-height: 76px;

          }

          .products-header h1 {

            font-size: 25px;

          }

          .products-header p {

            font-size: 12px;

          }

          .products-table {

            min-width: 980px;

          }

          .products-alert {

            font-size: 11px;

          }

        }

      `}</style>

    </div>

  );

}
