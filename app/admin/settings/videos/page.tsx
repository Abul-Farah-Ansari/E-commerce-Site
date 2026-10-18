
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

type Video = {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  publicId: string;
  isPublished: boolean;
  sortOrder: number;
};

const MAX_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const ALLOWED_EXTENSIONS = /\.(mp4|webm|mov)$/i;

export default function HomeVideosAdminPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fileInput = useRef<HTMLInputElement>(null);

  const api = useCallback(
    async (url: string, options?: RequestInit) => {
      const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || `Request failed with status ${response.status}.`
        );
      }

      return data;
    },
    []
  );

  const loadVideos = useCallback(async () => {
    try {
      const data = await api("/api/admin/settings/videos");
      setVideos(data.videos || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load videos."
      );
    }
  }, [api]);

  useEffect(() => {
    void loadVideos();
  }, [loadVideos]);

  function selectFile(selected: File | null) {
    setError("");
    setMessage("");

    if (!selected) {
      setFile(null);
      return;
    }

    const extensionIsValid = ALLOWED_EXTENSIONS.test(selected.name);
    const typeIsValid = ALLOWED_TYPES.includes(selected.type);

    // Some browsers report an empty MIME type for valid video files.
    const validType =
      typeIsValid || (selected.type === "" && extensionIsValid);

    if (!validType) {
      setFile(null);

      if (fileInput.current) {
        fileInput.current.value = "";
      }

      setError("Choose an MP4, WebM, or MOV video.");
      return;
    }

    if (selected.size === 0 || selected.size > MAX_SIZE) {
      setFile(null);

      if (fileInput.current) {
        fileInput.current.value = "";
      }

      setError("Video size must be greater than 0 and no more than 25 MB.");
      return;
    }

    setFile(selected);
  }

  async function uploadVideo(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setMessage("");

    // Read directly from the file input as a fallback.
    const selectedFile = fileInput.current?.files?.[0] || file;

    if (!title.trim()) {
      setError("Please enter a video title.");
      return;
    }

    if (!selectedFile) {
      setError("Please choose a video file before uploading.");
      return;
    }

    const extensionIsValid = ALLOWED_EXTENSIONS.test(
      selectedFile.name
    );
    const typeIsValid = ALLOWED_TYPES.includes(selectedFile.type);

    if (
      !typeIsValid &&
      !(selectedFile.type === "" && extensionIsValid)
    ) {
      setError("Choose an MP4, WebM, or MOV video.");
      return;
    }

    if (
      selectedFile.size === 0 ||
      selectedFile.size > MAX_SIZE
    ) {
      setError("Video size must be greater than 0 and no more than 25 MB.");
      return;
    }

    setBusy(true);

    try {
      // 1. Request a secure upload signature from the server.
      const signed = await api(
        "/api/admin/settings/videos/upload-signature",
        {
          method: "POST",
          body: JSON.stringify({}),
        }
      );

      // 2. Upload the video directly to Cloudinary.
      const form = new FormData();
      form.append("file", selectedFile);
      form.append("api_key", signed.apiKey);
      form.append("timestamp", String(signed.timestamp));
      form.append("folder", signed.folder);
      form.append("signature", signed.signature);

      const cloudResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signed.cloudName}/video/upload`,
        {
          method: "POST",
          body: form,
        }
      );

      const cloudData = await cloudResponse.json().catch(() => null);

      if (
        !cloudResponse.ok ||
        !cloudData?.secure_url ||
        !cloudData?.public_id
      ) {
        throw new Error(
          cloudData?.error?.message || "Cloudinary upload failed."
        );
      }

      // 3. Save the uploaded video's details in MongoDB.
      await api("/api/admin/settings/videos", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          sortOrder: Number(sortOrder || 0),
          videoUrl: cloudData.secure_url,
          publicId: cloudData.public_id,
        }),
      });

      // 4. Reset the form after successful upload.
      setTitle("");
      setDescription("");
      setSortOrder("0");
      setFile(null);

      if (fileInput.current) {
        fileInput.current.value = "";
      }

      setMessage(
        "Video uploaded successfully as unpublished. Publish it when ready."
      );

      await loadVideos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Video upload failed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(video: Video) {
    setError("");
    setMessage("");

    try {
      await api(`/api/admin/settings/videos/${video._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          isPublished: !video.isPublished,
        }),
      });

      setVideos((current) =>
        current.map((item) =>
          item._id === video._id
            ? { ...item, isPublished: !item.isPublished }
            : item
        )
      );

      setMessage(
        video.isPublished
          ? "Video unpublished successfully."
          : "Video published successfully."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update video."
      );
    }
  }

  async function deleteVideo(video: Video) {
    const confirmed = window.confirm(
      `Delete "${video.title}" permanently?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api(`/api/admin/settings/videos/${video._id}`, {
        method: "DELETE",
      });

      setVideos((current) =>
        current.filter((item) => item._id !== video._id)
      );

      setMessage("Video deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete video."
      );
    }
  }

  return (
    <main className="video-admin">
      <Link href="/admin/settings" className="back-link">
        <Icon icon="solar:arrow-left-linear" width={18} />
        Settings
      </Link>

      <span className="eyebrow">HOUSE OF ORIVE / ADMIN</span>

      <h1>Home Page Videos</h1>

      <p className="intro">
        Upload and manage videos displayed on your homepage.
      </p>

      {message && (
        <p className="success" role="status">
          {message}
        </p>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <section className="panel">
        <h2>Add a video</h2>

        <p className="muted">
          MP4, WebM, or MOV · Maximum 25 MB
        </p>

        <form onSubmit={uploadVideo}>
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              placeholder="Enter video title"
              required
            />
          </label>

          <label>
            Description (optional)
            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              maxLength={300}
              rows={3}
              placeholder="Enter a short description"
            />
          </label>

          <label>
            Display order
            <input
              type="number"
              min="0"
              max="9999"
              value={sortOrder}
              onChange={(event) =>
                setSortOrder(event.target.value)
              }
            />
          </label>

          <label className="file-picker">
            Choose video

            <input
              ref={fileInput}
              type="file"
              accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
              onChange={(event) =>
                selectFile(event.currentTarget.files?.[0] || null)
              }
              required
            />

            <span className="file-name">
              {file
                ? `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
                : "Select an MP4, WebM, or MOV file"}
            </span>
          </label>

          <button disabled={busy} type="submit">
            {busy ? "Uploading..." : "Upload video"}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Uploaded videos ({videos.length})</h2>

        {videos.length === 0 ? (
          <p className="muted">No videos uploaded yet.</p>
        ) : (
          <div className="video-list">
            {videos.map((video) => (
              <article className="video-card" key={video._id}>
                <video
                  src={video.videoUrl}
                  controls
                  preload="metadata"
                />

                <div className="video-info">
                  <h3>{video.title}</h3>

                  {video.description && (
                    <p>{video.description}</p>
                  )}

                  <span
                    className={
                      video.isPublished
                        ? "published"
                        : "unpublished"
                    }
                  >
                    {video.isPublished
                      ? "Published"
                      : "Unpublished"}
                  </span>

                  <div className="actions">
                    <button
                      type="button"
                      onClick={() => void togglePublished(video)}
                    >
                      {video.isPublished
                        ? "Unpublish"
                        : "Publish"}
                    </button>

                    <button
                      type="button"
                      className="delete"
                      onClick={() => void deleteVideo(video)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .video-admin {
          min-height: 100vh;
          padding: 35px clamp(18px, 4vw, 55px) 70px;
          background: #f7f7f8;
          color: #111;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 30px;
          color: #555;
          text-decoration: none;
        }

        .back-link:hover {
          color: #111;
        }

        .eyebrow {
          color: #777;
          font-size: 10px;
          letter-spacing: 0.2em;
        }

        h1 {
          margin: 9px 0;
          font-size: clamp(30px, 4vw, 42px);
          font-weight: 400;
          letter-spacing: -0.04em;
        }

        .intro,
        .muted {
          color: #777;
          font-size: 14px;
        }

        .panel {
          max-width: 1050px;
          margin: 25px 0;
          padding: 25px;
          border: 1px solid #e4e4e7;
          border-radius: 15px;
          background: #fff;
        }

        .panel h2 {
          margin: 0 0 8px;
          font-size: 21px;
          font-weight: 400;
        }

        form {
          display: grid;
          gap: 17px;
          max-width: 650px;
        }

        label {
          display: grid;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        input,
        textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: #fff;
          color: #111;
          font: inherit;
        }

        input:focus,
        textarea:focus {
          outline: 2px solid #999;
          outline-offset: 1px;
        }

        .file-picker {
          padding: 15px;
          border: 1px dashed #aaa;
          border-radius: 9px;
        }

        .file-picker input {
          padding: 8px;
          border: 0;
        }

        .file-name {
          color: #666;
          font-size: 12px;
          font-weight: 400;
          overflow-wrap: anywhere;
        }

        button {
          padding: 11px 15px;
          border: 1px solid #111;
          border-radius: 8px;
          background: #111;
          color: #fff;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        button:hover {
          opacity: 0.8;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .success,
        .error {
          max-width: 1050px;
          padding: 12px;
          border-radius: 8px;
          font-size: 13px;
        }

        .success {
          background: #eaf8ee;
          color: #176534;
        }

        .error {
          background: #fff0f0;
          color: #9b2020;
        }

        .video-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .video-card {
          overflow: hidden;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          min-width: 0;
        }

        .video-card video {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #111;
          object-fit: contain;
        }

        .video-info {
          padding: 15px;
        }

        .video-info h3 {
          margin: 0 0 8px;
          overflow-wrap: anywhere;
        }

        .video-info p {
          color: #777;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .published,
        .unpublished {
          display: inline-block;
          margin-top: 7px;
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 11px;
        }

        .published {
          background: #eaf8ee;
          color: #176534;
        }

        .unpublished {
          background: #eee;
          color: #555;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .delete {
          border-color: #a22;
          background: #fff;
          color: #a22;
        }

        @media (max-width: 700px) {
          .video-list {
            grid-template-columns: 1fr;
          }

          .panel {
            padding: 17px;
          }
        }
      `}</style>
    </main>
  );
}
