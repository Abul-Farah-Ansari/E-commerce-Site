
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

export default function AdminTwoFactorSetupPage() {
  const [qrCode, setQrCode] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const [setupPassword, setSetupPassword] = useState("");
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  const [enabled, setEnabled] = useState(false);
  const [showSetupForm, setShowSetupForm] = useState(false);
  const [showDisableForm, setShowDisableForm] = useState(false);

  // Load current 2FA status
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

  // Start initial setup or authenticator replacement
  async function startSetup(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/2fa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          password: setupPassword,
          currentCode: enabled ? currentCode : "",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to start setup.");
        return;
      }

      setQrCode(data.qrCode);
      setNewCode("");
      setShowSetupForm(false);
      setSetupPassword("");
      setCurrentCode("");

      setMessage(
        "Scan the new QR code with Google Authenticator."
      );
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // Verify the new authenticator
  async function verifySetup(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/2fa/verify-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          code: newCode,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Unable to verify the code.");
        return;
      }

      setEnabled(true);
      setQrCode("");
      setNewCode("");
      setSetupPassword("");
      setCurrentCode("");
      setShowSetupForm(false);

      setMessage(
        "Your new authenticator has been activated successfully."
      );
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // Disable 2FA - existing functionality
  async function disableTwoFactor(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          password,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Unable to disable two-factor authentication."
        );
        return;
      }

      setEnabled(false);
      setShowDisableForm(false);
      setShowSetupForm(false);

      setPassword("");
      setCode("");
      setQrCode("");
      setNewCode("");
      setSetupPassword("");
      setCurrentCode("");

      setMessage(
        "Two-factor authentication has been disabled."
      );
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  // Cancel setup
  function cancelSetup() {
    setQrCode("");
    setNewCode("");
    setSetupPassword("");
    setCurrentCode("");
    setShowSetupForm(false);
    setMessage("");
    setError("");
  }

  // Shared input styling
  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    padding: 13,
    border: "1px solid #dedede",
    borderRadius: 8,
    fontSize: 15,
    outlineColor: "#111111",
  };

  // Shared button styling
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

  const secondaryButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: 12,
    marginTop: 10,
    border: "1px solid #dddddd",
    borderRadius: 8,
    background: "#ffffff",
    color: "#333333",
    cursor: "pointer",
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
          <Icon
            icon="mdi:shield-lock-outline"
            width={29}
          />
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

        <p
          style={{
            color: "#666666",
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          Protect your administrator account with an additional
          verification code from Google Authenticator or another
          compatible app.
        </p>

        {/* Error message */}
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

        {/* Success message */}
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
          <p
            style={{
              marginTop: 24,
              color: "#666666",
              fontSize: 14,
            }}
          >
            Checking your security status...
          </p>
        ) : (
          <>
            {/* Current 2FA status */}
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
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    margin: 0,
                  }}
                >
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

            {/* Enable or change authenticator button */}
            {!qrCode &&
              !showSetupForm &&
              !showDisableForm && (
                <button
                  type="button"
                  onClick={() => {
                    setShowSetupForm(true);
                    setError("");
                    setMessage("");
                  }}
                  disabled={loading}
                  style={{
                    ...primaryButtonStyle,
                    marginTop: 20,
                  }}
                >
                  {enabled
                    ? "Change Authenticator"
                    : "Enable 2FA"}
                </button>
              )}

            {/* Setup authorization form */}
            {showSetupForm && !qrCode && (
              <form
                onSubmit={startSetup}
                style={{
                  marginTop: 22,
                  padding: 18,
                  border: "1px solid #e5e5e5",
                  borderRadius: 12,
                }}
              >
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    marginTop: 0,
                  }}
                >
                  {enabled
                    ? "Change Authenticator"
                    : "Enable Two-Factor Authentication"}
                </h2>

                <p
                  style={{
                    fontSize: 13,
                    color: "#666666",
                    lineHeight: 1.6,
                  }}
                >
                  {enabled
                    ? "Verify your current password and existing authenticator before generating a replacement QR code."
                    : "Enter your admin password to generate your authenticator QR code."}
                </p>

                <label
                  htmlFor="setup-password"
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
                  id="setup-password"
                  type="password"
                  autoComplete="current-password"
                  value={setupPassword}
                  onChange={(event) =>
                    setSetupPassword(event.target.value)
                  }
                  required
                  style={inputStyle}
                />

                {/* Existing authenticator code is required
                    only when changing an enabled authenticator. */}
                {enabled && (
                  <>
                    <label
                      htmlFor="existing-auth-code"
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        margin: "16px 0 8px",
                      }}
                    >
                      Existing Authenticator Code
                    </label>

                    <input
                      id="existing-auth-code"
                      value={currentCode}
                      onChange={(event) =>
                        setCurrentCode(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        )
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
                      }}
                    />
                  </>
                )}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !setupPassword ||
                    (enabled && currentCode.length !== 6)
                  }
                  style={{
                    ...primaryButtonStyle,
                    marginTop: 18,
                  }}
                >
                  {loading
                    ? "Preparing..."
                    : "Generate New QR Code"}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={cancelSetup}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>
              </form>
            )}

            {/* New authenticator QR code */}
            {qrCode && (
              <>
                <div
                  style={{
                    textAlign: "center",
                    margin: "24px 0",
                  }}
                >
                  <h2 style={{ fontSize: 17 }}>
                    Scan Your New Authenticator QR Code
                  </h2>

                  <img
                    src={qrCode}
                    alt="New authenticator enrollment QR code"
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
                  <li>
                    Open Google Authenticator on your phone.
                  </li>
                  <li>
                    Add a new account by scanning this QR code.
                  </li>
                  <li>
                    Check that the new entry displays your updated email.
                  </li>
                  <li>
                    Enter the six-digit code from the new entry below.
                  </li>
                </ol>

                <form
                  onSubmit={verifySetup}
                  style={{ marginTop: 18 }}
                >
                  <label
                    htmlFor="new-auth-code"
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 8,
                    }}
                  >
                    New Authenticator Code
                  </label>

                  <input
                    id="new-auth-code"
                    value={newCode}
                    onChange={(event) =>
                      setNewCode(
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
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
                    disabled={loading || newCode.length !== 6}
                    style={primaryButtonStyle}
                  >
                    {loading
                      ? "Verifying..."
                      : "Verify and Activate New Authenticator"}
                  </button>
                </form>

                <button
                  type="button"
                  disabled={loading}
                  onClick={cancelSetup}
                  style={secondaryButtonStyle}
                >
                  Cancel Setup
                </button>
              </>
            )}

            {/* Disable 2FA button */}
            {enabled &&
              !showDisableForm &&
              !showSetupForm &&
              !qrCode && (
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

            {/* Disable 2FA form */}
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
                <h2
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    marginTop: 0,
                  }}
                >
                  Confirm disabling 2FA
                </h2>

                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "#666666",
                  }}
                >
                  Enter your current admin password and a valid
                  authenticator code to confirm this change.
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
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
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
                    setCode(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
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
                  disabled={
                    loading ||
                    !password ||
                    code.length !== 6
                  }
                  style={{
                    ...primaryButtonStyle,
                    marginTop: 18,
                  }}
                >
                  {loading
                    ? "Verifying..."
                    : "Confirm and Disable 2FA"}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setShowDisableForm(false);
                    setPassword("");
                    setCode("");
                    setError("");
                  }}
                  style={secondaryButtonStyle}
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
