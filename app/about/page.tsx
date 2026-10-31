import Image from "next/image";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import bannerImage from "@/assets/Orive Women’s Fashion Boutique Banner.jpg";

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white text-[#222222]">

        {/* BANNER IMAGE */}

        <section className="mx-auto w-full max-w-[1200px] px-4 pt-10 sm:px-8 sm:pt-14 lg:px-12 lg:pt-16">
          <div className="mx-auto w-full max-w-[950px]">
            <Image
              src={bannerImage}
              alt="House Of Orive women's fashion collection"
              width={bannerImage.width}
              height={bannerImage.height}
              priority
              sizes="(max-width: 768px) 100vw, 950px"
              className="block h-auto w-full object-contain"
            />
          </div>
        </section>

        {/* ABOUT CONTENT */}

        <section className="mx-auto max-w-[1000px] px-6 pb-20 pt-16 sm:px-10 sm:pt-20 lg:px-0 lg:pt-24">

          {/* CORE VALUES + COMMUNITY */}

          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">

            {/* CORE VALUES */}

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#242424]">
                Core Values
              </h2>

              <p className="mt-6 font-serif text-[13px] leading-[2] text-[#555555]">
                At{" "}
                <strong className="font-semibold text-[#222222]">
                  House Of Orive
                </strong>
                , we believe fashion should be beautiful,
                comfortable and effortless. Every piece is chosen
                with attention to its design, quality and the way
                it makes you feel. We value timeless style,
                thoughtful details and clothing that brings
                confidence to everyday dressing. Our aim is to
                create a wardrobe that feels personal, refined
                and easy to wear.
              </p>
            </div>

            {/* OUR COMMUNITY */}

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-[#242424]">
                Our Community
              </h2>

              <p className="mt-6 font-serif text-[13px] leading-[2] text-[#555555]">
                At{" "}
                <strong className="font-semibold text-[#222222]">
                  House Of Orive
                </strong>
                , our customers are at the heart of everything
                we do. We believe style is a form of personal
                expression, and everyone deserves to feel
                confident in what they wear. We aim to build a
                community that values individuality, creativity
                and an appreciation for thoughtful fashion.
                Every collection is created with this spirit
                in mind.
              </p>
            </div>

          </div>

          {/* BRAND DETAILS */}

          <div className="mt-20 space-y-7 border-t border-[#eeeeee] pt-10 sm:mt-24">

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <span className="text-[10px] uppercase tracking-[0.12em] text-[#777777]">
                Founder:
              </span>

              <strong className="text-[11px] font-semibold uppercase tracking-wide text-[#222222]">
                Tarannum Ara (Fashion Designer)
              </strong>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <span className="text-[10px] uppercase tracking-[0.12em] text-[#777777]">
                Founded:
              </span>

              <strong className="text-[11px] font-semibold uppercase tracking-wide text-[#222222]">
                2026
              </strong>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <span className="text-[10px] uppercase tracking-[0.12em] text-[#777777]">
                Location:
              </span>

              <strong className="text-[11px] font-semibold uppercase tracking-wide text-[#222222]">
                New Delhi, India
              </strong>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <span className="text-[10px] uppercase tracking-[0.12em] text-[#777777]">
                Brand:
              </span>

              <strong className="text-[11px] font-semibold uppercase tracking-wide text-[#222222]">
                House Of Orive — Women's Fashion
              </strong>
            </div>

          </div>

          {/* CLOSING STATEMENT */}

          <div className="mt-20 border-t border-[#eeeeee] pt-8">

            <p className="font-serif text-2xl leading-relaxed text-[#333333] sm:text-3xl">
              Thoughtful fashion.
              <br />
              Everyday confidence.
            </p>

            <p className="mt-4 text-[9px] font-medium uppercase tracking-[0.22em] text-[#999999]">
              House Of Orive
            </p>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}