"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // If Supabase has email confirmation enabled, user.identities will typically indicate this
      // or session will be null. If session exists right away, we can redirect directly.
      if (data?.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setRegisteredSuccess(true);
        setLoading(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(message);
      setLoading(false);
    }
  };

  if (registeredSuccess) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900">Check your email</h3>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          We&apos;ve sent a verification link to{" "}
          <strong className="text-slate-900">{email}</strong>. Please click the link to confirm your account and sign in.
        </p>
        <div className="mt-6">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Create your account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Start tracking and organizing your university admissions documents.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2">
          <svg
            className="h-4 w-4 shrink-0 text-rose-500 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label
            htmlFor="fullName"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            placeholder="student@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            placeholder="Re-enter password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
