"use client";

import { Icon } from "@iconify/react";

const benefits = [
  {
    icon: "solar:delivery-linear",
    title: "Fast & Reliable Delivery",
    description:
      "Get your orders delivered quickly and safely right to your doorstep.",
  },
  {
    icon: "solar:shield-check-linear",
    title: "Secure Payments",
    description:
      "Your payment information is protected with secure checkout technology.",
  },
  {
    icon: "solar:refresh-circle-linear",
    title: "Easy Returns",
    description:
      "Changed your mind? Enjoy a simple and hassle-free return experience.",
  },
  {
    icon: "solar:headphones-round-linear",
    title: "Dedicated Support",
    description:
      "Our support team is here to help whenever you need assistance.",
  },
];

export default function Benefits() {
  return (
    <section className="benefits-section">
      <div className="benefits-container">
        {/* TOP LABEL */}
        <div className="benefits-heading">
          <span className="benefits-line" />
          <span>SHOP WITH CONFIDENCE</span>
          <span className="benefits-line" />
        </div>

        {/* BENEFITS */}
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`benefit-card benefit-card-${index + 1}`}
            >
              {/* ICON */}
              <div className="benefit-icon">
                <Icon icon={benefit.icon} width="23" height="23" />
              </div>

              {/* CONTENT */}
              <div className="benefit-content">
                <h3 className="benefit-title">{benefit.title}</h3>

                <p className="benefit-description">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        /* =========================================
           SECTION
        ========================================= */

        .benefits-section {
          width: 100%;
          background: #f7f7f5;
          border-top: 1px solid #e9e9e7;
          border-bottom: 1px solid #e9e9e7;
          padding: 72px 0;
        }

        .benefits-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* =========================================
           HEADING
        ========================================= */

        .benefits-heading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 42px;

          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #8a8a87;
        }

        .benefits-line {
          width: 34px;
          height: 1px;
          background: #d7d7d4;
        }

        /* =========================================
           GRID
        ========================================= */

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0;
        }

        /* =========================================
           CARD
        ========================================= */

        .benefit-card {
          position: relative;

          display: flex;
          align-items: flex-start;

          gap: 18px;

          min-height: 105px;

          padding: 8px 30px;

          transition:
            transform 0.3s ease,
            opacity 0.3s ease;
        }

        .benefit-card:not(:last-child) {
          border-right: 1px solid #dededb;
        }

        .benefit-card:hover {
          transform: translateY(-3px);
        }

        /* =========================================
           ICON
        ========================================= */

        .benefit-icon {
          position: relative;

          display: flex;
          align-items: center;
          justify-content: center;

          width: 50px;
          height: 50px;
          min-width: 50px;

          border: 1px solid #111111;
          border-radius: 50%;

          background: #111111;
          color: #ffffff;

          transition:
            background 0.3s ease,
            color 0.3s ease,
            transform 0.3s ease;
        }

        .benefit-card:hover .benefit-icon {
          background: #FAF8F5;
          color: #111111;
          transform: rotate(-6deg);
        }

        /* =========================================
           CONTENT
        ========================================= */

        .benefit-content {
          padding-top: 2px;
        }

        .benefit-title {
          margin: 0;

          font-size: 14px;
          line-height: 1.4;
          font-weight: 600;
          letter-spacing: -0.01em;

          color: #111111;
        }

        .benefit-description {
          max-width: 210px;

          margin: 7px 0 0;

          font-size: 12px;
          line-height: 1.65;
          font-weight: 400;

          color: #777774;
        }

        /* =========================================
           TABLET
           769px - 1100px
        ========================================= */

        @media (min-width: 769px) and (max-width: 1100px) {
          .benefits-section {
            padding: 60px 0;
          }

          .benefits-container {
            padding: 0 28px;
          }

          .benefits-heading {
            margin-bottom: 35px;
          }

          .benefit-card {
            gap: 13px;
            padding: 8px 18px;
          }

          .benefit-icon {
            width: 45px;
            height: 45px;
            min-width: 45px;
          }

          .benefit-title {
            font-size: 13px;
          }

          .benefit-description {
            margin-top: 6px;
            font-size: 11px;
            line-height: 1.55;
          }
        }

        /* =========================================
           TABLET / SMALL LAPTOP
           769px - 900px
        ========================================= */

        @media (min-width: 769px) and (max-width: 900px) {
          .benefits-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 25px 0;
          }

          .benefit-card {
            min-height: 90px;
          }

          .benefit-card:nth-child(2) {
            border-right: 0;
          }

          .benefit-card:nth-child(1),
          .benefit-card:nth-child(2) {
            padding-bottom: 25px;
            border-bottom: 1px solid #dededb;
          }

          .benefit-card:nth-child(3),
          .benefit-card:nth-child(4) {
            padding-top: 25px;
          }
        }

        /* =========================================
           MOBILE
           768px and below
        ========================================= */

        @media (max-width: 768px) {
          .benefits-section {
            padding: 52px 0;
          }

          .benefits-container {
            padding: 0 22px;
          }

          .benefits-heading {
            margin-bottom: 32px;

            font-size: 9px;
            letter-spacing: 0.17em;
          }

          .benefits-line {
            width: 25px;
          }

          .benefits-grid {
            display: flex;
            flex-direction: column;
            gap: 0;
          }

          .benefit-card {
            min-height: auto;

            padding: 20px 0;

            gap: 16px;

            border-right: 0 !important;
            border-bottom: 1px solid #dededb;
          }

          .benefit-card:first-child {
            padding-top: 0;
          }

          .benefit-card:last-child {
            padding-bottom: 0;
            border-bottom: 0;
          }

          .benefit-icon {
            width: 46px;
            height: 46px;
            min-width: 46px;
          }

          .benefit-title {
            font-size: 14px;
          }

          .benefit-description {
            max-width: none;

            margin-top: 5px;

            font-size: 12px;
            line-height: 1.6;
          }

          .benefit-card:hover {
            transform: none;
          }

          .benefit-card:hover .benefit-icon {
            transform: none;
          }
        }

        /* =========================================
           SMALL MOBILE
           480px and below
        ========================================= */

        @media (max-width: 480px) {
          .benefits-section {
            padding: 46px 0;
          }

          .benefits-container {
            padding: 0 18px;
          }

          .benefits-heading {
            gap: 10px;
            margin-bottom: 28px;

            font-size: 8px;
            letter-spacing: 0.15em;
          }

          .benefits-line {
            width: 20px;
          }

          .benefit-card {
            padding: 18px 0;
            gap: 14px;
          }

          .benefit-icon {
            width: 43px;
            height: 43px;
            min-width: 43px;
          }

          .benefit-icon :global(svg) {
            width: 20px !important;
            height: 20px !important;
          }

          .benefit-title {
            font-size: 13px;
            line-height: 1.4;
          }

          .benefit-description {
            font-size: 11px;
            line-height: 1.55;
          }
        }

        /* =========================================
           VERY SMALL MOBILE
           359px and below
        ========================================= */

        @media (max-width: 359px) {
          .benefits-section {
            padding: 40px 0;
          }

          .benefits-container {
            padding: 0 15px;
          }

          .benefits-heading {
            margin-bottom: 25px;
            font-size: 7px;
          }

          .benefit-card {
            gap: 12px;
            padding: 16px 0;
          }

          .benefit-icon {
            width: 40px;
            height: 40px;
            min-width: 40px;
          }

          .benefit-icon :global(svg) {
            width: 18px !important;
            height: 18px !important;
          }

          .benefit-title {
            font-size: 12px;
          }

          .benefit-description {
            font-size: 10px;
            line-height: 1.5;
          }
        }

        /* =========================================
           REDUCED MOTION
        ========================================= */

        @media (prefers-reduced-motion: reduce) {
          .benefit-card,
          .benefit-icon {
            transition: none !important;
          }

          .benefit-card:hover {
            transform: none;
          }

          .benefit-card:hover .benefit-icon {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}