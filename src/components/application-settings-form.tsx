"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateApplication, deleteApplication } from "@/lib/actions/applications";
import type { Application, DegreeLevel, ApplicationStatus } from "@/types/database";

interface ApplicationSettingsFormProps {
  application: Application;
}

export function ApplicationSettingsForm({
  application,
}: ApplicationSettingsFormProps) {
  const router = useRouter();

  const [universityName, setUniversityName] = useState(application.university_name);
  const [country, setCountry] = useState(application.country);
  const [programName, setProgramName] = useState(application.program_name);
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>(application.degree_level);
  const [intakeSemester, setIntakeSemester] = useState(application.intake_semester);
  const [deadline, setDeadline] = useState(application.deadline || "");
  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [notes, setNotes] = useState(application.notes || "");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!universityName.trim() || !programName.trim() || !country.trim() || !intakeSemester.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await updateApplication(application.id, {
        university_name: universityName.trim(),
        country: country.trim(),
        program_name: programName.trim(),
        degree_level: degreeLevel,
        intake_semester: intakeSemester.trim(),
        deadline: deadline || null,
        status: status,
        notes: notes.trim() || null,
      });

      if (!res.success) {
        setError(res.error || "Failed to update application.");
      } else {
        setSuccess("Application settings updated successfully!");
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmation = window.confirm(
      `Are you sure you want to permanently delete "${application.university_name}"? All document requirements and uploaded files will be permanently deleted.`
    );
    if (!confirmation) return;

    setDeleting(true);
    setError(null);

    try {
      const res = await deleteApplication(application.id);
      if (!res.success) {
        setError(res.error || "Failed to delete application.");
        setDeleting(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete application.";
      setError(message);
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
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

      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-700 flex items-center gap-2">
          <svg
            className="h-4 w-4 shrink-0 text-emerald-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* Edit Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
          Application Details
        </h2>

        <form onSubmit={handleUpdate} className="space-y-5">
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
              />
            </div>

            <div>
              <label
                htmlFor="deadline"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Application Deadline
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
                Application Status
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
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Link
              href={`/applications/${application.id}`}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back to Checklist
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-60 transition-colors"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone: Delete Application */}
      <div className="rounded-xl border border-rose-200 bg-white p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-rose-700 mb-1">Danger Zone</h3>
        <p className="text-xs text-slate-600 mb-4">
          Permanently delete this university application and all its document requirements and uploaded files from Supabase Storage.
        </p>

        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-500 focus:outline-hidden focus:ring-2 focus:ring-rose-600 focus:ring-offset-2 disabled:opacity-60 transition-colors"
        >
          {deleting ? "Deleting Application..." : "Delete Application"}
        </button>
      </div>
    </div>
  );
}
