
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

type TwoFactorStatus = {
  enabled: boolean;
};

export default function AdminTwoFactorSetupPage() {
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [showDisableForm, setShowDisableForm] = useState(false);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/2fa/status", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to load two-factor status.");
        return;
      }

      setEnabled(Boolean(data.enabled));
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  async function startSetup() {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/2fa/setup", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to start setup.");
        return;
      }

      setQrCode(data.qrCode);
      setMessage("Scan this QR code with your authenticator app.");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function verifySetup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/2fa/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to verify the code.");
        return;
      }

      setEnabled(true);
      setQrCode("");
      setCode("");
      setMessage("Two-factor authentication is now enabled.");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function disableTwoFactor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ password, code }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to disable two-factor authentication.");
        return;
      }

      setEnabled(false);
      setShowDisableForm(false);
      setPassword("");
      setCode("");
      setQrCode("");
      setMessage("Two-factor authentication has been disabled.");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: 13,
    border: "1px solid #dedede",
    borderRadius: 8,
    fontSize: 15,
    outlineColor: "#111111",
  };

  const primaryButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: 14,
    background: "#111111",
    color: "#ffffff",
    border: 0,
    borderRadius: 8,
    cursor: loading ? "not-allowed" : "pointer",
    fontWeight: 600,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f7",
        padding: "40px 18px",
        color: "#202020",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          background: "#ffffff",
          border: "1px solid #e8e8e8",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 12px 40px rgba(0,0,0,0.04)",
        }}
      >
        <Link
          href="/admin/settings"
          style={{
            color: "#666666",
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          ← Back to Settings
        </Link>

        <div
          style={{
            width: 52,
            height: 52,
            marginTop: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f1f1f1",
            borderRadius: 12,
          }}
        >
          <Icon icon="mdi:shield-lock-outline" width={29} />
        </div>

        <h1
          style={{
            fontSize: 27,
            fontWeight: 700,
            margin: "20px 0 10px",
            letterSpacing: "-0.7px",
          }}
        >
          Two-Factor Authentication
        </h1>

        <p style={{ color: "#666666", fontSize: 14, lineHeight: 1.7 }}>
          Protect your administrator account with an additional verification
          code from Google Authenticator or another compatible app.
        </p>

        {error && (
          <div
            role="alert"
            style={{
              marginTop: 18,
              padding: 13,
              borderRadius: 8,
              background: "#fff0f0",
              color: "#a32121",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div
            role="status"
            style={{
              marginTop: 18,
              padding: 13,
              borderRadius: 8,
              background: "#f1f1f1",
              color: "#333333",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {message}
          </div>
        )}

        {statusLoading ? (
          <p style={{ marginTop: 24, color: "#666666", fontSize: 14 }}>
            Checking your security status...
          </p>
        ) : (
          <>
            {/* Current status */}
            <div
              style={{
                marginTop: 24,
                padding: 18,
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
                  Authenticator protection
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "#777777",
                    margin: "6px 0 0",
                  }}
                >
                  {enabled
                    ? "Your admin login requires an authenticator code."
                    : "An authenticator code is not currently enabled."}
                </p>
              </div>

              <span
                style={{
                  whiteSpace: "nowrap",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "7px 10px",
                  borderRadius: 20,
                  background: enabled ? "#e8e8e8" : "#f4f4f4",
                  color: enabled ? "#111111" : "#666666",
                }}
              >
                {enabled ? "Enabled" : "Disabled"}
              </span>
            </div>

            {/* Enable flow */}
            {!enabled && !qrCode && (
              <button
                type="button"
                onClick={startSetup}
                disabled={loading}
                style={{ ...primaryButtonStyle, marginTop: 20 }}
              >
                {loading ? "Preparing setup..." : "Enable 2FA"}
              </button>
            )}

            {!enabled && qrCode && (
              <>
                <div style={{ textAlign: "center", margin: "24px 0" }}>
                  <img
                    src={qrCode}
                    alt="Authenticator enrollment QR code"
                    width={230}
                    height={230}
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      border: "1px solid #eeeeee",
                      borderRadius: 12,
                    }}
                  />
                </div>

                <ol
                  style={{
                    fontSize: 13,
                    color: "#555555",
                    lineHeight: 1.8,
                    paddingLeft: 22,
                  }}
                >
                  <li>Open Google Authenticator on your phone.</li>
                  <li>Scan the QR code above.</li>
                  <li>Enter the current six-digit code below.</li>
                </ol>

                <form onSubmit={verifySetup} style={{ marginTop: 18 }}>
                  <label
                    htmlFor="setup-code"
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    Authenticator Code
                  </label>

                  <input
                    id="setup-code"
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="000000"
                    required
                    style={{
                      ...inputStyle,
                      textAlign: "center",
                      letterSpacing: 6,
                      fontSize: 18,
                      marginBottom: 14,
                    }}
                  />

                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    style={primaryButtonStyle}
                  >
                    {loading ? "Verifying..." : "Verify and Enable 2FA"}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => {
                    setQrCode("");
                    setCode("");
                    setMessage("");
                    setError("");
                  }}
                  style={{
                    width: "100%",
                    padding: 12,
                    marginTop: 10,
                    border: "1px solid #dddddd",
                    borderRadius: 8,
                    background: "#ffffff",
                    color: "#333333",
                    cursor: "pointer",
                  }}
                >
                  Cancel Setup
                </button>
              </>
            )}

            {/* Disable flow */}
            {enabled && !showDisableForm && (
              <button
                type="button"
                onClick={() => {
                  setShowDisableForm(true);
                  setMessage("");
                  setError("");
                }}
                style={{
                  ...primaryButtonStyle,
                  marginTop: 20,
                  background: "#ffffff",
                  color: "#111111",
                  border: "1px solid #cccccc",
                }}
              >
                Disable 2FA
              </button>
            )}

            {enabled && showDisableForm && (
              <form
                onSubmit={disableTwoFactor}
                style={{
                  marginTop: 22,
                  padding: 18,
                  border: "1px solid #e5e5e5",
                  borderRadius: 12,
                }}
              >
                <h2 style={{ fontSize: 16, fontWeight: 700, marginTop: 0 }}>
                  Confirm disabling 2FA
                </h2>

                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "#666666",
                  }}
                >
                  Enter your current admin password and a valid authenticator
                  code to confirm this change.
                </p>

                <label
                  htmlFor="current-password"
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    margin: "16px 0 8px",
                  }}
                >
                  Current Admin Password
                </label>

                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  style={inputStyle}
                />

                <label
                  htmlFor="disable-code"
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    margin: "16px 0 8px",
                  }}
                >
                  Six-Digit Authenticator Code
                </label>

                <input
                  id="disable-code"
                  value={code}
                  onChange={(event) =>
                    setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  placeholder="000000"
                  required
                  style={{
                    ...inputStyle,
                    textAlign: "center",
                    letterSpacing: 6,
                  }}
                />

                <button
                  type="submit"
                  disabled={loading || !password || code.length !== 6}
                  style={{ ...primaryButtonStyle, marginTop: 18 }}
                >
                  {loading ? "Verifying..." : "Confirm and Disable 2FA"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDisableForm(false);
                    setPassword("");
                    setCode("");
                    setError("");
                  }}
                  style={{
                    width: "100%",
                    padding: 12,
                    marginTop: 10,
                    border: "1px solid #dddddd",
                    borderRadius: 8,
                    background: "#ffffff",
                    color: "#333333",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}
