"use client";

import { useState } from "react";
import { addRequirement } from "@/lib/actions/documents";

interface AddRequirementModalProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddRequirementModal({
  applicationId,
  isOpen,
  onClose,
  onSuccess,
}: AddRequirementModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a document name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await addRequirement({
        application_id: applicationId,
        name: name.trim(),
        description: description.trim() || null,
        is_required: isRequired,
      });

      if (!res.success) {
        setError(res.error || "Failed to add requirement.");
        setLoading(false);
        return;
      }

      setName("");
      setDescription("");
      setIsRequired(true);
      setLoading(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Add Document Requirement</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="req-name"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Document Name *
            </label>
            <input
              id="req-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
              placeholder="e.g. Portfolio, GRE Scorecard, Resume"
            />
          </div>

          <div>
            <label
              htmlFor="req-desc"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Description (Optional)
            </label>
            <textarea
              id="req-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-600"
              placeholder="Provide instructions or formatting guidelines for this document."
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="req-required"
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="req-required"
              className="text-xs font-medium text-slate-700 select-none cursor-pointer"
            >
              Mandatory Requirement (impacts completion percentage)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-60 transition-colors"
            >
              {loading ? "Adding..." : "Add Requirement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
