
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Stage = "email" | "otp" | "password";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 15px",
  border: "1px solid #dedbd6",
  borderRadius: "8px",
  outline: "none",
  fontSize: "14px",
  color: "#292521",
  background: "#fff",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px",
  border: "none",
  borderRadius: "8px",
  background: "#292521",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

export default function ForgotPasswordPage() {
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (resendSeconds <= 0) return;

    const timer = window.setTimeout(() => {
      setResendSeconds((seconds) => seconds - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  async function postJSON(url: string, data: Record<string, string>) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Something went wrong. Please try again.");
    }

    return result;
  }

  async function handleRequestOTP(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await postJSON("/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setStage("otp");
      setResendSeconds(60);
      setMessage(
        result.message ||
          "If an eligible account exists, a verification code will be sent to its registered email."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to request a verification code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the six-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const result = await postJSON("/api/auth/verify-reset-otp", {
        email: email.trim().toLowerCase(),
        otp,
      });

      setStage("password");
      setMessage(result.message || "Code verified. You can now reset your password.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to verify the code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOTP() {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await postJSON("/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setResendSeconds(60);
      setMessage(
        result.message ||
          "If an eligible account exists, a verification code will be sent to its registered email."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to resend the code."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8 || password.length > 128) {
      setError("Your password must contain between 8 and 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await postJSON("/api/auth/reset-password", {
        email: email.trim().toLowerCase(),
        newPassword: password,
      });

      setMessage(result.message || "Your password has been reset successfully.");
      setPassword("");
      setConfirmPassword("");

      // Give the success message time to be read before returning to login.
      window.setTimeout(() => {
        window.location.href = "/login";
      }, 1800);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to reset your password."
      );
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setError("");
    setMessage("");
    setStage("email");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f7f7f5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 18px",
        boxSizing: "border-box",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#292521",
      }}
    >
      <div style={{ width: "100%", maxWidth: "430px" }}>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            color: "#6d665e",
            textDecoration: "none",
            fontSize: "13px",
            marginBottom: "24px",
          }}
        >
          ← Back to login
        </Link>

        <section
          style={{
            background: "#fff",
            border: "1px solid #eeeae5",
            borderRadius: "14px",
            padding: "36px 30px",
            boxShadow: "0 12px 40px rgba(41, 37, 33, 0.05)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <Link
              href="/"
              style={{
                display: "inline-block",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "27px",
                letterSpacing: "1px",
                color: "#292521",
                textDecoration: "none",
                marginBottom: "22px",
              }}
            >
              House of Orive
            </Link>

            <div
              style={{
                width: "44px",
                height: "2px",
                background: "#a77d55",
                margin: "0 auto 22px",
              }}
            />

            <h1
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: "29px",
                fontWeight: 400,
                margin: "0 0 10px",
              }}
            >
              {stage === "email"
                ? "Forgot Password?"
                : stage === "otp"
                  ? "Verify Your Email"
                  : "Create New Password"}
            </h1>

            <p
              style={{
                fontSize: "13px",
                color: "#77716b",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              {stage === "email"
                ? "Enter your registered email to receive a verification code."
                : stage === "otp"
                  ? `Enter the six-digit code sent to ${email}.`
                  : "Choose a new password for your account."}
            </p>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                background: "#fff1f0",
                color: "#a12c25",
                padding: "12px",
                borderRadius: "7px",
                fontSize: "13px",
                lineHeight: 1.5,
                marginBottom: "18px",
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              role="status"
              style={{
                background: "#f2f7f0",
                color: "#42633b",
                padding: "12px",
                borderRadius: "7px",
                fontSize: "13px",
                lineHeight: 1.5,
                marginBottom: "18px",
              }}
            >
              {message}
            </div>
          )}

          {stage === "email" && (
            <form onSubmit={handleRequestOTP}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "9px",
                }}
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                style={{ ...inputStyle, marginBottom: "22px" }}
              />

              <button type="submit" disabled={loading} style={buttonStyle}>
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {stage === "otp" && (
            <form onSubmit={handleVerifyOTP}>
              <label
                htmlFor="otp"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "9px",
                }}
              >
                Six-Digit Verification Code
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                maxLength={6}
                style={{
                  ...inputStyle,
                  textAlign: "center",
                  letterSpacing: "8px",
                  fontSize: "22px",
                  marginBottom: "22px",
                }}
              />

              <button type="submit" disabled={loading} style={buttonStyle}>
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <div
                style={{
                  textAlign: "center",
                  marginTop: "20px",
                  fontSize: "13px",
                  color: "#77716b",
                }}
              >
                {resendSeconds > 0 ? (
                  <span>Resend available in {resendSeconds}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={loading}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#8a623e",
                      fontWeight: 600,
                      cursor: loading ? "not-allowed" : "pointer",
                      padding: "4px",
                    }}
                  >
                    {loading ? "Please wait..." : "Resend code"}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={goBack}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  color: "#77716b",
                  marginTop: "12px",
                  padding: "8px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Use a different email
              </button>
            </form>
          )}

          {stage === "password" && (
            <form onSubmit={handleResetPassword}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "9px",
                }}
              >
                New Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter your new password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                maxLength={128}
                style={{ ...inputStyle, marginBottom: "18px" }}
              />

              <label
                htmlFor="confirmPassword"
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "9px",
                }}
              >
                Confirm New Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                maxLength={128}
                style={{ ...inputStyle, marginBottom: "22px" }}
              />

              <button type="submit" disabled={loading} style={buttonStyle}>
                {loading ? "Updating Password..." : "Reset Password"}
              </button>
            </form>
          )}

          <div
            style={{
              borderTop: "1px solid #eeeae5",
              marginTop: "28px",
              paddingTop: "20px",
              textAlign: "center",
              fontSize: "12px",
              color: "#8a847d",
              lineHeight: 1.7,
            }}
          >
            Secure account recovery · House of Orive
          </div>
        </section>
      </div>
    </main>
  );
}
