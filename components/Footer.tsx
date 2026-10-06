"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* =========================================
              BRAND
          ========================================= */}

          <div className="footer-brand">
            {/* LOGO */}
            <Link href="/" className="footer-logo-space">
              <img
                src="/logo.jpeg"
                alt="House of Orive"
                className="footer-logo"
              />
            </Link>

            {/* BRAND NAME */}
            <Link href="/" className="footer-brand-name">
              HOUSE OF ORIVE
            </Link>

            <p className="footer-description">
              Discover timeless styles, refined essentials and effortless
              fashion designed for everyday living.
            </p>

            {/* SOCIAL */}
            <div className="footer-social">
              <a
                href="https://www.instagram.com/houseoforive?stkn=MXFjOXY5YzhpN3YzcQ=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="House of Orive on Instagram"
              >
                <Icon
                  icon="mdi:instagram"
                  width="18"
                  height="18"
                />
              </a>

              <a
                href="https://www.facebook.com/share/1MmhivAx9t/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="House of Orive on Facebook"
              >
                <Icon
                  icon="mdi:facebook"
                  width="18"
                  height="18"
                />
              </a>
            </div>
          </div>

          {/* =========================================
              SHOP
          ========================================= */}

          <div className="footer-column">
            <h3 className="footer-heading">Shop</h3>

            <div className="footer-links">
              <Link href="/products">
                All Products
              </Link>

              <Link href="/categories/men">
                Men
              </Link>

              <Link href="/categories/women">
                Women
              </Link>

              <Link href="/categories/shoes">
                Shoes
              </Link>

              <Link href="/categories/accessories">
                Accessories
              </Link>
            </div>
          </div>

          {/* =========================================
              INFORMATION
          ========================================= */}

          <div className="footer-column">
            <h3 className="footer-heading">
              Information
            </h3>

            <div className="footer-links">
              <Link href="/about">
                About Us
              </Link>

              <Link href="/contact">
                Contact
              </Link>

              <Link href="/shipping">
                Shipping
              </Link>

              <Link href="/returns">
                Returns
              </Link>

              <Link href="/faq">
                FAQ
              </Link>
            </div>
          </div>

          {/* =========================================
              CONTACT
          ========================================= */}

          <div className="footer-contact">
            <h3 className="footer-heading">
              Get In Touch
            </h3>

            <div className="contact-list">
              {/* PHONE */}

              <a
                href="tel:+918448658341"
                className="contact-item"
              >
                <span className="contact-icon">
                  <Icon
                    icon="solar:phone-linear"
                    width="18"
                    height="18"
                  />
                </span>

                <span className="contact-text">
                  <small>Call Us</small>
                  <strong>8448658341</strong>
                </span>
              </a>

              {/* EMAIL */}

              <a
                href="mailto:Houseoforive@gmail.com"
                className="contact-item"
              >
                <span className="contact-icon">
                  <Icon
                    icon="solar:letter-linear"
                    width="18"
                    height="18"
                  />
                </span>

                <span className="contact-text">
                  <small>Email Us</small>
                  <strong>
                    Houseoforive@gmail.com
                  </strong>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* =========================================
            DIVIDER
        ========================================= */}

        <div className="footer-divider" />

        {/* =========================================
            BOTTOM
        ========================================= */}

        <div className="footer-bottom">
          <p className="copyright">
            © 2026 House of Orive. All rights reserved.
          </p>

          <div className="footer-bottom-links">
            <Link href="/privacy-policy">
              Privacy Policy
            </Link>

            <Link href="/terms">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* =========================================
           FOOTER
        ========================================= */

        .footer {
          width: 100%;
          background: #111111;
          color: #ffffff;
        }

        .footer-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 80px 40px 32px;
        }

        /* =========================================
           GRID
        ========================================= */

        .footer-grid {
          display: grid;

          grid-template-columns:
            2fr
            1fr
            1fr
            1.4fr;

          gap: 50px;
        }

        /* =========================================
           BRAND
        ========================================= */

        .footer-brand {
          min-width: 0;
        }

        /* =========================================
           LOGO
        ========================================= */

        .footer-logo-space {
          display: flex;
          align-items: center;
          justify-content: flex-start;

          width: 190px;
          height: 72px;

          margin-bottom: 22px;

          text-decoration: none;
        }

        .footer-logo {
          display: block;

          max-width: 180px;
          max-height: 68px;

          width: auto;
          height: auto;

          object-fit: contain;
        }

        /* =========================================
           BRAND NAME
        ========================================= */

        .footer-brand-name {
          display: inline-block;

          color: #ffffff;

          font-size: 27px;
          font-weight: 700;
          line-height: 1;

          letter-spacing: -0.045em;

          text-decoration: none;
        }

        .footer-description {
          max-width: 350px;

          margin: 20px 0 0;

          color: #999999;

          font-size: 13px;
          line-height: 1.8;
        }

        /* =========================================
           SOCIAL
        ========================================= */

        .footer-social {
          display: flex;
          align-items: center;

          gap: 9px;

          margin-top: 27px;
        }

        .footer-social a {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 38px;
          height: 38px;

          border: 1px solid #333333;
          border-radius: 50%;

          color: #ffffff;

          text-decoration: none;

          transition:
            background 0.3s ease,
            border-color 0.3s ease,
            color 0.3s ease,
            transform 0.3s ease;
        }

        .footer-social a:hover {
          background: #ffffff;
          border-color: #ffffff;
          color: #111111;

          transform: translateY(-2px);
        }

        /* =========================================
           HEADINGS
        ========================================= */

        .footer-heading {
          margin: 0 0 22px;

          color: #ffffff;

          font-size: 12px;
          font-weight: 600;

          letter-spacing: 0.18em;
          text-transform: uppercase;
        }

        /* =========================================
           LINKS
        ========================================= */

        .footer-links {
          display: flex;
          flex-direction: column;

          gap: 13px;
        }

        .footer-links a {
          width: fit-content;

          color: #999999;

          font-size: 13px;
          line-height: 1.4;

          text-decoration: none;

          transition:
            color 0.25s ease,
            transform 0.25s ease;
        }

        .footer-links a:hover {
          color: #ffffff;
          transform: translateX(3px);
        }

        /* =========================================
           CONTACT
        ========================================= */

        .contact-list {
          display: flex;
          flex-direction: column;

          gap: 18px;
        }

        .contact-item {
          display: flex;
          align-items: center;

          gap: 12px;

          color: #ffffff;

          text-decoration: none;
        }

        .contact-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 38px;
          height: 38px;
          min-width: 38px;

          border: 1px solid #333333;
          border-radius: 50%;

          color: #ffffff;

          transition:
            background 0.25s ease,
            color 0.25s ease;
        }

        .contact-item:hover .contact-icon {
          background: #ffffff;
          color: #111111;
        }

        .contact-text {
          display: flex;
          flex-direction: column;

          min-width: 0;
        }

        .contact-item small {
          margin-bottom: 4px;

          color: #777777;

          font-size: 9px;
          font-weight: 600;

          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .contact-item strong {
          color: #dddddd;

          font-size: 12px;
          font-weight: 400;

          line-height: 1.5;

          word-break: break-word;
        }

        /* =========================================
           DIVIDER
        ========================================= */

        .footer-divider {
          width: 100%;
          height: 1px;

          margin: 62px 0 25px;

          background: #292929;
        }

        /* =========================================
           BOTTOM
        ========================================= */

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          flex-wrap: wrap;
        }

        .copyright {
          margin: 0;

          color: #777777;

          font-size: 11px;
          line-height: 1.5;
        }

        .footer-bottom-links {
          display: flex;
          align-items: center;

          gap: 22px;
        }

        .footer-bottom-links a {
          color: #777777;

          font-size: 10px;

          text-decoration: none;

          transition: color 0.25s ease;
        }

        .footer-bottom-links a:hover {
          color: #ffffff;
        }

        /* =========================================
           TABLET
           769px - 1000px
        ========================================= */

        @media (min-width: 769px) and (max-width: 1000px) {
          .footer-container {
            padding: 65px 25px 35px;
          }

          .footer-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 45px 35px;
          }

          .footer-brand {
            grid-column: span 2;
          }

          .footer-description {
            max-width: 500px;
          }

          .footer-divider {
            margin-top: 50px;
          }
        }

        /* =========================================
           LARGE TABLET
           1001px - 1150px
        ========================================= */

        @media (min-width: 1001px) and (max-width: 1150px) {
          .footer-container {
            padding-left: 30px;
            padding-right: 30px;
          }

          .footer-grid {
            grid-template-columns:
              1.7fr
              1fr
              1fr
              1.3fr;

            gap: 35px;
          }
        }

        /* =========================================
           MOBILE
           768px and below
        ========================================= */

        @media (max-width: 768px) {
          .footer-container {
            padding: 55px 20px 30px;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            gap: 38px;
          }

          .footer-brand {
            grid-column: auto;
          }

          .footer-logo-space {
            width: 180px;
            height: 68px;
          }

          .footer-logo {
            max-width: 170px;
            max-height: 64px;
          }

          .footer-brand-name {
            font-size: 24px;
          }

          .footer-description {
            max-width: 100%;
            margin-top: 18px;

            font-size: 12px;
            line-height: 1.75;
          }

          .footer-social {
            margin-top: 22px;
          }

          .footer-column,
          .footer-contact {
            width: 100%;
          }

          .footer-heading {
            margin-bottom: 18px;
            font-size: 11px;
          }

          .footer-links {
            gap: 11px;
          }

          .footer-links a {
            font-size: 12px;
          }

          .contact-list {
            gap: 15px;
          }

          .footer-divider {
            margin: 45px 0 22px;
          }

          .footer-bottom {
            flex-direction: column;
            align-items: flex-start;

            gap: 17px;
          }

          .footer-bottom-links {
            gap: 18px;
            flex-wrap: wrap;
          }
        }

        /* =========================================
           SMALL MOBILE
           480px and below
        ========================================= */

        @media (max-width: 480px) {
          .footer-container {
            padding: 48px 18px 28px;
          }

          .footer-grid {
            gap: 33px;
          }

          .footer-logo-space {
            width: 165px;
            height: 62px;
          }

          .footer-logo {
            max-width: 155px;
            max-height: 58px;
          }

          .footer-brand-name {
            font-size: 22px;
          }

          .footer-description {
            font-size: 11px;
          }

          .footer-social {
            gap: 8px;
            margin-top: 19px;
          }

          .footer-social a {
            width: 35px;
            height: 35px;
          }

          .footer-social a :global(svg) {
            width: 17px;
            height: 17px;
          }

          .footer-heading {
            font-size: 10px;
            letter-spacing: 0.16em;
          }

          .footer-links {
            gap: 10px;
          }

          .footer-links a {
            font-size: 11px;
          }

          .contact-item strong {
            font-size: 11px;
          }

          .contact-icon {
            width: 35px;
            height: 35px;
            min-width: 35px;
          }

          .footer-divider {
            margin: 40px 0 20px;
          }

          .copyright {
            font-size: 10px;
          }

          .footer-bottom-links {
            gap: 14px;
          }

          .footer-bottom-links a {
            font-size: 9px;
          }
        }

        /* =========================================
           VERY SMALL MOBILE
           359px and below
        ========================================= */

        @media (max-width: 359px) {
          .footer-container {
            padding: 42px 15px 26px;
          }

          .footer-grid {
            gap: 29px;
          }

          .footer-logo-space {
            width: 150px;
            height: 58px;
          }

          .footer-logo {
            max-width: 145px;
            max-height: 54px;
          }

          .footer-brand-name {
            font-size: 20px;
          }

          .footer-description {
            font-size: 10px;
          }

          .footer-social a {
            width: 33px;
            height: 33px;
          }

          .footer-social a :global(svg) {
            width: 16px;
            height: 16px;
          }

          .footer-heading {
            font-size: 9px;
          }

          .footer-links a {
            font-size: 11px;
          }

          .contact-item strong {
            font-size: 10px;
          }

          .footer-bottom-links {
            gap: 10px;
          }

          .footer-bottom-links a {
            font-size: 8px;
          }
        }

        /* =========================================
           REDUCED MOTION
        ========================================= */

        @media (prefers-reduced-motion: reduce) {
          .footer-social a,
          .footer-links a,
          .contact-icon {
            transition: none;
          }

          .footer-social a:hover,
          .footer-links a:hover {
            transform: none;
          }
        }
      `}</style>
    </footer>
  );
}