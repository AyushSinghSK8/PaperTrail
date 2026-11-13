import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs shadow-indigo-200 transition-transform group-hover:scale-105">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              PaperTrail
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/demo"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Demo Checklist
            </Link>

            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
              >
                Open Dashboard &rarr;
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
          University Document Readiness Engine
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl max-w-3xl mx-auto leading-tight">
          Keep every university admission document ready and organized.
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          PaperTrail helps prospective students track document checklists across multiple university applications, calculate readiness progress in real time, and securely store official transcripts and certificates in private cloud storage.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all hover:shadow-indigo-200 hover:shadow-md"
            >
              Go to Your Dashboard
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          ) : (
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all hover:shadow-indigo-200 hover:shadow-md"
            >
              Create Free Account
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          )}

          <Link
            href="/demo"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            Explore Interactive Demo
          </Link>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Engineered for Admissions Success
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Never scramble for a missing mark sheet or misplace an attested transcript.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Multi-Application Tracking
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Applying to multiple universities? Manage each application with its own deadlines, degree levels, and distinct requirements without mixing up files.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-indigo-600">
              Personalized Dashboards &rarr;
            </div>
          </div>

          {/* Feature 2 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Configurable Checklists
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Pre-populated with standard university requirements (passports, transcripts, SOPs, IELTS). Add custom requirements and flag mandatory vs. optional items.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-emerald-600">
              Live Readiness Score &rarr;
            </div>
          </div>

          {/* Feature 3 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 mb-4">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Private Cloud Storage
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Files are stored in private Supabase Storage buckets, secured by PostgreSQL Row Level Security (RLS) and accessible only via time-limited signed URLs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-semibold text-purple-600">
              Enterprise RLS Policies &rarr;
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 w-full my-6">
        <div className="rounded-2xl bg-indigo-600 p-8 sm:p-10 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md shadow-indigo-200">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold">
              Ready to streamline your admissions process?
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-indigo-100 max-w-xl">
              Create your account in 30 seconds and start tracking your documents today.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/register"
              className="rounded-xl bg-white text-indigo-600 px-5 py-2.5 text-xs font-bold hover:bg-indigo-50 shadow-xs transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/demo"
              className="rounded-xl border border-indigo-400 text-white px-5 py-2.5 text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">PaperTrail</span>
            <span>•</span>
            <span>University Document Readiness Engine</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/demo" className="hover:text-slate-700">
              Interactive Demo
            </Link>
            <Link href="/login" className="hover:text-slate-700">
              Sign In
            </Link>
            <Link href="/register" className="hover:text-slate-700">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
