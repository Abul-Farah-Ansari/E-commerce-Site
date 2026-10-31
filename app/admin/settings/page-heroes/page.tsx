"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { Icon } from "@iconify/react";

type PageSlug =
  | "products"
  | "sale"
  | "about"
  | "contact";

type HeroForm = {
  desktopImageUrl: string;
  desktopPublicId: string;

  mobileImageUrl: string;
  mobilePublicId: string;

  // Legacy fields
  imageUrl: string;
  publicId: string;

  altText: string;
  eyebrow: string;
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
};

type UploadType = "desktop" | "mobile";

type CloudinarySignature = {
  success: boolean;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

const PAGES: {
  value: PageSlug;
  label: string;
}[] = [
  { value: "products", label: "Products Page" },
  { value: "sale", label: "Sale Page" },
  { value: "about", label: "About Page" },
  { value: "contact", label: "Contact Page" },
];

const EMPTY_FORM: HeroForm = {
  desktopImageUrl: "",
  desktopPublicId: "",

  mobileImageUrl: "",
  mobilePublicId: "",

  imageUrl: "",
  publicId: "",

  altText: "House Of Orive collection",
  eyebrow: "",
  heading: "",
  description: "",
  buttonText: "",
  buttonLink: "",
};

const MAX_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

function normalizeHero(
  hero: Partial<HeroForm> | null
): HeroForm {
  const desktopImageUrl =
    hero?.desktopImageUrl ||
    hero?.imageUrl ||
    "";

  const desktopPublicId =
    hero?.desktopPublicId ||
    hero?.publicId ||
    "";

  return {
    ...EMPTY_FORM,
    ...hero,

    desktopImageUrl,
    desktopPublicId,

    mobileImageUrl:
      hero?.mobileImageUrl || "",

    mobilePublicId:
      hero?.mobilePublicId || "",

    // Keep the old fields synchronized.
    imageUrl: desktopImageUrl,
    publicId: desktopPublicId,

    altText:
      hero?.altText ||
      EMPTY_FORM.altText,
  };
}

export default function PageHeroesAdmin() {
  const [page, setPage] =
    useState<PageSlug>("products");

  const [form, setForm] =
    useState<HeroForm>({ ...EMPTY_FORM });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploadingImage, setUploadingImage] =
    useState<UploadType | null>(null);

  const [resetting, setResetting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /*
  =========================================================
  LOAD PAGE SETTINGS
  =========================================================
  */

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      setMessage("");
      setError("");
      setForm({ ...EMPTY_FORM });

      try {
        const response = await fetch(
          `/api/admin/settings/page-hero?page=${page}`,
          {
            cache: "no-store",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load hero settings."
          );
        }

        if (cancelled) return;

        setForm(normalizeHero(data.hero));
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load settings."
        );

        setForm({ ...EMPTY_FORM });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, [page]);

  /*
  =========================================================
  UPDATE TEXT FIELDS
  =========================================================
  */

  function updateField<K extends keyof HeroForm>(
    field: K,
    value: HeroForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /*
  =========================================================
  UPLOAD IMAGE TO CLOUDINARY
  =========================================================
  */

  async function uploadCloudinaryImage(
    file: File
  ) {
    const signatureResponse = await fetch(
      "/api/admin/settings/page-hero/upload-signature",
      {
        method: "POST",
        credentials: "include",
      }
    );

    const signatureData =
      (await signatureResponse.json()) as CloudinarySignature & {
        message?: string;
      };

    if (
      !signatureResponse.ok ||
      !signatureData.success
    ) {
      throw new Error(
        signatureData.message ||
          "Unable to prepare image upload."
      );
    }

    const uploadData = new FormData();

    uploadData.append("file", file);
    uploadData.append(
      "api_key",
      signatureData.apiKey
    );

    uploadData.append(
      "timestamp",
      String(signatureData.timestamp)
    );

    uploadData.append(
      "folder",
      signatureData.folder
    );

    uploadData.append(
      "signature",
      signatureData.signature
    );

    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
      {
        method: "POST",
        body: uploadData,
      }
    );

    const uploaded = await uploadResponse.json();

    if (
      !uploadResponse.ok ||
      !uploaded.secure_url ||
      !uploaded.public_id
    ) {
      throw new Error(
        uploaded.error?.message ||
          "Cloudinary image upload failed."
      );
    }

    return {
      imageUrl: uploaded.secure_url as string,
      publicId: uploaded.public_id as string,
    };
  }

  /*
  =========================================================
  DESKTOP / MOBILE IMAGE UPLOAD
  =========================================================
  */

  async function handleImageUpload(
    type: UploadType,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setError("");
    setMessage("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(
        "Please select a JPG, PNG, or WebP image."
      );
      return;
    }

    if (file.size > MAX_SIZE) {
      setError(
        "Image size must be 10 MB or less."
      );
      return;
    }

    setUploadingImage(type);

    try {
      const uploaded =
        await uploadCloudinaryImage(file);

      if (type === "desktop") {
        setForm((current) => ({
          ...current,

          desktopImageUrl:
            uploaded.imageUrl,

          desktopPublicId:
            uploaded.publicId,

          // Legacy fields use the desktop image.
          imageUrl:
            uploaded.imageUrl,

          publicId:
            uploaded.publicId,

          altText:
            current.altText ||
            `${page} page hero image`,
        }));
      } else {
        setForm((current) => ({
          ...current,

          mobileImageUrl:
            uploaded.imageUrl,

          mobilePublicId:
            uploaded.publicId,
        }));
      }

      setMessage(
        `${type === "desktop" ? "Desktop" : "Mobile"} image uploaded. Click Save Changes to publish it.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed."
      );
    } finally {
      setUploadingImage(null);
    }
  }

  /*
  =========================================================
  REMOVE DESKTOP IMAGE
  =========================================================
  */

  function removeDesktopImage() {
    setForm((current) => ({
      ...current,

      desktopImageUrl: "",
      desktopPublicId: "",

      // Clear legacy fields too.
      imageUrl: "",
      publicId: "",
    }));

    setMessage("");
    setError("");
  }

  /*
  =========================================================
  REMOVE MOBILE IMAGE
  =========================================================
  */

  function removeMobileImage() {
    setForm((current) => ({
      ...current,

      mobileImageUrl: "",
      mobilePublicId: "",
    }));

    setMessage("");
    setError("");
  }

  /*
  =========================================================
  SAVE SETTINGS
  =========================================================
  */

  async function handleSave(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      Boolean(form.desktopImageUrl) !==
      Boolean(form.desktopPublicId)
    ) {
      setError(
        "Desktop image URL and public ID are incomplete."
      );
      return;
    }

    if (
      Boolean(form.mobileImageUrl) !==
      Boolean(form.mobilePublicId)
    ) {
      setError(
        "Mobile image URL and public ID are incomplete."
      );
      return;
    }

    if (
      Boolean(form.buttonText.trim()) &&
      !form.buttonLink.trim()
    ) {
      setError(
        "Please provide a link for the hero button."
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "/api/admin/settings/page-hero",
        {
          method: "PUT",

          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            page,

            desktopImageUrl:
              form.desktopImageUrl,

            desktopPublicId:
              form.desktopPublicId,

            mobileImageUrl:
              form.mobileImageUrl,

            mobilePublicId:
              form.mobilePublicId,

            // Legacy fields.
            imageUrl:
              form.desktopImageUrl,

            publicId:
              form.desktopPublicId,

            altText: form.altText,
            eyebrow: form.eyebrow,
            heading: form.heading,
            description: form.description,
            buttonText: form.buttonText,
            buttonLink: form.buttonLink,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to save hero settings."
        );
      }

      setForm(normalizeHero(data.hero));

      setMessage(
        "Hero settings saved successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
  =========================================================
  RESET SETTINGS
  =========================================================
  */

  async function handleReset() {
    const confirmed = window.confirm(
      `Reset the ${page} hero settings? This will delete its saved desktop and mobile hero images and hero content.`
    );

    if (!confirmed) return;

    setResetting(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/settings/page-hero?page=${page}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to reset hero settings."
        );
      }

      setForm({ ...EMPTY_FORM });

      setMessage(
        "Page hero settings reset successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reset settings."
      );
    } finally {
      setResetting(false);
    }
  }

  /*
  =========================================================
  CSS CLASSES
  =========================================================
  */

  const inputClass =
    "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

  const selectedPageLabel =
    PAGES.find(
      (item) => item.value === page
    )?.label || "Page";

  const isBusy =
    saving ||
    resetting ||
    uploadingImage !== null;

  /*
  =========================================================
  RENDER
  =========================================================
  */

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-8">
      <div className="mx-auto max-w-6xl">

        {/* PAGE HEADER */}

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">
            House Of Orive · Administration
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Page Hero Settings
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            Manage separate desktop and mobile hero images
            and content for your Products, Sale, About
            and Contact pages.
          </p>
        </div>

        {/* PAGE SELECTOR */}

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
            onChange={(event) =>
              setPage(
                event.target.value as PageSlug
              )
            }
            className={`${inputClass} mt-1 max-w-md`}
            disabled={isBusy}
          >
            {PAGES.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* SUCCESS */}

        {message && (
          <div
            role="status"
            className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            <Icon
              icon="mdi:check-circle-outline"
              width={20}
            />

            {message}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <Icon
              icon="mdi:alert-circle-outline"
              width={20}
            />

            {error}
          </div>
        )}

        {/* LOADING */}

        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">
            Loading {selectedPageLabel} settings...
          </div>
        ) : (
          <form onSubmit={handleSave}>

            <div className="grid gap-6 lg:grid-cols-2">

              {/* IMAGE MANAGEMENT */}

              <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">

                <h2 className="text-lg font-semibold">
                  Responsive Hero Images
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Upload one landscape image for desktop
                  and one portrait image for mobile.
                </p>

                {/* DESKTOP IMAGE */}

                <div className="mt-6">

                  <div className="mb-3 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <Icon
                        icon="mdi:monitor"
                        width={20}
                      />

                      Desktop Image
                    </label>

                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                      1920 × 1080
                    </span>
                  </div>

                  <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                    {form.desktopImageUrl ? (
                      <img
                        src={form.desktopImageUrl}
                        alt={`${form.altText} desktop`}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Icon
                          icon="mdi:image-outline"
                          width={40}
                        />

                        <span className="mt-2 text-sm">
                          No desktop image
                        </span>
                      </div>
                    )}
                  </div>

                  <label className="mt-4 block text-sm font-semibold">
                    Upload desktop image

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        handleImageUpload(
                          "desktop",
                          event
                        )
                      }
                      disabled={isBusy}
                      className="mt-2 block w-full cursor-pointer rounded-lg border border-gray-300 p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-medium"
                    />
                  </label>

                  {uploadingImage === "desktop" && (
                    <p className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                      <Icon
                        icon="mdi:loading"
                        className="animate-spin"
                        width={16}
                      />
                      Uploading desktop image...
                    </p>
                  )}

                  {form.desktopImageUrl && (
                    <button
                      type="button"
                      onClick={removeDesktopImage}
                      disabled={isBusy}
                      className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      <Icon
                        icon="mdi:delete-outline"
                        className="mr-1 inline"
                        width={17}
                      />

                      Remove desktop image
                    </button>
                  )}

                </div>

                {/* DIVIDER */}

                <div className="my-7 border-t border-gray-200" />

                {/* MOBILE IMAGE */}

                <div>

                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-sm font-semibold">
                      <Icon
                        icon="mdi:cellphone"
                        width={20}
                      />

                      Mobile Image
                    </label>

                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                      1080 × 1440
                    </span>
                  </div>

                  <div className="flex min-h-[250px] items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 p-3">
                    {form.mobileImageUrl ? (
                      <img
                        src={form.mobileImageUrl}
                        alt={`${form.altText} mobile`}
                        className="max-h-[380px] w-auto max-w-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Icon
                          icon="mdi:cellphone"
                          width={40}
                        />

                        <span className="mt-2 text-sm">
                          No mobile image uploaded
                        </span>

                        <span className="mt-1 text-xs">
                          Desktop image will be used instead
                        </span>
                      </div>
                    )}
                  </div>

                  <label className="mt-4 block text-sm font-semibold">
                    Upload mobile image

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        handleImageUpload(
                          "mobile",
                          event
                        )
                      }
                      disabled={isBusy}
                      className="mt-2 block w-full cursor-pointer rounded-lg border border-gray-300 p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-medium"
                    />
                  </label>

                  {uploadingImage === "mobile" && (
                    <p className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                      <Icon
                        icon="mdi:loading"
                        className="animate-spin"
                        width={16}
                      />

                      Uploading mobile image...
                    </p>
                  )}

                  {form.mobileImageUrl && (
                    <button
                      type="button"
                      onClick={removeMobileImage}
                      disabled={isBusy}
                      className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      <Icon
                        icon="mdi:delete-outline"
                        className="mr-1 inline"
                        width={17}
                      />

                      Remove mobile image
                    </button>
                  )}

                </div>

                {/* IMAGE RULES */}

                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                  <div className="flex items-start gap-2">
                    <Icon
                      icon="mdi:information-outline"
                      width={19}
                      className="mt-0.5 shrink-0 text-gray-600"
                    />

                    <p className="text-xs leading-5 text-gray-500">
                      JPG, PNG or WebP. Maximum 10 MB
                      per image. Desktop and mobile images
                      are uploaded separately. If you do
                      not upload a mobile image, the desktop
                      image will be used on mobile screens.
                    </p>
                  </div>
                </div>

                {/* ALT TEXT */}

                <label className="mt-6 block text-sm font-semibold">
                  Image alternative text

                  <input
                    value={form.altText}
                    onChange={(event) =>
                      updateField(
                        "altText",
                        event.target.value
                      )
                    }
                    maxLength={200}
                    disabled={isBusy}
                    className={inputClass}
                    placeholder="Describe the hero image"
                  />
                </label>

              </section>

              {/* HERO CONTENT */}

              <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">

                <h2 className="text-lg font-semibold">
                  Hero Content
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Customize the text displayed over
                  the hero images.
                </p>

                {/* EYEBROW */}

                <label className="mt-5 block text-sm font-semibold">
                  Eyebrow / Small label

                  <input
                    value={form.eyebrow}
                    onChange={(event) =>
                      updateField(
                        "eyebrow",
                        event.target.value
                      )
                    }
                    maxLength={100}
                    disabled={isBusy}
                    className={inputClass}
                    placeholder="HOUSE OF ORIVE"
                  />
                </label>

                {/* HEADING */}

                <label className="mt-5 block text-sm font-semibold">
                  Main heading

                  <input
                    value={form.heading}
                    onChange={(event) =>
                      updateField(
                        "heading",
                        event.target.value
                      )
                    }
                    maxLength={150}
                    disabled={isBusy}
                    className={inputClass}
                    placeholder="Enter hero heading"
                  />
                </label>

                {/* DESCRIPTION */}

                <label className="mt-5 block text-sm font-semibold">
                  Description

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        "description",
                        event.target.value
                      )
                    }
                    maxLength={500}
                    rows={5}
                    disabled={isBusy}
                    className={inputClass}
                    placeholder="Write the hero description"
                  />
                </label>

                {/* BUTTON */}

                <div className="mt-6 border-t border-gray-200 pt-5">
                  <h3 className="text-sm font-semibold">
                    Optional Hero Button
                  </h3>

                  <label className="mt-4 block text-sm font-medium">
                    Button text

                    <input
                      value={form.buttonText}
                      onChange={(event) =>
                        updateField(
                          "buttonText",
                          event.target.value
                        )
                      }
                      maxLength={80}
                      disabled={isBusy}
                      className={inputClass}
                      placeholder="Explore Collection"
                    />
                  </label>

                  <label className="mt-4 block text-sm font-medium">
                    Button link

                    <input
                      value={form.buttonLink}
                      onChange={(event) =>
                        updateField(
                          "buttonLink",
                          event.target.value
                        )
                      }
                      maxLength={300}
                      disabled={isBusy}
                      className={inputClass}
                      placeholder="/products"
                    />
                  </label>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Example links: /products, /sale
                    or a full HTTPS URL.
                  </p>
                </div>

              </section>

            </div>

            {/* ACTION BUTTONS */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">

              <button
                type="button"
                onClick={handleReset}
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon
                  icon="solar:restart-linear"
                  width={18}
                />

                {resetting
                  ? "Resetting..."
                  : "Reset Page Settings"}
              </button>

              <button
                type="submit"
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon
                  icon="solar:diskette-linear"
                  width={18}
                />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          </form>
        )}

      </div>
    </main>
  );
}