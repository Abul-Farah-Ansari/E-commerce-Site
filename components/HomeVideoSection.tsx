
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
            ? data.videos.filter(
                (video: HomeVideo) =>
                  Boolean(video._id && video.videoUrl)
              )
            : [];

          setVideos(items);
        }
      } catch (error) {
        console.error("Failed to load homepage videos:", error);

        if (!cancelled) {
          setVideos([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
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
      if (event.key === "Escape") {
        closeFullscreen();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeVideo, closeFullscreen]);

  if (loading || videos.length === 0) {
    return null;
  }

  // ONE VIDEO: Full-screen immersive section.
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
            width: 100%;
            height: 100vh;
            min-height: 450px;
            overflow: hidden;
            background: #080808;
          }

          .single-video {
            position: absolute;
            inset: 0;
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .single-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              to top,
              rgba(0, 0, 0, 0.65),
              transparent 60%
            );
            pointer-events: none;
          }

          .single-caption {
            position: absolute;
            bottom: clamp(30px, 7vh, 75px);
            left: clamp(22px, 7vw, 100px);
            right: 70px;
            color: #fff;
            pointer-events: none;
          }

          .single-caption h2 {
            margin: 0 0 10px;
            font-size: clamp(30px, 5vw, 68px);
            font-weight: 400;
            letter-spacing: -0.045em;
          }

          .single-caption p {
            margin: 0;
            font-size: 14px;
            line-height: 1.7;
          }

          .zoom-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            border: 1px solid rgba(255, 255, 255, 0.75);
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.45);
            color: #fff;
            cursor: pointer;
          }

          .zoom-button:hover {
            background: rgba(0, 0, 0, 0.85);
          }

          .single-zoom {
            position: absolute;
            top: 20px;
            right: 20px;
          }

          @media (max-width: 600px) {
            .single-section {
              height: 85vh;
              min-height: 400px;
            }
          }
        `}</style>

        <FullscreenViewer
          video={activeVideo}
          onClose={closeFullscreen}
        />
      </>
    );
  }

  // TWO VIDEOS: Equal-width horizontal split.
  if (videos.length === 2) {
    return (
      <>
        <section className="two-section">
          {videos.map((video) => (
            <article className="two-tile" key={video._id}>
              <video
                src={video.videoUrl}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-label={video.title}
              />

              <div className="two-overlay">
                <div>
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
        </section>

        <style jsx>{`
          .two-section {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            width: 100%;
            padding: 16px;
            box-sizing: border-box;
            background: #fff;
          }

          .two-tile {
            position: relative;
            min-width: 0;
            aspect-ratio: 16 / 9;
            overflow: hidden;
            background: #111;
          }

          .two-tile video {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .two-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: flex-end;
            padding: clamp(14px, 3vw, 30px);
            color: #fff;
            background: linear-gradient(
              to top,
              rgba(0, 0, 0, 0.65),
              transparent 65%
            );
            pointer-events: none;
          }

          .two-overlay h2 {
            margin: 0;
            font-size: clamp(18px, 2.5vw, 32px);
            font-weight: 400;
          }

          .two-overlay p {
            margin: 8px 0 0;
            font-size: 13px;
          }

          .zoom-button {
            position: absolute;
            top: 12px;
            right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border: 1px solid rgba(255, 255, 255, 0.75);
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.45);
            color: #fff;
            cursor: pointer;
          }

          @media (max-width: 600px) {
            .two-section {
              gap: 8px;
              padding: 8px;
            }

            .two-overlay {
              padding: 10px;
            }

            .two-overlay h2 {
              font-size: 15px;
            }

            .zoom-button {
              top: 6px;
              right: 6px;
              width: 32px;
              height: 32px;
            }
          }
        `}</style>

        <FullscreenViewer
          video={activeVideo}
          onClose={closeFullscreen}
        />
      </>
    );
  }

  // THREE OR MORE VIDEOS: Horizontal landscape gallery.
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
          {videos.map((video) => (
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
          padding: 40px 0 0;
          background: #fff;
          color: #111;
        }

        .gallery-heading {
          max-width: 720px;
          margin: 0 auto 30px;
          padding: 0 16px;
          text-align: center;
        }

        .eyebrow {
          display: block;
          margin-bottom: 12px;
          color: #777;
          font-size: 10px;
          letter-spacing: 0.28em;
        }

        .gallery-heading h2 {
          margin: 0;
          font-size: clamp(27px, 4vw, 48px);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: -0.045em;
        }

        .gallery-heading > p {
          margin: 12px auto 0;
          color: #777;
          font-size: 14px;
          line-height: 1.7;
        }

        .video-gallery {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          align-items: start;
          gap: 16px;
          width: 100%;
          padding: 0 16px;
          box-sizing: border-box;
        }

        .gallery-tile {
          position: relative;
          min-width: 0;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #111;
        }

        .gallery-tile video {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #111;
        }

        .tile-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          padding: 16px;
          background: linear-gradient(
            to top,
            rgba(0, 0, 0, 0.68),
            transparent 65%
          );
          opacity: 0;
          transition: opacity 200ms ease;
          pointer-events: none;
        }

        .gallery-tile:hover .tile-overlay {
          opacity: 1;
        }

        .tile-caption {
          color: #fff;
        }

        .tile-caption h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 500;
          overflow-wrap: anywhere;
        }

        .tile-caption p {
          margin: 6px 0 0;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.85);
        }

        .zoom-button {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.45);
          color: #fff;
          cursor: pointer;
          opacity: 0;
          transition: opacity 200ms ease;
        }

        .gallery-tile:hover .zoom-button,
        .zoom-button:focus-visible {
          opacity: 1;
        }

        .zoom-button:hover {
          background: rgba(0, 0, 0, 0.85);
        }

        @media (max-width: 900px) {
          .video-gallery {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            padding: 0 12px;
          }
        }

        @media (max-width: 550px) {
          .gallery-section {
            padding-top: 30px;
          }

          .video-gallery {
            grid-template-columns: 1fr;
            gap: 12px;
            padding: 0 10px;
          }

          .tile-overlay {
            padding: 10px;
            opacity: 1;
          }

          .tile-caption h3 {
            font-size: 13px;
          }

          .zoom-button {
            top: 8px;
            right: 8px;
            width: 34px;
            height: 34px;
            opacity: 1;
          }
        }
      `}</style>

      <FullscreenViewer
        video={activeVideo}
        onClose={closeFullscreen}
      />
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
      if (event.key === "Escape") {
        onClose();
      }
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
