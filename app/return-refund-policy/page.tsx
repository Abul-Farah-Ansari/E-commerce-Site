import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Exchange & Refund Policy | House of Orive",
  description:
    "Read the House of Orive exchange-only policy, including eligibility, conditions, and how to request an exchange.",
};

export default function ReturnRefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="policy-page">
        <style>{`
          .policy-page{min-height:100vh;background:#f8f7f4;color:#171717;padding:34px 22px 70px}
          .policy-shell{width:100%;max-width:980px;margin:0 auto}
          .policy-header:after{content:"✦";display:grid;place-items:center;width:42px;height:42px;margin-top:30px;border:1px solid #c9c3b8;border-radius:50%;color:#5e574b;font-size:16px}
          .policy-back-link{display:inline-flex;gap:9px;align-items:center;color:#555;font-size:12px;letter-spacing:.04em;text-decoration:none}
          .policy-back-link:hover,.policy-footer a:hover{color:#000}
          .policy-header{padding:78px 0 42px;max-width:720px}
          .policy-eyebrow{margin:0 0 18px;color:#777168;font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase}
          .policy-page h1{margin:0;font-family:var(--font-cormorant,Georgia,serif);font-size:clamp(45px,8vw,78px);font-weight:400;letter-spacing:-.055em;line-height:.98}
          .policy-intro{max-width:650px;margin:26px 0 0;color:#64615c;font-size:15px;line-height:1.9}
          .policy-rule{height:1px;background:#dcd9d2}
          .policy-section{display:grid;grid-template-columns:54px minmax(0,1fr);gap:22px;padding:34px 0;border-bottom:1px solid #e3e0da}
          .policy-icon{width:46px;height:46px;display:grid;place-items:center;border:1px solid #d8d3ca;border-radius:50%;color:#554f45;background:#fbfaf8}
          .policy-icon svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
          .policy-section h2,.policy-contact h2{margin:0 0 12px;font-family:var(--font-cormorant,Georgia,serif);font-size:clamp(25px,4vw,34px);font-weight:400;letter-spacing:-.025em}
          .policy-section p{margin:0;color:#5f5c57;font-size:14px;line-height:1.9}
          .policy-list{display:grid;gap:11px;margin:0;padding-left:19px;color:#5f5c57;font-size:14px;line-height:1.9}
          .policy-list li{padding-left:4px}
          .policy-contact{position:relative;overflow:hidden;margin-top:54px;padding:42px;background:#171717;color:#fff;border:1px solid #292929}
          .policy-contact:after{content:"✦";position:absolute;right:26px;top:10px;color:#38352f;font-size:88px;pointer-events:none}
          .policy-contact .policy-eyebrow{color:#b8b3aa}
          .policy-contact h2{margin-bottom:10px;color:#fff}
          .policy-contact>p:not(.policy-eyebrow){margin:0;color:#c5c2bd;font-size:14px;line-height:1.9}
          .policy-button{display:inline-flex;align-items:center;gap:18px;margin-top:24px;padding:13px 17px;background:#f8f7f4;color:#171717;font-size:11px;font-weight:700;letter-spacing:.08em;text-decoration:none;text-transform:uppercase}
          .policy-footer{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-top:36px;color:#777168;font-size:10px;letter-spacing:.12em}
          .policy-footer a{color:#777168;text-decoration:none;letter-spacing:0}
          @media(max-width:560px){.policy-page{padding:24px 17px 44px}.policy-header{padding:60px 0 32px}.policy-section{grid-template-columns:42px minmax(0,1fr);gap:14px;padding:26px 0}.policy-icon{width:38px;height:38px}.policy-section p,.policy-list{font-size:13px}.policy-contact{padding:25px 20px}}
        `}</style>

        <div className="policy-shell">
          <Link href="/" className="policy-back-link">
            <span aria-hidden="true">←</span> Back to Home
          </Link>

          <header className="policy-header">
            <p className="policy-eyebrow">HOUSE OF ORIVE · CUSTOMER CARE</p>
            <h1>Exchange &amp; Refund Policy</h1>
            <p className="policy-intro">
              At ORIVE, we want you to love every piece you purchase. Please read our
              exchange policy carefully before placing your order.
            </p>
          </header>

          <div className="policy-rule" />

          <section className="policy-section">
            <span className="policy-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M3 7h18l-1.5 13h-15L3 7Z" /><path d="M8 7a4 4 0 0 1 8 0" /></svg>
            </span>
            <div>
              <h2>1. Exchange Policy</h2>
              <ul className="policy-list">
                <li>If you experience a size or fitting issue, you can request an exchange within 7 days of receiving your order.</li>
                <li>Exchanges are subject to product availability and the availability of the required size.</li>
                <li>The product must be unused, unworn, unwashed, and returned in its original condition with all tags and packaging intact.</li>
                <li>Please contact our customer support team within 7 days of delivery to request an exchange.</li>
              </ul>
            </div>
          </section>

          <section className="policy-section">
            <span className="policy-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z" /><path d="M8 9h8M8 13h5" /><path d="m7 17 10-10" /></svg>
            </span>
            <div>
              <h2>2. No Returns or Refunds</h2>
              <ul className="policy-list">
                <li>We do not accept returns or offer refunds.</li>
                <li>We offer an exchange-only policy for eligible size and fitting issues.</li>
                <li>Once an order has been placed, cancellations and refund requests are not accepted.</li>
              </ul>
            </div>
          </section>

          <section className="policy-section">
            <span className="policy-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 3 20 7v5c0 5-4 8-8 9-4-1-8-4-8-9V7l8-4Z" /><path d="m9 12 2 2 4-4" /></svg>
            </span>
            <div>
              <h2>3. Exchange Conditions</h2>
              <ul className="policy-list">
                <li>Products showing signs of wear, damage, washing, or alteration will not be eligible for exchange.</li>
                <li>Exchanges are subject to verification and approval by our team.</li>
                <li>Any applicable shipping charges for exchanges will be communicated to the customer before processing.</li>
              </ul>
            </div>
          </section>

          <section className="policy-section">
            <span className="policy-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z" /><path d="m4 7 8 6 8-6" /></svg>
            </span>
            <div>
              <h2>4. How to Request an Exchange</h2>
              <p className="policy-section-copy">
                To request an exchange, please contact our customer support team with your order number and the reason for the exchange within 7 days of receiving your order.
              </p>
            </div>
          </section>

          <div className="policy-contact">
            <p className="policy-eyebrow">HOUSE OF ORIVE</p>
            <h2>Questions about an exchange?</h2>
            <p>Thank you for shopping with ORIVE. We appreciate your trust and support.</p>
            <Link href="/contact" className="policy-button">
              Contact Us <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <footer className="policy-footer">
            <span>ORIVE – Wear Your Elegance.</span>
            <Link href="/shipping-policy">Shipping Policy</Link>
          </footer>
        </div>
      </main>
      <Footer />
    </>
  );
}
