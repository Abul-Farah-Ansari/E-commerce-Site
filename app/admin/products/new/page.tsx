"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Category = {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  featured: boolean;
  sortOrder: number;
};

type ProductForm = {
  name: string;
  description: string;
  category: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  stock: string;
  lowStockThreshold: string;
  status: string;
  images: string;
  sizes: string;
  colors: string;
  featured: boolean;
  newArrival: boolean;
  trending: boolean;
  sale: boolean;
};

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    category: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    stock: "0",
    lowStockThreshold: "5",
    status: "draft",
    images: "",
    sizes: "",
    colors: "",
    featured: false,
    newArrival: false,
    trending: false,
    sale: false,
  });

  const [imageInput, setImageInput] = useState("");
  const [imageError, setImageError] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =========================================================
     IMAGE LIST
  ========================================================= */

  const imageUrls = useMemo(() => {
    return form.images
      .split(/\r?\n/)
      .map((image) => image.trim())
      .filter(Boolean);
  }, [form.images]);

  /* =========================================================
     LOAD CATEGORIES
  ========================================================= */

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);

        const response = await fetch(
          "/api/admin/categories",
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
              "Unable to load categories."
          );
        }

        const activeCategories = (
          data.categories || []
        )
          .filter(
            (category: Category) =>
              category.status === "active"
          )
          .sort(
            (a: Category, b: Category) =>
              a.sortOrder - b.sortOrder
          );

        setCategories(activeCategories);
      } catch (requestError) {
        console.error(
          "Load categories error:",
          requestError
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load categories."
        );
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  /* =========================================================
     GENERAL FORM CHANGE
  ========================================================= */

  const handleChange = (
    field: keyof ProductForm,
    value: string | boolean
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =========================================================
     IMAGE URL VALIDATION
  ========================================================= */

  const isValidImageUrl = (value: string) => {
    try {
      const url = new URL(value);

      return (
        url.protocol === "http:" ||
        url.protocol === "https:"
      );
    } catch {
      return false;
    }
  };

  /* =========================================================
     ADD IMAGE
  ========================================================= */

  const addImage = () => {
    const value = imageInput.trim();

    setImageError("");

    if (!value) {
      setImageError(
        "Please paste an image URL first."
      );
      return;
    }

    if (!isValidImageUrl(value)) {
      setImageError(
        "Please enter a valid http:// or https:// image URL."
      );
      return;
    }

    if (imageUrls.includes(value)) {
      setImageError(
        "This image URL has already been added."
      );
      return;
    }

    const updatedImages = [
      ...imageUrls,
      value,
    ];

    setForm((previous) => ({
      ...previous,
      images: updatedImages.join("\n"),
    }));

    setImageInput("");
  };

  /* =========================================================
     ADD MULTIPLE IMAGES
  ========================================================= */

  const addMultipleImages = () => {
    const values = imageInput
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    setImageError("");

    if (!values.length) {
      setImageError(
        "Please paste at least one image URL."
      );
      return;
    }

    const invalidUrl = values.find(
      (value) => !isValidImageUrl(value)
    );

    if (invalidUrl) {
      setImageError(
        `Invalid image URL: ${invalidUrl}`
      );
      return;
    }

    const uniqueNewImages = values.filter(
      (value) =>
        !imageUrls.includes(value)
    );

    if (!uniqueNewImages.length) {
      setImageError(
        "These image URLs are already added."
      );
      return;
    }

    const updatedImages = [
      ...imageUrls,
      ...uniqueNewImages,
    ];

    setForm((previous) => ({
      ...previous,
      images: updatedImages.join("\n"),
    }));

    setImageInput("");
  };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeImage = (index: number) => {
    const updatedImages = imageUrls.filter(
      (_, imageIndex) =>
        imageIndex !== index
    );

    setForm((previous) => ({
      ...previous,
      images: updatedImages.join("\n"),
    }));

    setImageError("");
  };

  /* =========================================================
     MAKE PRIMARY IMAGE
  ========================================================= */

  const makePrimaryImage = (index: number) => {
    if (index === 0) return;

    const selectedImage = imageUrls[index];

    const updatedImages = [
      selectedImage,
      ...imageUrls.filter(
        (_, imageIndex) =>
          imageIndex !== index
      ),
    ];

    setForm((previous) => ({
      ...previous,
      images: updatedImages.join("\n"),
    }));
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.category.trim() ||
      !form.price ||
      !form.sku.trim()
    ) {
      setError(
        "Please fill in all required fields."
      );
      return;
    }

    if (Number(form.price) < 0) {
      setError(
        "Price cannot be negative."
      );
      return;
    }

    if (
      form.compareAtPrice &&
      Number(form.compareAtPrice) < 0
    ) {
      setError(
        "Compare-at price cannot be negative."
      );
      return;
    }

    if (Number(form.stock) < 0) {
      setError(
        "Stock cannot be negative."
      );
      return;
    }

    const parsedLowStockThreshold =
      Number(form.lowStockThreshold);

    if (
      form.lowStockThreshold === "" ||
      !Number.isInteger(
        parsedLowStockThreshold
      ) ||
      parsedLowStockThreshold < 0
    ) {
      setError(
        "Low stock threshold must be a whole number greater than or equal to 0."
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name.trim(),

        description:
          form.description.trim(),

        category:
          form.category.trim(),

        price: Number(form.price),

        compareAtPrice:
          form.compareAtPrice
            ? Number(form.compareAtPrice)
            : undefined,

        sku: form.sku
          .trim()
          .toUpperCase(),

        stock: Number(form.stock),

        lowStockThreshold:
          parsedLowStockThreshold,

        status: form.status,

        images: imageUrls,

        sizes: form.sizes
          .split(",")
          .map((size) => size.trim())
          .filter(Boolean),

        colors: form.colors
          .split(",")
          .map((color) => color.trim())
          .filter(Boolean),

        /*
         * VISIBILITY FLAGS
         */

        featured: form.featured,

        newArrival: form.newArrival,

        trending: form.trending,

        sale: form.sale,
      };

      const response = await fetch(
        "/api/admin/products",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify(payload),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Unable to create product."
        );
        return;
      }

      setSuccess(
        "Product created successfully."
      );

      setTimeout(() => {
        router.push(
          "/admin/products"
        );
      }, 700);
    } catch (requestError) {
      console.error(
        "Create product error:",
        requestError
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="new-product-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="new-product-header">

        <Link
          href="/admin/products"
          className="back-link"
        >
          <Icon
            icon="solar:arrow-left-linear"
            width={18}
            height={18}
          />

          <span>
            Back to Products
          </span>
        </Link>

        <div className="page-eyebrow">
          CATALOG
        </div>

        <h1>
          Add Product
        </h1>

        <p>
          Create a new product for your
          store catalog.
        </p>

      </div>

      {/* =====================================================
          ALERTS
      ===================================================== */}

      {error && (
        <div className="form-alert form-alert-error">

          <Icon
            icon="solar:danger-circle-linear"
            width={20}
            height={20}
          />

          <span>
            {error}
          </span>

        </div>
      )}

      {success && (
        <div className="form-alert form-alert-success">

          <Icon
            icon="solar:check-circle-linear"
            width={20}
            height={20}
          />

          <span>
            {success}
          </span>

        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        className="product-form"
        onSubmit={handleSubmit}
      >

        {/* ===================================================
            MAIN
        =================================================== */}

        <div className="form-main">

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <section className="form-card">

            <div className="form-card-header">
              <div>
                <h2>
                  Basic Information
                </h2>

                <p>
                  Add the main information
                  about your product.
                </p>
              </div>
            </div>

            <div className="form-card-body">

              <div className="form-group full-width">

                <label htmlFor="name">
                  Product Name
                  <span>*</span>
                </label>

                <input
                  id="name"
                  type="text"
                  placeholder="e.g. Premium Cotton Shirt"
                  value={form.name}
                  onChange={(event) =>
                    handleChange(
                      "name",
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="form-group full-width">

                <label htmlFor="description">
                  Description
                  <span>*</span>
                </label>

                <textarea
                  id="description"
                  rows={6}
                  placeholder="Describe your product..."
                  value={form.description}
                  onChange={(event) =>
                    handleChange(
                      "description",
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="form-grid">

                <div className="form-group">

                  <label htmlFor="category">
                    Category
                    <span>*</span>
                  </label>

                  <select
                    id="category"
                    value={form.category}
                    onChange={(event) =>
                      handleChange(
                        "category",
                        event.target.value
                      )
                    }
                    disabled={categoriesLoading}
                  >

                    <option value="">
                      {categoriesLoading
                        ? "Loading categories..."
                        : "Select a category"}
                    </option>

                    {categories.map(
                      (category) => (
                        <option
                          key={category._id}
                          value={category._id}
                        >
                          {category.name}
                        </option>
                      )
                    )}

                  </select>

                  {!categoriesLoading &&
                    categories.length ===
                      0 && (
                      <small className="category-warning">
                        No active categories
                        found. Create a
                        category first.
                      </small>
                    )}

                </div>

                <div className="form-group">

                  <label htmlFor="sku">
                    SKU
                    <span>*</span>
                  </label>

                  <input
                    id="sku"
                    type="text"
                    placeholder="e.g. MEN-SHIRT-001"
                    value={form.sku}
                    onChange={(event) =>
                      handleChange(
                        "sku",
                        event.target.value
                      )
                    }
                  />

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              PRICING
          ================================================= */}

          <section className="form-card">

            <div className="form-card-header">
              <div>
                <h2>
                  Pricing & Inventory
                </h2>

                <p>
                  Set product pricing and
                  stock information.
                </p>
              </div>
            </div>

            <div className="form-card-body">

              <div className="form-grid">

                <div className="form-group">

                  <label htmlFor="price">
                    Selling Price
                    <span>*</span>
                  </label>

                  <div className="input-with-prefix">

                    <span>₹</span>

                    <input
                      id="price"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="1999"
                      value={form.price}
                      onChange={(event) =>
                        handleChange(
                          "price",
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>

                <div className="form-group">

                  <label htmlFor="compareAtPrice">
                    Compare-at Price
                  </label>

                  <div className="input-with-prefix">

                    <span>₹</span>

                    <input
                      id="compareAtPrice"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="2499"
                      value={
                        form.compareAtPrice
                      }
                      onChange={(event) =>
                        handleChange(
                          "compareAtPrice",
                          event.target.value
                        )
                      }
                    />

                  </div>

                  <small>
                    Optional original
                    price.
                  </small>

                </div>

                <div className="form-group">

                  <label htmlFor="stock">
                    Stock Quantity
                  </label>

                  <input
                    id="stock"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={form.stock}
                    onChange={(event) =>
                      handleChange(
                        "stock",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="form-group">

                  <label htmlFor="lowStockThreshold">
                    Low Stock Threshold
                  </label>

                  <input
                    id="lowStockThreshold"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="5"
                    value={
                      form.lowStockThreshold
                    }
                    onChange={(event) =>
                      handleChange(
                        "lowStockThreshold",
                        event.target.value
                      )
                    }
                  />

                  <small>
                    Products at or below
                    this quantity will be
                    marked as low stock.
                  </small>

                </div>

                <div className="form-group">

                  <label htmlFor="status">
                    Product Status
                  </label>

                  <select
                    id="status"
                    value={form.status}
                    onChange={(event) =>
                      handleChange(
                        "status",
                        event.target.value
                      )
                    }
                  >

                    <option value="draft">
                      Draft
                    </option>

                    <option value="active">
                      Active
                    </option>

                    <option value="out_of_stock">
                      Out of Stock
                    </option>

                  </select>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              VARIANTS
          ================================================= */}

          <section className="form-card">

            <div className="form-card-header">

              <div>
                <h2>
                  Variants
                </h2>

                <p>
                  Add available sizes and
                  colors.
                </p>
              </div>

            </div>

            <div className="form-card-body">

              <div className="form-group full-width">

                <label htmlFor="sizes">
                  Sizes
                </label>

                <input
                  id="sizes"
                  type="text"
                  placeholder="S, M, L, XL, XXL"
                  value={form.sizes}
                  onChange={(event) =>
                    handleChange(
                      "sizes",
                      event.target.value
                    )
                  }
                />

                <small>
                  Separate multiple sizes
                  with commas.
                </small>

              </div>

              <div className="form-group full-width">

                <label htmlFor="colors">
                  Colors
                </label>

                <input
                  id="colors"
                  type="text"
                  placeholder="Black, White, Navy"
                  value={form.colors}
                  onChange={(event) =>
                    handleChange(
                      "colors",
                      event.target.value
                    )
                  }
                />

                <small>
                  Separate multiple colors
                  with commas.
                </small>

              </div>

            </div>

          </section>

          {/* =================================================
              PRODUCT IMAGES
          ================================================= */}

          <section className="form-card image-card">

            <div className="form-card-header">

              <div>

                <div className="image-title-row">

                  <div className="image-title-icon">

                    <Icon
                      icon="solar:gallery-wide-linear"
                      width={19}
                      height={19}
                    />

                  </div>

                  <div>

                    <h2>
                      Product Images
                    </h2>

                    <p>
                      Add image URLs for
                      this product.
                    </p>

                  </div>

                </div>

              </div>

              {imageUrls.length > 0 && (
                <span className="image-count">
                  {imageUrls.length}{" "}
                  {imageUrls.length === 1
                    ? "image"
                    : "images"}
                </span>
              )}

            </div>

            <div className="form-card-body">

              {/* IMAGE URL */}

              <div className="image-input-area">

                <label htmlFor="image-url">
                  Image URL
                </label>

                <div className="image-input-row">

                  <div className="image-url-input">

                    <Icon
                      icon="solar:link-linear"
                      width={18}
                      height={18}
                    />

                    <input
                      id="image-url"
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={imageInput}
                      onChange={(event) => {
                        setImageInput(
                          event.target.value
                        );
                        setImageError("");
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter"
                        ) {
                          event.preventDefault();
                          addImage();
                        }
                      }}
                    />

                  </div>

                  <button
                    type="button"
                    className="add-image-button"
                    onClick={addImage}
                  >

                    <Icon
                      icon="solar:add-circle-linear"
                      width={18}
                      height={18}
                    />

                    <span>
                      Add Image
                    </span>

                  </button>

                </div>

                <small>
                  Paste a direct image URL
                  ending in an image file or
                  a supported image-host URL.
                </small>

              </div>

              {/* MULTIPLE URLS */}

              <div className="multi-url-box">

                <div className="multi-url-heading">

                  <div>

                    <strong>
                      Add multiple URLs
                    </strong>

                    <span>
                      Paste one URL per line.
                    </span>

                  </div>

                  <button
                    type="button"
                    className="add-multiple-button"
                    onClick={
                      addMultipleImages
                    }
                  >
                    Add All
                  </button>

                </div>

                <textarea
                  value={imageInput}
                  onChange={(event) => {
                    setImageInput(
                      event.target.value
                    );
                    setImageError("");
                  }}
                  placeholder={`https://images.unsplash.com/photo-1
https://images.unsplash.com/photo-2
https://images.unsplash.com/photo-3`}
                  rows={4}
                />

              </div>

              {/* IMAGE ERROR */}

              {imageError && (
                <div className="image-error">

                  <Icon
                    icon="solar:danger-circle-linear"
                    width={17}
                    height={17}
                  />

                  <span>
                    {imageError}
                  </span>

                </div>
              )}

              {/* IMAGE PREVIEW */}

              {imageUrls.length > 0 ? (

                <div className="image-preview-section">

                  <div className="preview-heading">

                    <div>

                      <strong>
                        Image Preview
                      </strong>

                      <span>
                        The first image is
                        used as the primary
                        product image.
                      </span>

                    </div>

                  </div>

                  <div className="image-grid">

                    {imageUrls.map(
                      (image, index) => (

                        <div
                          className={
                            "image-preview-card" +
                            (index === 0
                              ? " primary-image"
                              : "")
                          }
                          key={`${image}-${index}`}
                        >

                          <div className="preview-image">

                            <img
                              src={image}
                              alt={`Product image ${
                                index + 1
                              }`}
                              onError={(
                                event
                              ) => {
                                event.currentTarget.style.display =
                                  "none";

                                const parent =
                                  event.currentTarget
                                    .parentElement;

                                if (parent) {
                                  parent.classList.add(
                                    "image-load-error"
                                  );
                                }
                              }}
                            />

                            <div className="preview-error">

                              <Icon
                                icon="solar:gallery-remove-linear"
                                width={25}
                                height={25}
                              />

                              <span>
                                Image could not
                                be loaded
                              </span>

                            </div>

                            <div className="image-number">
                              {index + 1}
                            </div>

                            {index === 0 && (
                              <div className="primary-badge">
                                Primary
                              </div>
                            )}

                          </div>

                          <div className="preview-footer">

                            <div className="preview-url">
                              {image}
                            </div>

                            <div className="preview-actions">

                              {index !== 0 && (
                                <button
                                  type="button"
                                  title="Make primary"
                                  onClick={() =>
                                    makePrimaryImage(
                                      index
                                    )
                                  }
                                >
                                  <Icon
                                    icon="solar:star-linear"
                                    width={16}
                                    height={16}
                                  />
                                </button>
                              )}

                              <button
                                type="button"
                                title="Remove image"
                                className="remove-image"
                                onClick={() =>
                                  removeImage(
                                    index
                                  )
                                }
                              >
                                <Icon
                                  icon="solar:trash-bin-trash-linear"
                                  width={16}
                                  height={16}
                                />
                              </button>

                            </div>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </div>

              ) : (

                <div className="empty-images">

                  <div className="empty-images-icon">

                    <Icon
                      icon="solar:gallery-add-linear"
                      width={27}
                      height={27}
                    />

                  </div>

                  <strong>
                    No images added yet
                  </strong>

                  <span>
                    Paste an image URL above
                    to see a preview here.
                  </span>

                </div>

              )}

            </div>

          </section>

        </div>

        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="form-sidebar">

          {/* =================================================
              VISIBILITY
          ================================================= */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <h2>
                  Visibility
                </h2>

                <p>
                  Control how the product
                  appears in your store.
                </p>

              </div>

            </div>

            <div className="form-card-body">

              {/* FEATURED */}

              <label className="toggle-row">

                <span>
                  <strong>
                    Featured Product
                  </strong>

                  <small>
                    Show in featured
                    products.
                  </small>
                </span>

                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    handleChange(
                      "featured",
                      event.target.checked
                    )
                  }
                />

                <span className="toggle-switch" />

              </label>

              {/* NEW ARRIVAL */}

              <label className="toggle-row">

                <span>
                  <strong>
                    New Arrival
                  </strong>

                  <small>
                    Show in new arrivals.
                  </small>
                </span>

                <input
                  type="checkbox"
                  checked={form.newArrival}
                  onChange={(event) =>
                    handleChange(
                      "newArrival",
                      event.target.checked
                    )
                  }
                />

                <span className="toggle-switch" />

              </label>

              {/* TRENDING */}

              <label className="toggle-row">

                <span>
                  <strong>
                    Trending
                  </strong>

                  <small>
                    Show in trending
                    products.
                  </small>
                </span>

                <input
                  type="checkbox"
                  checked={form.trending}
                  onChange={(event) =>
                    handleChange(
                      "trending",
                      event.target.checked
                    )
                  }
                />

                <span className="toggle-switch" />

              </label>

              {/* SALE */}

              <label className="toggle-row">

                <span>
                  <strong>
                    Sale
                  </strong>

                  <small>
                    Show in sale products.
                  </small>
                </span>

                <input
                  type="checkbox"
                  checked={form.sale}
                  onChange={(event) =>
                    handleChange(
                      "sale",
                      event.target.checked
                    )
                  }
                />

                <span className="toggle-switch" />

              </label>

            </div>

          </section>

          {/* =================================================
              PRODUCT SUMMARY
          ================================================= */}

          <section className="form-card summary-card">

            <div className="form-card-header">

              <div>

                <h2>
                  Product Summary
                </h2>

                <p>
                  Quick overview before
                  publishing.
                </p>

              </div>

            </div>

            <div className="summary-body">

              <div className="summary-row">
                <span>
                  Images
                </span>

                <strong>
                  {imageUrls.length}
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Sizes
                </span>

                <strong>
                  {
                    form.sizes
                      .split(",")
                      .map((item) =>
                        item.trim()
                      )
                      .filter(Boolean)
                      .length
                  }
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Colors
                </span>

                <strong>
                  {
                    form.colors
                      .split(",")
                      .map((item) =>
                        item.trim()
                      )
                      .filter(Boolean)
                      .length
                  }
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Stock
                </span>

                <strong>
                  {form.stock || 0}
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Status
                </span>

                <strong className="summary-status">
                  {form.status ===
                  "active"
                    ? "Active"
                    : form.status ===
                        "out_of_stock"
                      ? "Out of Stock"
                      : "Draft"}
                </strong>
              </div>

              {/* FLAGS */}

              <div className="summary-flags">

                {form.featured && (
                  <span>
                    Featured
                  </span>
                )}

                {form.newArrival && (
                  <span>
                    New Arrival
                  </span>
                )}

                {form.trending && (
                  <span>
                    Trending
                  </span>
                )}

                {form.sale && (
                  <span>
                    Sale
                  </span>
                )}

              </div>

            </div>

          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <section className="form-actions-card">

            <button
              type="submit"
              className="save-product-button"
              disabled={saving}
            >

              {saving ? (
                <>
                  <Icon
                    icon="solar:refresh-linear"
                    width={19}
                    height={19}
                    className="spin"
                  />

                  <span>
                    Creating...
                  </span>
                </>
              ) : (
                <>
                  <Icon
                    icon="solar:check-circle-linear"
                    width={19}
                    height={19}
                  />

                  <span>
                    Create Product
                  </span>
                </>
              )}

            </button>

            <Link
              href="/admin/products"
              className="cancel-button"
            >
              Cancel
            </Link>

          </section>

        </aside>

      </form>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx>{`

        .new-product-page {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          padding-bottom: 50px;
          color: #111111;
        }

        .new-product-header {
          margin-bottom: 28px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 18px;
          color: #777777;
          text-decoration: none;
          font-size: 11px;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .back-link:hover {
          color: #111111;
        }

        .page-eyebrow {
          margin-bottom: 7px;
          color: #999999;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .new-product-header h1 {
          margin: 0;
          color: #111111;
          font-family:
            var(--font-bodoni),
            "Bodoni Moda",
            Didot,
            serif;
          font-size: 34px;
          font-weight: 500;
          letter-spacing: -0.035em;
          line-height: 1;
        }

        .new-product-header p {
          margin: 9px 0 0;
          color: #777777;
          font-size: 12px;
        }

        .form-alert {
          min-height: 48px;
          margin-bottom: 20px;
          padding: 12px 15px;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 8px;
          font-size: 12px;
        }

        .form-alert-error {
          background: #fff4f4;
          border: 1px solid #f0d5d5;
          color: #a33a3a;
        }

        .form-alert-success {
          background: #f3faf4;
          border: 1px solid #d5ead7;
          color: #397144;
        }

        .product-form {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            330px;
          gap: 22px;
          align-items: start;
        }

        .form-main {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-sidebar {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
          position: sticky;
          top: 98px;
        }

        .form-card {
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          box-shadow:
            0 5px 20px
            rgba(0, 0, 0, 0.025);
        }

        .form-card-header {
          padding: 20px 22px;
          border-bottom: 1px solid #eeeeee;
        }

        .form-card-header h2 {
          margin: 0;
          color: #151515;
          font-family:
            var(--font-bodoni),
            "Bodoni Moda",
            Didot,
            serif;
          font-size: 20px;
          font-weight: 500;
          letter-spacing: -0.015em;
        }

        .form-card-header p {
          margin: 5px 0 0;
          color: #888888;
          font-size: 10px;
          line-height: 1.5;
        }

        .form-card-body {
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .form-group {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .full-width {
          width: 100%;
        }

        .form-group label,
        .image-input-area > label {
          color: #333333;
          font-size: 11px;
          font-weight: 600;
        }

        .form-group label span {
          margin-left: 3px;
          color: #a00000;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 12px 13px;
          box-sizing: border-box;
          border: 1px solid #dedede;
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          color: #111111;
          font-size: 12px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
          line-height: 1.6;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #b0b0b0;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          border-color: #999999;
          box-shadow:
            0 0 0 3px
            rgba(0, 0, 0, 0.04);
        }

        .form-group small,
        .image-input-area small {
          color: #999999;
          font-size: 9px;
          line-height: 1.5;
        }

        .category-warning {
          color: #9b702c !important;
        }

        .input-with-prefix {
          position: relative;
        }

        .input-with-prefix > span {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #777777;
          font-size: 13px;
          pointer-events: none;
        }

        .input-with-prefix input {
          padding-left: 28px;
        }

        /* ===================================================
           IMAGE SECTION
        =================================================== */

        .image-card {
          border-color: #dedede;
        }

        .image-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .image-title-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #111111;
          color: #ffffff;
          border-radius: 7px;
        }

        .image-count {
          display: inline-flex;
          align-items: center;
          min-height: 25px;
          padding: 0 9px;
          background: #f5f5f5;
          color: #666666;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 600;
        }

        .image-input-area {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .image-input-row {
          display: flex;
          align-items: stretch;
          gap: 9px;
        }

        .image-url-input {
          min-width: 0;
          flex: 1;
          height: 46px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 13px;
          box-sizing: border-box;
          border: 1px solid #dedede;
          border-radius: 8px;
          background: #ffffff;
          color: #999999;
        }

        .image-url-input:focus-within {
          border-color: #999999;
          box-shadow:
            0 0 0 3px
            rgba(0, 0, 0, 0.04);
        }

        .image-url-input input {
          width: 100%;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #111111;
          font-size: 12px;
        }

        .image-url-input input::placeholder {
          color: #b0b0b0;
        }

        .add-image-button {
          min-width: 120px;
          height: 46px;
          padding: 0 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px solid #111111;
          border-radius: 8px;
          background: #111111;
          color: #ffffff;
          cursor: pointer;
          font-size: 10px;
          font-weight: 600;
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .add-image-button:hover {
          background: #292929;
          transform: translateY(-1px);
        }

        .multi-url-box {
          padding: 15px;
          border: 1px solid #eeeeee;
          border-radius: 9px;
          background: #fafafa;
        }

        .multi-url-heading {
          margin-bottom: 9px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .multi-url-heading > div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .multi-url-heading strong {
          color: #333333;
          font-size: 10px;
          font-weight: 600;
        }

        .multi-url-heading span {
          color: #999999;
          font-size: 9px;
        }

        .add-multiple-button {
          padding: 7px 11px;
          border: 1px solid #dcdcdc;
          border-radius: 6px;
          background: #ffffff;
          color: #333333;
          cursor: pointer;
          font-size: 9px;
          font-weight: 600;
        }

        .multi-url-box textarea {
          width: 100%;
          box-sizing: border-box;
          resize: vertical;
          padding: 11px;
          border: 1px solid #dedede;
          border-radius: 7px;
          outline: none;
          background: #ffffff;
          color: #111111;
          font-size: 11px;
          line-height: 1.6;
        }

        .multi-url-box textarea:focus {
          border-color: #999999;
          box-shadow:
            0 0 0 3px
            rgba(0, 0, 0, 0.04);
        }

        .image-error {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 10px 12px;
          border: 1px solid #efd2d2;
          border-radius: 7px;
          background: #fff6f6;
          color: #a33a3a;
          font-size: 10px;
        }

        .image-preview-section {
          display: flex;
          flex-direction: column;
          gap: 13px;
        }

        .preview-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .preview-heading > div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .preview-heading strong {
          color: #333333;
          font-size: 11px;
        }

        .preview-heading span {
          color: #999999;
          font-size: 9px;
        }

        .image-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 12px;
        }

        .image-preview-card {
          overflow: hidden;
          border: 1px solid #e7e7e7;
          border-radius: 9px;
          background: #ffffff;
        }

        .image-preview-card.primary-image {
          border-color: #111111;
        }

        .preview-image {
          position: relative;
          height: 190px;
          background: #f7f7f7;
          overflow: hidden;
        }

        .preview-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .preview-error {
          position: absolute;
          inset: 0;
          display: none;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #999999;
          font-size: 9px;
        }

        .image-load-error .preview-error {
          display: flex;
        }

        .image-number {
          position: absolute;
          top: 8px;
          left: 8px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          color: #ffffff;
          font-size: 9px;
          font-weight: 600;
        }

        .primary-badge {
          position: absolute;
          right: 8px;
          top: 8px;
          padding: 5px 8px;
          border-radius: 999px;
          background: #111111;
          color: #ffffff;
          font-size: 8px;
          font-weight: 600;
        }

        .preview-footer {
          padding: 9px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .preview-url {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          color: #999999;
          font-size: 8px;
        }

        .preview-actions {
          display: flex;
          gap: 5px;
        }

        .preview-actions button {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #dddddd;
          border-radius: 6px;
          background: #ffffff;
          color: #555555;
          cursor: pointer;
        }

        .preview-actions button:hover {
          background: #f5f5f5;
        }

        .preview-actions .remove-image {
          color: #b33131;
        }

        .empty-images {
          min-height: 190px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 7px;
          border: 1px dashed #dddddd;
          border-radius: 9px;
          background: #fafafa;
          color: #999999;
          text-align: center;
        }

        .empty-images-icon {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 3px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid #eeeeee;
        }

        .empty-images strong {
          color: #555555;
          font-size: 11px;
        }

        .empty-images span {
          font-size: 9px;
        }

        /* ===================================================
           VISIBILITY TOGGLES
        =================================================== */

        .toggle-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 2px 0 18px;
          border-bottom: 1px solid #eeeeee;
          cursor: pointer;
        }

        .toggle-row:last-child {
          padding-bottom: 0;
          border-bottom: 0;
        }

        .toggle-row > span:first-child {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .toggle-row strong {
          color: #333333;
          font-size: 11px;
          font-weight: 600;
        }

        .toggle-row small {
          color: #999999;
          font-size: 9px;
          line-height: 1.4;
        }

        .toggle-row input {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }

        .toggle-switch {
          position: relative;
          flex-shrink: 0;
          width: 56px;
          height: 30px;
          border-radius: 999px;
          background: #dddddd;
          transition:
            background 0.2s ease;
        }

        .toggle-switch::after {
          content: "";
          position: absolute;
          width: 24px;
          height: 24px;
          top: 3px;
          left: 3px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow:
            0 2px 5px
            rgba(0, 0, 0, 0.15);
          transition:
            transform 0.2s ease;
        }

        .toggle-row
          input:checked
          + .toggle-switch {
          background: #111111;
        }

        .toggle-row
          input:checked
          + .toggle-switch::after {
          transform: translateX(26px);
        }

        /* ===================================================
           SUMMARY
        =================================================== */

        .summary-body {
          padding: 18px 22px;
          display: flex;
          flex-direction: column;
        }

        .summary-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #eeeeee;
        }

        .summary-row span {
          color: #888888;
          font-size: 10px;
        }

        .summary-row strong {
          color: #333333;
          font-size: 11px;
        }

        .summary-status {
          font-weight: 600;
        }

        .summary-flags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          padding-top: 14px;
        }

        .summary-flags span {
          padding: 6px 9px;
          border-radius: 999px;
          background: #f4f4f4;
          color: #555555;
          font-size: 8px;
          font-weight: 600;
        }

        /* ===================================================
           ACTIONS
        =================================================== */

        .form-actions-card {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .save-product-button {
          width: 100%;
          min-height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #111111;
          border-radius: 8px;
          background: #111111;
          color: #ffffff;
          cursor: pointer;
          font-size: 11px;
          font-weight: 600;
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .save-product-button:hover {
          background: #292929;
          transform: translateY(-1px);
        }

        .save-product-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .cancel-button {
          width: 100%;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          border: 1px solid #dedede;
          border-radius: 8px;
          background: #ffffff;
          color: #555555;
          text-decoration: none;
          font-size: 10px;
          font-weight: 600;
        }

        .cancel-button:hover {
          background: #f7f7f7;
        }

        .spin {
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* ===================================================
           RESPONSIVE
        =================================================== */

        @media (max-width: 1100px) {

          .product-form {
            grid-template-columns:
              minmax(0, 1fr)
              300px;
          }

          .image-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

        }

        @media (max-width: 900px) {

          .product-form {
            grid-template-columns: 1fr;
          }

          .form-sidebar {
            position: static;
          }

        }

        @media (max-width: 640px) {

          .new-product-page {
            padding-bottom: 30px;
          }

          .new-product-header h1 {
            font-size: 28px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .image-input-row {
            flex-direction: column;
          }

          .add-image-button {
            width: 100%;
          }

          .image-grid {
            grid-template-columns: 1fr;
          }

          .preview-image {
            height: 220px;
          }

        }

      `}</style>

    </div>
  );
}