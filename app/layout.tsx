
import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import MetaPixel from "@/components/MetaPixel";
import GoogleAnalytics from "@/components/GoogleAnalytics";

import "./globals.css";

import { CartProvider } from "@/components/CartContext";
import GlobalAnimations from "@/components/GlobalAnimations";
import PageLoader from "@/components/PageLoader";

const GA_MEASUREMENT_ID = "G-JJE3FKF3JT";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

// Website URL
const SITE_URL = "https://www.houseoforive.in";

// Organization structured data
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "House of Orive",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/Orive%20Boutique%20Fashion%20Logo.png`,
  },
  image: `${SITE_URL}/Orive%20Boutique%20Fashion%20Logo.png`,
  email: "contact@houseoforive.in",
  telephone: "+918448658341",
  sameAs: [
    "https://www.instagram.com/houseoforive",
  ],
};

// Website structured data
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "House of Orive",
  url: SITE_URL,
  publisher: {
    "@id": `${SITE_URL}/#organization`,
  },
  inLanguage: "en-IN",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.houseoforive.in"),

  title: {
    default: "House of Orive | Timeless Fashion & Modern Elegance",
    template: "%s | House of Orive",
  },

  description:
    "Discover House of Orive for timeless fashion, refined essentials and contemporary styles. Explore our collection and shop online.",

  applicationName: "House of Orive",

  keywords: [
    "House of Orive",
    "House of Orive official website",
    "House of Orive clothing",
    "online fashion store India",
    "fashion clothing online",
    "modern fashion",
    "timeless fashion",
    "wardrobe essentials",
    "contemporary clothing",
  ],

  authors: [{ name: "House of Orive" }],
  creator: "House of Orive",
  publisher: "House of Orive",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    title: "House of Orive | Timeless Fashion & Modern Elegance",
    description:
      "Discover House of Orive for timeless fashion, refined essentials and contemporary styles.",
    siteName: "House of Orive",
    locale: "en_IN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "House of Orive | Timeless Fashion & Modern Elegance",
    description:
      "Discover House of Orive for timeless fashion, refined essentials and contemporary styles.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${manrope.variable}`}
    >
      <body className="antialiased">

        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              send_page_view: false
            });
          `}
        </Script>

        {/* Track Next.js route changes */}
        <GoogleAnalytics />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />

        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema).replace(
              /</g,
              "\\u003c"
            ),
          }}
        />

        <PageLoader />
        <MetaPixel />

        <CartProvider>
          <GlobalAnimations />
          {children}
        </CartProvider>

      </body>
    </html>
  );
}
