
"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );

    if (!finePointer.matches) return;

    const handleMove = (event: PointerEvent) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.style.opacity = "1";

      const target = event.target;

      if (target instanceof Element) {
        cursor.classList.toggle(
          "orive-cursor-active",
          Boolean(target.closest("a, button"))
        );
      }
    };

    const handleLeave = () => {
      cursor.style.opacity = "0";
    };

    const handleEnter = () => {
      cursor.style.opacity = "1";
    };

    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerleave", handleLeave);
    document.addEventListener("pointerenter", handleEnter);

    return () => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerleave", handleLeave);
      document.removeEventListener("pointerenter", handleEnter);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 2147483647,
        width: 32,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#171411",
        pointerEvents: "none",
        opacity: 0,
        transform: "translate(-50%, -50%)",
      }}
      className="orive-cursor"
    >
      <Icon
        icon="solar:arrow-up-right-linear"
        width={30}
        height={30}
        style={{ display: "block", flexShrink: 0 }}
      />
    </div>
  );
}
