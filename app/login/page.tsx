"use client";

import Link from "next/link";
import {
  FormEvent,
  Suspense,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Icon } from "@iconify/react";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | REDIRECT URL
  |--------------------------------------------------------------------------
  |
  | Example:
  | /login?redirect=/products/classic-oversized-shirt
  |
  */

  const redirectPath =
    searchParams.get("redirect") || "/";

  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Login failed."
        );

        return;
      }

      setSuccess(
        `Welcome back, ${data.user.name}!`
      );

      setPassword("");

      /*
       * Give the success message a
       * moment to display, then return
       * to the page where the user
       * originally came from.
       */

      setTimeout(() => {
        router.replace(
          redirectPath
        );
      }, 500);
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | STYLES
  |--------------------------------------------------------------------------
  */

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
    position: "relative",
    width: "100%",
  } as const;

  const inputStyle = {
    width: "100%",
    height: "52px",
    padding:
      "0 16px 0 46px",
    border:
      "1px solid #dddddd",
    borderRadius: "10px",
    outline: "none",
    background: "#ffffff",
    color: "#111111",
    fontSize: "13px",
    boxSizing: "border-box",
  } as const;

  const iconStyle = {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform:
      "translateY(-50%)",
    color: "#777777",
    pointerEvents: "none",
  } as const;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 20px",
        background: "#f7f7f5",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "45px",
          boxShadow:
            "0 10px 40px rgba(0,0,0,0.06)",
        }}
      >
        {/* LOGO */}

        <Link
          href="/"
          style={{
            display: "block",
            textAlign: "center",
            color: "#111111",
            textDecoration: "none",
            fontSize: "24px",
            fontWeight: 700,
            letterSpacing:
              "-0.03em",
          }}
        >
          E-Commerce
        </Link>

        {/* HEADING */}

        <div
          style={{
            textAlign: "center",
            marginTop: "35px",
          }}
        >
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
                background:
                  "#111111",
              }}
            />

            <span
              style={{
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing:
                  "0.2em",
                textTransform:
                  "uppercase",
                color: "#777777",
              }}
            >
              Welcome Back
            </span>

            <span
              style={{
                width: "28px",
                height: "1px",
                background:
                  "#111111",
              }}
            />
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "36px",
              fontWeight: 600,
              letterSpacing:
                "-0.04em",
              color: "#111111",
            }}
          >
            Login
          </h1>

          <p
            style={{
              margin:
                "12px 0 0",
              fontSize: "13px",
              lineHeight: "1.6",
              color: "#777777",
            }}
          >
            Sign in to continue
            shopping.
          </p>
        </div>

        {/* LOGIN FORM */}

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: "35px",
          }}
        >
          {/* EMAIL */}

          <div>
            <label
              style={labelStyle}
            >
              Email Address
              <span
                style={
                  requiredStyle
                }
              >
                *
              </span>
            </label>

            <div
              style={
                inputWrapperStyle
              }
            >
              <Icon
                icon="solar:letter-linear"
                width="19"
                height="19"
                style={iconStyle}
              />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(
                    e.target.value
                  );
                  setError("");
                  setSuccess("");
                }}
                required
                autoComplete="email"
                style={inputStyle}
              />
            </div>
          </div>

          {/* PASSWORD */}

          <div
            style={{
              marginTop: "18px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                marginBottom: "8px",
              }}
            >
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#333333",
                }}
              >
                Password
                <span
                  style={
                    requiredStyle
                  }
                >
                  *
                </span>
              </label>

              <Link
                href="/forgot-password"
                style={{
                  fontSize: "11px",
                  color: "#777777",
                  textDecoration:
                    "none",
                }}
              >
                Forgot Password?
              </Link>
            </div>

            <div
              style={{
                position:
                  "relative",
              }}
            >
              <Icon
                icon="solar:lock-password-linear"
                width="19"
                height="19"
                style={iconStyle}
              />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(
                    e.target.value
                  );
                  setError("");
                  setSuccess("");
                }}
                required
                autoComplete="current-password"
                style={{
                  ...inputStyle,
                  paddingRight:
                    "50px",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                style={{
                  position:
                    "absolute",
                  right: "15px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  border: "none",
                  background:
                    "transparent",
                  cursor: "pointer",
                  color: "#777777",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
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

          {/* REMEMBER ME */}

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
              onChange={(e) =>
                setRememberMe(
                  e.target.checked
                )
              }
              style={{
                width: "15px",
                height: "15px",
                accentColor:
                  "#111111",
                cursor: "pointer",
              }}
            />

            Remember me
          </label>

          {/* ERROR */}

          {error && (
            <div
              style={{
                marginTop: "18px",
                padding:
                  "12px 14px",
                borderRadius: "8px",
                background:
                  "#fff5f5",
                border:
                  "1px solid #f1caca",
                color: "#c53030",
                fontSize: "12px",
                lineHeight: "1.5",
              }}
            >
              {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div
              style={{
                marginTop: "18px",
                padding:
                  "12px 14px",
                borderRadius: "8px",
                background:
                  "#f0fff4",
                border:
                  "1px solid #c6f6d5",
                color: "#18794e",
                fontSize: "12px",
                lineHeight: "1.5",
              }}
            >
              {success}
            </div>
          )}

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "52px",
              marginTop: "25px",
              border: "none",
              borderRadius: "999px",
              background: loading
                ? "#555555"
                : "#111111",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              gap: "9px",
            }}
          >
            {loading
              ? "Logging in..."
              : "Login"}

            {!loading && (
              <Icon
                icon="solar:arrow-right-linear"
                width="18"
                height="18"
              />
            )}
          </button>
        </form>

        {/* REGISTER */}

        <div
          style={{
            marginTop: "28px",
            paddingTop: "25px",
            borderTop:
              "1px solid #eeeeee",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#777777",
            }}
          >
            Don't have an
            account?{" "}
          </span>

          <Link
            href="/register"
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#111111",
              textDecoration:
                "none",
            }}
          >
            Create Account
          </Link>
        </div>

        {/* BACK TO STORE */}

        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            gap: "6px",
            marginTop: "20px",
            color: "#777777",
            fontSize: "12px",
            textDecoration:
              "none",
          }}
        >
          <Icon
            icon="solar:arrow-left-linear"
            width="15"
            height="15"
          />

          Back to Store
        </Link>
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