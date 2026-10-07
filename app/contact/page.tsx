"use client";

import { FormEvent, useState } from "react";

import Link from "next/link";

import { Icon } from "@iconify/react";

import Navbar from "@/components/Navbar";

import Footer from "@/components/Footer";

const contactHero =
  "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=2200&q=90";

const mapUrl =
  "https://www.google.com/maps?q=Delhi%2C%20India&output=embed";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSubmitted(true);
  };

  return (
    <>
      <Navbar />

      <main className="bg-white">
        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative flex min-h-[560px] items-center overflow-hidden bg-black">
          <img
            src={contactHero}
            alt="Contact House Of Orive"
            className="absolute inset-0 h-full w-full object-cover grayscale"
          />

          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 mx-auto w-full max-w-[1600px] px-6 py-28 sm:px-10 lg:px-16">
            <p className="text-[10px] font-medium uppercase tracking-[0.32em] text-white/65">
              House Of Orive
            </p>

            <h1 className="mt-6 font-serif text-[72px] leading-[0.88] tracking-[-0.045em] text-white sm:text-[100px] lg:text-[140px]">
              Contact
            </h1>

            <p className="mt-8 max-w-[520px] text-sm leading-7 text-white/70">
              Questions, styling enquiries or simply want
              to say hello? We would love to hear from you.
            </p>
          </div>

          <div className="absolute bottom-8 right-8 hidden text-right lg:block">
            <p className="text-[9px] uppercase tracking-[0.25em] text-white/55">
              Contact
            </p>

            <p className="mt-1 font-serif text-3xl text-white">
              01
            </p>
          </div>
        </section>

        {/* ================================================= */}
        {/* CONTACT CONTENT */}
        {/* ================================================= */}

        <section className="mx-auto max-w-[1400px] px-6 py-24 sm:px-10 lg:px-16 lg:py-32">
          <div className="grid gap-20 lg:grid-cols-[0.75fr_1.25fr] lg:gap-28">
            {/* ================================================= */}
            {/* LEFT INFORMATION */}
            {/* ================================================= */}

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-black/40">
                Get In Touch
              </p>

              <h2 className="mt-5 max-w-[450px] font-serif text-4xl leading-[1] tracking-[-0.035em] sm:text-5xl">
                We are here to help.
              </h2>

              <p className="mt-7 max-w-[430px] text-sm leading-7 text-black/50">
                Whether you have a question about a product,
                an order or anything else, send us a message
                and our team will get back to you.
              </p>

              {/* EMAIL */}

              <div className="mt-12 border-t border-black/10 pt-7">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#f4f4f2]">
                    <Icon
                      icon="solar:letter-linear"
                      width={20}
                      height={20}
                    />
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-black/40">
                      Email
                    </p>

                    <a
                      href="mailto:Houseoforive@gmail.com"
                      className="mt-2 block text-sm transition-opacity hover:opacity-50"
                    >
                      Houseoforive@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* PHONE */}

              <div className="mt-8">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#f4f4f2]">
                    <Icon
                      icon="solar:phone-linear"
                      width={20}
                      height={20}
                    />
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-black/40">
                      Phone
                    </p>

                    <p className="mt-2 text-sm">
                      +91 84486 58341
                    </p>
                  </div>
                </div>
              </div>

              {/* LOCATION */}

              <div className="mt-8">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#f4f4f2]">
                    <Icon
                      icon="solar:map-point-linear"
                      width={20}
                      height={20}
                    />
                  </div>

                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-black/40">
                      Location
                    </p>

                    <p className="mt-2 text-sm">
                      Delhi, India
                    </p>
                  </div>
                </div>
              </div>

              {/* SOCIAL */}

              <div className="mt-10 flex items-center gap-4">
                <a
                  href="https://www.instagram.com/houseoforive"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center border border-black/10 transition-colors hover:bg-black hover:text-white"
                >
                  <Icon
                    icon="mdi:instagram"
                    width={19}
                    height={19}
                  />
                </a>

                <a
                  href="https://www.facebook.com/people/Houseoforive/61592099355373/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center border border-black/10 transition-colors hover:bg-black hover:text-white"
                >
                  <Icon
                    icon="mdi:facebook"
                    width={19}
                    height={19}
                  />
                </a>

                <a
                  href="#"
                  aria-label="Pinterest"
                  className="flex h-10 w-10 items-center justify-center border border-black/10 transition-colors hover:bg-black hover:text-white"
                >
                  <Icon
                    icon="mdi:pinterest"
                    width={19}
                    height={19}
                  />
                </a>
              </div>
            </div>

            {/* ================================================= */}
            {/* FORM */}
            {/* ================================================= */}

            <div>
              {submitted ? (
                <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-black/10 bg-[#fafaf8] px-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
                  <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white">
                      <Icon
                        icon="solar:check-linear"
                        width={28}
                        height={28}
                      />
                    </div>

                    <h3 className="mt-7 font-serif text-3xl">
                      Thank you.
                    </h3>

                    <p className="mx-auto mt-4 max-w-[400px] text-sm leading-7 text-black/50">
                      Your message has been received.
                      We will get back to you shortly.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setSubmitted(false)
                      }
                      className="mt-8 border-b border-black pb-2 text-[10px] font-medium uppercase tracking-[0.2em]"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl border border-black/15 bg-[#fafaf8] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.06)] sm:p-8 lg:p-10"
                >
                  {/* NAME */}

                  <div className="border-b border-black/15 py-6">
                    <label className="mb-3 block text-[9px] font-medium uppercase tracking-[0.2em] text-black/65">
                      Your Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Enter your name"
                      className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black/50"
                    />
                  </div>

                  {/* EMAIL */}

                  <div className="border-b border-black/15 py-6">
                    <label className="mb-3 block text-[9px] font-medium uppercase tracking-[0.2em] text-black/65">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Enter your email"
                      className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black/50"
                    />
                  </div>

                  {/* PHONE */}

                  <div className="border-b border-black/15 py-6">
                    <label className="mb-3 block text-[9px] font-medium uppercase tracking-[0.2em] text-black/65">
                      Phone
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      placeholder="Enter your phone number"
                      className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black/50"
                    />
                  </div>

                  {/* SUBJECT */}

                  <div className="border-b border-black/15 py-6">
                    <label className="mb-3 block text-[9px] font-medium uppercase tracking-[0.2em] text-black/65">
                      Subject
                    </label>

                    <select
                      name="subject"
                      required
                      defaultValue=""
                      className="w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-black/50"
                    >
                      <option value="" disabled>
                        Select a subject
                      </option>

                      <option value="order">
                        Order Enquiry
                      </option>

                      <option value="product">
                        Product Enquiry
                      </option>

                      <option value="return">
                        Return / Exchange
                      </option>

                      <option value="general">
                        General Enquiry
                      </option>
                    </select>
                  </div>

                  {/* MESSAGE */}

                  <div className="border-b border-black/15 py-6">
                    <label className="mb-3 block text-[9px] font-medium uppercase tracking-[0.2em] text-black/65">
                      Message
                    </label>

                    <textarea
                      name="message"
                      required
                      rows={5}
                      placeholder="How can we help?"
                      className="w-full resize-none rounded-lg border border-black/15 bg-white px-4 py-3 text-sm leading-7 outline-none transition-colors placeholder:text-black/35 focus:border-black/50"
                    />
                  </div>

                  {/* SUBMIT */}

                  <div className="pt-7">
                    <button
                      type="submit"
                      className="group flex w-full items-center justify-center gap-4 bg-black px-8 py-5 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85"
                    >
                      Send Message

                      <Icon
                        icon="solar:arrow-right-up-linear"
                        width={18}
                        height={18}
                        className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                      />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* LOCATION MAP */}
        {/* ================================================= */}

        <section className="mx-auto max-w-[1600px] px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32">
          <div className="border-t border-black/10 pt-10">
            {/* MAP HEADER */}

            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-black/40">
                  Find Us
                </p>

                <h2 className="mt-4 font-serif text-4xl tracking-[-0.035em] sm:text-5xl">
                  Delhi, India
                </h2>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Delhi%2C%20India"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-3 border-b border-black pb-2 text-[10px] font-medium uppercase tracking-[0.18em]"
              >
                Open In Google Maps

                <Icon
                  icon="solar:arrow-right-up-linear"
                  width={17}
                  height={17}
                />
              </a>
            </div>

            {/* MAP */}

            <div className="relative h-[300px] w-full overflow-hidden bg-[#eeeeec] sm:h-[340px] lg:h-[400px]">
              <iframe
                src={mapUrl}
                title="House Of Orive location in Delhi, India"
                className="h-full w-full border-0 grayscale"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* MAP LABEL */}

              <div className="pointer-events-none absolute bottom-5 left-5 bg-white/95 px-5 py-4 shadow-[0_10px_35px_rgba(0,0,0,0.08)]">
                <div className="flex items-center gap-3">
                  <Icon
                    icon="solar:map-point-bold"
                    width={19}
                    height={19}
                  />

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em]">
                      House Of Orive
                    </p>

                    <p className="mt-1 text-[11px] text-black/45">
                      Delhi, India
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* QUICK HELP */}
        {/* ================================================= */}

        <section className="bg-[#f5f5f3]">
          <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 lg:px-16">
            <div className="grid gap-10 md:grid-cols-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                  Orders
                </p>

                <h3 className="mt-4 font-serif text-2xl">
                  Need help with an order?
                </h3>

                <p className="mt-3 text-sm leading-7 text-black/50">
                  Have a question about your order,
                  delivery or status? Send us the
                  details and we will assist you.
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                  Products
                </p>

                <h3 className="mt-4 font-serif text-2xl">
                  Looking for something?
                </h3>

                <p className="mt-3 text-sm leading-7 text-black/50">
                  If you need help finding a size,
                  colour or particular style, our team
                  is happy to help.
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                  Collection
                </p>

                <h3 className="mt-4 font-serif text-2xl">
                  Explore House Of Orive
                </h3>

                <Link
                  href="/products"
                  className="mt-5 inline-flex items-center gap-3 border-b border-black pb-2 text-[10px] font-medium uppercase tracking-[0.18em]"
                >
                  Shop Collection

                  <Icon
                    icon="solar:arrow-right-up-linear"
                    width={16}
                    height={16}
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}