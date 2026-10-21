
"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@iconify/react";

type HomeVideo = {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  sortOrder: number;
};

export default function HomeVideoSection() {
  const [videos, setVideos] = useState<HomeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<HomeVideo | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchVideos() {
      try {
        const response = await fetch("/api/videos", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load videos.");
        }

        const data = await response.json();

        if (!cancelled) {
          const items: HomeVideo[] = Array.isArray(data.videos)
            ? data.videos
                .filter(
                  (video: HomeVideo) =>
                    Boolean(video._id && video.videoUrl)
                )
                .sort((a: HomeVideo, b: HomeVideo) => a.sortOrder - b.sortOrder)
            : [];

          setVideos(items);
        }
      } catch (error) {
        console.error("Failed to load homepage videos:", error);

        if (!cancelled) setVideos([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchVideos();

    return () => {
      cancelled = true;
    };
  }, []);

  const closeFullscreen = useCallback(() => {
    setActiveVideo(null);
  }, []);

  useEffect(() => {
    if (!activeVideo) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeFullscreen();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeVideo, closeFullscreen]);

  if (loading || videos.length === 0) return null;

  // ONE VIDEO — centered, narrower, and taller.
  if (videos.length === 1) {
    const video = videos[0];

    return (
      <>
        <section className="single-section">
          <video
            className="single-video"
            src={video.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label={video.title}
          />

          <div className="single-overlay" />

          <div className="single-caption">
            <span className="caption-eyebrow">HOUSE OF ORIVE</span>
            <h2>{video.title}</h2>
            {video.description && <p>{video.description}</p>}
          </div>

          <button
            type="button"
            className="zoom-button single-zoom"
            onClick={() => setActiveVideo(video)}
            aria-label="View video fullscreen"
            title="View fullscreen"
          >
            <Icon icon="mdi:fullscreen" width={25} />
          </button>
        </section>

        <style jsx>{`
          .single-section {
            position: relative;
            width: min(calc(100% - 48px), 1050px);
            height: min(78vh, 740px);
            min-height: 480px;
            margin: 48px auto;
            overflow: hidden;
            background: #080808;
            border-radius: 3px;
          }

          .single-video {
            position: absolute;
            inset: 0;
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
          }

          .single-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to top,
              rgba(0, 0, 0, 0.76) 0%,
              rgba(0, 0, 0, 0.15) 43%,
              transparent 70%
            );
            pointer-events: none;
          }

          .single-caption {
            position: absolute;
            bottom: clamp(28px, 6vh, 65px);
            left: clamp(22px, 5vw, 65px);
            right: 75px;
            color: #fff;
            pointer-events: none;
          }

          .caption-eyebrow {
            display: block;
            margin-bottom: 13px;
            color: rgba(255, 255, 255, 0.8);
            font-size: 10px;
            letter-spacing: 0.25em;
          }

          .single-caption h2 {
            margin: 0 0 10px;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(30px, 4.5vw, 60px);
            font-weight: 400;
            letter-spacing: -0.04em;
            line-height: 1.12;
          }

          .single-caption p {
            max-width: 500px;
            margin: 0;
            color: rgba(255, 255, 255, 0.85);
            font-size: 14px;
            line-height: 1.8;
          }

          .zoom-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border: 1px solid rgba(255, 255, 255, 0.7);
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.42);
            color: #fff;
            cursor: pointer;
            transition: background 200ms ease, transform 200ms ease;
          }

          .zoom-button:hover {
            background: rgba(0, 0, 0, 0.85);
            transform: scale(1.05);
          }

          .single-zoom {
            position: absolute;
            top: 18px;
            right: 18px;
          }

          @media (max-width: 600px) {
            .single-section {
              width: calc(100% - 24px);
              height: 70svh;
              min-height: 380px;
              max-height: 620px;
              margin: 28px auto;
            }

            .single-caption {
              bottom: 28px;
              left: 20px;
              right: 20px;
            }

            .single-caption h2 {
              font-size: clamp(28px, 8vw, 40px);
            }

            .single-caption p {
              font-size: 12px;
            }

            .single-zoom {
              top: 12px;
              right: 12px;
            }
          }
        `}</style>

        <FullscreenViewer video={activeVideo} onClose={closeFullscreen} />
      </>
    );
  }

  // TWO VIDEOS — centered portrait cards.
  if (videos.length === 2) {
    return (
      <>
        <section className="two-section">
          <div className="two-heading">
            <span className="eyebrow">THE ORIVE EXPERIENCE</span>
            <h2>Stories in Motion</h2>
          </div>

          <div className="two-grid">
            {videos.map((video, index) => (
              <article className="two-tile" key={video._id}>
                <video
                  src={video.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={video.title}
                />

                <div className="two-overlay">
                  <div>
                    <span className="tile-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h2>{video.title}</h2>
                    {video.description && <p>{video.description}</p>}
                  </div>
                </div>

                <button
                  type="button"
                  className="zoom-button"
                  onClick={() => setActiveVideo(video)}
                  aria-label={`View ${video.title} fullscreen`}
                  title="View fullscreen"
                >
                  <Icon icon="mdi:fullscreen" width={24} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <style jsx>{`
          .two-section {
            width: 100%;
            padding: 56px 20px 64px;
            box-sizing: border-box;
            background: #f8f7f4;
            color: #171717;
          }

          .two-heading {
            margin: 0 auto 32px;
            text-align: center;
          }

          .eyebrow {
            display: block;
            margin-bottom: 12px;
            color: #8a7964;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.24em;
          }

          .two-heading h2 {
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(30px, 4vw, 46px);
            font-weight: 400;
            letter-spacing: -0.04em;
          }

          .two-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 420px));
            justify-content: center;
            gap: 26px;
            width: 100%;
          }

          .two-tile {
            position: relative;
            min-width: 0;
            width: 100%;
            aspect-ratio: 3 / 4;
            overflow: hidden;
            background: #111;
          }

          .two-tile video {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 700ms ease;
          }

          .two-tile:hover video {
            transform: scale(1.035);
          }

          .two-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: flex-end;
            padding: clamp(20px, 3vw, 36px);
            color: #fff;
            background: linear-gradient(
              to top,
              rgba(0, 0, 0, 0.78),
              rgba(0, 0, 0, 0.08) 55%,
              transparent 75%
            );
            pointer-events: none;
          }

          .tile-number {
            display: block;
            margin-bottom: 12px;
            color: rgba(255, 255, 255, 0.8);
            font-family: Georgia, "Times New Roman", serif;
            font-size: 14px;
            font-style: italic;
          }

          .two-overlay h2 {
            margin: 0;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(23px, 2.6vw, 34px);
            font-weight: 400;
            line-height: 1.2;
          }

          .two-overlay p {
            margin: 9px 0 0;
            color: rgba(255, 255, 255, 0.85);
            font-size: 13px;
            line-height: 1.7;
          }

          .zoom-button {
            position: absolute;
            top: 14px;
            right: 14px;
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            border: 1px solid rgba(255, 255, 255, 0.75);
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.42);
            color: #fff;
            cursor: pointer;
            transition: background 200ms ease;
          }

          .zoom-button:hover {
            background: rgba(0, 0, 0, 0.85);
          }

          @media (max-width: 600px) {
            .two-section {
              padding: 38px 12px 44px;
            }

            .two-heading {
              margin-bottom: 24px;
            }

            .two-grid {
              grid-template-columns: minmax(0, 420px);
              gap: 18px;
            }

            .two-tile {
              aspect-ratio: 3 / 4;
            }

            .two-overlay {
              padding: 22px;
            }

            .two-overlay h2 {
              font-size: 26px;
            }

            .zoom-button {
              top: 10px;
              right: 10px;
              width: 38px;
              height: 38px;
            }
          }
        `}</style>

        <FullscreenViewer video={activeVideo} onClose={closeFullscreen} />
      </>
    );
  }

  // THREE OR MORE VIDEOS — premium portrait gallery.
  return (
    <>
      <section className="gallery-section">
        <div className="gallery-heading">
          <span className="eyebrow">HOUSE OF ORIVE</span>
          <h2>THE WORLD OF ORIVE</h2>
          <p>
            A closer look at the details, textures, and moments
            that define our collection.
          </p>
        </div>

        <div className="video-gallery">
          {videos.map((video, index) => (
            <article className="gallery-tile" key={video._id}>
              <video
                src={video.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={video.title}
              />

              <div className="tile-overlay">
                <div className="tile-caption">
                  <span className="tile-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{video.title}</h3>
                  {video.description && <p>{video.description}</p>}
                </div>
              </div>

              <button
                type="button"
                className="zoom-button"
                onClick={() => setActiveVideo(video)}
                aria-label={`View ${video.title} fullscreen`}
                title="View fullscreen"
              >
                <Icon icon="mdi:fullscreen" width={24} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <style jsx>{`
        .gallery-section {
          width: 100%;
          padding: 64px 0 70px;
          background: #f8f7f4;
          color: #171717;
        }

        .gallery-heading {
          max-width: 720px;
          margin: 0 auto 38px;
          padding: 0 20px;
          text-align: center;
        }

        .eyebrow {
          display: block;
          margin-bottom: 13px;
          color: #8a7964;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.25em;
        }

        .gallery-heading h2 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(29px, 4vw, 48px);
          font-weight: 400;
          line-height: 1.15;
          letter-spacing: -0.045em;
        }

        .gallery-heading > p {
          max-width: 470px;
          margin: 14px auto 0;
          color: #77736d;
          font-size: 14px;
          line-height: 1.8;
        }

       .video-gallery {
  width: min(calc(100% - 48px), 1280px);
  margin: 40px auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.gallery-tile {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: 8px;
  background: #f2f0ec;
  cursor: pointer;
}

.gallery-tile video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.gallery-tile:hover video {
  transform: scale(1.05);
}

/* Tablet: 2 videos per row */
@media (max-width: 900px) {
  .video-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    width: calc(100% - 32px);
  }
}

/* Mobile: 2 videos per row */
@media (max-width: 550px) {
  .video-gallery {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    width: calc(100% - 20px);
    margin: 24px auto;
  }
}

        .gallery-tile video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          background: #111;
          transition: transform 700ms ease;
        }

        .gallery-tile:hover video {
          transform: scale(1.035);
        }

        .tile-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          padding: 22px;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.78),
            rgba(0, 0, 0, 0.05) 56%,
            transparent 75%
          );
          opacity: 0;
          transition: opacity 250ms ease;
          pointer-events: none;
        }

        .gallery-tile:hover .tile-overlay,
        .gallery-tile:focus-within .tile-overlay {
          opacity: 1;
        }

        .tile-caption {
          color: #fff;
        }

        .tile-number {
          display: block;
          margin-bottom: 10px;
          color: rgba(255, 255, 255, 0.8);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 13px;
          font-style: italic;
        }

        .tile-caption h3 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 23px;
          font-weight: 400;
          line-height: 1.25;
          overflow-wrap: anywhere;
        }

        .tile-caption p {
          margin: 8px 0 0;
          color: rgba(255, 255, 255, 0.85);
          font-size: 12px;
          line-height: 1.7;
        }

        .zoom-button {
          position: absolute;
          top: 13px;
          right: 13px;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.42);
          color: #fff;
          cursor: pointer;
          opacity: 0;
          transition: opacity 200ms ease, background 200ms ease;
        }

        .gallery-tile:hover .zoom-button,
        .zoom-button:focus-visible {
          opacity: 1;
        }

        .zoom-button:hover {
          background: rgba(0, 0, 0, 0.85);
        }

        @media (max-width: 900px) {
          .gallery-section {
            padding: 48px 0 52px;
          }

          .video-gallery {
            grid-template-columns: repeat(2, minmax(0, 300px));
            gap: 18px;
            padding: 0 18px;
          }
        }

        @media (max-width: 550px) {
          .gallery-section {
            padding: 38px 0 42px;
          }

          .gallery-heading {
            margin-bottom: 25px;
            padding: 0 18px;
          }

          .gallery-heading h2 {
            font-size: 30px;
          }

          .gallery-heading > p {
            font-size: 12px;
          }

          .video-gallery {
            grid-template-columns: minmax(0, 380px);
            justify-content: center;
            gap: 16px;
            padding: 0 12px;
          }

          .gallery-tile {
            aspect-ratio: 3 / 4;
          }

          .tile-overlay {
            padding: 18px;
            opacity: 1;
          }

          .tile-caption h3 {
            font-size: 21px;
          }

          .zoom-button {
            top: 10px;
            right: 10px;
            width: 38px;
            height: 38px;
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gallery-tile video,
          .tile-overlay,
          .zoom-button {
            transition: none;
          }
        }
      `}</style>

      <FullscreenViewer video={activeVideo} onClose={closeFullscreen} />
    </>
  );
}

function FullscreenViewer({
  video,
  onClose,
}: {
  video: HomeVideo | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!video) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [video, onClose]);

  if (!video) return null;

  return (
    <div
      className="fullscreen-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      onClick={onClose}
    >
      <button
        type="button"
        className="close-button"
        onClick={onClose}
        aria-label="Close fullscreen video"
        title="Close"
      >
        <Icon icon="mdi:close" width={30} />
      </button>

      <div
        className="fullscreen-content"
        onClick={(event) => event.stopPropagation()}
      >
        <video
          key={video._id}
          src={video.videoUrl}
          autoPlay
          muted
          loop
          playsInline
          controls
          className="fullscreen-video"
        />

        <div className="fullscreen-caption">
          <h2>{video.title}</h2>
          {video.description && <p>{video.description}</p>}
        </div>
      </div>

      <style jsx>{`
        .fullscreen-viewer {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background: rgba(0, 0, 0, 0.96);
        }

        .fullscreen-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          max-width: 1500px;
          min-height: 0;
        }

        .fullscreen-video {
          display: block;
          width: 100%;
          height: 100%;
          min-height: 0;
          object-fit: contain;
          background: #000;
        }

        .fullscreen-caption {
          flex-shrink: 0;
          width: 100%;
          padding-top: 12px;
          color: #fff;
        }

        .fullscreen-caption h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 400;
        }

        .fullscreen-caption p {
          margin: 6px 0 0;
          color: #ccc;
          font-size: 13px;
        }

        .close-button {
          position: absolute;
          top: 18px;
          right: 18px;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.5);
          color: #fff;
          cursor: pointer;
        }

        .close-button:hover {
          background: #333;
        }

        @media (max-width: 600px) {
          .fullscreen-viewer {
            padding: 12px;
          }

          .fullscreen-video {
            max-height: 78vh;
          }

          .close-button {
            top: 10px;
            right: 10px;
          }
        }
      `}</style>
    </div>
  );
}
