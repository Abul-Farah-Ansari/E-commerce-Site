
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/cart",
        "/checkout",
        "/account",
        "/login",
        "/register",
        "/forgot-password",
        "/orders",
        "/wishlist",
      ],
    },

    sitemap: "https://houseoforive.in/sitemap.xml",
    host: "https://houseoforive.in",
  };
}
