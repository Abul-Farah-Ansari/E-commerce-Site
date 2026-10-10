
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

type AdminProfile = {
  name: string;
  email: string;
  phone: string;
};

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile>({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const response = await fetch("/api/admin/settings/profile", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load admin profile.");
        }

        if (!cancelled) {
          setProfile({
            name: data.profile?.name || "",
            email: data.profile?.email || "",
            phone: data.profile?.phone || "",
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to connect to the server."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(field: keyof AdminProfile, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!profile.name.trim() || !profile.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/settings/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          name: profile.name.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to update your profile.");
        return;
      }

      if (data.profile) {
        setProfile({
          name: data.profile.name || "",
          email: data.profile.email || "",
          phone: data.profile.phone || "",
        });
      }

      setMessage(data.message || "Profile updated successfully.");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5";

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
        >
          <Icon icon="mdi:arrow-left" width={18} />
          Back to Settings
        </Link>

        <section className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-100 px-6 py-7 sm:px-9 sm:py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <Icon icon="mdi:account-outline" width={28} />
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
              Admin Profile
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Manage the personal information associated with your House of
              Orive administrator account.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-6 px-6 py-7 sm:px-9 sm:py-8"
          >
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                <Icon icon="mdi:alert-circle-outline" width={21} />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-800"
              >
                <Icon icon="mdi:check-circle-outline" width={21} />
                <span>{message}</span>
              </div>
            )}

            {loading ? (
              <div className="flex items-center gap-3 py-8 text-sm text-gray-500">
                <Icon icon="mdi:loading" width={21} className="animate-spin" />
                Loading administrator profile...
              </div>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="admin-name"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Full Name
                  </label>
                  <input
                    id="admin-name"
                    type="text"
                    value={profile.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    autoComplete="name"
                    maxLength={100}
                    required
                    className={inputClass}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-email"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Email Address
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    value={profile.email}
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                    autoComplete="email"
                    maxLength={254}
                    required
                    className={inputClass}
                    placeholder="Enter your email address"
                  />
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Changing your email may affect how you sign in. We'll
                    handle that securely in the backend.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="admin-phone"
                    className="mb-2 block text-sm font-semibold text-gray-800"
                  >
                    Phone Number
                  </label>
                  <input
                    id="admin-phone"
                    type="tel"
                    value={profile.phone}
                    onChange={(event) =>
                      updateField("phone", event.target.value)
                    }
                    autoComplete="tel"
                    maxLength={20}
                    className={inputClass}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="border-t border-gray-100 pt-5">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-44"
                  >
                    <Icon
                      icon={saving ? "mdi:loading" : "mdi:content-save-outline"}
                      width={20}
                      className={saving ? "animate-spin" : ""}
                    />
                    {saving ? "Saving Changes..." : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </form>
        </section>

        <div className="mt-5 flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-500">
          <Icon
            icon="mdi:shield-check-outline"
            width={20}
            className="mt-0.5 shrink-0 text-black"
          />
          <p>
            Your profile is available only to an authenticated administrator.
            Keep your login credentials private.
          </p>
        </div>
      </div>
    </main>
  );
}
