import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import ProductSection from "@/components/ProductSection";
import PromoBanner from "@/components/PromoBanner";
import Benefits from "@/components/Benefits";
import Testimonials from "@/components/Testimonials";
import BrandStory from "@/components/BrandStory";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <Hero />

        {/* Categories */}
        <Categories />

        {/* New Arrivals */}
        <ProductSection
          title="New Arrivals"
          subtitle="THE LATEST EDIT"
          type="new"
          limit={5}
        />

        {/* Sale */}
        <ProductSection
          title="Sale"
          subtitle="SPECIAL EDIT"
          type="sale"
          limit={5}
        />

        {/* Trending */}
        <ProductSection
          title="Trending Now"
          subtitle="WHAT'S HOT"
          type="trending"
          limit={5}
        />
        <PromoBanner />

        {/* Best Sellers */}
        <ProductSection
          title="Best Sellers"
          subtitle="MOST WANTED"
          type="featured"
          limit={5}
        />

        {/* Promotional Banner */}
        

        {/* Benefits */}
        <Benefits />

        {/* Brand Story */}
        <BrandStory />

        {/* Testimonials */}
        <Testimonials />

        {/* Contact */}
        <ContactSection />
      </main>

      <Footer />
    </>
  );
}