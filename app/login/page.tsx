
"use client";

import Link from "next/link";
import {
  FormEvent,
  Suspense,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Admin 2FA challenge state
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [challengeToken, setChallengeToken] = useState("");
  const [authenticatorCode, setAuthenticatorCode] = useState("");

  const requestedRedirect = searchParams.get("redirect");

  const redirectPath = requestedRedirect?.startsWith("/") &&
    !requestedRedirect.startsWith("//")
      ? requestedRedirect
      : null;

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#333333",
  } as const;

  const requiredStyle = {
    color: "#111111",
    marginLeft: "3px",
  } as const;

  const inputWrapperStyle = {
    position: "relative" as const,
    width: "100%",
  };

  const inputStyle = {
    width: "100%",
    height: "52px",
    padding: "0 16px 0 46px",
    border: "1px solid #dddddd",
    borderRadius: "10px",
    outline: "none",
    background: "#ffffff",
    color: "#111111",
    fontSize: "13px",
    boxSizing: "border-box" as const,
  };

  const iconStyle = {
    position: "absolute" as const,
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#777777",
    pointerEvents: "none" as const,
  };

  const buttonStyle = {
    width: "100%",
    height: "52px",
    marginTop: "25px",
    border: "none",
    borderRadius: "999px",
    background: loading ? "#555555" : "#111111",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
  } as const;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Login failed.");
        return;
      }

      // Admin has entered the correct password but must complete 2FA.
      if (data.requiresTwoFactor === true) {
        if (typeof data.challengeToken !== "string") {
          setError("Unable to start two-factor verification. Please try again.");
          return;
        }

        setChallengeToken(data.challengeToken);
        setRequiresTwoFactor(true);
        setPassword("");
        setAuthenticatorCode("");
        setSuccess("Password verified. Enter your authenticator code.");
        return;
      }

      if (!data.user) {
        setError("The server returned an invalid login response.");
        return;
      }

      setSuccess(`Welcome back, ${data.user.name}!`);
      setPassword("");

      const destination =
        redirectPath ||
        (data.user.role === "admin" ? "/admin" : "/");

      window.setTimeout(() => {
        router.replace(destination);
      }, 500);
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTwoFactorSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(authenticatorCode)) {
      setError("Enter the six-digit code from your authenticator app.");
      return;
    }

    if (!challengeToken) {
      setError("Your login challenge is missing. Please log in again.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/admin-2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          challengeToken,
          code: authenticatorCode,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Authenticator verification failed.");
        return;
      }

      if (!data.user || data.user.role !== "admin") {
        setError("Unable to verify the admin session.");
        return;
      }

      setSuccess("Two-factor verification successful. Redirecting...");
      setChallengeToken("");
      setAuthenticatorCode("");

      const destination = redirectPath || "/admin";

      window.setTimeout(() => {
        router.replace(destination);
      }, 500);
    } catch (err) {
      console.error("Admin 2FA verification error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  function returnToPasswordLogin() {
    setRequiresTwoFactor(false);
    setChallengeToken("");
    setAuthenticatorCode("");
    setError("");
    setSuccess("");
    setPassword("");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 20px",
        background: "#f7f7f5",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "45px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
          boxSizing: "border-box",
        }}
      >
        <Link
          href="/"
          style={{
            display: "block",
            textAlign: "center",
            color: "#111111",
            textDecoration: "none",
            fontSize: "24px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          House Of Orive
        </Link>

        <div style={{ textAlign: "center", marginTop: "35px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                width: "28px",
                height: "1px",
                background: "#111111",
              }}
            />
            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#777777",
              }}
            >
              {requiresTwoFactor ? "Admin Security" : "Welcome Back"}
            </span>
            <span
              style={{
                width: "28px",
                height: "1px",
                background: "#111111",
              }}
            />
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "36px",
              fontWeight: 600,
              letterSpacing: "-0.04em",
              color: "#111111",
            }}
          >
            {requiresTwoFactor ? "Verify It's You" : "Login"}
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              fontSize: "13px",
              lineHeight: "1.6",
              color: "#777777",
            }}
          >
            {requiresTwoFactor
              ? "Open Google Authenticator or your TOTP app and enter the current six-digit code."
              : "Sign in to continue shopping."}
          </p>
        </div>

        <form
          onSubmit={
            requiresTwoFactor
              ? handleTwoFactorSubmit
              : handleSubmit
          }
          style={{ marginTop: "35px" }}
        >
          {!requiresTwoFactor ? (
            <>
              <div>
                <label htmlFor="login-email" style={labelStyle}>
                  Email Address
                  <span style={requiredStyle}>*</span>
                </label>

                <div style={inputWrapperStyle}>
                  <Icon
                    icon="solar:letter-linear"
                    width="19"
                    height="19"
                    style={iconStyle}
                  />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    required
                    autoComplete="username"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginTop: "18px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <label htmlFor="login-password" style={labelStyle}>
                    Password
                    <span style={requiredStyle}>*</span>
                  </label>

                  <Link
                    href="/forgot-password"
                    style={{
                      fontSize: "11px",
                      color: "#777777",
                      textDecoration: "none",
                    }}
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div style={inputWrapperStyle}>
                  <Icon
                    icon="solar:lock-password-linear"
                    width="19"
                    height="19"
                    style={iconStyle}
                  />

                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                      setSuccess("");
                    }}
                    required
                    autoComplete="current-password"
                    style={{
                      ...inputStyle,
                      paddingRight: "50px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "#777777",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      icon={
                        showPassword
                          ? "solar:eye-closed-linear"
                          : "solar:eye-linear"
                      }
                      width="20"
                      height="20"
                    />
                  </button>
                </div>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginTop: "18px",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "#666666",
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: "15px",
                    height: "15px",
                    accentColor: "#111111",
                    cursor: "pointer",
                  }}
                />
                Remember me
              </label>
            </>
          ) : (
            <div>
              <label htmlFor="authenticator-code" style={labelStyle}>
                Authenticator Code
                <span style={requiredStyle}>*</span>
              </label>

              <div style={inputWrapperStyle}>
                <Icon
                  icon="solar:shield-keyhole-linear"
                  width="20"
                  height="20"
                  style={iconStyle}
                />

                <input
                  id="authenticator-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  value={authenticatorCode}
                  onChange={(e) => {
                    setAuthenticatorCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    );
                    setError("");
                    setSuccess("");
                  }}
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  style={{
                    ...inputStyle,
                    paddingLeft: "46px",
                    letterSpacing: "6px",
                    fontSize: "17px",
                  }}
                />
              </div>

              <p
                style={{
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "#777777",
                  lineHeight: "1.6",
                }}
              >
                Enter the code currently shown in your authenticator app.
                The code changes approximately every 30 seconds.
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              style={{
                marginTop: "18px",
                padding: "12px 14px",
                borderRadius: "8px",
                background: "#fff5f5",
                border: "1px solid #f1caca",
                color: "#c53030",
                fontSize: "12px",
                lineHeight: "1.5",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              style={{
                marginTop: "18px",
                padding: "12px 14px",
                borderRadius: "8px",
                background: "#f0fff4",
                border: "1px solid #c6f6d5",
                color: "#18794e",
                fontSize: "12px",
                lineHeight: "1.5",
              }}
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={buttonStyle}
          >
            {loading
              ? requiresTwoFactor
                ? "Verifying..."
                : "Logging in..."
              : requiresTwoFactor
                ? "Verify & Login"
                : "Login"}

            {!loading && (
              <Icon
                icon="solar:arrow-right-linear"
                width="18"
                height="18"
              />
            )}
          </button>

          {requiresTwoFactor && (
            <button
              type="button"
              onClick={returnToPasswordLogin}
              disabled={loading}
              style={{
                width: "100%",
                marginTop: "14px",
                padding: "10px",
                border: "none",
                background: "transparent",
                color: "#777777",
                fontSize: "12px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              ← Back to login
            </button>
          )}
        </form>

        {!requiresTwoFactor && (
          <>
            <div
              style={{
                marginTop: "28px",
                paddingTop: "25px",
                borderTop: "1px solid #eeeeee",
                textAlign: "center",
              }}
            >
              <span style={{ fontSize: "12px", color: "#777777" }}>
                Don&apos;t have an account?{" "}
              </span>
              <Link
                href="/register"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#111111",
                  textDecoration: "none",
                }}
              >
                Create Account
              </Link>
            </div>

            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                marginTop: "20px",
                color: "#777777",
                fontSize: "12px",
                textDecoration: "none",
              }}
            >
              <Icon
                icon="solar:arrow-left-linear"
                width="15"
                height="15"
              />
              Back to Store
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
