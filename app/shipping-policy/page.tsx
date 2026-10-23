import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Shipping Policy | House of Orive",
  description: "Shipping and delivery information for House of Orive orders.",
};

export default function ShippingPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="policy-page">
      <style>{`
        .policy-page{min-height:100vh;background:#f8f7f4;color:#171717;padding:34px 22px 70px}
        .policy-shell{width:100%;max-width:980px;margin:0 auto}.policy-header:after{content:"✦";display:grid;place-items:center;width:42px;height:42px;margin-top:30px;border:1px solid #c9c3b8;border-radius:50%;color:#5e574b;font-size:16px}
        .policy-back-link{display:inline-flex;gap:9px;align-items:center;color:#555;font-size:12px;letter-spacing:.04em;text-decoration:none}
        .policy-back-link:hover,.policy-footer a:hover{color:#000}
        .policy-header{padding:78px 0 45px;max-width:720px}
        .policy-eyebrow{margin:0 0 18px;color:#777168;font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase}
        .policy-page h1{margin:0;font-family:var(--font-bodoni,Georgia,serif);font-size:clamp(45px,8vw,82px);font-weight:400;letter-spacing:-.055em;line-height:.98}
        .policy-intro{max-width:610px;margin:26px 0 0;color:#64615c;font-size:15px;line-height:1.9}
        .policy-rule{height:1px;background:#dcd9d2}
        .policy-section{display:grid;grid-template-columns:54px minmax(0,1fr);gap:22px;padding:34px 0;border-bottom:1px solid #e3e0da}.policy-icon{width:46px;height:46px;display:grid;place-items:center;border:1px solid #d8d3ca;border-radius:50%;color:#554f45;background:#fbfaf8}.policy-icon svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
        .policy-number{margin:4px 0 0;color:#918b80;font-family:var(--font-bodoni,Georgia,serif);font-size:25px}
        .policy-section h2,.policy-contact h2{margin:0 0 12px;font-family:var(--font-bodoni,Georgia,serif);font-size:clamp(25px,4vw,34px);font-weight:400;letter-spacing:-.025em}
        .policy-section p:not(.policy-number),.policy-contact>p:not(.policy-eyebrow){margin:0;color:#5f5c57;font-size:14px;line-height:1.9}
        .policy-section a{color:#171717;text-underline-offset:3px}
        .policy-contact{position:relative;overflow:hidden;margin-top:54px;padding:42px;background:#171717;color:#fff;border:1px solid #292929}.policy-contact:after{content:"✦";position:absolute;right:26px;top:10px;color:#38352f;font-size:88px;pointer-events:none}
        .policy-contact .policy-eyebrow{color:#b8b3aa}
        .policy-contact h2{margin-bottom:10px;color:#fff}
        .policy-contact>p:not(.policy-eyebrow){color:#c5c2bd}
        .policy-button{display:inline-flex;align-items:center;gap:18px;margin-top:24px;padding:13px 17px;background:#f8f7f4;color:#171717;font-size:11px;font-weight:700;letter-spacing:.08em;text-decoration:none;text-transform:uppercase}
        .policy-footer{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-top:36px;color:#777168;font-size:10px;letter-spacing:.12em}
        .policy-footer a{color:#777168;text-decoration:none;letter-spacing:0}
        @media(max-width:560px){.policy-page{padding:24px 17px 44px}.policy-header{padding:60px 0 32px}.policy-section{grid-template-columns:42px minmax(0,1fr);gap:14px;padding:26px 0}.policy-icon{width:38px;height:38px}.policy-section p:not(.policy-number),.policy-contact>p:not(.policy-eyebrow){font-size:13px}.policy-contact{padding:25px 20px}}
      `}</style>

      <div className="policy-shell">
        <Link href="/" className="policy-back-link"><span aria-hidden="true">←</span> Back to Home</Link>
        <header className="policy-header">
          <p className="policy-eyebrow">HOUSE OF ORIVE · CUSTOMER CARE</p>
          <h1>Shipping Policy</h1>
          <p className="policy-intro">We aim to prepare and deliver your House of Orive order with care. Please review the processing and delivery estimates below.</p>
        </header>
        <div className="policy-rule" />
        <section className="policy-section"><span className="policy-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 7h18l-1.5 13h-15L3 7Z"/><path d="M8 7a4 4 0 0 1 8 0"/></svg></span><div><h2>Order Processing</h2><p>Please allow <strong>1–2 business days</strong> for order processing before your order is dispatched. Processing time is separate from the estimated delivery period.</p></div></section>
        <section className="policy-section"><span className="policy-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/></svg></span><div><h2>Estimated Delivery</h2><p>After processing, delivery typically takes <strong>5–7 business days</strong>. Delivery estimates are indicative and may vary depending on the destination and courier operations.</p></div></section>
        <section className="policy-section"><span className="policy-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 7v5c0 5-4 8-8 9-4-1-8-4-8-9V7l8-4Z"/><path d="m9 12 2 2 4-4"/></svg></span><div><h2>Shipping Charges</h2><p><strong>Free shipping</strong> is offered on orders. No shipping charge is intended to be added to the customer&apos;s order under this policy.</p></div></section>
        <section className="policy-section"><span className="policy-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/></svg></span><div><h2>Questions About Your Order</h2><p>If you have a question about shipping or delivery, contact our team at <a href="mailto:Houseoforive@gmail.com">Houseoforive@gmail.com</a> or call <a href="tel:+918448658341">8448658341</a>.</p></div></section>
        <div className="policy-contact"><p className="policy-eyebrow">NEED HELP?</p><h2>We&apos;re here to help.</h2><p>For order-related questions, please get in touch with our team.</p><Link href="/contact" className="policy-button">Contact Us <span aria-hidden="true">↗</span></Link></div>
        <footer className="policy-footer"><span>HOUSE OF ORIVE</span><Link href="/return-refund-policy">Return &amp; Refund Policy</Link></footer>
      </div>
      </main>
      <Footer />
    </>
  );
}
