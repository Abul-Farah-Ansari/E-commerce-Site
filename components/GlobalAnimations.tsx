
"use client";

import { useEffect } from "react";

export default function GlobalAnimations() {
  useEffect(() => {
    const selector = [
      "main > section",
      "main > div",
      "main article",
      'main [class*="grid"] > div',
    ].join(",");

    const observed = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("global-reveal");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px",
      }
    );

    const scan = () => {
      document.querySelectorAll(selector).forEach((element) => {
        if (observed.has(element)) return;

        observed.add(element);
        element.classList.add("global-reveal-hidden");
        observer.observe(element);
      });
    };

    scan();

    const mutationObserver = new MutationObserver(scan);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return null;
}
