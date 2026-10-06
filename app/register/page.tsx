"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.terms) {
      setError("Please accept the Terms & Conditions and Privacy Policy.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        return;
      }

      setSuccess("Account created successfully!");

      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        terms: false,
      });
    } catch (error) {
      console.error("Registration error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

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
          boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}

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
          E-Commerce
        </Link>

        {/* Heading */}

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
              Join Us
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
            Create Account
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              fontSize: "13px",
              lineHeight: "1.6",
              color: "#777777",
            }}
          >
            Create your account to start shopping.
          </p>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: "35px",
          }}
        >
          {/* Full Name */}

          <div>
            <label style={labelStyle}>
              Full Name
              <span style={requiredStyle}>*</span>
            </label>

            <div style={inputWrapperStyle}>
              <Icon
                icon="solar:user-linear"
                width="19"
                height="19"
                style={iconStyle}
              />

              <input
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Email */}

          <div style={{ marginTop: "18px" }}>
            <label style={labelStyle}>
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
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Phone */}

          <div style={{ marginTop: "18px" }}>
            <label style={labelStyle}>
              Phone Number
              <span style={requiredStyle}>*</span>
            </label>

            <div style={inputWrapperStyle}>
              <Icon
                icon="solar:phone-linear"
                width="19"
                height="19"
                style={iconStyle}
              />

              <input
                name="phone"
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Password */}

          <div style={{ marginTop: "18px" }}>
            <label style={labelStyle}>
              Password
              <span style={requiredStyle}>*</span>
            </label>

            <div style={inputWrapperStyle}>
              <Icon
                icon="solar:lock-keyhole-linear"
                width="19"
                height="19"
                style={iconStyle}
              />

              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeButtonStyle}
                aria-label="Toggle password visibility"
              >
                <Icon
                  icon={
                    showPassword
                      ? "solar:eye-linear"
                      : "solar:eye-closed-linear"
                  }
                  width="19"
                  height="19"
                />
              </button>
            </div>
          </div>

          {/* Confirm Password */}

          <div style={{ marginTop: "18px" }}>
            <label style={labelStyle}>
              Confirm Password
              <span style={requiredStyle}>*</span>
            </label>

            <div style={inputWrapperStyle}>
              <Icon
                icon="solar:lock-keyhole-linear"
                width="19"
                height="19"
                style={iconStyle}
              />

              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={inputStyle}
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                style={eyeButtonStyle}
                aria-label="Toggle confirm password visibility"
              >
                <Icon
                  icon={
                    showConfirmPassword
                      ? "solar:eye-linear"
                      : "solar:eye-closed-linear"
                  }
                  width="19"
                  height="19"
                />
              </button>
            </div>
          </div>

          {/* Terms */}

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "9px",
              marginTop: "22px",
              cursor: "pointer",
            }}
          >
            <input
              name="terms"
              type="checkbox"
              checked={formData.terms}
              onChange={handleChange}
              required
              style={{
                marginTop: "2px",
              }}
            />

            <span
              style={{
                fontSize: "11px",
                lineHeight: "1.6",
                color: "#777777",
              }}
            >
              I agree to the{" "}
              <Link
                href="/terms"
                style={{
                  color: "#111111",
                  fontWeight: 600,
                }}
              >
                Terms & Conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                style={{
                  color: "#111111",
                  fontWeight: 600,
                }}
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>

          {/* Error */}

          {error && (
            <div
              style={{
                marginTop: "18px",
                padding: "12px 14px",
                borderRadius: "8px",
                background: "#fff1f1",
                border: "1px solid #ffd5d5",
                color: "#c62828",
                fontSize: "12px",
                lineHeight: "1.5",
              }}
            >
              {error}
            </div>
          )}

          {/* Success */}

          {success && (
            <div
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

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            style={{
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
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}

            {!loading && (
              <Icon
                icon="solar:arrow-right-linear"
                width="18"
                height="18"
              />
            )}
          </button>
        </form>

        {/* Login */}

        <div
          style={{
            marginTop: "28px",
            paddingTop: "25px",
            borderTop: "1px solid #eeeeee",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              color: "#777777",
            }}
          >
            Already have an account?{" "}
          </span>

          <Link
            href="/login"
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#111111",
              textDecoration: "none",
            }}
          >
            Login
          </Link>
        </div>

        {/* Back */}

        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            marginTop: "20px",
            color: "#888888",
            textDecoration: "none",
            fontSize: "11px",
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

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontSize: "12px",
  fontWeight: 600,
  color: "#333333",
};

const requiredStyle = {
  marginLeft: "3px",
  color: "#999999",
};

const inputWrapperStyle = {
  position: "relative" as const,
  display: "flex",
  alignItems: "center",
  width: "100%",
  height: "48px",
  border: "1px solid #dddddd",
  borderRadius: "9px",
  background: "#ffffff",
};

const iconStyle = {
  marginLeft: "14px",
  flexShrink: 0,
  color: "#777777",
};

const inputStyle = {
  width: "100%",
  height: "100%",
  padding: "0 14px",
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#111111",
  fontSize: "13px",
  boxSizing: "border-box" as const,
};

const eyeButtonStyle = {
  width: "42px",
  height: "42px",
  flexShrink: 0,
  border: "none",
  background: "transparent",
  color: "#777777",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};