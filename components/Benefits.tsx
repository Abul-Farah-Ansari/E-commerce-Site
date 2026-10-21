
"use client";

import { Icon } from "@iconify/react";

const benefits = [
  {
    icon: "solar:delivery-linear",
    number: "01",
    title: "Complimentary Care",
    highlight: "Reliable Delivery",
    description:
      "Your selected pieces, carefully packed and delivered to your doorstep.",
  },
  {
    icon: "solar:shield-check-linear",
    number: "02",
    title: "Shop With Confidence",
    highlight: "Secure Payments",
    description:
      "A smooth and secure checkout experience, with your privacy in mind.",
  },
  {
    icon: "solar:refresh-circle-linear",
    number: "03",
    title: "A Better Experience",
    highlight: "Easy Returns",
    description:
      "Simple return support to help you shop with greater peace of mind.",
  },
  {
    icon: "solar:headphones-round-linear",
    number: "04",
    title: "Here For You",
    highlight: "Personal Support",
    description:
      "Our team is ready to assist you with your orders and shopping queries.",
  },
];

export default function Benefits() {
  return (
    <section className="benefits-premium">
      <div className="benefits-inner">
        <div className="benefits-heading">
          <span className="benefits-heading-line" />
          <span className="benefits-eyebrow">THE ORIVE EXPERIENCE</span>
          <span className="benefits-heading-line" />
        </div>

        <div className="benefits-intro">
          <h2>
            More than shopping.
            <span> An experience.</span>
          </h2>
          <p>
            Thoughtful details, dependable service, and a little more care
            in every order.
          </p>
        </div>

        <div className="benefits-grid">
          {benefits.map((benefit) => (
            <article className="benefit-card" key={benefit.number}>
              <div className="benefit-card-top">
                <span className="benefit-number">{benefit.number}</span>
                <span className="benefit-arrow">
                  <Icon icon="solar:arrow-up-right-linear" width="22" height="22" />
                </span>
              </div>

              <div className="benefit-icon-wrap">
                <div className="benefit-icon">
                  <Icon
                    icon={benefit.icon}
                    width="42"
                    height="42"
                    strokeWidth={1.3}
                  />
                </div>
              </div>

              <div className="benefit-copy">
                <p className="benefit-kicker">{benefit.title}</p>
                <h3>{benefit.highlight}</h3>
                <p className="benefit-description">
                  {benefit.description}
                </p>
              </div>

              <div className="benefit-bottom-line" />
            </article>
          ))}
        </div>

        <div className="benefits-footer">
          <Icon icon="solar:heart-linear" width="19" height="19" />
          <span>MADE FOR YOUR EVERYDAY STYLE</span>
        </div>
      </div>

      <style jsx>{`
        .benefits-premium {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 88px 0 76px;
          background: #f8f7f4;
          color: #171717;
          border-top: 1px solid #e8e5df;
          border-bottom: 1px solid #e8e5df;
        }

        .benefits-inner {
          width: 100%;
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 56px;
        }

        .benefits-heading {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 17px;
        }

        .benefits-heading-line {
          width: 43px;
          height: 1px;
          background: #b6a995;
        }

        .benefits-eyebrow {
          color: #796a58;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.24em;
          text-align: center;
        }

        .benefits-intro {
          max-width: 650px;
          margin: 23px auto 52px;
          text-align: center;
        }

        .benefits-intro h2 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(30px, 3.5vw, 48px);
          font-weight: 400;
          letter-spacing: -0.045em;
          line-height: 1.18;
        }

        .benefits-intro h2 span {
          color: #8a7964;
          font-style: italic;
        }

        .benefits-intro > p {
          max-width: 440px;
          margin: 16px auto 0;
          color: #77736d;
          font-size: 14px;
          line-height: 1.8;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          border-top: 1px solid #ded9d0;
          border-bottom: 1px solid #ded9d0;
        }

        .benefit-card {
          position: relative;
          display: flex;
          min-width: 0;
          flex-direction: column;
          padding: 26px 29px 30px;
          border-right: 1px solid #ded9d0;
          background: transparent;
          transition:
            background 0.35s ease,
            transform 0.35s ease;
        }

        .benefit-card:last-child {
          border-right: 0;
        }

        .benefit-card:hover {
          z-index: 1;
          background: #fffefa;
          transform: translateY(-5px);
        }

        .benefit-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .benefit-number {
          color: #a49a8b;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 14px;
          font-style: italic;
        }

        .benefit-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999084;
          transition:
            color 0.3s ease,
            transform 0.3s ease;
        }

        .benefit-card:hover .benefit-arrow {
          color: #171717;
          transform: translate(3px, -3px);
        }

        .benefit-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin: 33px 0 27px;
        }

        .benefit-icon {
          display: flex;
          width: 94px;
          height: 94px;
          align-items: center;
          justify-content: center;
          border: 1px solid #e4ded4;
          border-radius: 50%;
          background: #f0ede7;
          color: #25221e;
          transition:
            color 0.35s ease,
            background 0.35s ease,
            border-color 0.35s ease,
            transform 0.35s ease;
        }

        .benefit-card:hover .benefit-icon {
          border-color: #24211d;
          background: #24211d;
          color: #fff;
          transform: scale(1.06);
        }

        .benefit-copy {
          flex: 1;
        }

        .benefit-kicker {
          margin: 0 0 9px;
          color: #897965;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.13em;
          line-height: 1.5;
          text-transform: uppercase;
        }

        .benefit-copy h3 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(19px, 1.6vw, 24px);
          font-weight: 400;
          letter-spacing: -0.035em;
          line-height: 1.3;
        }

        .benefit-description {
          margin: 13px 0 0;
          color: #77736d;
          font-size: 12px;
          line-height: 1.9;
        }

        .benefit-bottom-line {
          width: 32px;
          height: 2px;
          margin-top: 27px;
          background: #b8a58d;
          transition: width 0.35s ease;
        }

        .benefit-card:hover .benefit-bottom-line {
          width: 65px;
        }

        .benefits-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: 35px;
          color: #887967;
        }

        .benefits-footer span {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.2em;
        }

        @media (min-width: 769px) and (max-width: 1100px) {
          .benefits-inner {
            padding: 0 30px;
          }

          .benefit-card {
            padding: 24px 20px 26px;
          }

          .benefit-icon {
            width: 78px;
            height: 78px;
          }

          .benefit-icon :global(svg) {
            width: 36px !important;
            height: 36px !important;
          }

          .benefit-icon-wrap {
            margin: 29px 0 24px;
          }

          .benefit-copy h3 {
            font-size: 20px;
          }
        }

        @media (min-width: 769px) and (max-width: 900px) {
          .benefits-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .benefit-card {
            padding: 28px;
            border-bottom: 1px solid #ded9d0;
          }

          .benefit-card:nth-child(2) {
            border-right: 0;
          }

          .benefit-card:nth-child(3),
          .benefit-card:nth-child(4) {
            border-bottom: 0;
          }

          .benefit-icon {
            width: 86px;
            height: 86px;
          }

          .benefit-copy h3 {
            font-size: 23px;
          }
        }

        @media (max-width: 768px) {
          .benefits-premium {
            padding: 62px 0 52px;
          }

          .benefits-inner {
            padding: 0 24px;
          }

          .benefits-intro {
            margin: 20px auto 35px;
          }

          .benefits-intro h2 {
            font-size: clamp(29px, 6vw, 39px);
          }

          .benefits-intro > p {
            font-size: 13px;
          }

          .benefits-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .benefit-card {
            padding: 24px 20px;
            border-bottom: 1px solid #ded9d0;
          }

          .benefit-card:nth-child(2) {
            border-right: 0;
          }

          .benefit-card:nth-child(3),
          .benefit-card:nth-child(4) {
            border-bottom: 0;
          }

          .benefit-icon-wrap {
            margin: 25px 0 22px;
          }

          .benefit-icon {
            width: 76px;
            height: 76px;
          }

          .benefit-icon :global(svg) {
            width: 36px !important;
            height: 36px !important;
          }

          .benefit-copy h3 {
            font-size: 21px;
          }

          .benefit-description {
            font-size: 12px;
          }

          .benefits-footer {
            margin-top: 28px;
          }
        }

        @media (max-width: 480px) {
          .benefits-premium {
            padding: 50px 0 42px;
          }

          .benefits-inner {
            padding: 0 16px;
          }

          .benefits-heading {
            gap: 10px;
          }

          .benefits-heading-line {
            width: 25px;
          }

          .benefits-eyebrow {
            font-size: 8px;
            letter-spacing: 0.17em;
          }

          .benefits-intro {
            margin-bottom: 27px;
          }

          .benefits-intro h2 {
            font-size: 29px;
          }

          .benefits-intro > p {
            max-width: 320px;
            font-size: 12px;
          }

          .benefit-card {
            padding: 19px 12px 21px;
          }

          .benefit-number {
            font-size: 12px;
          }

          .benefit-arrow :global(svg) {
            width: 18px !important;
            height: 18px !important;
          }

          .benefit-icon-wrap {
            margin: 22px 0 19px;
          }

          .benefit-icon {
            width: 65px;
            height: 65px;
          }

          .benefit-icon :global(svg) {
            width: 30px !important;
            height: 30px !important;
          }

          .benefit-kicker {
            font-size: 8px;
            letter-spacing: 0.08em;
          }

          .benefit-copy h3 {
            font-size: 18px;
          }

          .benefit-description {
            margin-top: 9px;
            font-size: 11px;
            line-height: 1.7;
          }

          .benefit-bottom-line {
            margin-top: 20px;
          }

          .benefits-footer span {
            font-size: 8px;
            letter-spacing: 0.13em;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .benefit-card,
          .benefit-icon,
          .benefit-arrow,
          .benefit-bottom-line {
            transition: none !important;
          }

          .benefit-card:hover,
          .benefit-card:hover .benefit-icon,
          .benefit-card:hover .benefit-arrow {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
