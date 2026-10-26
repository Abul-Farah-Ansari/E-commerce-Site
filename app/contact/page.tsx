
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ADDRESS =
  "161/62 Ghafoor Nagar, Batla House Chowk, Okhla, New Delhi, Delhi 110025";

const MAP_QUERY = encodeURIComponent(ADDRESS);

const mapUrl = `https://www.google.com/maps?q=${MAP_QUERY}&output=embed`;

const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${MAP_QUERY}`;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-white text-black">
        {/* CONTACT DETAILS + MESSAGE FORM */}
        <section className="mx-auto max-w-[1440px] px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
            {/* CONTACT INFORMATION */}
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-black/40">
                Contact Information
              </p>

              <h1 className="mt-4 max-w-md font-serif text-3xl leading-tight tracking-[-0.03em] sm:text-4xl">
                Let us help you find the answer.
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-black/55">
                Reach out to us using the details below. Whether it is an order
                enquiry or a question about our collection, we will be happy to
                assist.
              </p>

              <div className="mt-9 border-t border-black/10">
                {/* EMAIL */}
                <a
                  href="mailto:Houseoforive@gmail.com"
                  className="group flex gap-5 border-b border-black/10 py-6 transition-colors hover:bg-[#faf9f6]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-black/10 bg-[#faf9f6] transition-colors group-hover:bg-white">
                    <Icon
                      icon="solar:letter-linear"
                      width={21}
                      height={21}
                    />
                  </div>

                  <div className="min-w-0 flex-1 py-0.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-black/45">
                      Email Us
                    </p>
                    <p className="mt-2 break-all text-sm font-medium">
                      Houseoforive@gmail.com
                    </p>
                  </div>

                  <Icon
                    icon="solar:arrow-up-right-linear"
                    width={18}
                    height={18}
                    className="mt-1 shrink-0 text-black/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>

                {/* PHONE */}
                <a
                  href="tel:+918448658341"
                  className="group flex gap-5 border-b border-black/10 py-6 transition-colors hover:bg-[#faf9f6]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-black/10 bg-[#faf9f6] transition-colors group-hover:bg-white">
                    <Icon
                      icon="solar:phone-linear"
                      width={21}
                      height={21}
                    />
                  </div>

                  <div className="flex-1 py-0.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-black/45">
                      Call Us
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      +91 84486 58341
                    </p>
                  </div>

                  <Icon
                    icon="solar:arrow-up-right-linear"
                    width={18}
                    height={18}
                    className="mt-1 shrink-0 text-black/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>

                {/* ADDRESS */}
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-5 border-b border-black/10 py-6 transition-colors hover:bg-[#faf9f6]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-black/10 bg-[#faf9f6] transition-colors group-hover:bg-white">
                    <Icon
                      icon="solar:map-point-linear"
                      width={21}
                      height={21}
                    />
                  </div>

                  <div className="flex-1 py-0.5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-black/45">
                      Visit Us
                    </p>

                    <p className="mt-2 max-w-sm text-sm leading-7">
                      {ADDRESS}
                    </p>

                    <p className="mt-3 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.15em]">
                      Get Directions
                      <Icon
                        icon="solar:arrow-up-right-linear"
                        width={15}
                        height={15}
                      />
                    </p>
                  </div>
                </a>
              </div>

              {/* SOCIAL LINKS */}
              <div className="mt-9">
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-black/45">
                  Follow Our World
                </p>

                <div className="mt-4 flex gap-3">
                  <a
                    href="https://www.instagram.com/houseoforive"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="House Of Orive on Instagram"
                    className="flex h-11 w-11 items-center justify-center border border-black/15 transition-colors duration-300 hover:bg-black hover:text-white"
                  >
                    <Icon icon="mdi:instagram" width={20} height={20} />
                  </a>

                  <a
                    href="https://www.facebook.com/people/Houseoforive/61592099355373/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="House Of Orive on Facebook"
                    className="flex h-11 w-11 items-center justify-center border border-black/15 transition-colors duration-300 hover:bg-black hover:text-white"
                  >
                    <Icon icon="mdi:facebook" width={20} height={20} />
                  </a>
                </div>
              </div>
            </div>

            {/* CONTACT FORM */}
            <div>
              <div className="mb-7 flex items-end justify-between gap-5">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-black/40">
                    Write To Us
                  </p>

                  <h2 className="mt-3 font-serif text-3xl tracking-[-0.03em] sm:text-4xl">
                    Send a message.
                  </h2>
                </div>

                <Icon
                  icon="solar:letter-opened-linear"
                  width={29}
                  height={29}
                  className="mb-1 shrink-0 text-black/35"
                />
              </div>

              {submitted ? (
                <div className="flex min-h-[480px] items-center justify-center border border-black/10 bg-[#faf9f6] px-6 py-12 text-center sm:px-10">
                  <div className="max-w-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
                      <Icon
                        icon="solar:check-linear"
                        width={27}
                        height={27}
                      />
                    </div>

                    <h3 className="mt-7 font-serif text-3xl">
                      Thank You.
                    </h3>

                    <p className="mt-4 text-sm leading-7 text-black/55">
                      Your form has been submitted. Our team will be happy to
                      assist you.
                    </p>

                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-8 border-b border-black pb-2 text-[10px] font-medium uppercase tracking-[0.18em]"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="border border-black/10 bg-[#faf9f6] p-6 sm:p-9 lg:p-10"
                >
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="mb-2.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-black/65"
                      >
                        Your Name *
                      </label>

                      <input
                        id="contact-name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        required
                        placeholder="Enter your name"
                        className="w-full border border-black/15 bg-white px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="mb-2.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-black/65"
                      >
                        Phone Number
                      </label>

                      <input
                        id="contact-phone"
                        type="tel"
                        name="phone"
                        autoComplete="tel"
                        placeholder="Enter your phone number"
                        className="w-full border border-black/15 bg-white px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="contact-email"
                      className="mb-2.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-black/65"
                    >
                      Email Address *
                    </label>

                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      placeholder="Enter your email address"
                      className="w-full border border-black/15 bg-white px-4 py-3.5 text-sm outline-none transition-colors placeholder:text-black/35 focus:border-black"
                    />
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="contact-subject"
                      className="mb-2.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-black/65"
                    >
                      How Can We Help? *
                    </label>

                    <select
                      id="contact-subject"
                      name="subject"
                      required
                      defaultValue=""
                      className="w-full border border-black/15 bg-white px-4 py-3.5 text-sm outline-none transition-colors focus:border-black"
                    >
                      <option value="" disabled>
                        Select an enquiry
                      </option>
                      <option value="order">Order Enquiry</option>
                      <option value="product">Product Enquiry</option>
                      <option value="return">Return / Exchange</option>
                      <option value="delivery">Shipping / Delivery</option>
                      <option value="general">General Enquiry</option>
                    </select>
                  </div>

                  <div className="mt-6">
                    <label
                      htmlFor="contact-message"
                      className="mb-2.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-black/65"
                    >
                      Your Message *
                    </label>

                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us how we can help..."
                      className="w-full resize-y border border-black/15 bg-white px-4 py-3.5 text-sm leading-7 outline-none transition-colors placeholder:text-black/35 focus:border-black"
                    />
                  </div>

                  <button
                    type="submit"
                    className="group mt-7 flex min-h-14 w-full items-center justify-center gap-3 bg-black px-6 py-4 text-[10px] font-medium uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:bg-black/80"
                  >
                    Send Your Message

                    <Icon
                      icon="solar:arrow-right-up-linear"
                      width={18}
                      height={18}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </button>

                  <p className="mt-4 text-center text-[10px] leading-5 text-black/40">
                    We appreciate you reaching out to House Of Orive.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* LOCATION MAP */}
        <section className="bg-[#faf9f6]">
          <div className="mx-auto max-w-[1440px] px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
            <div className="mb-9 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-black/40" />

                  <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-black/45">
                    Find Our Location
                  </p>
                </div>

                <h2 className="mt-5 max-w-2xl font-serif text-4xl leading-tight tracking-[-0.035em] sm:text-5xl">
                  Visit House Of Orive.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-black/55">
                  <Icon
                    icon="solar:map-point-linear"
                    width={17}
                    height={17}
                    className="mr-2 inline-block align-[-3px]"
                  />
                  {ADDRESS}
                </p>
              </div>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-3 border-b border-black pb-2 text-[10px] font-medium uppercase tracking-[0.16em] transition-opacity hover:opacity-55"
              >
                Open Google Maps

                <Icon
                  icon="solar:arrow-up-right-linear"
                  width={17}
                  height={17}
                />
              </a>
            </div>

            <div className="relative h-[300px] overflow-hidden border border-black/10 bg-[#e9e7e1] sm:h-[380px] lg:h-[460px]">
              <iframe
                src={mapUrl}
                title={`House Of Orive location: ${ADDRESS}`}
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />

              <div className="pointer-events-none absolute bottom-4 left-4 max-w-[calc(100%-2rem)] border border-black/5 bg-white/95 p-4 shadow-sm sm:bottom-6 sm:left-6 sm:p-5">
                <div className="flex items-start gap-3">
                  <Icon
                    icon="solar:map-point-bold"
                    width={20}
                    height={20}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em]">
                      House Of Orive
                    </p>

                    <p className="mt-1 max-w-xs text-xs leading-5 text-black/55">
                      {ADDRESS}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL COLLECTION SECTION */}
        <section className="border-t border-black/10 bg-white">
          <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-7 px-6 py-14 sm:px-10 md:flex-row md:items-center lg:px-16 lg:py-16">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-black/40">
                The House Of Orive Experience
              </p>

              <h2 className="mt-3 font-serif text-3xl tracking-[-0.03em] sm:text-4xl">
                Discover your next favourite.
              </h2>

              <p className="mt-3 text-sm leading-6 text-black/55">
                Explore pieces chosen to make everyday dressing feel special.
              </p>
            </div>

            <Link
              href="/products"
              className="group inline-flex min-h-12 items-center justify-center gap-4 border border-black px-6 py-4 text-[10px] font-medium uppercase tracking-[0.17em] transition-colors duration-300 hover:bg-black hover:text-white"
            >
              Explore Collection

              <Icon
                icon="solar:arrow-right-up-linear"
                width={17}
                height={17}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
