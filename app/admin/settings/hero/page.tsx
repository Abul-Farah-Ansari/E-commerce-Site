"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

type HeroImage = {
  desktopImageUrl?: string;
  desktopPublicId?: string;
  mobileImageUrl?: string;
  mobilePublicId?: string;

  // Legacy fields
  imageUrl?: string;
  publicId?: string;

  altText: string;
  sortOrder?: number;
};

type DraftSlide = {
  id: number;
  desktopFile: File | null;
  mobileFile: File | null;
  desktopPreview: string;
  mobilePreview: string;
  altText: string;
};

type PreviewImage = {
  url: string;
  altText: string;
  label: string;
};

type UploadSignature = {
  success: boolean;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

type UploadedCloudinaryImage = {
  imageUrl: string;
  publicId: string;
};

const MAX_SIZE = 10 * 1024 * 1024;
const MAX_IMAGES = 10;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const DEFAULT_ALT = "House of Orive fashion collection";

let draftIdCounter = 0;

function createDraftSlide(): DraftSlide {
  draftIdCounter += 1;

  return {
    id: draftIdCounter,
    desktopFile: null,
    mobileFile: null,
    desktopPreview: "",
    mobilePreview: "",
    altText: DEFAULT_ALT,
  };
}

function getDesktopUrl(image: HeroImage) {
  return image.desktopImageUrl || image.imageUrl || "";
}

function getDesktopPublicId(image: HeroImage) {
  return image.desktopPublicId || image.publicId || "";
}

export default function HeroImageAdminPage() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [draftSlides, setDraftSlides] = useState<DraftSlide[]>([
    createDraftSlide(),
  ]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(
    null
  );

  const [previewImage, setPreviewImage] =
    useState<PreviewImage | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const previewUrlsRef = useRef<Set<string>>(new Set());

  // Release preview URLs when the page unmounts.
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      previewUrlsRef.current.clear();
    };
  }, []);

  /*
  =========================================================
  API HELPER
  =========================================================
  */

  const api = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...(options.body instanceof FormData
            ? {}
            : { "Content-Type": "application/json" }),
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "The request failed.");
      }

      return data;
    },
    []
  );

  /*
  =========================================================
  LOAD SAVED HERO IMAGES
  =========================================================
  */

  const loadHero = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api("/api/admin/settings/hero");

      const savedImages: HeroImage[] = Array.isArray(
        data.hero?.images
      )
        ? data.hero.images
        : [];

      setImages(savedImages);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load hero images."
      );
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void loadHero();
  }, [loadHero]);

  /*
  =========================================================
  IMAGE VALIDATION
  =========================================================
  */

  function validateFile(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG, and WebP images are supported.");
      return false;
    }

    if (file.size > MAX_SIZE) {
      setError(`"${file.name}" exceeds the 10 MB size limit.`);
      return false;
    }

    return true;
  }

  /*
  =========================================================
  UPDATE DESKTOP OR MOBILE FILE
  =========================================================
  */

  function handleFileChange(
    slideId: number,
    type: "desktop" | "mobile",
    file: File | null
  ) {
    setError("");
    setMessage("");

    if (!file) return;

    if (!validateFile(file)) return;

    const previewUrl = URL.createObjectURL(file);
    previewUrlsRef.current.add(previewUrl);

    setDraftSlides((current) =>
      current.map((slide) =>
        slide.id === slideId
          ? type === "desktop"
            ? {
                ...slide,
                desktopFile: file,
                desktopPreview: previewUrl,
              }
            : {
                ...slide,
                mobileFile: file,
                mobilePreview: previewUrl,
              }
          : slide
      )
    );
  }

  /*
  =========================================================
  UPDATE ALT TEXT
  =========================================================
  */

  function updateAltText(
    slideId: number,
    value: string
  ) {
    setDraftSlides((current) =>
      current.map((slide) =>
        slide.id === slideId
          ? {
              ...slide,
              altText: value,
            }
          : slide
      )
    );
  }

  /*
  =========================================================
  ADD / REMOVE SLIDES
  =========================================================
  */

  function addSlide() {
    if (draftSlides.length >= MAX_IMAGES) {
      setError(`You can add a maximum of ${MAX_IMAGES} slides.`);
      return;
    }

    setError("");
    setMessage("");

    setDraftSlides((current) => [
      ...current,
      createDraftSlide(),
    ]);
  }

  function removeDraftSlide(slideId: number) {
    setDraftSlides((current) => {
      const slide = current.find(
        (item) => item.id === slideId
      );

      if (slide?.desktopPreview) {
        URL.revokeObjectURL(slide.desktopPreview);
        previewUrlsRef.current.delete(slide.desktopPreview);
      }

      if (slide?.mobilePreview) {
        URL.revokeObjectURL(slide.mobilePreview);
        previewUrlsRef.current.delete(slide.mobilePreview);
      }

      return current.filter(
        (item) => item.id !== slideId
      );
    });

    setError("");
  }

  /*
  =========================================================
  CLEAR DRAFT SLIDES
  =========================================================
  */

  function clearDraftSlides() {
    draftSlides.forEach((slide) => {
      if (slide.desktopPreview) {
        URL.revokeObjectURL(slide.desktopPreview);
        previewUrlsRef.current.delete(slide.desktopPreview);
      }

      if (slide.mobilePreview) {
        URL.revokeObjectURL(slide.mobilePreview);
        previewUrlsRef.current.delete(slide.mobilePreview);
      }
    });

    setDraftSlides([createDraftSlide()]);

    setError("");
    setMessage("");
  }

  /*
  =========================================================
  CLOUDINARY UPLOAD
  =========================================================
  */

  async function uploadCloudinaryImage(
    file: File
  ): Promise<UploadedCloudinaryImage> {
    const signature = (await api(
      "/api/admin/settings/hero/upload-signature",
      {
        method: "POST",
      }
    )) as UploadSignature;

    const formData = new FormData();

    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append(
      "timestamp",
      String(signature.timestamp)
    );
    formData.append("folder", signature.folder);
    formData.append("signature", signature.signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const uploaded = await response.json();

    if (
      !response.ok ||
      !uploaded.secure_url ||
      !uploaded.public_id
    ) {
      throw new Error(
        uploaded.error?.message ||
          `Upload failed for "${file.name}".`
      );
    }

    return {
      imageUrl: uploaded.secure_url,
      publicId: uploaded.public_id,
    };
  }

  /*
  =========================================================
  UPLOAD COMPLETE CAROUSEL
  =========================================================
  */

  async function uploadHero() {
    if (draftSlides.length === 0) {
      setError("Please add at least one slide.");
      return;
    }

    const incompleteSlide = draftSlides.find(
      (slide) => !slide.desktopFile
    );

    if (incompleteSlide) {
      setError(
        "Every slide must have a desktop image. Mobile images are optional."
      );
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const uploadedImages: HeroImage[] = [];

      for (
        let index = 0;
        index < draftSlides.length;
        index++
      ) {
        const slide = draftSlides[index];

        if (!slide.desktopFile) {
          throw new Error(
            `Desktop image is missing for slide ${index + 1}.`
          );
        }

        // Upload desktop image.
        const desktop = await uploadCloudinaryImage(
          slide.desktopFile
        );

        // Upload mobile image only when provided.
        const mobile = slide.mobileFile
          ? await uploadCloudinaryImage(
              slide.mobileFile
            )
          : null;

        uploadedImages.push({
          desktopImageUrl: desktop.imageUrl,
          desktopPublicId: desktop.publicId,

          mobileImageUrl: mobile?.imageUrl,
          mobilePublicId: mobile?.publicId,

          // Legacy fields remain synchronized.
          imageUrl: desktop.imageUrl,
          publicId: desktop.publicId,

          altText:
            slide.altText.trim() || DEFAULT_ALT,

          sortOrder: index,
        });
      }

      await api("/api/admin/settings/hero", {
        method: "PUT",
        body: JSON.stringify({
          images: uploadedImages,
        }),
      });

      clearDraftSlides();

      await loadHero();

      setMessage(
        `${uploadedImages.length} slide${uploadedImages.length === 1 ? "" : "s"} saved successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to upload hero images."
      );
    } finally {
      setUploading(false);
    }
  }

  /*
  =========================================================
  DELETE SINGLE SAVED SLIDE
  =========================================================
  */

  async function deleteSingleImage(image: HeroImage) {
    const desktopId = getDesktopPublicId(image);

    const confirmed = window.confirm(
      `Delete this hero slide? Both desktop and mobile images will be removed.`
    );

    if (!confirmed) return;

    if (!desktopId) {
      setError("This slide has no valid desktop image ID.");
      return;
    }

    setDeletingImageId(desktopId);
    setError("");
    setMessage("");

    try {
      const remainingImages = images
        .filter(
          (item) =>
            getDesktopPublicId(item) !== desktopId
        )
        .map((item, index) => ({
          ...item,
          sortOrder: index,
        }));

      if (remainingImages.length === 0) {
        await api("/api/admin/settings/hero", {
          method: "DELETE",
        });
      } else {
        await api("/api/admin/settings/hero", {
          method: "PUT",
          body: JSON.stringify({
            images: remainingImages,
          }),
        });
      }

      setPreviewImage(null);

      await loadHero();

      setMessage("Hero slide deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete this slide."
      );
    } finally {
      setDeletingImageId(null);
    }
  }

  /*
  =========================================================
  DELETE ENTIRE CAROUSEL
  =========================================================
  */

  async function deleteHero() {
    const confirmed = window.confirm(
      "Delete all custom hero slides and their desktop/mobile images?"
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      const data = await api(
        "/api/admin/settings/hero",
        {
          method: "DELETE",
        }
      );

      setImages([]);
      setPreviewImage(null);

      setMessage(
        data.message || "Hero carousel deleted successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete hero carousel."
      );
    } finally {
      setDeleting(false);
    }
  }

  /*
  =========================================================
  PREVIEW MODAL
  =========================================================
  */

  useEffect(() => {
    if (!previewImage) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [previewImage]);

  const isBusy =
    uploading ||
    deleting ||
    deletingImageId !== null;

  /*
  =========================================================
  RENDER
  =========================================================
  */

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-6 text-[#202020] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Icon icon="mdi:cog-outline" width={17} />

            <Link
              href="/admin/settings"
              className="hover:text-black"
            >
              Settings
            </Link>

            <Icon icon="mdi:chevron-right" width={15} />

            <span className="text-black">
              Hero Carousel
            </span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Homepage Hero Carousel
              </h1>

              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Upload separate desktop and mobile images for
                each homepage hero slide.
              </p>
            </div>

            <Link
              href="/admin/settings"
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-gray-100"
            >
              <Icon icon="mdi:arrow-left" width={18} />
              Back to Settings
            </Link>
          </div>
        </div>

        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <Icon
              icon="mdi:check-circle-outline"
              width={20}
            />
            <span>{message}</span>
          </div>
        )}

        {/* ERROR MESSAGE */}

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <Icon
              icon="mdi:alert-circle-outline"
              width={20}
            />
            <span>{error}</span>
          </div>
        )}

        {/* LAYOUT */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">

          {/* SAVED CAROUSEL */}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="font-semibold">
                  Saved Carousel
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  {images.length} saved slide
                  {images.length === 1 ? "" : "s"}
                </p>
              </div>

              <Icon
                icon="mdi:image-multiple-outline"
                width={23}
              />
            </div>

            <div className="space-y-5 p-4 sm:p-5">
              {loading ? (
                <div className="flex aspect-video items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500">
                  Loading hero images...
                </div>
              ) : images.length > 0 ? (
                images.map((image, index) => {
                  const desktopUrl = getDesktopUrl(image);
                  const mobileUrl = image.mobileImageUrl;

                  const desktopId = getDesktopPublicId(image);

                  return (
                    <div
                      key={desktopId || index}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="rounded-md bg-black px-2.5 py-1 text-xs font-medium text-white">
                          Slide {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            void deleteSingleImage(image)
                          }
                          disabled={isBusy}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Icon
                            icon="mdi:delete-outline"
                            width={17}
                          />
                          {deletingImageId === desktopId
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        {/* DESKTOP PREVIEW */}

                        <div>
                          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-600">
                            <Icon
                              icon="mdi:monitor"
                              width={17}
                            />
                            Desktop image
                          </div>

                          {desktopUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  url: desktopUrl,
                                  altText: image.altText,
                                  label: "Desktop image",
                                })
                              }
                              className="block w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                            >
                              <img
                                src={desktopUrl}
                                alt={image.altText}
                                className="aspect-video w-full object-contain"
                              />
                            </button>
                          ) : (
                            <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                              No desktop image
                            </div>
                          )}
                        </div>

                        {/* MOBILE PREVIEW */}

                        <div>
                          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-600">
                            <Icon
                              icon="mdi:cellphone"
                              width={17}
                            />
                            Mobile image
                          </div>

                          {mobileUrl ? (
                            <button
                              type="button"
                              onClick={() =>
                                setPreviewImage({
                                  url: mobileUrl,
                                  altText: image.altText,
                                  label: "Mobile image",
                                })
                              }
                              className="flex min-h-[150px] w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                            >
                              <img
                                src={mobileUrl}
                                alt={`${image.altText} mobile`}
                                className="max-h-[220px] w-auto max-w-full object-contain"
                              />
                            </button>
                          ) : (
                            <div className="flex min-h-[150px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-center text-xs text-gray-400">
                              <span>
                                <Icon
                                  icon="mdi:cellphone-off"
                                  width={23}
                                  className="mx-auto mb-2"
                                />
                                No mobile image
                                <br />
                                Desktop image will be used
                              </span>
                            </div>
                          )}
                        </div>

                      </div>

                      <p className="mt-3 text-xs text-gray-500">
                        {image.altText || DEFAULT_ALT}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                  <Icon
                    icon="mdi:image-off-outline"
                    width={36}
                  />
                  <p className="mt-3 text-sm font-medium">
                    No custom hero slides saved
                  </p>
                  <p className="mt-1 text-xs">
                    Add your first slide using the upload panel.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 px-5 py-4 text-xs leading-5 text-gray-500">
              Desktop and mobile images are stored separately.
              If a mobile image is not supplied, the desktop
              image will be used on mobile screens.
            </div>
          </section>

          {/* UPLOAD PANEL */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <h2 className="font-semibold">
              Create New Carousel
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Add up to {MAX_IMAGES} slides. Each slide needs
              a desktop image. A mobile image is optional.
            </p>

            {/* DRAFT SLIDES */}

            <div className="mt-6 space-y-5">

              {draftSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      Slide {index + 1}
                    </h3>

                    {draftSlides.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeDraftSlide(slide.id)
                        }
                        disabled={uploading}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
                      >
                        <Icon
                          icon="mdi:trash-can-outline"
                          width={16}
                        />
                        Remove slide
                      </button>
                    )}
                  </div>

                  {/* DESKTOP UPLOAD */}

                  <div className="mb-5">
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Icon
                        icon="mdi:monitor"
                        width={18}
                      />
                      Desktop image
                      <span className="text-red-500">*</span>
                    </label>

                    <label className="flex min-h-[130px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-gray-500 hover:bg-gray-100">
                      {slide.desktopPreview ? (
                        <img
                          src={slide.desktopPreview}
                          alt={`Desktop preview ${index + 1}`}
                          className="max-h-[200px] w-full object-contain"
                        />
                      ) : (
                        <>
                          <Icon
                            icon="mdi:monitor-arrow-up"
                            width={30}
                            className="text-gray-400"
                          />
                          <span className="mt-2 text-xs font-semibold text-gray-700">
                            Choose desktop image
                          </span>
                          <span className="mt-1 text-[11px] text-gray-400">
                            Landscape image recommended
                          </span>
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={uploading}
                        onChange={(event) =>
                          handleFileChange(
                            slide.id,
                            "desktop",
                            event.target.files?.[0] || null
                          )
                        }
                      />
                    </label>

                    {slide.desktopFile && (
                      <p className="mt-2 truncate text-xs text-gray-500">
                        {slide.desktopFile.name}
                      </p>
                    )}
                  </div>

                  {/* MOBILE UPLOAD */}

                  <div className="mb-5">
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <Icon
                        icon="mdi:cellphone"
                        width={18}
                      />
                      Mobile image
                      <span className="text-xs font-normal text-gray-400">
                        (Optional)
                      </span>
                    </label>

                    <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-gray-500 hover:bg-gray-100">
                      {slide.mobilePreview ? (
                        <img
                          src={slide.mobilePreview}
                          alt={`Mobile preview ${index + 1}`}
                          className="max-h-[210px] w-auto max-w-full object-contain"
                        />
                      ) : (
                        <>
                          <Icon
                            icon="mdi:cellphone-arrow-down"
                            width={30}
                            className="text-gray-400"
                          />
                          <span className="mt-2 text-xs font-semibold text-gray-700">
                            Choose mobile image
                          </span>
                          <span className="mt-1 text-[11px] text-gray-400">
                            Portrait image recommended
                          </span>
                        </>
                      )}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={uploading}
                        onChange={(event) =>
                          handleFileChange(
                            slide.id,
                            "mobile",
                            event.target.files?.[0] || null
                          )
                        }
                      />
                    </label>

                    {slide.mobileFile && (
                      <p className="mt-2 truncate text-xs text-gray-500">
                        {slide.mobileFile.name}
                      </p>
                    )}
                  </div>

                  {/* ALT TEXT */}

                  <div>
                    <label
                      htmlFor={`hero-alt-${slide.id}`}
                      className="mb-2 block text-sm font-medium"
                    >
                      Image alternative text
                    </label>

                    <input
                      id={`hero-alt-${slide.id}`}
                      type="text"
                      maxLength={200}
                      value={slide.altText}
                      onChange={(event) =>
                        updateAltText(
                          slide.id,
                          event.target.value
                        )
                      }
                      placeholder={DEFAULT_ALT}
                      disabled={uploading}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-black"
                    />
                  </div>
                </div>
              ))}

            </div>

            {/* ADD SLIDE */}

            <button
              type="button"
              onClick={addSlide}
              disabled={
                uploading ||
                draftSlides.length >= MAX_IMAGES
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-400 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:border-black hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon
                icon="mdi:plus-circle-outline"
                width={19}
              />
              Add another slide
            </button>

            <p className="mt-2 text-center text-xs text-gray-400">
              {draftSlides.length} of {MAX_IMAGES} slides added
            </p>

            {/* CLEAR DRAFT */}

            <button
              type="button"
              onClick={clearDraftSlides}
              disabled={uploading}
              className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Clear selected slides
            </button>

            {/* SAVE */}

            <button
              type="button"
              onClick={uploadHero}
              disabled={
                uploading ||
                deleting ||
                loading ||
                draftSlides.length === 0 ||
                !draftSlides.every(
                  (slide) => Boolean(slide.desktopFile)
                )
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon
                icon={
                  uploading
                    ? "mdi:loading"
                    : "mdi:cloud-upload-outline"
                }
                width={20}
                className={
                  uploading ? "animate-spin" : ""
                }
              />

              {uploading
                ? "Uploading images..."
                : "Upload and Save Carousel"}
            </button>

            {/* DELETE ALL */}

            {images.length > 0 && (
              <button
                type="button"
                onClick={deleteHero}
                disabled={isBusy}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon
                  icon="mdi:delete-outline"
                  width={20}
                />

                {deleting
                  ? "Deleting..."
                  : "Delete Entire Carousel"}
              </button>
            )}

            {/* INFORMATION */}

            <div className="mt-5 rounded-xl bg-gray-50 p-4">
              <div className="flex items-start gap-2">
                <Icon
                  icon="mdi:information-outline"
                  width={19}
                  className="mt-0.5 shrink-0 text-gray-600"
                />

                <p className="text-xs leading-5 text-gray-500">
                  Upload a landscape image for desktop and a
                  portrait image for mobile. Saving a new
                  carousel replaces the previously saved slides.
                  Each image must be JPG, PNG, or WebP and no
                  larger than 10 MB.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* FULL SCREEN PREVIEW */}

      {previewImage && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Hero image preview"
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            aria-label="Close image preview"
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black hover:bg-gray-200"
          >
            <Icon
              icon="mdi:close"
              width={24}
            />
          </button>

          <div
            className="flex max-h-[90vh] max-w-6xl flex-col items-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={previewImage.url}
              alt={previewImage.altText || DEFAULT_ALT}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />

            <p className="text-center text-sm text-white">
              {previewImage.label} — {previewImage.altText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}