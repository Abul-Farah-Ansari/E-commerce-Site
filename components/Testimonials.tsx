"use client";

import { Icon } from "@iconify/react";

const testimonials = [
  {
    name: "Aarav Mehta",
    role: "Verified Customer",
    initials: "AM",
    review:
      "The quality is genuinely impressive. Everything feels premium, from the packaging to the product itself. Definitely ordering again.",
  },
  {
    name: "Sanya Kapoor",
    role: "Verified Customer",
    initials: "SK",
    review:
      "I loved the overall shopping experience. The clothes look exactly like the pictures and the delivery was surprisingly quick.",
  },
  {
    name: "Rohan Sharma",
    role: "Verified Customer",
    initials: "RS",
    review:
      "Simple designs, great quality and very comfortable. This has quickly become one of my favourite places to shop.",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        {/* =========================================
            HEADER
        ========================================= */}

        <div className="testimonials-header">
          <div className="testimonials-heading-left">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              <span>Customer Stories</span>
            </div>

            <h2 className="testimonials-title">
              Loved by our
              <br />
              <span>customers.</span>
            </h2>
          </div>

          <div className="testimonials-heading-right">
            <p className="testimonials-description">
              Real experiences from customers who have made our collection part
              of their everyday style.
            </p>

            <div className="rating-overview">
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    icon="solar:star-bold"
                    width="15"
                    height="15"
                  />
                ))}
              </div>

              <span>5.0 Customer Rating</span>
            </div>
          </div>
        </div>

        {/* =========================================
            TESTIMONIAL CARDS
        ========================================= */}

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.name}
              className={`testimonial-card testimonial-card-${index + 1}`}
            >
              {/* TOP */}
              <div className="testimonial-top">
                <div className="testimonial-number">
                  0{index + 1}
                </div>

                <div className="testimonial-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      icon="solar:star-bold"
                      width="16"
                      height="16"
                    />
                  ))}
                </div>
              </div>

              {/* QUOTE */}
              <div className="testimonial-quote-mark">“</div>

              <p className="testimonial-review">{testimonial.review}</p>

              {/* CUSTOMER */}
              <div className="testimonial-customer">
                <div className="testimonial-avatar">
                  {testimonial.initials}
                </div>

                <div className="testimonial-customer-info">
                  <div className="testimonial-name">
                    {testimonial.name}
                  </div>

                  <div className="testimonial-role">
                    <Icon
                      icon="solar:verified-check-bold"
                      width="12"
                      height="12"
                    />
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* =========================================
            TRUST STRIP
        ========================================= */}

        <div className="review-summary">
          <div className="summary-icon">
            <Icon
              icon="solar:verified-check-bold"
              width="18"
              height="18"
            />
          </div>

          <div className="summary-content">
            <span className="summary-title">
              Trusted by customers who value quality.
            </span>

            <span className="summary-divider" />

            <span className="summary-subtitle">
              Timeless style. Premium experience.
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* =========================================
           SECTION
        ========================================= */

        .testimonials-section {
          width: 100%;
          background: #FAF8F5;
          padding: 105px 0;
          border-bottom: 1px solid #eeeeec;
        }

        .testimonials-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* =========================================
           HEADER
        ========================================= */

        .testimonials-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 50px;

          margin-bottom: 55px;
        }

        .testimonials-heading-left {
          flex: 1;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;

          margin-bottom: 18px;

          color: #777777;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
        }

        .eyebrow-line {
          width: 32px;
          height: 1px;
          background: #111111;
        }

        .testimonials-title {
          margin: 0;

          color: #111111;

          font-size: clamp(42px, 5vw, 60px);
          line-height: 0.98;
          font-weight: 600;
          letter-spacing: -0.055em;
        }

        .testimonials-title span {
          color: #8a8a87;
        }

        .testimonials-heading-right {
          width: 390px;
          padding-bottom: 4px;
        }

        .testimonials-description {
          margin: 0;

          color: #666666;

          font-size: 14px;
          line-height: 1.75;
        }

        /* =========================================
           RATING OVERVIEW
        ========================================= */

        .rating-overview {
          display: flex;
          align-items: center;
          gap: 10px;

          margin-top: 22px;
          padding-top: 18px;

          border-top: 1px solid #eeeeec;

          color: #777777;

          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .rating-stars {
          display: flex;
          align-items: center;
          gap: 2px;

          color: #111111;
        }

        /* =========================================
           GRID
        ========================================= */

        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        /* =========================================
           CARD
        ========================================= */

        .testimonial-card {
          position: relative;

          display: flex;
          flex-direction: column;

          min-height: 330px;

          padding: 30px;

          overflow: hidden;

          background: #f6f6f4;
          border: 1px solid transparent;
          border-radius: 20px;

          transition:
            transform 0.35s ease,
            background 0.35s ease,
            border-color 0.35s ease;
        }

        .testimonial-card:hover {
          transform: translateY(-5px);

          background: #f2f2f0;
          border-color: #e5e5e2;
        }

        /* subtle corner number */

        .testimonial-number {
          color: #b0b0ad;

          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
        }

        .testimonial-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .testimonial-stars {
          display: flex;
          align-items: center;
          gap: 3px;

          color: #111111;
        }

        /* =========================================
           QUOTE
        ========================================= */

        .testimonial-quote-mark {
          height: 38px;

          margin-top: 22px;

          color: #111111;

          font-family: Georgia, "Times New Roman", serif;
          font-size: 64px;
          line-height: 0.8;
        }

        .testimonial-review {
          margin: 12px 0 0;

          color: #333333;

          font-size: 15px;
          line-height: 1.75;
          letter-spacing: -0.005em;
        }

        /* =========================================
           CUSTOMER
        ========================================= */

        .testimonial-customer {
          display: flex;
          align-items: center;

          gap: 12px;

          margin-top: auto;
          padding-top: 28px;
        }

        .testimonial-avatar {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 43px;
          height: 43px;
          min-width: 43px;

          border-radius: 50%;

          background: #111111;
          color: #ffffff;

          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .testimonial-customer-info {
          min-width: 0;
        }

        .testimonial-name {
          color: #111111;

          font-size: 13px;
          font-weight: 600;
          line-height: 1.4;
        }

        .testimonial-role {
          display: flex;
          align-items: center;
          gap: 4px;

          margin-top: 4px;

          color: #858582;

          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.12em;
          line-height: 1.4;
          text-transform: uppercase;
        }

        /* =========================================
           TRUST SUMMARY
        ========================================= */

        .review-summary {
          display: flex;
          align-items: center;
          justify-content: center;

          margin-top: 32px;
          padding: 21px 28px;

          border: 1px solid #e9e9e7;
          border-radius: 15px;

          background: #FAF8F5;
        }

        .summary-icon {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 32px;
          height: 32px;
          min-width: 32px;

          border-radius: 50%;

          background: #111111;
          color: #ffffff;
        }

        .summary-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;

          margin-left: 10px;
        }

        .summary-title {
          color: #222222;

          font-size: 12px;
          font-weight: 600;
        }

        .summary-divider {
          width: 1px;
          height: 13px;

          background: #d8d8d5;
        }

        .summary-subtitle {
          color: #8a8a87;

          font-size: 11px;
        }

        /* =========================================
           TABLET
           769px - 1024px
        ========================================= */

        @media (min-width: 769px) and (max-width: 1024px) {
          .testimonials-section {
            padding: 80px 0;
          }

          .testimonials-container {
            padding: 0 25px;
          }

          .testimonials-header {
            margin-bottom: 42px;
            gap: 35px;
          }

          .testimonials-title {
            font-size: 46px;
          }

          .testimonials-heading-right {
            width: 330px;
          }

          .testimonials-description {
            font-size: 13px;
          }

          .testimonials-grid {
            gap: 14px;
          }

          .testimonial-card {
            min-height: 300px;
            padding: 24px;
            border-radius: 17px;
          }

          .testimonial-review {
            font-size: 14px;
            line-height: 1.65;
          }

          .testimonial-quote-mark {
            margin-top: 18px;
          }

          .review-summary {
            margin-top: 27px;
            padding: 19px 22px;
          }
        }

        /* =========================================
           MOBILE
           768px and below
        ========================================= */

        @media (max-width: 768px) {
          .testimonials-section {
            padding: 68px 0;
          }

          .testimonials-container {
            padding: 0 20px;
          }

          .testimonials-header {
            display: block;

            margin-bottom: 34px;
          }

          .eyebrow {
            margin-bottom: 16px;
            font-size: 9px;
          }

          .testimonials-title {
            font-size: 38px;
            line-height: 1;
          }

          .testimonials-heading-right {
            width: 100%;
            margin-top: 22px;
          }

          .testimonials-description {
            font-size: 13px;
            line-height: 1.7;
          }

          .rating-overview {
            margin-top: 18px;
            padding-top: 15px;
          }

          /* horizontal swipe */

          .testimonials-grid {
            display: flex;

            flex-wrap: nowrap;

            gap: 13px;

            margin-right: -20px;

            overflow-x: auto;
            overflow-y: hidden;

            padding-right: 20px;

            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;

            scrollbar-width: none;
            -ms-overflow-style: none;
          }

          .testimonials-grid::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
          }

          .testimonial-card {
            flex: 0 0 calc(100% - 38px);

            width: calc(100% - 38px);
            min-width: calc(100% - 38px);

            min-height: 300px;

            padding: 24px;

            border-radius: 17px;

            scroll-snap-align: start;
            scroll-snap-stop: always;
          }

          .testimonial-card:hover {
            transform: none;
          }

          .testimonial-review {
            font-size: 14px;
            line-height: 1.7;
          }

          .testimonial-customer {
            padding-top: 25px;
          }

          .review-summary {
            margin-top: 24px;
            padding: 18px 18px;

            text-align: center;
          }

          .summary-content {
            flex-wrap: wrap;
            gap: 7px 10px;
          }

          .summary-title,
          .summary-subtitle {
            font-size: 11px;
          }
        }

        /* =========================================
           SMALL MOBILE
           480px and below
        ========================================= */

        @media (max-width: 480px) {
          .testimonials-section {
            padding: 56px 0;
          }

          .testimonials-container {
            padding: 0 20px;
          }

          .testimonials-title {
            font-size: 33px;
          }

          .testimonials-description {
            font-size: 12px;
          }

          .rating-overview {
            font-size: 9px;
          }

          .testimonial-card {
            flex: 0 0 calc(100% - 30px);

            width: calc(100% - 30px);
            min-width: calc(100% - 30px);

            min-height: 285px;

            padding: 21px;

            border-radius: 15px;
          }

          .testimonial-stars {
            gap: 2px;
          }

          .testimonial-stars :global(svg) {
            width: 14px !important;
            height: 14px !important;
          }

          .testimonial-quote-mark {
            height: 34px;
            margin-top: 18px;
            font-size: 56px;
          }

          .testimonial-review {
            margin-top: 10px;

            font-size: 13px;
            line-height: 1.65;
          }

          .testimonial-customer {
            gap: 10px;
            padding-top: 22px;
          }

          .testimonial-avatar {
            width: 40px;
            height: 40px;
            min-width: 40px;

            font-size: 10px;
          }

          .testimonial-name {
            font-size: 12px;
          }

          .testimonial-role {
            font-size: 8px;
          }

          .review-summary {
            margin-top: 20px;
            padding: 15px 13px;
          }

          .summary-icon {
            width: 29px;
            height: 29px;
            min-width: 29px;
          }

          .summary-content {
            margin-left: 7px;
          }

          .summary-title,
          .summary-subtitle {
            font-size: 10px;
          }

          .summary-divider {
            display: none;
          }
        }

        /* =========================================
           VERY SMALL MOBILE
           359px and below
        ========================================= */

        @media (max-width: 359px) {
          .testimonials-container {
            padding: 0 15px;
          }

          .testimonials-title {
            font-size: 29px;
          }

          .testimonials-grid {
            margin-right: -15px;
            padding-right: 15px;
          }

          .testimonial-card {
            flex: 0 0 calc(100% - 25px);

            width: calc(100% - 25px);
            min-width: calc(100% - 25px);

            min-height: 275px;

            padding: 17px;
          }

          .testimonial-review {
            font-size: 12px;
            line-height: 1.6;
          }

          .testimonial-avatar {
            width: 37px;
            height: 37px;
            min-width: 37px;
          }

          .testimonial-name {
            font-size: 11px;
          }

          .testimonial-role {
            font-size: 7px;
          }

          .review-summary {
            padding: 13px 10px;
          }

          .summary-title,
          .summary-subtitle {
            font-size: 9px;
          }
        }

        /* =========================================
           REDUCED MOTION
        ========================================= */

        @media (prefers-reduced-motion: reduce) {
          .testimonial-card {
            transition: none;
          }

          .testimonial-card:hover {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}