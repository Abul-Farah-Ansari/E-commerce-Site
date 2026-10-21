
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

type HeroImage = {
  imageUrl: string;
  publicId: string;
  altText: string;
  sortOrder?: number;
};

type UploadSignature = {
  success: boolean;
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

const MAX_SIZE = 10 * 1024 * 1024;
const MAX_IMAGES = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DEFAULT_ALT = "House of Orive fashion collection";

export default function HeroImageAdminPage() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [altText, setAltText] = useState(DEFAULT_ALT);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<HeroImage | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const loadHero = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await api("/api/admin/settings/hero");

      const savedImages: HeroImage[] = Array.isArray(data.hero?.images)
        ? data.hero.images
        : data.hero?.imageUrl
          ? [
              {
                imageUrl: data.hero.imageUrl,
                publicId: data.hero.publicId,
                altText: data.hero.altText || DEFAULT_ALT,
                sortOrder: 0,
              },
            ]
          : [];

      setImages(savedImages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load hero images."
      );
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void loadHero();
  }, [loadHero]);

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  // Close the preview modal with the Escape key.
  useEffect(() => {
    if (!previewImage) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPreviewImage(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewImage]);

  function chooseFiles(fileList: FileList | null) {
    setError("");
    setMessage("");

    if (!fileList) return;

    const selected = Array.from(fileList);

    if (selected.length === 0) return;

    if (selected.length > MAX_IMAGES) {
      setError(`Please select no more than ${MAX_IMAGES} images.`);
      return;
    }

    for (const file of selected) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only JPG, PNG, and WebP images are supported.");
        return;
      }

      if (file.size > MAX_SIZE) {
        setError(`"${file.name}" exceeds the 10 MB size limit.`);
        return;
      }
    }

    setFiles(selected);
  }

  async function uploadOneImage(file: File, index: number) {
    const signature = (await api(
      "/api/admin/settings/hero/upload-signature",
      { method: "POST" }
    )) as UploadSignature;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
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

    if (!response.ok || !uploaded.secure_url || !uploaded.public_id) {
      throw new Error(
        uploaded.error?.message || `Upload failed for "${file.name}".`
      );
    }

    return {
      imageUrl: uploaded.secure_url as string,
      publicId: uploaded.public_id as string,
      altText: `${altText.trim() || DEFAULT_ALT} ${index + 1}`,
      sortOrder: index,
    };
  }

  async function uploadHero() {
    if (files.length === 0) {
      setError("Please select one or more images first.");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    const uploadedImages: HeroImage[] = [];

    try {
      for (let index = 0; index < files.length; index++) {
        const image = await uploadOneImage(files[index], index);
        uploadedImages.push(image);
      }

      await api("/api/admin/settings/hero", {
        method: "PUT",
        body: JSON.stringify({
          images: uploadedImages,
        }),
      });

      setFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadHero();

      setMessage(
        `${uploadedImages.length} hero image${uploadedImages.length === 1 ? "" : "s"} saved successfully.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to upload hero images."
      );
    } finally {
      setUploading(false);
    }
  }

  // Delete only the selected image and preserve the other slides.
  async function deleteSingleImage(image: HeroImage) {
    const confirmed = window.confirm(
      `Delete slide "${image.altText || "Hero image"}" from the carousel?`
    );

    if (!confirmed) return;

    setDeletingImageId(image.publicId);
    setError("");
    setMessage("");

    try {
      const remainingImages = images
        .filter((item) => item.publicId !== image.publicId)
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

      if (previewImage?.publicId === image.publicId) {
        setPreviewImage(null);
      }

      await loadHero();
      setMessage("Image deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete this image."
      );
    } finally {
      setDeletingImageId(null);
    }
  }

  async function deleteHero() {
    const confirmed = window.confirm(
      "Delete all custom hero images? The homepage will return to its default image."
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      const data = await api("/api/admin/settings/hero", {
        method: "DELETE",
      });

      setImages([]);
      setFiles([]);
      setPreviewImage(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setMessage(data.message || "Hero carousel deleted.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete hero images."
      );
    } finally {
      setDeleting(false);
    }
  }

  const isBusy = uploading || deleting || deletingImageId !== null;

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-6 text-[#202020] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Icon icon="mdi:cog-outline" width={17} />
            <Link href="/admin/settings" className="hover:text-black">
              Settings
            </Link>
            <Icon icon="mdi:chevron-right" width={15} />
            <span className="text-black">Hero Carousel</span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Homepage Hero Carousel
              </h1>
              <p className="mt-2 text-sm text-gray-500 sm:text-base">
                Manage your homepage banner images and carousel slides.
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

        {message && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            <Icon icon="mdi:check-circle-outline" width={20} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <Icon icon="mdi:alert-circle-outline" width={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="font-semibold">Carousel Preview</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {files.length > 0
                    ? `${files.length} new image${files.length === 1 ? "" : "s"} selected`
                    : `${images.length} saved image${images.length === 1 ? "" : "s"}`}
                </p>
              </div>
              <Icon icon="mdi:image-multiple-outline" width={23} />
            </div>

            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
              {loading ? (
                <div className="flex aspect-video items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-500 sm:col-span-2">
                  Loading carousel images...
                </div>
              ) : files.length > 0 ? (
                previews.map((src, index) => (
                  <div key={`${files[index]?.name}-${index}`} className="group min-w-0">
                    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      <img
                        src={src}
                        alt={`Selected hero image ${index + 1}`}
                        className="aspect-video w-full object-contain"
                      />

                      <span className="absolute left-2 top-2 z-10 rounded-md bg-black px-2 py-1 text-xs font-medium text-white">
                        Slide {index + 1}
                      </span>

                      <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-black/55 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage({
                              imageUrl: src,
                              publicId: `local-preview-${index}`,
                              altText: `${altText || DEFAULT_ALT} ${index + 1}`,
                              sortOrder: index,
                            })
                          }
                          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-gray-100"
                        >
                          <Icon icon="mdi:eye-outline" width={18} />
                          Preview
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFiles((current) =>
                              current.filter((_, i) => i !== index)
                            );
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          disabled={uploading}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                        >
                          <Icon icon="mdi:delete-outline" width={18} />
                          Remove
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 truncate text-xs text-gray-500">
                      {files[index]?.name}
                    </p>
                  </div>
                ))
              ) : images.length > 0 ? (
                images.map((image, index) => (
                  <div key={image.publicId} className="group min-w-0">
                    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                      <img
                        src={image.imageUrl}
                        alt={image.altText || `Hero slide ${index + 1}`}
                        className="aspect-video w-full object-contain"
                      />

                      <span className="absolute left-2 top-2 z-10 rounded-md bg-black px-2 py-1 text-xs font-medium text-white">
                        Slide {index + 1}
                      </span>

                      <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-black/55 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(image)}
                          aria-label={`Preview slide ${index + 1}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-gray-100"
                        >
                          <Icon icon="mdi:eye-outline" width={18} />
                          Preview
                        </button>

                        <button
                          type="button"
                          onClick={() => void deleteSingleImage(image)}
                          disabled={isBusy}
                          aria-label={`Delete slide ${index + 1}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Icon icon="mdi:delete-outline" width={18} />
                          {deletingImageId === image.publicId
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>

                    <p className="mt-2 truncate text-xs text-gray-500">
                      {image.altText || `Hero slide ${index + 1}`}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-gray-100 text-gray-500 sm:col-span-2">
                  <Icon icon="mdi:image-off-outline" width={36} />
                  <p className="mt-2 text-sm">Default hero image is active</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 px-5 py-4 text-xs leading-5 text-gray-500">
              Hover over a saved image to preview or delete it. On mobile,
              the controls remain visible. Uploading a new selection replaces
              the saved carousel.
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <h2 className="font-semibold">Manage Hero Images</h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Select up to {MAX_IMAGES} images. Uploading a selection replaces
              the currently saved carousel.
            </p>

            <div className="mt-5">
              <label
                htmlFor="hero-images"
                className="mb-2 block text-sm font-medium"
              >
                Choose multiple images
              </label>

              <input
                ref={fileInputRef}
                id="hero-images"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => chooseFiles(event.target.files)}
                className="block w-full rounded-lg border border-gray-200 p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium"
              />

              <p className="mt-2 text-xs leading-5 text-gray-400">
                JPG, PNG, or WebP · Maximum 10 MB per image · Up to{" "}
                {MAX_IMAGES} images
              </p>
            </div>

            <div className="mt-5">
              <label
                htmlFor="hero-alt"
                className="mb-2 block text-sm font-medium"
              >
                Image alternative text
              </label>

              <input
                id="hero-alt"
                type="text"
                maxLength={200}
                value={altText}
                onChange={(event) => setAltText(event.target.value)}
                placeholder={DEFAULT_ALT}
                className="w-full rounded-lg border border-gray-200 px-3 py-3 text-sm outline-none transition focus:border-black"
              />

              <p className="mt-1 text-xs text-gray-400">
                Used to describe the collection images to screen readers.
              </p>
            </div>

            {files.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setFiles([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                disabled={uploading}
                className="mt-4 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Clear selected images
              </button>
            )}

            <button
              type="button"
              onClick={uploadHero}
              disabled={files.length === 0 || isBusy || loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon
                icon={uploading ? "mdi:loading" : "mdi:cloud-upload-outline"}
                width={20}
              />
              {uploading
                ? "Uploading images..."
                : `Upload ${files.length || ""} ${files.length === 1 ? "Image" : "Images"}`}
            </button>

            {images.length > 0 && (
              <button
                type="button"
                onClick={deleteHero}
                disabled={isBusy}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon icon="mdi:delete-outline" width={20} />
                {deleting ? "Deleting..." : "Delete Entire Carousel"}
              </button>
            )}

            <div className="mt-5 rounded-xl bg-gray-50 p-4">
              <div className="flex items-start gap-2">
                <Icon
                  icon="mdi:information-outline"
                  width={19}
                  className="mt-0.5 shrink-0 text-gray-600"
                />
                <p className="text-xs leading-5 text-gray-500">
                  Individual deletion keeps the remaining images in the
                  carousel. Deleting the entire carousel restores your
                  default project image.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Full-screen image preview */}
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
            <Icon icon="mdi:close" width={24} />
          </button>

          <div
            className="flex max-h-[90vh] max-w-6xl flex-col items-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={previewImage.imageUrl}
              alt={previewImage.altText || DEFAULT_ALT}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />

            <p className="text-center text-sm text-white">
              {previewImage.altText || DEFAULT_ALT}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
