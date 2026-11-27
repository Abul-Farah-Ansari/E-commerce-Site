
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || !window.gtag) return;

    const currentPath =
      pathname + window.location.search;

    if (previousPath.current === currentPath) return;

    previousPath.current = currentPath;

    window.gtag("event", "page_view", {
      page_path: currentPath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
