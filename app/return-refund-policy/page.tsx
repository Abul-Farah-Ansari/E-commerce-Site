import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Return & Refund Policy | House of Orive",
  description: "Return and refund policy information for House of Orive.",
};

export default function ReturnRefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="policy-page">
      <style>{`
        .policy-page{min-height:100vh;background:#f8f7f4;color:#171717;padding:34px 22px 70px}
        .policy-shell{width:100%;max-width:980px;margin:0 auto}.policy-header:after{content:"✦";display:grid;place-items:center;width:42px;height:42px;margin-top:30px;border:1px solid #c9c3b8;border-radius:50%;color:#5e574b;font-size:16px}
        .policy-back-link{display:inline-flex;gap:9px;align-items:center;color:#555;font-size:12px;letter-spacing:.04em;text-decoration:none}
        .policy-back-link:hover,.policy-footer a:hover{color:#000}
        .policy-header{padding:78px 0 42px;max-width:720px}
        .policy-eyebrow{margin:0 0 18px;color:#777168;font-size:10px;font-weight:700;letter-spacing:.22em;text-transform:uppercase}
        .policy-page h1{margin:0;font-family:var(--font-bodoni,Georgia,serif);font-size:clamp(45px,8vw,78px);font-weight:400;letter-spacing:-.055em;line-height:.98}
        .policy-intro{max-width:650px;margin:26px 0 0;color:#64615c;font-size:15px;line-height:1.9}
        .draft-notice{margin:0 0 30px;padding:22px 24px;border:1px solid #b9a77d;background:#f0ece2}
        .draft-notice strong{display:block;margin-bottom:8px;color:#51442a;font-size:11px;letter-spacing:.12em;text-transform:uppercase}
        .draft-notice p{margin:0;color:#5f5748;font-size:13px;line-height:1.8}
        .policy-rule{height:1px;background:#dcd9d2}
        .policy-section{display:grid;grid-template-columns:54px minmax(0,1fr);gap:22px;padding:34px 0;border-bottom:1px solid #e3e0da}.policy-icon{width:46px;height:46px;display:grid;place-items:center;border:1px solid #d8d3ca;border-radius:50%;color:#554f45;background:#fbfaf8}.policy-icon svg{width:19px;height:19px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
        .policy-number{margin:4px 0 0;color:#918b80;font-family:var(--font-bodoni,Georgia,serif);font-size:25px}
        .policy-section h2,.policy-contact h2{margin:0 0 12px;font-family:var(--font-bodoni,Georgia,serif);font-size:clamp(25px,4vw,34px);font-weight:400;letter-spacing:-.025em}
        .policy-section p:not(.policy-number){margin:0;color:#5f5c57;font-size:14px;line-height:1.9}
        .policy-section a{color:#171717;text-underline-offset:3px}
        .policy-section .draft-placeholder{margin-top:12px;color:#7b6a49;font-size:12px;font-style:italic}
        .policy-contact{position:relative;overflow:hidden;margin-top:54px;padding:42px;background:#171717;color:#fff;border:1px solid #292929}.policy-contact:after{content:"✦";position:absolute;right:26px;top:10px;color:#38352f;font-size:88px;pointer-events:none}
        .policy-contact .policy-eyebrow{color:#b8b3aa}
        .policy-contact h2{margin-bottom:10px;color:#fff}
        .policy-contact>p:not(.policy-eyebrow){margin:0;color:#c5c2bd;font-size:14px;line-height:1.9}
        .policy-button{display:inline-flex;align-items:center;gap:18px;margin-top:24px;padding:13px 17px;background:#f8f7f4;color:#171717;font-size:11px;font-weight:700;letter-spacing:.08em;text-decoration:none;text-transform:uppercase}
        .policy-footer{display:flex;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-top:36px;color:#777168;font-size:10px;letter-spacing:.12em}
        .policy-footer a{color:#777168;text-decoration:none;letter-spacing:0}
        @media(max-width:560px){.policy-page{padding:24px 17px 44px}.policy-header{padding:60px 0 32px}.policy-section{grid-template-columns:42px minmax(0,1fr);gap:14px;padding:26px 0}.policy-icon{width:38px;height:38px}.policy-section p:not(.policy-number),.draft-notice p{font-size:13px}.policy-contact{padding:25px 20px}}
      `}</style>

      <div className="policy-shell">
        <Link href="/" className="policy-back-link"><span aria-hidden="true">←</span> Back to Home</Link>
        <header className="policy-header">
          <p className="policy-eyebrow">HOUSE OF ORIVE · CUSTOMER CARE</p>
          <h1>Return &amp; Refund Policy</h1>
          <p className="policy-intro">We want you to feel confident when shopping with House of Orive. Our return and refund terms are being finalised. Please review the draft status below before this page is published as a final policy.</p>
        </header>
        <div className="draft-notice" role="status"><strong>Draft for business confirmation</strong><p>This page is not ready to be treated as a final customer policy. Confirm the return window, eligible items, return-shipping costs, refund method and processing timeline before publishing.</p></div>
        <div className="policy-rule" />
        <section className="policy-section"><span className="policy-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 7h18l-1.5 13h-15L3 7Z"/><path d="M8 7a4 4 0 0 1 8 0"/></svg></span><div><h2>Return Eligibility</h2><p><strong>To confirm before publishing:</strong> state the number of days customers have to request a return, the condition items must be in, and whether tags, original packaging or proof of purchase are required.</p><p className="draft-placeholder">Business decision needed: return window and item-condition rules.</p></div></section>
        <section className="policy-section"><span className="policy-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 13h5"/></svg></span><div><h2>Items That Cannot Be Returned</h2><p><strong>To confirm before publishing:</strong> list any product categories that are excluded from returns, if applicable. Do not list exclusions unless they match your actual business practice.</p><p className="draft-placeholder">Business decision needed: any product exclusions.</p></div></section>
        <section className="policy-section"><span className="policy-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3 20 7v5c0 5-4 8-8 9-4-1-8-4-8-9V7l8-4Z"/><path d="m9 12 2 2 4-4"/></svg></span><div><h2>Damaged, Defective or Incorrect Items</h2><p>Define how a customer should contact House of Orive if an order arrives damaged, defective or different from what was ordered. Confirm the required evidence and the deadline for reporting an issue before publishing this section.</p><p className="draft-placeholder">Business decision needed: reporting window and resolution process.</p></div></section>
        <section className="policy-section"><span className="policy-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6"/></svg></span><div><h2>Refund Method and Timing</h2><p>Confirm whether approved refunds go to the original payment method or are handled another way, and specify the expected processing time. Do not promise a refund timeline until it has been confirmed.</p><p className="draft-placeholder">Business decision needed: refund method and processing timeline.</p></div></section>
        <section className="policy-section"><span className="policy-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3 8h11v9H3zM14 11h4l3 3v3h-7z"/><circle cx="7" cy="19" r="1.5"/><circle cx="18" cy="19" r="1.5"/></svg></span><div><h2>Return Shipping Costs</h2><p>Confirm who pays the return-shipping cost and whether the arrangement differs for damaged, defective or incorrectly supplied items.</p><p className="draft-placeholder">Business decision needed: return-shipping cost responsibility.</p></div></section>
        <section className="policy-section"><span className="policy-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span><div><h2>How to Contact Us</h2><p>Customers can contact House of Orive at <a href="mailto:Houseoforive@gmail.com">Houseoforive@gmail.com</a> or call <a href="tel:+918448658341">8448658341</a>. Confirm whether these are the preferred channels for return requests.</p></div></section>
        <div className="policy-contact"><p className="policy-eyebrow">HOUSE OF ORIVE</p><h2>Questions about an order?</h2><p>Contact our team for assistance with your order.</p><Link href="/contact" className="policy-button">Contact Us <span aria-hidden="true">↗</span></Link></div>
        <footer className="policy-footer"><span>HOUSE OF ORIVE</span><Link href="/shipping-policy">Shipping Policy</Link></footer>
      </div>
      </main>
      <Footer />
    </>
  );
}
