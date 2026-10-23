import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="policy-page">
        <article className="policy-card">
          <p className="policy-eyebrow">HOUSE OF ORIVE</p>
          <h1>Privacy Policy</h1>
          <p>At House of Orive, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard information when you visit houseoforive.in or make a purchase.</p>

          <h2>1. Information We Collect</h2>
          <p><strong>Personal information:</strong> Information you provide, such as your name, email address, phone number, shipping and billing address, and order details.</p>
          <p><strong>Transaction information:</strong> Order and payment-status details needed to process purchases. Payment details may be handled by our payment service providers.</p>
          <p><strong>Technical information:</strong> Browser type, device information, IP address, and website usage data where collected by our systems or analytics tools.</p>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To process, confirm, ship, and support your orders.</li>
            <li>To communicate about purchases, deliveries, returns, or enquiries.</li>
            <li>To maintain, secure, and improve our website and services.</li>
            <li>To send promotional communications where permitted; you can opt out of marketing messages.</li>
            <li>To prevent fraud and comply with applicable legal obligations.</li>
          </ul>

          <h2>3. Sharing Your Information</h2>
          <p>We do not sell your personal information. We may share relevant information with trusted service providers, such as payment processors, delivery partners, hosting providers, and customer-support tools, only as needed to operate our store and fulfil your requests. We may disclose information where required by law.</p>

          <h2>4. Data Security and Retention</h2>
          <p>We use reasonable measures designed to protect personal information. No internet transmission or storage system can be guaranteed to be completely secure. We retain information for as long as reasonably necessary for orders, support, legal compliance, and legitimate business purposes.</p>

          <h2>5. Cookies and Similar Technologies</h2>
          <p>Our website may use essential cookies or similar technologies to support shopping-cart functions, site security, preferences, and website performance. See our <a href="/cookies-policy">Cookies Policy</a> for more information.</p>

          <h2>6. Your Choices and Rights</h2>
          <p>You may contact us to request access to, correction of, or deletion of personal information, subject to applicable law and any records we must retain. You may opt out of promotional communications at any time.</p>

          <h2>7. Third-Party Services</h2>
          <p>Our website may link to or use third-party services. Those services operate under their own privacy terms, and we encourage you to review them when using their services.</p>

          <h2>8. Changes to This Policy</h2>
          <p>We may update this policy from time to time. Any updated version will be published on this page with a revised update date.</p>

          <h2>Contact Us</h2>
          <p>If you have questions about this Privacy Policy or how your information is handled, contact us:</p>
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
