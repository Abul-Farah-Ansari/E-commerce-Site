"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

const fashionIcons = [
  "mdi:hanger",
  "mdi:tshirt-crew-outline",
  "mdi:hanger",
  "mdi:shoe-heel",
  "mdi:tshirt-crew-outline",
];

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [iconIndex, setIconIndex] = useState(0);

  useEffect(() => {
    const iconTimer = window.setInterval(() => {
      setIconIndex((current) => (current + 1) % fashionIcons.length);
    }, 650);

    const startedAt = Date.now();
    let hideTimer: number | undefined;

    const hideLoader = () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, 1200 - elapsed);
      hideTimer = window.setTimeout(() => setVisible(false), remaining);
    };

    if (document.readyState === "complete") {
      hideLoader();
    } else {
      window.addEventListener("load", hideLoader, { once: true });
    }

    return () => {
      window.clearInterval(iconTimer);
      window.removeEventListener("load", hideLoader);
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="orive-loader" role="status" aria-label="Loading House of Orive">
      <div className="orive-loader__content">
        <div className="orive-loader__brand">HOUSE OF ORIVE</div>
        <div className="orive-loader__tagline">THE ART OF DRESSING</div>

        <div className="orive-loader__fashion-icon" aria-hidden="true">
          <Icon icon={fashionIcons[iconIndex]} width={58} height={58} />
        </div>

        <div className="orive-loader__loading-copy">PREPARING YOUR EXPERIENCE</div>
        <div className="orive-loader__track" aria-hidden="true">
          <span className="orive-loader__progress" />
        </div>
      </div>
    </div>
  );
}
