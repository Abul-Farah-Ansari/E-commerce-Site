
"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Icon } from "@iconify/react";

type PageSlug = "products" | "sale" | "about" | "contact";

type HeroForm = {
  imageUrl: string;
  publicId: string;
  altText: string;
  eyebrow: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
};

const PAGES: { value: PageSlug; label: string }[] = [
  { value: "products", label: "Products Page" },
  { value: "sale", label: "Sale Page" },
  { value: "about", label: "About Page" },
  { value: "contact", label: "Contact Page" },
];

const EMPTY_FORM: HeroForm = {
  imageUrl: "",
  publicId: "",
  altText: "House Of Orive collection",
  eyebrow: "",
  heading: "",
  description: "",
  buttonText: "",
  buttonLink: "",
};

export default function PageHeroesAdmin() {
  const [page, setPage] = useState<PageSlug>("products");
  const [form, setForm] = useState<HeroForm>({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSettings(selectedPage: PageSlug) {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/settings/page-hero?page=${selectedPage}`,
        { cache: "no-store" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load hero settings.");
      }

      setForm({
        ...EMPTY_FORM,
        ...(data.hero || {}),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load settings."
      );
      setForm({ ...EMPTY_FORM });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings(page);
  }, [page]);

  function updateField<K extends keyof HeroForm>(
    field: K,
    value: HeroForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be 10 MB or less.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const signatureResponse = await fetch(
        "/api/admin/settings/page-hero/upload-signature",
        { method: "POST" }
      );

      const signatureData = await signatureResponse.json();

      if (!signatureResponse.ok || !signatureData.success) {
        throw new Error(
          signatureData.message || "Unable to prepare image upload."
        );
      }

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", signatureData.apiKey);
      uploadData.append("timestamp", String(signatureData.timestamp));
      uploadData.append("folder", signatureData.folder);
      uploadData.append("signature", signatureData.signature);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        }
      );

      const uploaded = await uploadResponse.json();

      if (!uploadResponse.ok || !uploaded.secure_url || !uploaded.public_id) {
        throw new Error(
          uploaded.error?.message || "Cloudinary image upload failed."
        );
      }

      setForm((current) => ({
        ...current,
        imageUrl: uploaded.secure_url,
        publicId: uploaded.public_id,
        altText:
          current.altText || `${page} page hero image`,
      }));

      setMessage("Image uploaded. Click Save Changes to publish it.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Image upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/settings/page-hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, ...form }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save hero settings.");
      }

      setMessage("Hero settings saved successfully.");
      setForm({ ...EMPTY_FORM, ...(data.hero || {}) });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    const confirmed = window.confirm(
      `Reset the ${page} hero settings? This will remove its saved configuration and uploaded hero image.`
    );

    if (!confirmed) return;

    setResetting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/settings/page-hero?page=${page}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to reset hero settings.");
      }

      setForm({ ...EMPTY_FORM });
      setMessage(
        "Saved settings reset. The page will use its built-in defaults once connected."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reset settings."
      );
    } finally {
      setResetting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  const selectedPageLabel =
    PAGES.find((item) => item.value === page)?.label || "Page";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
            House Of Orive · Administration
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Page Hero Settings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            Manage the hero image, heading and content for your Products,
            Sale, About and Contact pages. Homepage carousel settings are
            managed separately.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <label
            htmlFor="hero-page"
            className="block text-sm font-semibold"
          >
            Select page to edit
          </label>

          <select
            id="hero-page"
            value={page}
            onChange={(event) => setPage(event.target.value as PageSlug)}
            className={`${inputClass} mt-1 max-w-md`}
            disabled={saving || uploading || resetting}
          >
            {PAGES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
            Loading {selectedPageLabel} settings...
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-semibold">Hero Image</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Upload a wide image for the selected page.
                </p>

                <div className="mt-5 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                  {form.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.imageUrl}
                      alt={form.altText || "Hero preview"}
                      className="h-64 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-64 flex-col items-center justify-center gap-3 text-gray-400">
                      <Icon icon="solar:gallery-add-linear" width={42} />
                      <p className="text-sm">No custom image uploaded</p>
                    </div>
                  )}
                </div>

                <label className="mt-5 block text-sm font-semibold">
                  Upload image
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading || saving || resetting}
                  className="mt-2 block w-full cursor-pointer rounded-lg border border-gray-300 p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-medium"
                />

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Maximum size: 10 MB. Use a high-resolution landscape
                  image for the best result.
                </p>

                {uploading && (
                  <p className="mt-3 text-sm text-gray-600">
                    Uploading image to Cloudinary...
                  </p>
                )}

                <label className="mt-5 block text-sm font-semibold">
                  Image alt text
                  <input
                    value={form.altText}
                    onChange={(event) =>
                      updateField("altText", event.target.value)
                    }
                    maxLength={200}
                    className={inputClass}
                    placeholder="Describe the hero image"
                  />
                </label>

                {form.imageUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        imageUrl: "",
                        publicId: "",
                      }))
                    }
                    className="mt-4 text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Remove image from this draft
                  </button>
                )}

                <p className="mt-4 break-all text-xs text-gray-400">
                  {form.imageUrl ? "Image URL: " + form.imageUrl : ""}
                </p>
              </section>

              <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-semibold">Hero Content</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Customize the text displayed over your hero image.
                </p>

                <label className="mt-5 block text-sm font-semibold">
                  Eyebrow / Small label
                  <input
                    value={form.eyebrow}
                    onChange={(event) =>
                      updateField("eyebrow", event.target.value)
                    }
                    maxLength={100}
                    className={inputClass}
                    placeholder="HOUSE OF ORIVE"
                  />
                </label>

                <label className="mt-5 block text-sm font-semibold">
                  Main heading
                  <input
                    value={form.heading}
                    onChange={(event) =>
                      updateField("heading", event.target.value)
                    }
                    maxLength={150}
                    className={inputClass}
                    placeholder="Enter hero heading"
                  />
                </label>

                <label className="mt-5 block text-sm font-semibold">
                  Description
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    maxLength={500}
                    rows={5}
                    className={inputClass}
                    placeholder="Write the hero description"
                  />
                </label>

                <div className="mt-6 border-t border-gray-200 pt-5">
                  <h3 className="text-sm font-semibold">
                    Optional Hero Button
                  </h3>

                  <label className="mt-4 block text-sm font-medium">
                    Button text
                    <input
                      value={form.buttonText}
                      onChange={(event) =>
                        updateField("buttonText", event.target.value)
                      }
                      maxLength={80}
                      className={inputClass}
                      placeholder="Explore Collection"
                    />
                  </label>

                  <label className="mt-4 block text-sm font-medium">
                    Button link
                    <input
                      value={form.buttonLink}
                      onChange={(event) =>
                        updateField("buttonLink", event.target.value)
                      }
                      maxLength={300}
                      className={inputClass}
                      placeholder="/products"
                    />
                  </label>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Example links: /products, /sale or a full HTTPS URL.
                    The storefront must be connected to display this button.
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting || saving || uploading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon icon="solar:restart-linear" width={18} />
                {resetting ? "Resetting..." : "Reset Page Settings"}
              </button>

              <button
                type="submit"
                disabled={saving || uploading || resetting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon icon="solar:diskette-linear" width={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
