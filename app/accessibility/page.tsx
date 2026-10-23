import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AccessibilityPage() {
  return (
    <>
      <Navbar />
      <main className="policy-page">
        <article className="policy-card">
          <p className="policy-eyebrow">HOUSE OF ORIVE</p>
          <h1>Website Accessibility</h1>
          <p>House of Orive is committed to making houseoforive.in accessible and usable for as many visitors as possible, including people with disabilities. We aim to provide an inclusive and user-friendly shopping experience.</p>
          <p>We work to improve the usability of our website and to follow generally accepted accessibility practices. Accessibility may vary across devices, browsers, and third-party tools.</p>

          <h2>Accessibility Features</h2>
          <p>We aim for the website to:</p>
          <ul>
            <li>Be usable on desktop, tablet, and mobile devices.</li>
            <li>Provide readable text and clear contrast where possible.</li>
            <li>Support keyboard navigation for key interactive elements where possible.</li>
            <li>Use descriptive labels and meaningful links.</li>
            <li>Allow browser zoom without unnecessarily breaking the layout.</li>
            <li>Present content in a clear and structured way.</li>
          </ul>

          <h2>Ongoing Improvements</h2>
          <p>We continue to review and improve our website. Some content or features may not yet be fully accessible, and we welcome feedback that helps us identify areas for improvement.</p>

          <h2>Third-Party Content</h2>
          <p>Some features, such as payment gateways, delivery tools, embedded media, or external services, may be operated by third parties. We cannot guarantee the accessibility of platforms we do not control, but we aim to work with reputable providers.</p>

          <h2>Need Help or Found an Issue?</h2>
          <p>If you have difficulty accessing any part of our website or need assistance placing an order, please contact us. Include the page you were visiting and a brief description of the issue so we can assist you.</p>

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
