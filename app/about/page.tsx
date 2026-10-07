"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const values = [
  {
    number: "01",
    title: "Considered Design",
    description:
      "Every piece is selected with attention to silhouette, detail and the feeling it brings to everyday dressing.",
    icon: "solar:layers-minimalistic-linear",
  },
  {
    number: "02",
    title: "Timeless Style",
    description:
      "We believe fashion should move beyond seasons. Our collections focus on pieces that remain relevant over time.",
    icon: "solar:clock-circle-linear",
  },
  {
    number: "03",
    title: "Quiet Confidence",
    description:
      "Refined details, thoughtful proportions and effortless styling come together to create a distinctive wardrobe.",
    icon: "solar:star-shine-linear",
  },
];

const images = {
  hero: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2200&q=90",
  story:
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=90",
  editorial:
    "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2200&q=90",
};

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="bg-white">
        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative flex min-h-[620px] items-center overflow-hidden bg-black">
          <img
            src={images.hero}
            alt="House Of Orive"
            className="absolute inset-0 h-full w-full object-cover grayscale"
          />

          <div className="absolute inset-0 bg-black/45" />

          <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 py-32 sm:px-10 lg:px-16">
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/65">
              House Of Orive
            </p>

            <h1 className="mt-6 max-w-[900px] font-serif text-[72px] leading-[0.88] tracking-[-0.045em] text-white sm:text-[100px] lg:text-[140px]">
              Our Story
            </h1>

            <p className="mt-8 max-w-[580px] text-sm leading-7 text-white/75">
              A considered approach to modern fashion,
              shaped by timeless silhouettes and refined
              details.
            </p>
          </div>

          <div className="absolute bottom-8 right-8 hidden text-right lg:block">
            <p className="text-[9px] uppercase tracking-[0.25em] text-white/55">
              About
            </p>

            <p className="mt-1 font-serif text-3xl text-white">
              01
            </p>
          </div>
        </section>

        {/* ================================================= */}
        {/* INTRO */}
        {/* ================================================= */}

        <section className="mx-auto max-w-[1400px] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-black/40">
                The House Of Orive
              </p>

              <h2 className="mt-5 max-w-[430px] font-serif text-4xl leading-[1.05] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                Designed for the way you live.
              </h2>
            </div>

            <div className="max-w-[700px]">
              <p className="text-lg leading-8 text-black/70">
                House Of Orive is built around a simple
                idea — fashion should feel effortless.
              </p>

              <p className="mt-7 text-base leading-8 text-black/55">
                Our approach combines modern silhouettes,
                understated details and versatile pieces
                designed to become part of your everyday
                wardrobe.
              </p>

              <p className="mt-7 text-base leading-8 text-black/55">
                Rather than following every trend, we focus
                on creating an aesthetic that feels
                considered, contemporary and personal.
              </p>

              <div className="mt-10 flex items-center gap-3">
                <span className="h-px w-12 bg-black" />

                <span className="text-[10px] uppercase tracking-[0.22em] text-black/45">
                  House Of Orive
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* IMAGE + STORY */}
        {/* ================================================= */}

        <section className="mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-12">
          <div className="grid min-h-[620px] lg:grid-cols-2">
            <div className="relative min-h-[500px] overflow-hidden bg-[#efefef]">
              <img
                src={images.story}
                alt="House Of Orive collection"
                className="h-full w-full object-cover grayscale transition-transform duration-1000 hover:scale-[1.02]"
              />
            </div>

            <div className="flex items-center bg-[#f5f5f3] px-8 py-16 sm:px-12 lg:px-20">
              <div className="max-w-[540px]">
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-black/40">
                  Our Philosophy
                </p>

                <h2 className="mt-5 font-serif text-4xl leading-[1] tracking-[-0.035em] sm:text-5xl">
                  Less noise.
                  <br />
                  More expression.
                </h2>

                <p className="mt-8 text-sm leading-7 text-black/55">
                  We believe great style does not need to
                  be complicated. It comes from knowing what
                  works, choosing thoughtfully and wearing it
                  with confidence.
                </p>

                <p className="mt-6 text-sm leading-7 text-black/55">
                  From everyday essentials to statement
                  pieces, every collection is intended to
                  offer flexibility while maintaining a
                  distinct point of view.
                </p>

                <Link
                  href="/products"
                  className="mt-9 inline-flex items-center gap-3 border-b border-black pb-2 text-[10px] font-medium uppercase tracking-[0.2em]"
                >
                  Explore Collection

                  <Icon
                    icon="solar:arrow-right-up-linear"
                    width={17}
                    height={17}
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* VALUES */}
        {/* ================================================= */}

        <section className="mx-auto max-w-[1600px] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
          <div className="mb-14 max-w-[600px]">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-black/40">
              What We Stand For
            </p>

            <h2 className="mt-5 font-serif text-4xl tracking-[-0.035em] sm:text-5xl">
              The House Philosophy
            </h2>
          </div>

          <div className="grid border-t border-black/10 md:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.number}
                className="border-b border-black/10 px-1 py-10 md:border-b-0 md:border-r md:px-8 md:py-12 first:md:pl-0 last:md:border-r-0"
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] tracking-[0.2em] text-black/35">
                    {value.number}
                  </span>

                  <Icon
                    icon={value.icon}
                    width={24}
                    height={24}
                    className="text-black/60"
                  />
                </div>

                <h3 className="mt-12 font-serif text-2xl">
                  {value.title}
                </h3>

                <p className="mt-5 max-w-[330px] text-sm leading-7 text-black/50">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================= */}
        {/* EDITORIAL */}
        {/* ================================================= */}

        <section className="relative min-h-[600px] overflow-hidden bg-black">
          <img
            src={images.editorial}
            alt="House Of Orive editorial"
            className="absolute inset-0 h-full w-full object-cover grayscale"
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 flex min-h-[600px] items-center justify-center px-6 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-white/60">
                The House Of Orive
              </p>

              <h2 className="mt-6 font-serif text-5xl leading-none tracking-[-0.04em] text-white sm:text-7xl lg:text-8xl">
                Wear your
                <br />
                own story.
              </h2>

              <Link
                href="/products"
                className="mt-10 inline-flex items-center gap-3 border border-white/50 px-7 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black"
              >
                Discover The Collection

                <Icon
                  icon="solar:arrow-right-up-linear"
                  width={17}
                  height={17}
                />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}