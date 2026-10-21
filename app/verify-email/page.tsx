
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerificationResult() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  const verified = status === "success";
  const title = verified
    ? "Email Verified"
    : status === "error"
      ? "Something Went Wrong"
      : "Verification Link Invalid";

  const message = verified
    ? "Your email address has been verified. You can now log in to House of Orive."
    : status === "error"
      ? "We couldn't verify your email right now. Please try again later."
      : "This verification link is invalid, expired, or has already been used. Please register again or request a new verification email.";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "#f7f7f5",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#fff",
          borderRadius: 18,
          padding: 36,
          textAlign: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ color: "#111", fontSize: 28 }}>
          {title}
        </h1>

        <p style={{ color: "#666", lineHeight: 1.7 }}>
          {message}
        </p>

        <Link
          href="/login"
          style={{
            display: "inline-block",
            marginTop: 20,
            padding: "13px 25px",
            borderRadius: 999,
            background: "#111",
            color: "#fff",
            textDecoration: "none",
          }}
        >
          Go to Login
        </Link>
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main style={{ padding: 40, textAlign: "center" }}>
          Loading verification status...
        </main>
      }
    >
      <VerificationResult />
    </Suspense>
  );
}
