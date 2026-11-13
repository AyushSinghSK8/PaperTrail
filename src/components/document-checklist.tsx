"use client";

import { useState } from "react";
import type { RequirementWithDocument } from "@/types/database";
import { DocumentCard } from "@/components/document-card";
import { AddRequirementModal } from "@/components/add-requirement-modal";
import { getRequirementsWithDocuments } from "@/lib/actions/documents";

interface DocumentChecklistProps {
  applicationId: string;
  initialRequirements: RequirementWithDocument[];
}

export function DocumentChecklist({
  applicationId,
  initialRequirements,
}: DocumentChecklistProps) {
  const [requirements, setRequirements] = useState<RequirementWithDocument[]>(initialRequirements);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const updated = await getRequirementsWithDocuments(applicationId);
      setRequirements(updated);
    } catch (err) {
      console.error("Failed to refresh requirements:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculations for progress
  const requiredList = requirements.filter((r) => r.is_required);
  const totalRequired = requiredList.length;
  const completedRequired = requiredList.filter((r) => r.is_completed).length;

  const optionalList = requirements.filter((r) => !r.is_required);
  const totalOptional = optionalList.length;
  const completedOptional = optionalList.filter((r) => r.is_completed).length;

  const percentage =
    totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 100;

  return (
    <div className="space-y-8">
      {/* Progress Tracking Card */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Readiness Progress
            </p>
            <span className="text-2xl font-extrabold text-indigo-600">
              {percentage}%
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between text-sm">
            <span className="text-slate-600">
              <strong className="text-slate-900 font-bold">{completedRequired}</strong> of{" "}
              <strong className="text-slate-900 font-bold">{totalRequired}</strong> mandatory documents uploaded
            </span>
            <span className="text-xs font-medium text-slate-500">
              {totalRequired - completedRequired} mandatory remaining
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
          {percentage === 100 ? (
            <div className="flex items-center gap-2 text-emerald-700 font-medium">
              <svg
                className="h-4 w-4 shrink-0 text-emerald-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>All mandatory documents uploaded! Your checklist readiness is 100%.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 shrink-0 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>
                Upload the remaining {totalRequired - completedRequired} mandatory documents to achieve 100% readiness.
              </span>
            </div>
          )}

          {totalOptional > 0 && (
            <span className="text-slate-500 text-[11px] font-medium">
              Optional: {completedOptional}/{totalOptional} uploaded
            </span>
          )}
        </div>
      </section>

      {/* Checklist Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Document Checklist</h2>
            <p className="text-xs text-slate-500">
              Required and optional documents for this application.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh document status"
            >
              <svg
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-indigo-600" : "text-slate-400"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Requirement
            </button>
          </div>
        </div>

        {requirements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
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
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-slate-800">No documents configured yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add custom document requirements to begin tracking readiness for this university application.
            </p>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
            >
              Add Requirement
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {requirements.map((req, idx) => (
              <DocumentCard
                key={req.id}
                requirement={req}
                index={idx}
                applicationId={applicationId}
                onRefresh={handleRefresh}
              />
            ))}
          </div>
        )}
      </section>

      {/* Add Requirement Modal */}
      <AddRequirementModal
        applicationId={applicationId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
