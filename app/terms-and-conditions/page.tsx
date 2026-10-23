import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsAndConditionsPage() {
  return (
    <>
      <Navbar />
      <main className="policy-page">
        <article className="policy-card">
          <p className="policy-eyebrow">HOUSE OF ORIVE</p>
          <h1>Terms &amp; Conditions</h1>
          <p>Welcome to House of Orive. By accessing or using houseoforive.in, you agree to these Terms &amp; Conditions. Please read them before placing an order.</p>

          <h2>1. Website Use</h2>
          <p>You agree to use this website lawfully and not to interfere with its security, operation, or other users' experience. We may update website content, features, and these terms from time to time.</p>

          <h2>2. Products and Availability</h2>
          <p>We aim to display product descriptions, colours, images, and prices as accurately as possible. Actual colours may vary depending on your screen. Products are subject to availability, and we may correct errors or update product information where necessary.</p>

          <h2>3. Orders and Payments</h2>
          <p>Placing an order is a request to purchase. Orders may be subject to availability, verification, and payment confirmation. Prices are displayed in Indian Rupees unless stated otherwise. Applicable charges will be shown during checkout where possible.</p>

          <h2>4. Shipping and Delivery</h2>
          <p>Delivery estimates are indicative and may be affected by location, courier operations, weather, or other circumstances outside our reasonable control. Any shipping information displayed at checkout or in our Shipping Policy also applies.</p>

          <h2>5. Returns, Refunds and Exchanges</h2>
          <p>Returns, refunds, and exchanges are governed by the applicable policy displayed on our website. Please review our <a href="/return-refund-policy">Return &amp; Refund Policy</a> before ordering. If a product arrives damaged or incorrect, contact us promptly with your order details and supporting photographs so we can review the issue.</p>

          <h2>6. Intellectual Property</h2>
          <p>Website text, branding, graphics, photography, and other content are owned by House of Orive or used with permission. They may not be copied, reproduced, or redistributed without prior permission, except as allowed by law.</p>

          <h2>7. Third-Party Services</h2>
          <p>Our website may link to third-party services, including payment and delivery providers. We do not control their websites or policies; your use of those services may be subject to their terms.</p>

          <h2>8. Limitation of Liability</h2>
          <p>To the extent permitted by applicable law, House of Orive is not liable for indirect or consequential loss arising from use of the website. Nothing in these terms excludes liability that cannot legally be excluded.</p>

          <h2>9. Privacy</h2>
          <p>Your use of the website is also subject to our <a href="/privacy-policy">Privacy Policy</a> and <a href="/cookies-policy">Cookies Policy</a>.</p>

          <h2>10. Governing Law</h2>
          <p>These terms are governed by the applicable laws of India. Any dispute will be handled by a competent court with jurisdiction under applicable law.</p>

          <h2>Contact Us</h2>
          <address>House of Orive<br />Email: <a href="mailto:info@houseoforive.in">info@houseoforive.in</a><br />Website: <a href="https://houseoforive.in">houseoforive.in</a></address>
          <p className="policy-updated">Last updated: 24 October 2026</p>
        </article>
      </main>
      <Footer />
      <style>{`
        .policy-page { min-height: 60vh; background: #f7f8f8; padding: 54px 24px 72px; color: #292929; }
        .policy-card { max-width: 1120px; margin: 0 auto; padding: clamp(28px, 5vw, 64px); background: #fff; border: 1px solid #e9e6e1; box-shadow: 0 12px 38px rgba(20,20,20,.045); }
        .policy-eyebrow { margin: 0 0 12px; color: #8a7965; font-size: 11px; font-weight: 600; letter-spacing: .22em; }
        .policy-card h1 { margin: 0 0 26px; font-size: clamp(34px, 4vw, 48px); font-weight: 500; line-height: 1.12; color: #181818; }
        .policy-card h2 { margin: 30px 0 10px; font-size: 19px; font-weight: 600; color: #222; }
        .policy-card p, .policy-card li, .policy-card address { font-size: 15px; line-height: 1.85; color: #595959; }
        .policy-card p { margin: 0 0 12px; }
        .policy-card ul { padding-left: 22px; margin: 8px 0 14px; }
        .policy-card li { padding-left: 4px; margin: 5px 0; }
        .policy-card a { color: #8a6848; text-decoration: underline; text-underline-offset: 3px; }
        .policy-card address { font-style: normal; }
        .policy-updated { margin-top: 28px !important; color: #888 !important; font-size: 12px !important; }
        @media (max-width: 600px) { .policy-page { padding: 28px 14px 42px; } .policy-card { padding: 26px 20px; } .policy-card p, .policy-card li, .policy-card address { font-size: 14px; } .policy-card h2 { font-size: 17px; } }
      `}</style>
    </>
  );
}
