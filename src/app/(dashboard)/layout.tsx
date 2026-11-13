import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/sign-out-button";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user profile or fallback to email
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.full_name || user.email?.split("@")[0] || "Student";
  const userInitials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
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

            <nav className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-600">
              <Link
                href="/dashboard"
                className="hover:text-indigo-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/applications/new"
                className="hover:text-indigo-600 transition-colors"
              >
                + New Application
              </Link>
              <Link
                href="/demo"
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                Demo View
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs sm:block">
              <p className="font-semibold text-slate-800">{displayName}</p>
              <p className="text-slate-500 text-[11px] truncate max-w-[160px]">
                {user.email}
              </p>
            </div>

            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 border border-indigo-200"
              title={displayName}
            >
              {userInitials}
            </div>

            <SignOutButton key={user.last_sign_in_at || user.id} />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 sm:py-10 flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>PaperTrail • University Document Readiness Engine</span>
          <div className="flex items-center gap-4">
            <Link href="/demo" className="hover:text-slate-700 underline">
              View Demo Checklist
            </Link>
            <span>Secured with Supabase RLS & Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
