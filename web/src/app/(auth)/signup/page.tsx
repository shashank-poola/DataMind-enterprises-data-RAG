"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiRegister } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { DotmSquare11 } from "@/components/ui/dotm-square-11";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await apiRegister(email, name, password);
      setSession(res.access_token, { id: res.user_id, name: res.name, email: res.email });
      router.push("/chat");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Left: visual ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-10">
        <Image
          src="/images/signupbg.gif"
          alt=""
          fill
          unoptimized
          className="object-cover"
          style={{ filter: "brightness(0.55)" }}
        />
        {/* brand mark */}
        <div className="relative z-10">
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-screener)",
              fontSize: "1.5rem",
              color: "#F0EDE8",
              letterSpacing: "0.01em",
              textDecoration: "none",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.7")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
          >
            DataMind
          </Link>
        </div>
        {/* bottom tagline */}
        <div className="relative z-10">
          <p
            style={{
              fontFamily: "var(--font-screener)",
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              color: "#F0EDE8",
              lineHeight: 1.1,
              maxWidth: "18ch",
            }}
          >
            Intelligence built into your data.
          </p>
          <p className="mt-4 text-sm" style={{ color: "#7A7570", maxWidth: "32ch", lineHeight: 1.6 }}>
            Hybrid retrieval. Cohere reranking. Streaming answers.
          </p>
        </div>
      </div>

      {/* ── Right: form ── */}
      <div
        className="flex-1 flex flex-col"
        style={{ background: "#0A0908" }}
      >
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 max-w-[520px] mx-auto w-full">
          {/* mobile brand */}
          <div className="lg:hidden mb-10">
            <span
              style={{
                fontFamily: "var(--font-screener)",
                fontSize: "1.4rem",
                color: "#F0EDE8",
              }}
            >
              DataMind
            </span>
          </div>

          <div className="mb-10">
            <h1
              style={{
                fontFamily: "var(--font-screener)",
                fontSize: "2rem",
                color: "#F0EDE8",
                lineHeight: 1.1,
              }}
            >
              Create your account
            </h1>
            <p className="mt-2 text-sm" style={{ color: "#5A5652" }}>
              Start querying your enterprise data
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{
                  background: "rgba(220,60,60,0.08)",
                  border: "1px solid rgba(220,60,60,0.2)",
                  color: "#E07070",
                }}
              >
                {error}
              </div>
            )}

            {[
              { label: "Full name", type: "text", value: name, setter: setName, placeholder: "Jane Smith" },
              { label: "Email", type: "email", value: email, setter: setEmail, placeholder: "you@company.com" },
              { label: "Password", type: "password", value: password, setter: setPassword, placeholder: "Min. 8 characters" },
            ].map(({ label, type, value, setter, placeholder }) => (
              <div key={label}>
                <label
                  className="block text-xs mb-2 tracking-wide"
                  style={{ color: "#5A5652", fontFamily: "var(--font-screener)", letterSpacing: "0.06em" }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  required
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all duration-200"
                  style={{
                    background: "#111110",
                    border: "1px solid #252321",
                    color: "#D4D0CA",
                    fontFamily: "var(--font-screener)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "#3A3835";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(240,237,232,0.04)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "#252321";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-lg text-sm transition-all duration-200"
              style={{
                background: loading ? "#1A1917" : "#F0EDE8",
                color: loading ? "#5A5652" : "#080706",
                fontFamily: "var(--font-screener)",
                fontSize: "0.95rem",
                border: loading ? "1px solid #252321" : "none",
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget as HTMLElement).style.background = "#E0DDD7";
              }}
              onMouseLeave={(e) => {
                if (!loading) (e.currentTarget as HTMLElement).style.background = "#F0EDE8";
              }}
            >
              {loading ? (
                <>
                  <DotmSquare11
                    size={16}
                    dotSize={2.5}
                    color="#6A6560"
                    speed={1.2}
                  />
                  Creating account…
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "#3A3835" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              className="transition-colors duration-150"
              style={{ color: "#8A857F", fontFamily: "var(--font-screener)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#D4D0CA")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#8A857F")}
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* ── Bottom legal strip ── */}
        <div
          className="px-8 sm:px-16 py-6 text-center space-y-2"
          style={{ borderTop: "1px solid #141312" }}
        >
          <p className="text-xs" style={{ color: "#3A3835", fontFamily: "var(--font-screener)" }}>
            By signing up, you agree to our{" "}
            <a href="#" className="underline underline-offset-2" style={{ color: "#5A5652" }}>
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-2" style={{ color: "#5A5652" }}>
              Privacy Policy
            </a>
          </p>
          <p className="text-xs" style={{ color: "#2A2826" }}>
            <a href="#" style={{ color: "#3A3835", fontFamily: "var(--font-screener)" }}>
              Are you an AI agent? Get an API key here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
