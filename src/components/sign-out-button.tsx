"use client";

import { useState, useTransition } from "react";
import { signOut } from "@/lib/auth";

export function SignOutButton({ className = "" }: { className?: string }) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignOut = () => {
    if (isPending) return;
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await signOut();
      } catch (error: unknown) {
        // Don't treat Next.js redirect control-flow exceptions as errors
        if (
          error &&
          typeof error === "object" &&
          "message" in error &&
          (error as { message: unknown }).message === "NEXT_REDIRECT"
        ) {
          return;
        }
        console.error("Sign out error:", error);
        setErrorMessage("Sign out failed. Please try again.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 focus:outline-hidden disabled:opacity-60 transition-colors ${className}`}
      title={errorMessage || "Sign out of your account"}
    >
      <svg
        className="h-3.5 w-3.5 text-slate-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      {isPending ? "Signing out..." : "Sign Out"}
    </button>
  );
}


