"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createApplication } from "@/lib/actions/applications";
import type { DegreeLevel, ApplicationStatus } from "@/types/database";

export default function NewApplicationPage() {
  const router = useRouter();

  const [universityName, setUniversityName] = useState("");
  const [country, setCountry] = useState("");
  const [programName, setProgramName] = useState("");
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>("undergraduate");
  const [intakeSemester, setIntakeSemester] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("planning");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!universityName.trim() || !programName.trim() || !country.trim() || !intakeSemester.trim()) {
      setError("Please fill in all mandatory fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createApplication({
        university_name: universityName.trim(),
        country: country.trim(),
        program_name: programName.trim(),
        degree_level: degreeLevel,
        intake_semester: intakeSemester.trim(),
        deadline: deadline || null,
        status: status,
        notes: notes.trim() || null,
      });

      if (!res.success || !res.application) {
        setError(res.error || "Failed to create application.");
        setLoading(false);
        return;
      }

      router.push(`/applications/${res.application.id}`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with back link */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          title="Back to dashboard"
        >
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight sm:text-2xl">
            Add University Application
          </h1>
          <p className="text-xs text-slate-500">
            Create an application and auto-generate its document requirements checklist.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-start gap-2">
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

      {/* Form Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="universityName"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                University / Institution Name *
              </label>
              <input
                id="universityName"
                type="text"
                required
                value={universityName}
                onChange={(e) => setUniversityName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                placeholder="e.g. University of Toronto, Stanford, Imperial College"
              />
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Country *
              </label>
              <input
                id="country"
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                placeholder="e.g. Canada, United States, UK"
              />
            </div>

            <div>
              <label
                htmlFor="degreeLevel"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Degree Level *
              </label>
              <select
                id="degreeLevel"
                value={degreeLevel}
                onChange={(e) => setDegreeLevel(e.target.value as DegreeLevel)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
              >
                <option value="undergraduate">Undergraduate (Bachelor&apos;s)</option>
                <option value="postgraduate">Postgraduate (Master&apos;s)</option>
                <option value="doctorate">Doctorate (Ph.D.)</option>
                <option value="diploma">Diploma / Associate</option>
                <option value="certificate">Certificate</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="programName"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Program / Course Name *
              </label>
              <input
                id="programName"
                type="text"
                required
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                placeholder="e.g. B.Sc. Computer Science, M.S. Data Science"
              />
            </div>

            <div>
              <label
                htmlFor="intakeSemester"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Intake / Semester *
              </label>
              <input
                id="intakeSemester"
                type="text"
                required
                value={intakeSemester}
                onChange={(e) => setIntakeSemester(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                placeholder="e.g. Fall 2027, Spring 2028"
              />
            </div>

            <div>
              <label
                htmlFor="deadline"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Application Deadline (Optional)
              </label>
              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Current Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 bg-white focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
              >
                <option value="planning">Planning</option>
                <option value="preparing_documents">Preparing Documents</option>
                <option value="ready_to_apply">Ready to Apply</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="notes"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Personal Notes (Optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
                placeholder="Application portal links, advisor contacts, scholarship requirements..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-60 transition-colors"
            >
              {loading ? "Creating Application..." : "Create Application & Checklist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
