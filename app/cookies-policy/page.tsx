import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CookiesPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="policy-page">
        <article className="policy-card">
          <p className="policy-eyebrow">HOUSE OF ORIVE</p>
          <h1>Cookies Policy</h1>
          <p>This website, houseoforive.in, may use cookies and similar technologies to support shopping, improve your browsing experience, and understand how the website is used.</p>
          <p>Cookies are small text files stored on your device when you visit a website. They can help a website remember actions and preferences between visits.</p>

          <h2>1. Essential Cookies</h2>
          <p>Essential cookies may be needed for core functions such as maintaining your shopping cart, supporting secure checkout, remembering session information, and helping protect the website. These functions may not work properly if essential cookies are disabled.</p>

          <h2>2. Preferences and Functionality</h2>
          <p>Where used, functional cookies can remember preferences and help provide a more convenient experience.</p>

          <h2>3. Analytics and Performance</h2>
          <p>We may use analytics or performance technologies to understand website traffic, identify popular pages or products, and improve the performance and usability of our store.</p>

          <h2>4. Advertising and Third-Party Cookies</h2>
          <p>If advertising, social media, payment, analytics, or delivery tools are integrated into the website, those services may use their own cookies or similar technologies. Their use is governed by the respective third-party policies.</p>

          <h2>5. Managing Cookies</h2>
          <p>You can manage or delete cookies through your browser settings. Blocking certain cookies may affect shopping-cart, login, or other website functionality. If a cookie preference tool is provided on our website, you can also use it to manage available choices.</p>

          <h2>6. Changes to This Policy</h2>
          <p>We may update this Cookies Policy when our practices or services change. The latest version will be available on this page.</p>

          <h2>Contact Us</h2>
          <p>If you have questions about this Cookies Policy, please contact:</p>
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
