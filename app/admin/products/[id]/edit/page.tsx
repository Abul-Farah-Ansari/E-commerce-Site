"use client";

import {

  DragEvent,

  FormEvent,

  useEffect,

  useState,

} from "react";

import { Icon } from "@iconify/react";

import Link from "next/link";

import { useParams, useRouter } from "next/navigation";

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
  trending: boolean;
  sale: boolean;
};

type Category = {
  _id: string;
  name: string;
  slug: string;
  status: "active" | "inactive";
  featured: boolean;
  sortOrder: number;
};

type FormState = {
  name: string;
  description: string;
  category: string;
  price: string;
  compareAtPrice: string;
  sku: string;
  stock: string;
  lowStockThreshold: string;
  status: string;
  images: string[];
  sizes: string;
  colors: string;

  featured: boolean;
  newArrival: boolean;
  trending: boolean;
  sale: boolean;
};

export default function EditProductPage() {

  const router = useRouter();

  const params = useParams();

  const productId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [form, setForm] = useState<FormState>({

    name: "",

    description: "",

    category: "",

    price: "",

    compareAtPrice: "",

    sku: "",

    stock: "0",

    lowStockThreshold: "5",

    status: "draft",

    images: [],

    sizes: "",

    colors: "",

    featured: false,
newArrival: false,
trending: false,
sale: false,

  });

  const [newImageUrl, setNewImageUrl] = useState("");

  const [draggedImageIndex, setDraggedImageIndex] =

    useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (!productId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setCategoriesLoading(true);
        setError("");

        const [productResponse, categoriesResponse] =
          await Promise.all([
            fetch(`/api/admin/products/${productId}`, {
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

        const productData = await productResponse.json();
        const categoriesData = await categoriesResponse.json();

        if (!productResponse.ok) {
          setError(
            productData.message || "Unable to load product."
          );
          return;
        }

        if (!categoriesResponse.ok) {
          setError(
            categoriesData.message ||
              "Unable to load categories."
          );
          return;
        }

        const activeCategories = (categoriesData.categories || [])
          .filter(
            (category: Category) =>
              category.status === "active"
          )
          .sort(
            (a: Category, b: Category) =>
              a.sortOrder - b.sortOrder
          );

        setCategories(activeCategories);

        const product: Product = productData.product;

        const productCategoryId =
          typeof product.category === "string"
            ? product.category
            : product.category?._id || "";

        setForm({
          name: product.name || "",
          description: product.description || "",
          category: productCategoryId,
          price:
            product.price !== undefined
              ? String(product.price)
              : "",
          compareAtPrice:
            product.compareAtPrice !== undefined &&
            product.compareAtPrice !== null
              ? String(product.compareAtPrice)
              : "",
          sku: product.sku || "",
          stock:
            product.stock !== undefined
              ? String(product.stock)
              : "0",
          lowStockThreshold:
            product.lowStockThreshold !== undefined &&
            product.lowStockThreshold !== null
              ? String(product.lowStockThreshold)
              : "5",
          status: product.status || "draft",
          images: Array.isArray(product.images)
            ? product.images
            : [],
          sizes: Array.isArray(product.sizes)
            ? product.sizes.join(", ")
            : "",
          colors: Array.isArray(product.colors)
            ? product.colors.join(", ")
            : "",
          featured: Boolean(product.featured),
newArrival: Boolean(product.newArrival),
trending: Boolean(product.trending),
sale: Boolean(product.sale),
        });
      } catch (requestError) {
        console.error(
          "Load edit product data error:",
          requestError
        );

        setError(
          "Something went wrong while loading the product."
        );
      } finally {
        setLoading(false);
        setCategoriesLoading(false);
      }
    };

    loadData();
  }, [productId]);

  const handleChange = (

    field: string,

    value: string | boolean

  ) => {

    setForm((previous) => ({

      ...previous,

      [field]: value,

    }));

  };

  const addImage = () => {

    const imageUrl = newImageUrl.trim();

    setImageError("");

    if (!imageUrl) {

      setImageError("Please enter an image URL.");

      return;

    }

    try {

      new URL(imageUrl);

    } catch {

      setImageError(

        "Please enter a valid image URL."

      );

      return;

    }

    if (form.images.includes(imageUrl)) {

      setImageError(

        "This image has already been added."

      );

      return;

    }

    setForm((previous) => ({

      ...previous,

      images: [...previous.images, imageUrl],

    }));

    setNewImageUrl("");

  };

  const removeImage = (index: number) => {

    setForm((previous) => ({

      ...previous,

      images: previous.images.filter(

        (_, imageIndex) => imageIndex !== index

      ),

    }));

    setImageError("");

  };

  const moveImage = (

    index: number,

    direction: "up" | "down"

  ) => {

    const newIndex =

      direction === "up" ? index - 1 : index + 1;

    if (

      newIndex < 0 ||

      newIndex >= form.images.length

    ) {

      return;

    }

    setForm((previous) => {

      const images = [...previous.images];

      const currentImage = images[index];

      images[index] = images[newIndex];

      images[newIndex] = currentImage;

      return {

        ...previous,

        images,

      };

    });

  };

  const handleDragStart = (

    event: DragEvent<HTMLDivElement>,

    index: number

  ) => {

    setDraggedImageIndex(index);

    event.dataTransfer.effectAllowed = "move";

    event.dataTransfer.setData(

      "text/plain",

      String(index)

    );

  };

  const handleDragOver = (

    event: DragEvent<HTMLDivElement>

  ) => {

    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

  };

  const handleDrop = (

    event: DragEvent<HTMLDivElement>,

    targetIndex: number

  ) => {

    event.preventDefault();

    if (

      draggedImageIndex === null ||

      draggedImageIndex === targetIndex

    ) {

      setDraggedImageIndex(null);

      return;

    }

    setForm((previous) => {

      const images = [...previous.images];

      const draggedImage =

        images[draggedImageIndex];

      images.splice(draggedImageIndex, 1);

      images.splice(

        targetIndex,

        0,

        draggedImage

      );

      return {

        ...previous,

        images,

      };

    });

    setDraggedImageIndex(null);

  };

  const handleDragEnd = () => {

    setDraggedImageIndex(null);

  };

  const handleSubmit = async (

    event: FormEvent<HTMLFormElement>

  ) => {

    event.preventDefault();

    setError("");

    setSuccess("");

    setImageError("");

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

      setError("Price cannot be negative.");

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

    if (

      !Number.isInteger(Number(form.stock)) ||

      Number(form.stock) < 0

    ) {

      setError(

        "Stock must be a valid whole number greater than or equal to 0."

      );

      return;

    }

    if (

      form.lowStockThreshold === "" ||

      !Number.isInteger(Number(form.lowStockThreshold)) ||

      Number(form.lowStockThreshold) < 0

    ) {

      setError(

        "Low stock threshold must be a valid whole number greater than or equal to 0."

      );

      return;

    }

    setSaving(true);

    try {

      const payload = {

        name: form.name.trim(),

        description: form.description.trim(),

        category: form.category.trim(), // Category._id

        price: Number(form.price),

        compareAtPrice: form.compareAtPrice

          ? Number(form.compareAtPrice)

          : undefined,

        sku: form.sku.trim().toUpperCase(),

        stock: Number(form.stock),

        lowStockThreshold: Number(

          form.lowStockThreshold

        ),

        status: form.status,

        images: form.images

          .map((image) => image.trim())

          .filter(Boolean),

        sizes: form.sizes

          .split(",")

          .map((size) => size.trim())

          .filter(Boolean),

        colors: form.colors

          .split(",")

          .map((color) => color.trim())

          .filter(Boolean),

        featured: form.featured,
newArrival: form.newArrival,
trending: form.trending,
sale: form.sale,

      };

      const response = await fetch(

        `/api/admin/products/${productId}`,

        {

          method: "PUT",

          headers: {

            "Content-Type": "application/json",

          },

          credentials: "include",

          body: JSON.stringify(payload),

        }

      );

      const data = await response.json();

      if (!response.ok) {

        setError(

          data.message ||

            "Unable to update product."

        );

        return;

      }

      setSuccess(

        "Product updated successfully."

      );

      setTimeout(() => {

        router.push("/admin/products");

      }, 700);

    } catch (requestError) {

      console.error(

        "Update product error:",

        requestError

      );

      setError(

        "Something went wrong. Please try again."

      );

    } finally {

      setSaving(false);

    }

  };

  if (loading) {

    return (

      <div className="edit-loading">

        <div className="loading-spinner">

          <Icon

            icon="solar:refresh-linear"

            width={25}

            height={25}

          />

        </div>

        <p>Loading product...</p>

        <style jsx>{`

          .edit-loading {

            min-height: 420px;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            color: #888888;

          }

          .loading-spinner {

            color: #111111;

            animation: spin 0.9s linear infinite;

          }

          .edit-loading p {

            margin: 12px 0 0;

            font-size: 13px;

          }

          @keyframes spin {

            from {

              transform: rotate(0deg);

            }

            to {

              transform: rotate(360deg);

            }

          }

        `}</style>

      </div>

    );

  }

  if (error && !form.name) {

    return (

      <div className="edit-error-page">

        <div className="error-icon">

          <Icon

            icon="solar:danger-circle-linear"

            width={32}

            height={32}

          />

        </div>

        <h1>Unable to load product</h1>

        <p>{error}</p>

        <Link

          href="/admin/products"

          className="back-button"

        >

          <Icon

            icon="solar:arrow-left-linear"

            width={18}

            height={18}

          />

          Back to Products

        </Link>

        <style jsx>{`

          .edit-error-page {

            min-height: 420px;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            text-align: center;

          }

          .error-icon {

            width: 64px;

            height: 64px;

            display: flex;

            align-items: center;

            justify-content: center;

            border-radius: 50%;

            background: #fff3f3;

            color: #a33a3a;

          }

          .edit-error-page h1 {

            margin: 18px 0 7px;

            color: #111111;

            font-size: 20px;

          }

          .edit-error-page p {

            max-width: 420px;

            margin: 0;

            color: #888888;

            font-size: 13px;

            line-height: 1.6;

          }

          .back-button {

            margin-top: 20px;

            min-height: 42px;

            padding: 0 17px;

            display: inline-flex;

            align-items: center;

            gap: 8px;

            border-radius: 8px;

            background: #111111;

            color: #ffffff;

            text-decoration: none;

            font-size: 12px;

            font-weight: 600;

          }

        `}</style>

      </div>

    );

  }

  return (

    <div className="edit-product-page">

      <div className="edit-product-header">

        <div>

          <Link

            href="/admin/products"

            className="back-link"

          >

            <Icon

              icon="solar:arrow-left-linear"

              width={18}

              height={18}

            />

            <span>Back to Products</span>

          </Link>

          <div className="page-eyebrow">

            CATALOG

          </div>

          <h1>Edit Product</h1>

          <p>

            Update the information for this

            product.

          </p>

        </div>

      </div>

      {error && (

        <div className="form-alert form-alert-error">

          <Icon

            icon="solar:danger-circle-linear"

            width={20}

            height={20}

          />

          <span>{error}</span>

        </div>

      )}

      {success && (

        <div className="form-alert form-alert-success">

          <Icon

            icon="solar:check-circle-linear"

            width={20}

            height={20}

          />

          <span>{success}</span>

        </div>

      )}

      <form

        className="product-form"

        onSubmit={handleSubmit}

      >

        <div className="form-main">

          {/* BASIC INFORMATION */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <h2>Basic Information</h2>

                <p>

                  Update the main information about

                  your product.

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

                    {categories.map((category) => (
                      <option
                        key={category._id}
                        value={category._id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {!categoriesLoading &&
                    categories.length === 0 && (
                      <small className="category-warning">
                        No active categories found. Create or activate a category first.
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

          {/* PRICING & INVENTORY */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <h2>Pricing & Inventory</h2>

                <p>

                  Update pricing and stock

                  information.

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

                      value={form.compareAtPrice}

                      onChange={(event) =>

                        handleChange(

                          "compareAtPrice",

                          event.target.value

                        )

                      }

                    />

                  </div>

                  <small>

                    Optional original price.

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

                    value={form.lowStockThreshold}

                    onChange={(event) =>

                      handleChange(

                        "lowStockThreshold",

                        event.target.value

                      )

                    }

                  />

                  <small>

                    Stock at or below this number will later be marked as low stock.

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

          {/* VARIANTS */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <h2>Variants</h2>

                <p>

                  Update available sizes and

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

                  Separate multiple sizes with

                  commas.

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

                  Separate multiple colors with

                  commas.

                </small>

              </div>

            </div>

          </section>

          {/* PRODUCT IMAGES */}

          <section className="form-card">

            <div className="form-card-header">

              <div className="image-header-content">

                <div>

                  <h2>Product Images</h2>

                  <p>

                    Add, preview and arrange your

                    product images.

                  </p>

                </div>

                <div className="image-count">

                  <Icon

                    icon="solar:gallery-linear"

                    width={15}

                    height={15}

                  />

                  <span>

                    {form.images.length}{" "}

                    {form.images.length === 1

                      ? "Image"

                      : "Images"}

                  </span>

                </div>

              </div>

            </div>

            <div className="form-card-body image-manager">

              {/* ADD IMAGE */}

              <div className="add-image-box">

                <div className="add-image-label">

                  <div>

                    <label htmlFor="newImageUrl">

                      Add Image URL

                    </label>

                    <small>

                      Paste a direct image URL.

                    </small>

                  </div>

                </div>

                <div className="add-image-row">

                  <div className="image-url-input">

                    <Icon

                      icon="solar:link-linear"

                      width={17}

                      height={17}

                    />

                    <input

                      id="newImageUrl"

                      type="url"

                      placeholder="https\\://example.com/product-image.jpg"

                      value={newImageUrl}

                      onChange={(event) => {

                        setNewImageUrl(

                          event.target.value

                        );

                        setImageError("");

                      }}

                      onKeyDown={(event) => {

                        if (event.key === "Enter") {

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

                    <span>Add Image</span>

                  </button>

                </div>

                {imageError && (

                  <div className="image-error">

                    <Icon

                      icon="solar:danger-circle-linear"

                      width={15}

                      height={15}

                    />

                    <span>{imageError}</span>

                  </div>

                )}

              </div>

              {/* IMAGE PREVIEW */}

              {form.images.length === 0 ? (

                <div className="empty-images">

                  <div className="empty-images-icon">

                    <Icon

                      icon="solar:gallery-add-linear"

                      width={30}

                      height={30}

                    />

                  </div>

                  <h3>No product images yet</h3>

                  <p>

                    Add your first image URL above

                    to start building the product

                    gallery.

                  </p>

                </div>

              ) : (

                <div className="image-grid">

                  {form.images.map(

                    (image, index) => (

                      <div

                        key={`${image}-${index}`}

                        className={`image-item ${

                          draggedImageIndex === index

                            ? "image-item-dragging"

                            : ""

                        }`}

                        draggable

                        onDragStart={(event) =>

                          handleDragStart(

                            event,

                            index

                          )

                        }

                        onDragOver={handleDragOver}

                        onDrop={(event) =>

                          handleDrop(

                            event,

                            index

                          )

                        }

                        onDragEnd={handleDragEnd}

                      >

                        <div className="image-preview">

                          <img

                            src={image}

                            alt={`${form.name || "Product"} image ${

                              index + 1

                            }`}

                            onError={(event) => {

                              event.currentTarget.style.display =

                                "none";

                              const fallback =

                                event.currentTarget

                                  .nextElementSibling as HTMLElement | null;

                              if (fallback) {

                                fallback.style.display =

                                  "flex";

                              }

                            }}

                          />

                          <div className="image-fallback">

                            <Icon

                              icon="solar:gallery-remove-linear"

                              width={28}

                              height={28}

                            />

                            <span>

                              Image unavailable

                            </span>

                          </div>

                          {index === 0 && (

                            <div className="primary-badge">

                              <Icon

                                icon="solar:star-bold"

                                width={12}

                                height={12}

                              />

                              <span>Primary</span>

                            </div>

                          )}

                          <div className="drag-handle">

                            <Icon

                              icon="solar:sort-vertical-linear"

                              width={17}

                              height={17}

                            />

                          </div>

                        </div>

                        <div className="image-item-footer">

                          <div className="image-number">

                            <span>

                              {String(index + 1).padStart(

                                2,

                                "0"

                              )}

                            </span>

                            <span>

                              {index === 0

                                ? "Primary image"

                                : `Image ${index + 1}`}

                            </span>

                          </div>

                          <div className="image-actions">

                            <button

                              type="button"

                              title="Move image up"

                              aria-label="Move image up"

                              disabled={index === 0}

                              onClick={() =>

                                moveImage(

                                  index,

                                  "up"

                                )

                              }

                            >

                              <Icon

                                icon="solar:alt-arrow-up-linear"

                                width={16}

                                height={16}

                              />

                            </button>

                            <button

                              type="button"

                              title="Move image down"

                              aria-label="Move image down"

                              disabled={

                                index ===

                                form.images.length -

                                  1

                              }

                              onClick={() =>

                                moveImage(

                                  index,

                                  "down"

                                )

                              }

                            >

                              <Icon

                                icon="solar:alt-arrow-down-linear"

                                width={16}

                                height={16}

                              />

                            </button>

                            <button

                              type="button"

                              className="delete-image-button"

                              title="Remove image"

                              aria-label="Remove image"

                              onClick={() =>

                                removeImage(index)

                              }

                            >

                              <Icon

                                icon="solar:trash-bin-minimalistic-linear"

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

              )}

              {form.images.length > 0 && (

                <div className="image-help">

                  <Icon

                    icon="solar:info-circle-linear"

                    width={16}

                    height={16}

                  />

                  <span>

                    The first image is used as the

                    primary product image. Drag images

                    to reorder them, or use the arrow

                    buttons.

                  </span>

                </div>

              )}

            </div>

          </section>

        </div>

        {/* SIDEBAR */}

        <aside className="form-sidebar">

          {/* VISIBILITY */}

          <section className="form-card">

            <div className="form-card-header">

              <div>

                <h2>Visibility</h2>

                <p>

                  Control how the product appears

                  in your store.

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
          Show in featured products.
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
          Show in trending products.
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

          {/* ACTIONS */}

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

                  <span>Saving...</span>

                </>

              ) : (

                <>

                  <Icon

                    icon="solar:check-circle-linear"

                    width={19}

                    height={19}

                  />

                  <span>Save Changes</span>

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

      <style jsx>{`

        .edit-product-page {

          width: 100%;

          max-width: 1500px;

          margin: 0 auto;

        }

        .edit-product-header {

          margin-bottom: 28px;

        }

        .back-link {

          display: inline-flex;

          align-items: center;

          gap: 7px;

          margin-bottom: 18px;

          color: #777777;

          text-decoration: none;

          font-size: 12px;

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

        .edit-product-header h1 {

          margin: 0;

          color: #111111;

          font-size: 30px;

          font-weight: 600;

          letter-spacing: -0.03em;

        }

        .edit-product-header p {

          margin: 8px 0 0;

          color: #777777;

          font-size: 13px;

        }

        .form-alert {

          min-height: 48px;

          margin-bottom: 20px;

          padding: 12px 15px;

          box-sizing: border-box;

          display: flex;

          align-items: center;

          gap: 10px;

          border-radius: 10px;

          font-size: 13px;

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

          grid-template-columns: minmax(0, 1fr) 330px;

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

          border-radius: 14px;

          box-shadow: 0 5px 20px

            rgba(0, 0, 0, 0.025);

        }

        .form-card-header {

          padding: 20px 22px;

          border-bottom: 1px solid #eeeeee;

        }

        .form-card-header h2 {

          margin: 0;

          color: #151515;

          font-size: 15px;

          font-weight: 600;

        }

        .form-card-header p {

          margin: 5px 0 0;

          color: #888888;

          font-size: 11px;

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

          grid-template-columns: repeat(

            2,

            minmax(0, 1fr)

          );

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

        .form-group label {

          color: #333333;

          font-size: 12px;

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

          border-radius: 9px;

          outline: none;

          background: #ffffff;

          color: #111111;

          font-size: 13px;

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

          box-shadow: 0 0 0 3px

            rgba(0, 0, 0, 0.04);

        }

        .form-group small {

          color: #999999;

          font-size: 10px;

          line-height: 1.4;

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

        /* IMAGE MANAGER */

        .image-header-content {

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

        }

        .image-count {

          flex-shrink: 0;

          min-height: 30px;

          padding: 0 10px;

          display: inline-flex;

          align-items: center;

          gap: 6px;

          border: 1px solid #e5e5e5;

          border-radius: 999px;

          background: #fafafa;

          color: #666666;

          font-size: 10px;

          font-weight: 600;

        }

        .add-image-box {

          padding: 16px;

          border: 1px solid #e8e8e8;

          border-radius: 11px;

          background: #fafafa;

        }

        .add-image-label {

          margin-bottom: 10px;

        }

        .add-image-label label {

          display: block;

          margin-bottom: 4px;

          color: #333333;

          font-size: 12px;

          font-weight: 600;

        }

        .add-image-label small {

          color: #999999;

          font-size: 10px;

        }

        .add-image-row {

          display: grid;

          grid-template-columns: minmax(0, 1fr) auto;

          gap: 9px;

        }

        .image-url-input {

          min-width: 0;

          height: 44px;

          padding: 0 12px;

          display: flex;

          align-items: center;

          gap: 8px;

          border: 1px solid #dddddd;

          border-radius: 8px;

          background: #ffffff;

          color: #888888;

        }

        .image-url-input:focus-within {

          border-color: #999999;

          box-shadow: 0 0 0 3px

            rgba(0, 0, 0, 0.04);

        }

        .image-url-input input {

          width: 100%;

          min-width: 0;

          padding: 0;

          border: none;

          outline: none;

          background: transparent;

          color: #111111;

          font-size: 12px;

        }

        .image-url-input input::placeholder {

          color: #b2b2b2;

        }

        .add-image-button {

          min-height: 44px;

          padding: 0 16px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

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

        .add-image-button:hover {

          background: #292929;

        }

        .add-image-button:active {

          transform: scale(0.98);

        }

        .image-error {

          margin-top: 9px;

          display: flex;

          align-items: center;

          gap: 6px;

          color: #a33a3a;

          font-size: 10px;

        }

        .empty-images {

          min-height: 210px;

          padding: 30px 20px;

          box-sizing: border-box;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          border: 1px dashed #dddddd;

          border-radius: 11px;

          background: #fcfcfc;

        }

        .empty-images-icon {

          width: 58px;

          height: 58px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          background: #f3f3f3;

          color: #888888;

        }

        .empty-images h3 {

          margin: 14px 0 5px;

          color: #333333;

          font-size: 13px;

          font-weight: 600;

        }

        .empty-images p {

          max-width: 330px;

          margin: 0;

          color: #999999;

          font-size: 10px;

          line-height: 1.6;

        }

        .image-grid {

          display: grid;

          grid-template-columns: repeat(

            3,

            minmax(0, 1fr)

          );

          gap: 14px;

        }

        .image-item {

          min-width: 0;

          overflow: hidden;

          border: 1px solid #e5e5e5;

          border-radius: 11px;

          background: #ffffff;

          cursor: grab;

          transition:

            border-color 0.2s ease,

            box-shadow 0.2s ease,

            transform 0.2s ease,

            opacity 0.2s ease;

        }

        .image-item:hover {

          border-color: #cfcfcf;

          box-shadow: 0 8px 24px

            rgba(0, 0, 0, 0.06);

        }

        .image-item:active {

          cursor: grabbing;

        }

        .image-item-dragging {

          opacity: 0.45;

          transform: scale(0.98);

          border-color: #999999;

        }

        .image-preview {

          position: relative;

          width: 100%;

          aspect-ratio: 1 / 1;

          overflow: hidden;

          background: #f4f4f4;

        }

        .image-preview img {

          width: 100%;

          height: 100%;

          display: block;

          object-fit: cover;

        }

        .image-fallback {

          position: absolute;

          inset: 0;

          display: none;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          gap: 7px;

          color: #999999;

          background: #f2f2f2;

          font-size: 9px;

          text-align: center;

        }

        .primary-badge {

          position: absolute;

          top: 9px;

          left: 9px;

          min-height: 25px;

          padding: 0 8px;

          display: inline-flex;

          align-items: center;

          gap: 5px;

          border-radius: 999px;

          background: rgba(17, 17, 17, 0.92);

          color: #ffffff;

          font-size: 9px;

          font-weight: 600;

          box-shadow: 0 4px 10px

            rgba(0, 0, 0, 0.15);

        }

        .drag-handle {

          position: absolute;

          top: 9px;

          right: 9px;

          width: 27px;

          height: 27px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 7px;

          background: rgba(

            255,

            255,

            255,

            0.9

          );

          color: #555555;

          box-shadow: 0 3px 8px

            rgba(0, 0, 0, 0.08);

          pointer-events: none;

        }

        .image-item-footer {

          min-height: 50px;

          padding: 8px 9px;

          box-sizing: border-box;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 8px;

          border-top: 1px solid #eeeeee;

        }

        .image-number {

          min-width: 0;

          display: flex;

          align-items: center;

          gap: 7px;

        }

        .image-number > span:first-child {

          color: #999999;

          font-size: 9px;

          font-weight: 700;

          letter-spacing: 0.05em;

        }

        .image-number > span:last-child {

          overflow: hidden;

          color: #555555;

          font-size: 9px;

          font-weight: 500;

          text-overflow: ellipsis;

          white-space: nowrap;

        }

        .image-actions {

          flex-shrink: 0;

          display: flex;

          align-items: center;

          gap: 3px;

        }

        .image-actions button {

          width: 27px;

          height: 27px;

          padding: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border: 1px solid #e3e3e3;

          border-radius: 6px;

          background: #ffffff;

          color: #555555;

          cursor: pointer;

          transition:

            background 0.2s ease,

            border-color 0.2s ease,

            color 0.2s ease;

        }

        .image-actions button:hover:not(:disabled) {

          border-color: #cfcfcf;

          background: #f7f7f7;

          color: #111111;

        }

        .image-actions button:disabled {

          opacity: 0.3;

          cursor: not-allowed;

        }

        .image-actions .delete-image-button {

          color: #a33a3a;

        }

        .image-actions

          .delete-image-button:hover:not(

            :disabled

          ) {

          border-color: #ebd0d0;

          background: #fff5f5;

          color: #a33a3a;

        }

        .image-help {

          padding: 11px 12px;

          display: flex;

          align-items: flex-start;

          gap: 8px;

          border-radius: 8px;

          background: #f8f8f8;

          color: #888888;

          font-size: 10px;

          line-height: 1.5;

        }

        .image-help svg {

          flex-shrink: 0;

          margin-top: 1px;

        }

        /* VISIBILITY */

        .toggle-row {

          position: relative;

          min-height: 52px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 15px;

          padding-bottom: 16px;

          border-bottom: 1px solid #eeeeee;

          cursor: pointer;

        }

        .toggle-row:last-child {

          padding-bottom: 0;

          border-bottom: none;

        }

        .toggle-row > span:first-child {

          display: flex;

          flex-direction: column;

          gap: 5px;

        }

        .toggle-row strong {

          color: #222222;

          font-size: 12px;

          font-weight: 600;

        }

        .toggle-row small {

          color: #999999;

          font-size: 10px;

          line-height: 1.4;

        }

        .toggle-row input {

          position: absolute;

          opacity: 0;

          pointer-events: none;

        }

        .toggle-switch {

          position: relative;

          width: 40px;

          height: 22px;

          min-width: 40px;

          border-radius: 999px;

          background: #dddddd;

          transition: background 0.2s ease;

        }

        .toggle-switch::after {

          content: "";

          position: absolute;

          top: 3px;

          left: 3px;

          width: 16px;

          height: 16px;

          border-radius: 50%;

          background: #ffffff;

          box-shadow: 0 1px 4px

            rgba(0, 0, 0, 0.15);

          transition: transform 0.2s ease;

        }

        .toggle-row input:checked

          + .toggle-switch {

          background: #111111;

        }

        .toggle-row input:checked

          + .toggle-switch::after {

          transform: translateX(18px);

        }

        /* ACTIONS */

        .form-actions-card {

          padding: 16px;

          display: flex;

          flex-direction: column;

          gap: 10px;

          background: #ffffff;

          border: 1px solid #e8e8e8;

          border-radius: 14px;

          box-shadow: 0 5px 20px

            rgba(0, 0, 0, 0.025);

        }

        .save-product-button,

        .cancel-button {

          width: 100%;

          min-height: 46px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          border-radius: 9px;

          font-size: 12px;

          font-weight: 600;

          text-decoration: none;

          transition:

            background 0.2s ease,

            border-color 0.2s ease,

            opacity 0.2s ease;

        }

        .save-product-button {

          border: 1px solid #111111;

          background: #111111;

          color: #ffffff;

        }

        .save-product-button:hover {

          background: #292929;

        }

        .save-product-button:disabled {

          cursor: not-allowed;

          opacity: 0.6;

        }

        .cancel-button {

          border: 1px solid #dedede;

          background: #ffffff;

          color: #333333;

        }

        .cancel-button:hover {

          background: #f7f7f7;

          border-color: #cfcfcf;

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

        /* TABLET */

        @media (max-width: 1050px) {

          .product-form {

            grid-template-columns: minmax(

                0,

                1fr

              )

              280px;

            gap: 18px;

          }

          .image-grid {

            grid-template-columns: repeat(

              2,

              minmax(0, 1fr)

            );

          }

        }

        /* TABLET / MOBILE */

        @media (max-width: 900px) {

          .product-form {

            grid-template-columns: 1fr;

          }

          .form-sidebar {

            position: static;

          }

          .form-actions-card {

            flex-direction: row;

          }

          .save-product-button,

          .cancel-button {

            flex: 1;

          }

        }

        /* MOBILE */

        @media (max-width: 600px) {

          .edit-product-header {

            margin-bottom: 20px;

          }

          .edit-product-header h1 {

            font-size: 25px;

          }

          .edit-product-header p {

            font-size: 12px;

          }

          .form-card-header {

            padding: 17px;

          }

          .form-card-body {

            padding: 17px;

            gap: 17px;

          }

          .form-grid {

            grid-template-columns: 1fr;

            gap: 17px;

          }

          .form-actions-card {

            flex-direction: column;

          }

          .form-alert {

            font-size: 12px;

          }

          .image-header-content {

            align-items: flex-start;

          }

          .image-count {

            font-size: 9px;

          }

          .add-image-box {

            padding: 13px;

          }

          .add-image-row {

            grid-template-columns: 1fr;

          }

          .add-image-button {

            width: 100%;

          }

          .image-grid {

            grid-template-columns: repeat(

              2,

              minmax(0, 1fr)

            );

            gap: 10px;

          }

          .image-item-footer {

            align-items: flex-start;

            flex-direction: column;

          }

          .image-actions {

            width: 100%;

            justify-content: flex-end;

          }

        }

        @media (max-width: 480px) {

          .image-grid {

            grid-template-columns: 1fr 1fr;

          }

          .image-number

            > span:last-child {

            max-width: 70px;

          }

          .image-actions button {

            width: 25px;

            height: 25px;

          }

          .primary-badge {

            top: 6px;

            left: 6px;

            min-height: 23px;

            padding: 0 7px;

          }

          .drag-handle {

            top: 6px;

            right: 6px;

            width: 25px;

            height: 25px;

          }

        }

        @media (max-width: 380px) {

          .edit-product-header h1 {

            font-size: 23px;

          }

          .form-card-header h2 {

            font-size: 14px;

          }

          .form-card-body {

            padding: 14px;

          }

          .form-group input,

          .form-group textarea,

          .form-group select {

            font-size: 12px;

          }

          .image-grid {

            gap: 8px;

          }

          .image-item-footer {

            padding: 7px;

          }

          .image-number > span:last-child {

            font-size: 8px;

            max-width: 55px;

          }

          .image-actions {

            gap: 2px;

          }

          .image-actions button {

            width: 23px;

            height: 23px;

          }

        }

      `}</style>

    </div>

  );

}