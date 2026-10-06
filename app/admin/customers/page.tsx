"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  role: "customer" | "admin";
  accountStatus: "active" | "disabled";
  createdAt: string;
  updatedAt: string;
  orderCount: number;
  totalSpent: number;
  latestOrderDate: string | null;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [pagination, setPagination] =
    useState<Pagination>({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = async (
    page = 1,
    searchValue = search
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", "20");

      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
      }

      const response = await fetch(
        `/api/admin/customers?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load customers."
        );
      }

      setCustomers(data.customers || []);

      setPagination(
        data.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (error) {
      console.error(
        "CUSTOMERS PAGE ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1, "");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  };

  const handleSearch = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const value = searchInput.trim();

    setSearch(value);

    fetchCustomers(1, value);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearch("");

    fetchCustomers(1, "");
  };

  const handlePrevious = () => {
    if (!pagination.hasPreviousPage) {
      return;
    }

    fetchCustomers(
      pagination.page - 1,
      search
    );
  };

  const handleNext = () => {
    if (!pagination.hasNextPage) {
      return;
    }

    fetchCustomers(
      pagination.page + 1,
      search
    );
  };

  const activeCustomers = customers.filter(
    (customer) =>
      customer.accountStatus !== "disabled"
  ).length;

  const disabledCustomers = customers.filter(
    (customer) =>
      customer.accountStatus === "disabled"
  ).length;

  return (
    <div className="customers-page">
      {/* HEADER */}

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

            <span>Customers</span>
          </div>

          <h1>Customers</h1>

          <p>
            Manage and view your registered
            customers.
          </p>
        </div>

        <div className="customer-count">
          <Icon
            icon="solar:users-group-rounded-bold"
            width="18"
          />

          <span>
            {pagination.total}{" "}
            {pagination.total === 1
              ? "Customer"
              : "Customers"}
          </span>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon">
            <Icon
              icon="solar:user-bold"
              width="21"
            />
          </div>

          <div>
            <span>Total Customers</span>

            <strong>
              {pagination.total}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <Icon
              icon="solar:user-check-bold"
              width="21"
            />
          </div>

          <div>
            <span>Active Shown</span>

            <strong>
              {activeCustomers}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <Icon
              icon="solar:cart-large-2-bold"
              width="21"
            />
          </div>

          <div>
            <span>Orders</span>

            <strong>
              {customers.reduce(
                (total, customer) =>
                  total +
                  customer.orderCount,
                0
              )}
            </strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon">
            <Icon
              icon="solar:wallet-money-bold"
              width="21"
            />
          </div>

          <div>
            <span>Total Spent</span>

            <strong>
              {formatCurrency(
                customers.reduce(
                  (total, customer) =>
                    total +
                    customer.totalSpent,
                  0
                )
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* SEARCH */}

      <div className="toolbar">
        <form
          className="search-form"
          onSubmit={handleSearch}
        >
          <Icon
            icon="solar:magnifer-linear"
            width="19"
          />

          <input
            type="text"
            placeholder="Search name, email or phone..."
            value={searchInput}
            onChange={(event) =>
              setSearchInput(
                event.target.value
              )
            }
          />

          {searchInput && (
            <button
              type="button"
              className="clear-search"
              onClick={clearSearch}
              aria-label="Clear search"
            >
              <Icon
                icon="solar:close-circle-bold"
                width="18"
              />
            </button>
          )}

          <button
            type="submit"
            className="search-button"
          >
            Search
          </button>
        </form>

        {search && (
          <div className="active-search">
            <span>Search:</span>

            <strong>{search}</strong>

            <button
              type="button"
              onClick={clearSearch}
            >
              <Icon
                icon="solar:close-circle-bold"
                width="16"
              />
            </button>
          </div>
        )}
      </div>

      {/* ERROR */}

      {error && (
        <div className="error-message">
          <Icon
            icon="solar:danger-circle-bold"
            width="18"
          />

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              fetchCustomers(
                pagination.page,
                search
              )
            }
          >
            Try Again
          </button>
        </div>
      )}

      {/* CUSTOMERS CARD */}

      <div className="customers-card">
        <div className="card-header">
          <div>
            <h2>Customer List</h2>

            <p>
              Registered customer accounts.
            </p>
          </div>

          <div className="page-info">
            Page{" "}
            <strong>
              {pagination.page}
            </strong>{" "}
            of{" "}
            <strong>
              {Math.max(
                pagination.totalPages,
                1
              )}
            </strong>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <Icon
              icon="solar:refresh-bold"
              width="27"
              className="loading-spinner"
            />

            <p>Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon
                icon="solar:users-group-rounded-bold"
                width="31"
              />
            </div>

            <h3>No customers found</h3>

            <p>
              {search
                ? "Try a different search term."
                : "No customer accounts have been registered yet."}
            </p>

            {search && (
              <button
                type="button"
                onClick={clearSearch}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Contact</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Joined</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.map(
                    (customer) => (
                      <tr
                        key={customer.id}
                      >
                        <td>
                          <div className="customer-cell">
                            <div className="avatar">
                              {getInitials(
                                customer.name
                              )}
                            </div>

                            <div className="customer-name">
                              <strong>
                                {
                                  customer.name
                                }
                              </strong>

                              <span>
                                ID:{" "}
                                {customer.id.slice(
                                  -8
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              customer.accountStatus ===
                              "disabled"
                                ? "status-disabled"
                                : "status-active"
                            }`}
                          >
                            <span className="status-dot" />

                            {customer.accountStatus ===
                            "disabled"
                              ? "Disabled"
                              : "Active"}
                          </span>
                        </td>

                        <td>
                          <div className="contact-cell">
                            <span>
                              <Icon
                                icon="solar:letter-linear"
                                width="14"
                              />

                              {
                                customer.email
                              }
                            </span>

                            <span>
                              <Icon
                                icon="solar:phone-linear"
                                width="14"
                              />

                              {
                                customer.phone
                              }
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="orders-count">
                            {
                              customer.orderCount
                            }
                          </span>
                        </td>

                        <td>
                          <strong className="spent">
                            {formatCurrency(
                              customer.totalSpent
                            )}
                          </strong>
                        </td>

                        <td>
                          <span className="date">
                            {formatDate(
                              customer.createdAt
                            )}
                          </span>
                        </td>

                        <td>
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="view-button"
                          >
                            View

                            <Icon
                              icon="solar:alt-arrow-right-linear"
                              width="15"
                            />
                          </Link>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE LIST */}

            <div className="mobile-customers">
              {customers.map(
                (customer) => (
                  <div
                    className="mobile-customer"
                    key={customer.id}
                  >
                    <div className="mobile-customer-top">
                      <div className="customer-cell">
                        <div className="avatar">
                          {getInitials(
                            customer.name
                          )}
                        </div>

                        <div className="customer-name">
                          <strong>
                            {
                              customer.name
                            }
                          </strong>

                          <span>
                            {
                              customer.email
                            }
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="mobile-view-button"
                      >
                        <Icon
                          icon="solar:alt-arrow-right-linear"
                          width="17"
                        />
                      </Link>
                    </div>

                    <div className="mobile-status-row">
                      <span
                        className={`status-badge ${
                          customer.accountStatus ===
                          "disabled"
                            ? "status-disabled"
                            : "status-active"
                        }`}
                      >
                        <span className="status-dot" />

                        {customer.accountStatus ===
                        "disabled"
                          ? "Disabled"
                          : "Active"}
                      </span>
                    </div>

                    <div className="mobile-customer-details">
                      <div>
                        <span>Phone</span>

                        <strong>
                          {
                            customer.phone
                          }
                        </strong>
                      </div>

                      <div>
                        <span>Orders</span>

                        <strong>
                          {
                            customer.orderCount
                          }
                        </strong>
                      </div>

                      <div>
                        <span>Spent</span>

                        <strong>
                          {formatCurrency(
                            customer.totalSpent
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Joined</span>

                        <strong>
                          {formatDate(
                            customer.createdAt
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}

        {/* PAGINATION */}

        {!loading &&
          customers.length > 0 && (
            <div className="pagination">
              <button
                type="button"
                onClick={
                  handlePrevious
                }
                disabled={
                  !pagination.hasPreviousPage
                }
              >
                <Icon
                  icon="solar:alt-arrow-left-linear"
                  width="17"
                />

                Previous
              </button>

              <div className="pagination-center">
                <span>Page</span>

                <strong>
                  {pagination.page}
                </strong>

                <span>of</span>

                <strong>
                  {Math.max(
                    pagination.totalPages,
                    1
                  )}
                </strong>
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={
                  !pagination.hasNextPage
                }
              >
                Next

                <Icon
                  icon="solar:alt-arrow-right-linear"
                  width="17"
                />
              </button>
            </div>
          )}
      </div>

      <style jsx>{`
        .customers-page {
          min-height: 100vh;
          padding: 32px;
          background: #f7f7f7;
          color: #111;
        }

        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 22px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 10px;
          color: #999;
          font-size: 11px;
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
          margin: 6px 0 0;
          color: #888;
          font-size: 12px;
        }

        .customer-count {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 12px;
          background: white;
          border: 1px solid #e7e7e7;
          border-radius: 8px;
          color: #444;
          font-size: 11px;
          font-weight: 600;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 13px;
          margin-bottom: 18px;
        }

        .summary-card {
          min-width: 0;
          min-height: 88px;
          padding: 16px;
          background: white;
          border: 1px solid #e7e7e7;
          border-radius: 11px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .summary-icon {
          width: 40px;
          height: 40px;
          border-radius: 9px;
          background: #f1f1f1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #222;
          flex-shrink: 0;
        }

        .summary-card > div:last-child {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-card span {
          color: #999;
          font-size: 10px;
        }

        .summary-card strong {
          font-size: 19px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 15px;
        }

        .search-form {
          height: 44px;
          max-width: 560px;
          width: 100%;
          background: white;
          border: 1px solid #e4e4e4;
          border-radius: 9px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding-left: 13px;
          overflow: hidden;
        }

        .search-form > svg {
          color: #999;
          flex-shrink: 0;
        }

        .search-form input {
          min-width: 0;
          flex: 1;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #111;
          font-size: 12px;
        }

        .search-form input::placeholder {
          color: #aaa;
        }

        .clear-search {
          border: 0;
          background: transparent;
          color: #aaa;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 4px;
        }

        .clear-search:hover {
          color: #555;
        }

        .search-button {
          height: 100%;
          padding: 0 17px;
          border: 0;
          background: #111;
          color: white;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }

        .search-button:hover {
          background: #333;
        }

        .active-search {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 10px;
          background: #ededed;
          border-radius: 7px;
          font-size: 10px;
          color: #777;
        }

        .active-search strong {
          color: #222;
        }

        .active-search button {
          border: 0;
          background: transparent;
          padding: 2px;
          display: flex;
          color: #777;
          cursor: pointer;
        }

        .error-message {
          margin-bottom: 15px;
          padding: 11px 13px;
          border-radius: 8px;
          background: #fcecec;
          color: #a33a3a;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
        }

        .error-message span {
          flex: 1;
        }

        .error-message button {
          border: 0;
          background: transparent;
          color: #8b3030;
          text-decoration: underline;
          font-size: 10px;
          cursor: pointer;
        }

        .customers-card {
          background: white;
          border: 1px solid #e7e7e7;
          border-radius: 11px;
          overflow: hidden;
        }

        .card-header {
          min-height: 67px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid #eeeeee;
        }

        .card-header h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
        }

        .card-header p {
          margin: 4px 0 0;
          color: #999;
          font-size: 10px;
        }

        .page-info {
          color: #999;
          font-size: 10px;
        }

        .page-info strong {
          color: #333;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 940px;
          border-collapse: collapse;
        }

        th {
          height: 43px;
          padding: 0 18px;
          text-align: left;
          background: #fafafa;
          border-bottom: 1px solid #eeeeee;
          color: #999;
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        td {
          padding: 13px 18px;
          border-bottom: 1px solid #eeeeee;
          vertical-align: middle;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        tbody tr:hover {
          background: #fcfcfc;
        }

        .customer-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 180px;
        }

        .avatar {
          width: 37px;
          height: 37px;
          border-radius: 50%;
          background: #eeeeee;
          color: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .customer-name {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .customer-name strong {
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .customer-name span {
          color: #aaa;
          font-size: 8px;
        }

        /* STATUS */

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          width: fit-content;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 700;
          line-height: 1;
          white-space: nowrap;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-active {
          background: #edf8f0;
          color: #27713b;
        }

        .status-active .status-dot {
          background: #3a9b52;
        }

        .status-disabled {
          background: #fceeee;
          color: #a33a3a;
        }

        .status-disabled .status-dot {
          background: #c94a4a;
        }

        .contact-cell {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 180px;
        }

        .contact-cell span {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #666;
          font-size: 9px;
          white-space: nowrap;
        }

        .contact-cell svg {
          color: #aaa;
          flex-shrink: 0;
        }

        .orders-count {
          min-width: 27px;
          height: 27px;
          padding: 0 7px;
          border-radius: 6px;
          background: #f2f2f2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 600;
        }

        .spent {
          font-size: 10px;
          white-space: nowrap;
        }

        .date {
          color: #777;
          font-size: 9px;
          white-space: nowrap;
        }

        .view-button {
          height: 30px;
          padding: 0 10px;
          border-radius: 6px;
          background: #111;
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          text-decoration: none;
          font-size: 9px;
          font-weight: 600;
        }

        .view-button:hover {
          background: #333;
        }

        .mobile-customers {
          display: none;
        }

        .mobile-status-row {
          margin-top: 11px;
        }

        .loading-state {
          min-height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 10px;
          color: #999;
        }

        .loading-state p {
          margin: 0;
          font-size: 11px;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        .empty-state {
          min-height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          text-align: center;
          padding: 30px;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #f2f2f2;
          color: #888;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 13px;
        }

        .empty-state h3 {
          margin: 0;
          font-size: 15px;
        }

        .empty-state p {
          max-width: 350px;
          margin: 6px 0 15px;
          color: #999;
          font-size: 11px;
        }

        .empty-state button {
          height: 34px;
          padding: 0 13px;
          border: 0;
          border-radius: 7px;
          background: #111;
          color: white;
          font-size: 10px;
          cursor: pointer;
        }

        .pagination {
          min-height: 62px;
          padding: 10px 18px;
          border-top: 1px solid #eeeeee;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .pagination > button {
          height: 34px;
          padding: 0 11px;
          border: 1px solid #dedede;
          border-radius: 7px;
          background: white;
          color: #333;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 10px;
          cursor: pointer;
        }

        .pagination > button:hover:not(:disabled) {
          border-color: #111;
          color: #111;
        }

        .pagination > button:disabled {
          color: #bbb;
          cursor: not-allowed;
          background: #fafafa;
        }

        .pagination-center {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #999;
          font-size: 10px;
        }

        .pagination-center strong {
          color: #333;
        }

        @media (max-width: 1100px) {
          .customers-page {
            padding: 26px;
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 800px) {
          .customers-page {
            padding: 22px 18px;
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .search-form {
            max-width: none;
          }

          .active-search {
            width: fit-content;
          }
        }

        @media (max-width: 650px) {
          .customers-page {
            padding: 18px 13px;
          }

          .page-header h1 {
            font-size: 25px;
          }

          .summary-grid {
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }

          .summary-card {
            min-height: 76px;
            padding: 12px;
            gap: 9px;
          }

          .summary-icon {
            width: 34px;
            height: 34px;
          }

          .summary-card span {
            font-size: 8px;
          }

          .summary-card strong {
            font-size: 15px;
          }

          .search-form {
            height: 42px;
          }

          .search-button {
            padding: 0 13px;
          }

          .table-wrapper {
            display: none;
          }

          .mobile-customers {
            display: flex;
            flex-direction: column;
          }

          .mobile-customer {
            padding: 14px;
            border-bottom: 1px solid #eeeeee;
          }

          .mobile-customer:last-child {
            border-bottom: 0;
          }

          .mobile-customer-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }

          .mobile-customer .customer-cell {
            min-width: 0;
          }

          .mobile-customer .customer-name {
            min-width: 0;
          }

          .mobile-customer .customer-name strong {
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 190px;
          }

          .mobile-customer .customer-name span {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 190px;
          }

          .mobile-view-button {
            width: 32px;
            height: 32px;
            flex-shrink: 0;
            border-radius: 7px;
            background: #111;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
          }

          .mobile-status-row {
            padding-top: 0;
          }

          .mobile-customer-details {
            margin-top: 13px;
            padding-top: 12px;
            border-top: 1px solid #eeeeee;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .mobile-customer-details > div {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .mobile-customer-details span {
            color: #999;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .mobile-customer-details strong {
            color: #333;
            font-size: 10px;
            word-break: break-word;
          }

          .pagination {
            padding: 10px 12px;
          }

          .pagination > button {
            padding: 0 9px;
          }

          .pagination-center {
            font-size: 9px;
          }
        }

        @media (max-width: 380px) {
          .customers-page {
            padding: 15px 10px;
          }

          .summary-card {
            padding: 10px;
          }

          .summary-icon {
            width: 30px;
            height: 30px;
          }

          .summary-card strong {
            font-size: 14px;
          }

          .search-button {
            padding: 0 10px;
          }

          .pagination > button {
            font-size: 9px;
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