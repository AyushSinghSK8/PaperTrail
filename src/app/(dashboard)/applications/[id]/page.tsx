import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getApplication } from "@/lib/actions/applications";
import { getRequirementsWithDocuments } from "@/lib/actions/documents";
import { StatusBadge } from "@/components/status-badge";
import { DocumentChecklist } from "@/components/document-checklist";

export const instant = false;

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const application = await getApplication(id);

  if (!application) {
    notFound();
  }

  const requirements = await getRequirementsWithDocuments(id);

  const formattedDeadline = application.deadline
    ? new Date(application.deadline).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No deadline specified";

  return (
    <div className="space-y-8">
      {/* Header and Navigation */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
            Applications
          </Link>
          <span>/</span>
          <span className="text-slate-800 truncate max-w-xs">{application.university_name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 border border-indigo-100 mb-1">
              <span>{application.country || "University Target"}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {application.university_name}
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              {application.program_name} • <span className="capitalize">{application.degree_level}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center">
            <StatusBadge status={application.status} />

            <Link
              href={`/applications/${id}/settings`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* Selected Application Card (matching visual identity of original demo) */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Selected Application Details
              </p>
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200">
                Active
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {application.university_name} — {application.program_name}
            </h2>
          </div>
          <StatusBadge status={application.status} />
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400">Intake / Cycle</span>
            <p className="font-semibold text-slate-700">{application.intake_semester || "General"}</p>
          </div>
          <div>
            <span className="text-slate-400">Target Level</span>
            <p className="font-semibold text-slate-700 capitalize">{application.degree_level}</p>
          </div>
          <div>
            <span className="text-slate-400">Application Deadline</span>
            <p className="font-semibold text-slate-700">{formattedDeadline}</p>
          </div>
          <div>
            <span className="text-slate-400">Reference ID</span>
            <p className="font-mono font-medium text-slate-700">PT-APP-{application.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {application.notes && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
            <span className="font-semibold text-slate-700">Notes: </span>
            {application.notes}
          </div>
        )}
      </section>

      {/* Interactive Document Checklist & Progress */}
      <DocumentChecklist
        applicationId={id}
        initialRequirements={requirements}
      />
    </div>
  );
}
