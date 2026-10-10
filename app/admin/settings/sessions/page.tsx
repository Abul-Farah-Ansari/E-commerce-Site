
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

type Session = {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  current: boolean;
};

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSessions() {
      try {
        const response = await fetch("/api/admin/settings/sessions", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load sessions.");
        }

        if (!cancelled) {
          setSessions(data.sessions || []);
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

    void loadSessions();

    return () => {
      cancelled = true;
    };
  }, []);

  async function revokeSession(sessionId: string) {
    if (!window.confirm("Sign out this session?")) return;

    setError("");
    setMessage("");
    setRevokingId(sessionId);

    try {
      const response = await fetch("/api/admin/settings/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to revoke this session.");
        return;
      }

      setSessions((current) =>
        current.filter((session) => session.id !== sessionId)
      );
      setMessage("Session revoked successfully.");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setRevokingId("");
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] px-4 py-8 text-black sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-black"
        >
          <Icon icon="mdi:arrow-left" width={18} />
          Back to Settings
        </Link>

        {/* Header */}
        <section className="mt-7 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-7 sm:px-9 sm:py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
              <Icon icon="mdi:devices" width={27} />
            </div>

            <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
              Active Sessions
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Review devices and sessions associated with your administrator
              account.
            </p>
          </div>

          <div className="p-6 sm:p-9">
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <Icon icon="mdi:alert-circle-outline" width={21} />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800"
              >
                <Icon icon="mdi:check-circle-outline" width={21} />
                <span>{message}</span>
              </div>
            )}

            {/* Security notice */}
            <div className="mb-7 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <Icon
                icon="mdi:shield-check-outline"
                width={22}
                className="mt-0.5 shrink-0"
              />
              <div>
                <h2 className="text-sm font-semibold">
                  Protect your account
                </h2>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Sign out sessions you no longer recognize. If you suspect
                  unauthorized access, change your password and review your
                  two-factor authentication settings.
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">
                Signed-in devices
              </h2>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {sessions.length} sessions
              </span>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 py-12 text-sm text-gray-500">
                <Icon icon="mdi:loading" width={21} className="animate-spin" />
                Loading active sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 px-5 py-12 text-center">
                <Icon
                  icon="mdi:devices"
                  width={38}
                  className="mx-auto text-gray-400"
                />
                <h3 className="mt-3 text-sm font-semibold">
                  No sessions available
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Session information will appear here when the backend is
                  configured.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        <Icon
                          icon={
                            session.device.toLowerCase().includes("mobile")
                              ? "mdi:cellphone"
                              : "mdi:laptop"
                          }
                          width={23}
                        />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold">
                            {session.device}
                          </h3>

                          {session.current && (
                            <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-semibold text-white">
                              Current session
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          {session.browser}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {session.location}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          Last active: {session.lastActive}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => revokeSession(session.id)}
                      disabled={session.current || revokingId === session.id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Icon icon="mdi:logout" width={17} />
                      {revokingId === session.id
                        ? "Signing out..."
                        : session.current
                          ? "Current device"
                          : "Sign out"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <p className="mt-4 text-xs leading-5 text-gray-500">
          Device and location details should be based on actual session records,
          not guessed from the browser.
        </p>
      </div>
    </main>
  );
}
