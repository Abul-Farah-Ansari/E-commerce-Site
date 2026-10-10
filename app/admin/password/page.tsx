
"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function AdminChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const meetsLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setError(
        "Use at least one uppercase letter, one lowercase letter, and one number."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The new password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("Your new password must be different from your current password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to change your password.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage(data.message || "Your password has been changed successfully.");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-12 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-2 focus:ring-black/5";

  function passwordField(
    id: string,
    label: string,
    value: string,
    setter: (value: string) => void,
    visible: boolean,
    toggle: () => void,
    autocomplete: string
  ) {
    return (
      <div>
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-semibold text-gray-800"
        >
          {label}
        </label>

        <div className="relative">
          <input
            id={id}
            type={visible ? "text" : "password"}
            value={value}
            onChange={(event) => setter(event.target.value)}
            autoComplete={autocomplete}
            required
            maxLength={128}
            className={inputStyle}
            placeholder={`Enter ${label.toLowerCase()}`}
          />

          <button
            type="button"
            onClick={toggle}
            aria-label={visible ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-black"
          >
            <Icon
              icon={visible ? "mdi:eye-off-outline" : "mdi:eye-outline"}
              width={21}
            />
          </button>
        </div>
      </div>
    );
  }

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

        <div className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-7 sm:px-9 sm:py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <Icon icon="mdi:key-outline" width={26} />
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
              Change Password
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
              Update your administrator password regularly to keep your
              House of Orive account secure.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-7 sm:px-9 sm:py-8">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <Icon icon="mdi:alert-circle-outline" width={21} />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div
                role="status"
                className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800"
              >
                <Icon icon="mdi:check-circle-outline" width={21} />
                <span>{message}</span>
              </div>
            )}

            {passwordField(
              "current-password",
              "Current Password",
              currentPassword,
              setCurrentPassword,
              showCurrent,
              () => setShowCurrent(!showCurrent),
              "current-password"
            )}

            <div className="border-t border-gray-100" />

            {passwordField(
              "new-password",
              "New Password",
              newPassword,
              setNewPassword,
              showNew,
              () => setShowNew(!showNew),
              "new-password"
            )}

            {/* Password requirements */}
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Password requirements
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { label: "At least 8 characters", valid: meetsLength },
                  { label: "One uppercase letter", valid: hasUppercase },
                  { label: "One lowercase letter", valid: hasLowercase },
                  { label: "One number", valid: hasNumber },
                ].map((requirement) => (
                  <div
                    key={requirement.label}
                    className={`flex items-center gap-2 text-xs ${
                      requirement.valid ? "text-black" : "text-gray-500"
                    }`}
                  >
                    <Icon
                      icon={
                        requirement.valid
                          ? "mdi:check-circle"
                          : "mdi:circle-outline"
                      }
                      width={17}
                    />
                    {requirement.label}
                  </div>
                ))}
              </div>
            </div>

            {passwordField(
              "confirm-password",
              "Confirm New Password",
              confirmPassword,
              setConfirmPassword,
              showConfirm,
              () => setShowConfirm(!showConfirm),
              "new-password"
            )}

            {confirmPassword && (
              <p
                className={`flex items-center gap-2 text-xs ${
                  confirmPassword === newPassword
                    ? "text-gray-800"
                    : "text-red-600"
                }`}
              >
                <Icon
                  icon={
                    confirmPassword === newPassword
                      ? "mdi:check-circle-outline"
                      : "mdi:alert-circle-outline"
                  }
                  width={17}
                />
                {confirmPassword === newPassword
                  ? "Passwords match"
                  : "Passwords do not match"}
              </p>
            )}

            <div className="border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-48"
              >
                <Icon
                  icon={loading ? "mdi:loading" : "mdi:lock-check-outline"}
                  width={20}
                  className={loading ? "animate-spin" : ""}
                />
                {loading ? "Updating Password..." : "Update Password"}
              </button>

              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-gray-500">
                <Icon icon="mdi:shield-check-outline" width={17} />
                Your password should remain private. Never share it with anyone.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
