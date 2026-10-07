"use client";

import {
  useEffect,
  useState,
} from "react";

import { usePathname, useRouter } from "next/navigation";

import { Icon } from "@iconify/react";

type WishlistButtonProps = {
  productId: string;
  className?: string;
};

export default function WishlistButton({
  productId,
  className = "",
}: WishlistButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [wishlisted, setWishlisted] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [loaded, setLoaded] =
    useState(false);

  /* =========================================================
     CHECK CURRENT WISHLIST STATUS
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadWishlist = async () => {
      try {
        const response = await fetch(
          "/api/wishlist",
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const data =
          await response.json();

        if (!mounted) {
          return;
        }

        const products =
          Array.isArray(data.products)
            ? data.products
            : [];

        const exists = products.some(
          (product: any) =>
            String(product?._id) ===
            String(productId)
        );

        setWishlisted(exists);
      } catch (error) {
        console.error(
          "Wishlist status error:",
          error
        );
      } finally {
        if (mounted) {
          setLoaded(true);
        }
      }
    };

    loadWishlist();

    return () => {
      mounted = false;
    };
  }, [productId]);

  /* =========================================================
     TOGGLE
  ========================================================= */

  const toggleWishlist = async (
    event: React.MouseEvent
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch("/api/wishlist", {
          method: wishlisted
            ? "DELETE"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            productId,
          }),
        });

      const data =
        await response.json();

      /* =====================================================
         NOT LOGGED IN
      ===================================================== */

      if (response.status === 401) {
        router.push(
          `/login?redirect=${encodeURIComponent(
            pathname
          )}`
        );

        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data?.message ||
            "Unable to update wishlist."
        );
      }

      setWishlisted(
        Boolean(data.wishlisted)
      );

      /* Notify other wishlist buttons/pages */
      window.dispatchEvent(
        new CustomEvent(
          "wishlist-updated"
        )
      );
    } catch (error) {
      console.error(
        "Wishlist toggle error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      disabled={loading}
      aria-label={
        wishlisted
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      title={
        wishlisted
          ? "Remove from wishlist"
          : "Add to wishlist"
      }
      className={`
        wishlist-button
        group/heart
        absolute
        left-3
        top-3
        z-20
        flex
        h-10
        w-10
        items-center
        justify-center
        rounded-full
        bg-white/95
        shadow-sm
        backdrop-blur-sm
        transition-all
        duration-300
        hover:scale-105
        disabled:cursor-wait
        disabled:opacity-60
        ${className}
      `}
    >
      <Icon
        icon={
          wishlisted
            ? "solar:heart-bold"
            : "solar:heart-linear"
        }
        width={19}
        height={19}
        className={`
          transition-all
          duration-300
          ${
            wishlisted
              ? "text-black"
              : "text-black/70 group-hover/heart:text-black"
          }
        `}
      />
    </button>
  );
}