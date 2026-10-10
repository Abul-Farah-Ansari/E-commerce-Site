
"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";

const securityItems = [
  {
    icon: "mdi:account-outline",
    title: "Admin Profile",
    description: "Manage your administrator account information.",
    detail: "Profile details",
    href: "/admin/settings/profile",
    tag: "Account",
  },
  {
    icon: "mdi:key-outline",
    title: "Change Password",
    description: "Keep your account secure with a strong password.",
    detail: "Password management",
    href: "/admin/settings/password",
    tag: "Security",
  },
  {
    icon: "mdi:cellphone-lock",
    title: "Two-Factor Authentication",
    description:
      "Add an extra layer of protection using Google Authenticator.",
    detail: "Authenticator app",
    href: "/admin/security/2fa",
    tag: "Recommended",
  },
  {
    icon: "mdi:devices",
    title: "Active Sessions",
    description: "Review and manage your account's signed-in sessions.",
    detail: "Session management",
    href: "/admin/settings/sessions",
    tag: "Account",
  },
];

const tabs = ["All settings", "Account", "Security"];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("All settings");

  const visibleItems = securityItems.filter((item) => {
    if (activeTab === "All settings") return true;
    if (activeTab === "Account") return item.tag === "Account";
    if (activeTab === "Security") {
      return item.tag === "Security" || item.tag === "Recommended";
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-6 text-[#202020] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
              <Icon icon="mdi:cog-outline" width={17} />
              <span>Admin Panel</span>
              <Icon icon="mdi:chevron-right" width={15} />
              <span className="text-black">Settings</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Settings
            </h1>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Manage your account and protect your store administration.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">
            <Icon icon="mdi:check-circle-outline" width={18} />
            Account security
          </div>
        </div>

        {/* Security banner */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-black p-6 text-white sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-2 -top-8 h-40 w-40 rounded-full border border-white/10" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Icon icon="mdi:shield-check-outline" width={29} />
              </div>

              <div className="max-w-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-300">
                  House of Orive
                </p>

                <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
                  Your security matters
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  Manage your password and two-factor authentication to help
                  protect your administrator account.
                </p>
              </div>
            </div>

            <Link
              href="/admin/security/2fa"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-200"
            >
              Manage 2FA
              <Icon icon="mdi:arrow-top-right" width={18} />
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-black text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Section heading */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {activeTab === "All settings"
              ? "Security & Account"
              : activeTab}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Essential controls for your administrator account.
          </p>
        </div>

        {/* Settings cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {visibleItems.map((item) => (
            <div
              key={item.title}
              className="group rounded-2xl border border-gray-200 bg-white p-5 transition duration-200 hover:border-gray-400 hover:shadow-md sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-black transition group-hover:bg-gray-200">
                  <Icon icon={item.icon} width={25} />
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                  {item.tag}
                </span>
              </div>

              <h3 className="mt-5 text-base font-semibold">
                {item.title}
              </h3>

              <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                {item.description}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs text-gray-400">
                  {item.detail}
                </span>

                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-black transition hover:text-gray-500"
                >
                  {item.title === "Two-Factor Authentication"
                    ? "Configure"
                    : "Manage"}
                  <Icon icon="mdi:chevron-right" width={17} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Security recommendation */}
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
          <div className="mt-0.5 text-gray-600">
            <Icon icon="mdi:lock-outline" width={21} />
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              Security recommendation
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Enable Google Authenticator and use a unique password for your
              administrator account. Never share your authentication codes
              or passwords.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
