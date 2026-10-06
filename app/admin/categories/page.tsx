"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: "active" | "inactive";
  featured: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  image: string;
  status: "active" | "inactive";
  featured: boolean;
  sortOrder: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [saving, setSaving] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null
  );

  const [error, setError] = useState("");

  const [form, setForm] = useState<CategoryForm>({
    name: "",
    slug: "",
    description: "",
    image: "",
    status: "active",
    featured: false,
    sortOrder: "0",
  });

  /* =========================
     FETCH CATEGORIES
  ========================= */

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/categories", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch categories.");
      }

      setCategories(data.categories || []);
    } catch (error) {
      console.error("FETCH CATEGORIES ERROR:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load categories."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* =========================
     SUMMARY
  ========================= */

  const summary = useMemo(() => {
    const total = categories.length;

    const active = categories.filter(
      (category) => category.status === "active"
    ).length;

    const inactive = categories.filter(
      (category) => category.status === "inactive"
    ).length;

    const featured = categories.filter(
      (category) => category.featured
    ).length;

    return {
      total,
      active,
      inactive,
      featured,
    };
  }, [categories]);

  /* =========================
     FILTERED CATEGORIES
  ========================= */

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return categories.filter((category) => {
      const matchesSearch =
        !query ||
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" || category.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  /* =========================
     FORM HELPERS
  ========================= */

  const resetForm = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      image: "",
      status: "active",
      featured: false,
      sortOrder: "0",
    });

    setError("");
  };

  const openAddModal = () => {
    setEditingCategory(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);

    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      image: category.image || "",
      status: category.status || "active",
      featured: Boolean(category.featured),
      sortOrder: String(category.sortOrder ?? 0),
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCategory(null);
    resetForm();
  };

  /* =========================
     NAME / SLUG
  ========================= */

  const createSlug = (value: string) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      name: value,
      ...(editingCategory
        ? {}
        : {
            slug: createSlug(value),
          }),
    }));
  };

  /* =========================
     SAVE CATEGORY
  ========================= */

  const handleSaveCategory = async () => {
    setError("");

    const cleanName = form.name.trim();
    const cleanSlug = createSlug(form.slug);

    if (!cleanName) {
      setError("Category name is required.");
      return;
    }

    if (!cleanSlug) {
      setError("Category slug is required.");
      return;
    }

    const parsedSortOrder =
      form.sortOrder.trim() === "" ? 0 : Number(form.sortOrder);

    if (!Number.isInteger(parsedSortOrder) || parsedSortOrder < 0) {
      setError("Sort order must be a whole number greater than or equal to 0.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: cleanName,
        slug: cleanSlug,
        description: form.description.trim(),
        image: form.image.trim(),
        status: form.status,
        featured: form.featured,
        sortOrder: parsedSortOrder,
      };

      /* =========================
         EDIT CATEGORY
      ========================= */

      if (editingCategory) {
        const response = await fetch(
          `/api/admin/categories/${editingCategory._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to update category.");
          return;
        }

        setCategories((prev) =>
          prev.map((category) =>
            category._id === editingCategory._id
              ? data.category
              : category
          )
        );

        closeModal();
        return;
      }

      /* =========================
         ADD CATEGORY
      ========================= */

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create category.");
        return;
      }

      setCategories((prev) => [data.category, ...prev]);

      closeModal();
    } catch (error) {
      console.error("SAVE CATEGORY ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the category."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     DELETE CATEGORY
  ========================= */

  const handleDeleteCategory = async (category: Category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingCategoryId(category._id);

      const response = await fetch(
        `/api/admin/categories/${category._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        window.alert(data.message || "Failed to delete category.");
        return;
      }

      setCategories((prev) =>
        prev.filter((item) => item._id !== category._id)
      );
    } catch (error) {
      console.error("DELETE CATEGORY ERROR:", error);

      window.alert("Something went wrong while deleting the category.");
    } finally {
      setDeletingCategoryId(null);
    }
  };

  /* =========================
     CLEAR FILTERS
  ========================= */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const hasFilters = search.trim() !== "" || statusFilter !== "all";

  return (
    <div className="categories-page">
      {/* =========================
          HEADER
      ========================= */}

      <div className="page-header">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" />
            CATALOG MANAGEMENT
          </div>

          <h1>Categories</h1>

          <p>
            Organize your products into structured collections and manage
            category visibility.
          </p>
        </div>

        <button className="primary-button" onClick={openAddModal}>
          <Icon icon="solar:add-circle-bold" width="20" />
          Add Category
        </button>
      </div>

      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon">
            <Icon icon="solar:widget-5-bold" width="22" />
          </div>

          <div>
            <span>Total Categories</span>
            <strong>{summary.total}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon active-icon">
            <Icon icon="solar:check-circle-bold" width="22" />
          </div>

          <div>
            <span>Active</span>
            <strong>{summary.active}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon inactive-icon">
            <Icon icon="solar:close-circle-bold" width="22" />
          </div>

          <div>
            <span>Inactive</span>
            <strong>{summary.inactive}</strong>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon featured-icon">
            <Icon icon="solar:star-bold" width="22" />
          </div>

          <div>
            <span>Featured</span>
            <strong>{summary.featured}</strong>
          </div>
        </div>
      </div>

      {/* =========================
          TOOLBAR
      ========================= */}

      <div className="toolbar">
        <div className="search-box">
          <Icon icon="solar:magnifer-linear" width="20" />

          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              className="clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <Icon icon="solar:close-circle-bold" width="18" />
            </button>
          )}
        </div>

        <div className="filter-area">
          <div className="select-wrapper">
            <Icon icon="solar:filter-bold" width="18" />

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as "all" | "active" | "inactive"
                )
              }
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <Icon
              className="select-arrow"
              icon="solar:alt-arrow-down-linear"
              width="16"
            />
          </div>

          {hasFilters && (
            <button className="clear-filter-button" onClick={clearFilters}>
              <Icon icon="solar:close-circle-linear" width="17" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* =========================
          ERROR
      ========================= */}

      {error && !showModal && (
        <div className="page-error">
          <Icon icon="solar:danger-triangle-bold" width="20" />
          <span>{error}</span>

          <button onClick={fetchCategories}>Retry</button>
        </div>
      )}

      {/* =========================
          TABLE
      ========================= */}

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>All Categories</h2>

            <span>
              {filteredCategories.length}{" "}
              {filteredCategories.length === 1 ? "category" : "categories"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="loader" />
            <p>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon icon="solar:widget-5-linear" width="36" />
            </div>

            <h3>
              {hasFilters ? "No categories found" : "No categories yet"}
            </h3>

            <p>
              {hasFilters
                ? "Try changing your search or filters."
                : "Create your first category to organize your products."}
            </p>

            {hasFilters ? (
              <button className="secondary-button" onClick={clearFilters}>
                Clear Filters
              </button>
            ) : (
              <button className="primary-button" onClick={openAddModal}>
                <Icon icon="solar:add-circle-bold" width="19" />
                Add Category
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th>Order</th>
                  <th className="action-header">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => {
                  const isDeleting =
                    deletingCategoryId === category._id;

                  return (
                    <tr key={category._id}>
                      {/* CATEGORY */}

                      <td>
                        <div className="category-info">
                          <div className="category-image">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                              />
                            ) : (
                              <Icon
                                icon="solar:widget-5-bold"
                                width="22"
                              />
                            )}
                          </div>

                          <div className="category-details">
                            <strong>{category.name}</strong>

                            {category.description && (
                              <span>
                                {category.description.length > 55
                                  ? `${category.description.slice(0, 55)}...`
                                  : category.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SLUG */}

                      <td>
                        <code className="slug">{category.slug}</code>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`status-badge ${
                            category.status === "active"
                              ? "status-active"
                              : "status-inactive"
                          }`}
                        >
                          <span className="status-dot" />
                          {category.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* FEATURED */}

                      <td>
                        {category.featured ? (
                          <span className="featured-badge">
                            <Icon icon="solar:star-bold" width="15" />
                            Featured
                          </span>
                        ) : (
                          <span className="not-featured">—</span>
                        )}
                      </td>

                      {/* SORT ORDER */}

                      <td>
                        <span className="sort-order">
                          {category.sortOrder}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <div className="actions">
                          <button
                            className="icon-button edit-button"
                            onClick={() => openEditModal(category)}
                            disabled={isDeleting}
                            title="Edit category"
                          >
                            <Icon
                              icon="solar:pen-new-square-linear"
                              width="19"
                            />
                          </button>

                          <button
                            className="icon-button delete-button"
                            onClick={() =>
                              handleDeleteCategory(category)
                            }
                            disabled={isDeleting}
                            title="Delete category"
                          >
                            {isDeleting ? (
                              <span className="button-spinner" />
                            ) : (
                              <Icon
                                icon="solar:trash-bin-trash-linear"
                                width="19"
                              />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}

      {showModal && (
        <div className="modal-overlay" onMouseDown={closeModal}>
          <div
            className="category-modal"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}

            <div className="modal-header">
              <div>
                <div className="modal-icon">
                  <Icon
                    icon={
                      editingCategory
                        ? "solar:pen-new-square-bold"
                        : "solar:add-circle-bold"
                    }
                    width="22"
                  />
                </div>

                <div>
                  <h2>
                    {editingCategory
                      ? "Edit Category"
                      : "Add Category"}
                  </h2>

                  <p>
                    {editingCategory
                      ? "Update category information."
                      : "Create a new product category."}
                  </p>
                </div>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close"
              >
                <Icon icon="solar:close-circle-bold" width="24" />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="modal-body">
              {error && (
                <div className="modal-error">
                  <Icon
                    icon="solar:danger-triangle-bold"
                    width="19"
                  />
                  <span>{error}</span>
                </div>
              )}

              {/* NAME */}

              <div className="form-group">
                <label>
                  Category Name <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="e.g. Women"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* SLUG */}

              <div className="form-group">
                <label>
                  Slug <span>*</span>
                </label>

                <div className="input-with-prefix">
                  <span>/</span>

                  <input
                    type="text"
                    placeholder="women"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        slug: createSlug(e.target.value),
                      }))
                    }
                    disabled={saving}
                  />
                </div>

                <small>
                  Used in the category URL.
                </small>
              </div>

              {/* DESCRIPTION */}

              <div className="form-group">
                <label>Description</label>

                <textarea
                  rows={4}
                  placeholder="Short description for this category..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  disabled={saving}
                />
              </div>

              {/* IMAGE */}

              <div className="form-group">
                <label>Image URL</label>

                <div className="input-with-icon">
                  <Icon icon="solar:gallery-linear" width="19" />

                  <input
                    type="text"
                    placeholder="https://example.com/category.jpg"
                    value={form.image}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        image: e.target.value,
                      }))
                    }
                    disabled={saving}
                  />
                </div>

                <small>
                  Add a direct image URL for the category.
                </small>
              </div>

              {/* STATUS + SORT */}

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>

                  <div className="select-wrapper form-select">
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          status: e.target.value as
                            | "active"
                            | "inactive",
                        }))
                      }
                      disabled={saving}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>

                    <Icon
                      className="select-arrow"
                      icon="solar:alt-arrow-down-linear"
                      width="16"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Sort Order</label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        sortOrder: e.target.value,
                      }))
                    }
                    disabled={saving}
                  />

                  <small>Lower numbers appear first.</small>
                </div>
              </div>

              {/* FEATURED */}

              <div className="featured-toggle-row">
                <div>
                  <strong>Featured Category</strong>

                  <p>
                    Highlight this category in featured sections.
                  </p>
                </div>

                <button
                  type="button"
                  className={`toggle ${
                    form.featured ? "toggle-on" : ""
                  }`}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      featured: !prev.featured,
                    }))
                  }
                  disabled={saving}
                  aria-label="Toggle featured category"
                >
                  <span />
                </button>
              </div>
            </div>

            {/* MODAL FOOTER */}

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="primary-button"
                onClick={handleSaveCategory}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="button-spinner light" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icon
                      icon={
                        editingCategory
                          ? "solar:check-circle-bold"
                          : "solar:add-circle-bold"
                      }
                      width="19"
                    />

                    {editingCategory
                      ? "Update Category"
                      : "Create Category"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .categories-page {
          width: 100%;
          padding: 32px;
          color: #111;
        }

        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 30px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.8px;
          color: #888;
        }

        .eyebrow-line {
          width: 24px;
          height: 1px;
          background: #111;
        }

        .page-header h1 {
          margin: 0;
          font-size: 34px;
          line-height: 1.1;
          font-weight: 700;
          letter-spacing: -1.1px;
        }

        .page-header p {
          margin: 9px 0 0;
          color: #777;
          font-size: 14px;
        }

        .primary-button {
          border: none;
          background: #111;
          color: #fff;
          height: 44px;
          padding: 0 18px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
          white-space: nowrap;
        }

        .primary-button:hover {
          background: #292929;
          transform: translateY(-1px);
        }

        .primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .secondary-button {
          height: 42px;
          padding: 0 17px;
          border: 1px solid #dedede;
          background: #fff;
          color: #222;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .secondary-button:hover {
          border-color: #aaa;
          background: #fafafa;
        }

        .secondary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 22px;
        }

        .summary-card {
          min-height: 104px;
          padding: 19px;
          border: 1px solid #e9e9e9;
          background: #fff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .summary-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: #f1f1f1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #222;
          flex-shrink: 0;
        }

        .active-icon {
          background: #edf7ef;
          color: #2e7d32;
        }

        .inactive-icon {
          background: #f5f5f5;
          color: #777;
        }

        .featured-icon {
          background: #fff8e7;
          color: #b57a00;
        }

        .summary-card span {
          display: block;
          font-size: 12px;
          color: #888;
          margin-bottom: 5px;
        }

        .summary-card strong {
          font-size: 24px;
          line-height: 1;
          font-weight: 700;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .search-box {
          height: 44px;
          flex: 1;
          max-width: 460px;
          border: 1px solid #e3e3e3;
          border-radius: 9px;
          background: #fff;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 13px;
          color: #888;
        }

        .search-box input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 13px;
          background: transparent;
          color: #111;
        }

        .search-box input::placeholder {
          color: #aaa;
        }

        .clear-search {
          border: none;
          background: transparent;
          padding: 0;
          color: #999;
          cursor: pointer;
          display: flex;
        }

        .filter-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .select-wrapper {
          position: relative;
          height: 44px;
          border: 1px solid #e3e3e3;
          background: #fff;
          border-radius: 9px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          color: #777;
        }

        .select-wrapper select {
          appearance: none;
          -webkit-appearance: none;
          border: none;
          outline: none;
          background: transparent;
          color: #333;
          font-size: 13px;
          padding: 0 24px 0 7px;
          cursor: pointer;
        }

        .select-arrow {
          position: absolute;
          right: 9px;
          pointer-events: none;
        }

        .clear-filter-button {
          height: 42px;
          border: none;
          background: transparent;
          display: flex;
          align-items: center;
          gap: 5px;
          color: #777;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .clear-filter-button:hover {
          color: #111;
        }

        .page-error {
          min-height: 46px;
          padding: 10px 13px;
          border: 1px solid #f1cccc;
          border-radius: 8px;
          background: #fff7f7;
          color: #b42318;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          font-size: 13px;
        }

        .page-error button {
          margin-left: auto;
          border: none;
          background: transparent;
          text-decoration: underline;
          color: inherit;
          cursor: pointer;
          font-weight: 600;
        }

        .table-card {
          border: 1px solid #e8e8e8;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
        }

        .table-header {
          min-height: 70px;
          padding: 0 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #ededed;
        }

        .table-header h2 {
          margin: 0 0 3px;
          font-size: 15px;
          font-weight: 700;
        }

        .table-header span {
          color: #999;
          font-size: 11px;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }

        th {
          height: 45px;
          padding: 0 18px;
          background: #fafafa;
          color: #888;
          text-align: left;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          border-bottom: 1px solid #ededed;
        }

        td {
          padding: 14px 18px;
          border-bottom: 1px solid #f0f0f0;
          vertical-align: middle;
          font-size: 13px;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        tbody tr:hover {
          background: #fcfcfc;
        }

        .category-info {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 230px;
        }

        .category-image {
          width: 46px;
          height: 46px;
          border-radius: 8px;
          overflow: hidden;
          background: #f3f3f3;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
          flex-shrink: 0;
        }

        .category-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .category-details {
          min-width: 0;
        }

        .category-details strong {
          display: block;
          font-size: 13px;
          font-weight: 650;
          color: #222;
          margin-bottom: 4px;
        }

        .category-details span {
          display: block;
          max-width: 270px;
          color: #999;
          font-size: 11px;
          line-height: 1.4;
        }

        .slug {
          padding: 5px 8px;
          border-radius: 5px;
          background: #f6f6f6;
          color: #666;
          font-size: 11px;
          font-family: monospace;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 27px;
          padding: 0 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .status-active {
          background: #edf7ef;
          color: #287c32;
        }

        .status-active .status-dot {
          background: #3ca047;
        }

        .status-inactive {
          background: #f2f2f2;
          color: #777;
        }

        .status-inactive .status-dot {
          background: #999;
        }

        .featured-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #a56f00;
          background: #fff8e7;
          padding: 5px 8px;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 650;
        }

        .not-featured {
          color: #bbb;
        }

        .sort-order {
          color: #555;
          font-size: 12px;
          font-weight: 600;
        }

        .action-header {
          text-align: right;
        }

        .actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }

        .icon-button {
          width: 35px;
          height: 35px;
          border: 1px solid #e5e5e5;
          background: #fff;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .icon-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .edit-button {
          color: #555;
        }

        .edit-button:hover:not(:disabled) {
          color: #111;
          border-color: #bbb;
          background: #fafafa;
        }

        .delete-button {
          color: #a33;
        }

        .delete-button:hover:not(:disabled) {
          color: #c62828;
          border-color: #e1b5b5;
          background: #fff8f8;
        }

        .button-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid #ddd;
          border-top-color: #555;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .button-spinner.light {
          border-color: rgba(255, 255, 255, 0.35);
          border-top-color: #fff;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty-state {
          min-height: 330px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
        }

        .empty-icon {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: #f5f5f5;
          color: #999;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
        }

        .empty-state h3 {
          margin: 0 0 7px;
          font-size: 15px;
        }

        .empty-state p {
          margin: 0 0 18px;
          max-width: 400px;
          color: #999;
          font-size: 12px;
          line-height: 1.6;
        }

        .loader {
          width: 30px;
          height: 30px;
          border: 3px solid #eee;
          border-top-color: #111;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-bottom: 13px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          padding: 24px;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .category-modal {
          width: min(600px, 100%);
          max-height: calc(100vh - 48px);
          overflow-y: auto;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          padding: 20px 22px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 1px solid #ededed;
        }

        .modal-header > div:first-child {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .modal-icon {
          width: 42px;
          height: 42px;
          border-radius: 9px;
          background: #f2f2f2;
          color: #222;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .modal-header h2 {
          margin: 0 0 4px;
          font-size: 18px;
          font-weight: 700;
        }

        .modal-header p {
          margin: 0;
          color: #999;
          font-size: 11px;
        }

        .modal-close {
          width: 34px;
          height: 34px;
          border: none;
          background: transparent;
          color: #888;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .modal-close:hover {
          color: #111;
        }

        .modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-body {
          padding: 22px;
        }

        .modal-error {
          margin-bottom: 17px;
          padding: 10px 12px;
          border-radius: 7px;
          background: #fff6f6;
          border: 1px solid #f0d0d0;
          color: #b42318;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }

        .form-group {
          margin-bottom: 17px;
        }

        .form-group label {
          display: block;
          margin-bottom: 7px;
          color: #333;
          font-size: 11px;
          font-weight: 650;
        }

        .form-group label span {
          color: #c62828;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          border: 1px solid #dedede;
          border-radius: 8px;
          outline: none;
          background: #fff;
          color: #222;
          font-size: 13px;
          transition: 0.2s ease;
          box-sizing: border-box;
        }

        .form-group input {
          height: 42px;
          padding: 0 12px;
        }

        .form-group textarea {
          padding: 11px 12px;
          resize: vertical;
          min-height: 95px;
          font-family: inherit;
          line-height: 1.5;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          border-color: #999;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.04);
        }

        .form-group input:disabled,
        .form-group textarea:disabled {
          background: #f8f8f8;
          cursor: not-allowed;
        }

        .form-group small {
          display: block;
          margin-top: 5px;
          color: #999;
          font-size: 10px;
        }

        .input-with-prefix {
          display: flex;
          align-items: center;
          height: 42px;
          border: 1px solid #dedede;
          border-radius: 8px;
          overflow: hidden;
        }

        .input-with-prefix > span {
          padding-left: 12px;
          color: #aaa;
          font-size: 13px;
        }

        .input-with-prefix input {
          border: none;
          height: 100%;
          border-radius: 0;
        }

        .input-with-prefix input:focus {
          box-shadow: none;
        }

        .input-with-icon {
          height: 42px;
          border: 1px solid #dedede;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          color: #999;
        }

        .input-with-icon input {
          border: none;
          padding: 0;
          height: 100%;
        }

        .input-with-icon input:focus {
          box-shadow: none;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .form-select {
          width: 100%;
          box-sizing: border-box;
        }

        .form-select select {
          width: 100%;
          padding-left: 0;
        }

        .featured-toggle-row {
          margin-top: 4px;
          padding: 14px;
          border: 1px solid #e7e7e7;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .featured-toggle-row strong {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
        }

        .featured-toggle-row p {
          margin: 0;
          color: #999;
          font-size: 10px;
        }

        .toggle {
          width: 43px;
          height: 24px;
          padding: 3px;
          border: none;
          border-radius: 20px;
          background: #ddd;
          cursor: pointer;
          transition: 0.2s ease;
          flex-shrink: 0;
        }

        .toggle span {
          display: block;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          transition: 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .toggle-on {
          background: #111;
        }

        .toggle-on span {
          transform: translateX(19px);
        }

        .toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-footer {
          padding: 16px 22px;
          border-top: 1px solid #ededed;
          display: flex;
          justify-content: flex-end;
          gap: 9px;
        }

        @media (max-width: 1100px) {
          .categories-page {
            padding: 26px;
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .categories-page {
            padding: 20px 16px;
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
            margin-bottom: 22px;
          }

          .page-header h1 {
            font-size: 29px;
          }

          .page-header p {
            max-width: 500px;
            line-height: 1.5;
          }

          .primary-button {
            width: 100%;
          }

          .summary-grid {
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }

          .summary-card {
            min-height: 90px;
            padding: 14px;
          }

          .summary-icon {
            width: 38px;
            height: 38px;
          }

          .summary-card strong {
            font-size: 21px;
          }

          .toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .search-box {
            max-width: none;
          }

          .filter-area {
            justify-content: space-between;
          }

          .select-wrapper {
            flex: 1;
          }

          .table-card {
            border-radius: 10px;
          }

          .table-header {
            padding: 0 15px;
          }

          .modal-overlay {
            padding: 12px;
          }

          .category-modal {
            max-height: calc(100vh - 24px);
          }
        }

        @media (max-width: 480px) {
          .categories-page {
            padding: 17px 12px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .summary-card {
            min-height: 78px;
          }

          .filter-area {
            align-items: stretch;
            flex-direction: column;
          }

          .clear-filter-button {
            justify-content: flex-end;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .modal-header {
            padding: 17px;
          }

          .modal-body {
            padding: 17px;
          }

          .modal-footer {
            padding: 14px 17px;
          }

          .modal-footer .secondary-button,
          .modal-footer .primary-button {
            width: auto;
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}