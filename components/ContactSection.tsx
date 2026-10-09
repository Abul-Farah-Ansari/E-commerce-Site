"use client";

import { FormEvent, useState } from "react";
import { Icon } from "@iconify/react";

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section className="contact-section">
      <div className="contact-inner">
        {/* =====================================================
            LEFT — CONTACT INFORMATION
        ===================================================== */}

        <div className="contact-content">
          <div className="contact-eyebrow">GET IN TOUCH</div>

          <h2>
            Let’s talk
            <br />
            <em>with us.</em>
          </h2>

          <div className="contact-line" />

          <p className="contact-description">
            Have a question about an order, a product, or something else? We
            would love to hear from you. Send us a message and our team will
            get back to you shortly.
          </p>

          {/* CONTACT DETAILS */}

          <div className="contact-details">
            {/* PHONE */}
            <a
              href="tel:+918448658341"
              className="contact-detail"
            >
              <div className="contact-icon">
                <Icon
                  icon="solar:phone-linear"
                  width={19}
                  height={19}
                />
              </div>

              <div className="contact-detail-text">
                <span>CALL US</span>

                <strong>+91 84486 58341</strong>
              </div>
            </a>

            {/* EMAIL */}
            <a
              href="mailto:Houseoforive@gmail.com"
              className="contact-detail"
            >
              <div className="contact-icon">
                <Icon
                  icon="solar:letter-linear"
                  width={19}
                  height={19}
                />
              </div>

              <div className="contact-detail-text">
                <span>EMAIL US</span>

                <strong>Houseoforive@gmail.com</strong>
              </div>
            </a>

            {/* INSTAGRAM */}
            <a
              href="https://www.instagram.com/houseoforive"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-detail"
            >
              <div className="contact-icon">
                <Icon
                  icon="mdi:instagram"
                  width={19}
                  height={19}
                />
              </div>

              <div className="contact-detail-text">
                <span>INSTAGRAM</span>

                <strong>@houseoforive</strong>
              </div>
            </a>

            {/* FACEBOOK */}
            <a
              href="https://www.facebook.com/people/Houseoforive/61592099355373/?mibextid=wwXIfr&rdid=noPQJ20NTbtqnLD0&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1MmhivAx9t%2F%3Fmibextid%3DwwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-detail"
            >
              <div className="contact-icon">
                <Icon
                  icon="mdi:facebook"
                  width={19}
                  height={19}
                />
              </div>

              <div className="contact-detail-text">
                <span>FACEBOOK</span>

                <strong>House Of Orive</strong>
              </div>
            </a>

            {/* PINTEREST */}
            <a
              href="https://www.pinterest.com/houseoforive/"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-detail"
            >
              <div className="contact-icon">
                <Icon
                  icon="mdi:pinterest"
                  width={19}
                  height={19}
                />
              </div>

              <div className="contact-detail-text">
                <span>PINTEREST</span>

                <strong>@houseoforive</strong>
              </div>
            </a>
          </div>

          {/* SMALL EDITORIAL DETAIL */}

          <div className="contact-editorial">
            <span>HOUSE OF ORIVE</span>

            <div className="editorial-line" />

            <span>EST. 2026</span>
          </div>
        </div>

        {/* =====================================================
            RIGHT — QUERY FORM
        ===================================================== */}

        <div className="contact-form-wrapper">
          <div className="form-header">
            <span>SEND A MESSAGE</span>

            <p>Tell us how we can help.</p>
          </div>

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >
            {/* NAME */}

            <div className="form-group">
              <label htmlFor="contact-name">FULL NAME</label>

              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Your name"
                required
              />
            </div>

            {/* EMAIL */}

            <div className="form-group">
              <label htmlFor="contact-email">EMAIL ADDRESS</label>

              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* PHONE */}

            <div className="form-group">
              <label htmlFor="contact-phone">PHONE NUMBER</label>

              <input
                id="contact-phone"
                name="phone"
                type="tel"
                placeholder="+91"
              />
            </div>

            {/* SUBJECT */}

            <div className="form-group">
              <label htmlFor="contact-subject">SUBJECT</label>

              <select
                id="contact-subject"
                name="subject"
                defaultValue=""
                required
              >
                <option value="" disabled>
                  Select a subject
                </option>

                <option value="order">Order Enquiry</option>

                <option value="product">Product Enquiry</option>

                <option value="return">Return / Exchange</option>

                <option value="support">Customer Support</option>

                <option value="other">Other</option>
              </select>
            </div>

            {/* MESSAGE */}

            <div className="form-group">
              <label htmlFor="contact-message">YOUR MESSAGE</label>

              <textarea
                id="contact-message"
                name="message"
                placeholder="Write your message..."
                rows={5}
                required
              />
            </div>

            {/* SUBMIT */}

            <button
              type="submit"
              className="contact-submit"
            >
              <span>
                {submitted ? "MESSAGE SENT" : "SEND MESSAGE"}
              </span>

              <Icon
                icon={
                  submitted
                    ? "solar:check-circle-linear"
                    : "solar:arrow-right-linear"
                }
                width={19}
                height={19}
              />
            </button>

            <p className="form-note">
              We usually respond within 24–48 hours.
            </p>
          </form>
        </div>
      </div>

      <style jsx>{`
        /* =====================================================
           SECTION
        ===================================================== */

        .contact-section {
          width: 100%;
          padding: 115px 24px;
          background: #f7f7f5;
          overflow: hidden;
        }

        .contact-inner {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns:
            minmax(0, 0.9fr)
            minmax(0, 1.1fr);
          gap: 100px;
          align-items: start;
        }

        /* =====================================================
           LEFT CONTENT
        ===================================================== */

        .contact-content {
          padding-top: 15px;
          max-width: 510px;
        }

        .contact-eyebrow {
          margin-bottom: 25px;
          color: #999999;
          font-family:
            var(--font-dm-sans),
            Arial,
            sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.23em;
        }

        .contact-content h2 {
          margin: 0;
          color: #111111;
          font-family:
            var(--font-bodoni),
            "Bodoni Moda",
            Didot,
            serif;
          font-size: clamp(54px, 5.5vw, 80px);
          font-weight: 500;
          line-height: 0.91;
          letter-spacing: -0.045em;
        }

        .contact-content h2 em {
          font-style: italic;
          font-weight: 400;
        }

        .contact-line {
          width: 55px;
          height: 1px;
          margin: 34px 0;
          background: #111111;
        }

        .contact-description {
          max-width: 455px;
          margin: 0;
          color: #777777;
          font-family:
            var(--font-dm-sans),
            Arial,
            sans-serif;
          font-size: 12px;
          line-height: 1.9;
        }

        /* =====================================================
           CONTACT DETAILS
        ===================================================== */

        .contact-details {
          margin-top: 45px;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .contact-detail {
          display: flex;
          align-items: center;
          gap: 16px;
          width: fit-content;
          color: inherit;
          text-decoration: none;
        }

        .contact-icon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          background: #111111;
          border-radius: 50%;
          transition:
            transform 0.25s ease,
            background 0.25s ease;
        }

        .contact-detail:hover .contact-icon {
          transform: translateY(-2px);
        }

        .contact-detail-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .contact-detail-text span {
          color: #999999;
          font-family:
            var(--font-dm-sans),
            Arial,
            sans-serif;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .contact-detail-text strong {
          color: #222222;
          font-family:
            var(--font-dm-sans),
            Arial,
            sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
        }

        /* =====================================================
           EDITORIAL FOOTNOTE
        ===================================================== */

        .contact-editorial {
          margin-top: 65px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #aaaaaa;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .editorial-line {
          width: 45px;
          height: 1px;
          background: #cccccc;
        }

        /* =====================================================
           FORM CARD
        ===================================================== */

        .contact-form-wrapper {
          padding: 42px;
          background: #FAF8F5;
          border: 1px solid #e9e9e7;
          box-shadow:
            0 25px 70px
            rgba(0, 0, 0, 0.035);
        }

        .form-header {
          margin-bottom: 38px;
          padding-bottom: 22px;
          border-bottom: 1px solid #eeeeec;
        }

        .form-header span {
          display: block;
          margin-bottom: 9px;
          color: #999999;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.2em;
        }

        .form-header p {
          margin: 0;
          color: #222222;
          font-family:
            var(--font-bodoni),
            "Bodoni Moda",
            Didot,
            serif;
          font-size: 26px;
          font-weight: 500;
          letter-spacing: -0.02em;
        }

        /* =====================================================
           FORM
        ===================================================== */

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .form-group label {
          color: #777777;
          font-family:
            var(--font-dm-sans),
            Arial,
            sans-serif;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.16em;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          box-sizing: border-box;
          border: none;
          border-bottom: 1px solid #dcdcd9;
          border-radius: 0;
          outline: none;
          padding: 10px 0 13px;
          background: transparent;
          color: #111111;
          font-family:
            var(--font-dm-sans),
            Arial,
            sans-serif;
          font-size: 12px;
          transition: border-color 0.2s ease;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #b5b5b5;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-bottom-color: #111111;
        }

        .form-group select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23111111' stroke-width='1.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right center;
        }

        .form-group textarea {
          min-height: 110px;
          resize: vertical;
          line-height: 1.7;
        }

        /* =====================================================
           SUBMIT
        ===================================================== */

        .contact-submit {
          width: 100%;
          min-height: 54px;
          margin-top: 8px;
          padding: 0 20px;
          border: 1px solid #111111;
          background: #111111;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          cursor: pointer;
          font-family:
            var(--font-dm-sans),
            Arial,
            sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.17em;
          transition:
            background 0.25s ease,
            color 0.25s ease,
            transform 0.25s ease;
        }

        .contact-submit:hover {
          background: #FAF8F5;
          color: #111111;
          transform: translateY(-1px);
        }

        .form-note {
          margin: 0;
          color: #aaaaaa;
          text-align: center;
          font-size: 8px;
          line-height: 1.5;
        }

        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1000px) {
          .contact-section {
            padding: 90px 22px;
          }

          .contact-inner {
            gap: 55px;
          }

          .contact-form-wrapper {
            padding: 32px;
          }

          .contact-content h2 {
            font-size: 58px;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 760px) {
          .contact-section {
            padding: 70px 18px;
          }

          .contact-inner {
            grid-template-columns: 1fr;
            gap: 55px;
          }

          .contact-content {
            max-width: none;
            padding-top: 0;
          }

          .contact-content h2 {
            font-size: clamp(48px, 14vw, 64px);
          }

          .contact-description {
            font-size: 11px;
            line-height: 1.85;
          }

          .contact-details {
            margin-top: 38px;
            gap: 22px;
          }

          .contact-editorial {
            margin-top: 48px;
          }

          .contact-form-wrapper {
            padding: 27px 22px;
          }

          .form-header {
            margin-bottom: 30px;
          }

          .form-header p {
            font-size: 24px;
          }
        }

        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 420px) {
          .contact-section {
            padding: 58px 15px;
          }

          .contact-content h2 {
            font-size: 45px;
          }

          .contact-line {
            margin: 27px 0;
          }

          .contact-icon {
            width: 39px;
            height: 39px;
          }

          .contact-detail-text strong {
            font-size: 11px;
          }

          .contact-form-wrapper {
            padding: 24px 18px;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {
          .contact-icon,
          .contact-submit {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}