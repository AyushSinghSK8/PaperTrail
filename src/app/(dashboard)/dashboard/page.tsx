import React from "react";
import Link from "next/link";
import { connection } from "next/server";
import { getApplications } from "@/lib/actions/applications";
import { StatusBadge } from "@/components/status-badge";
import { ProgressBar } from "@/components/progress-bar";

export const instant = false;

export default async function DashboardPage() {
  await connection();
  const applications = await getApplications();

  // Aggregate stats
  const totalApps = applications.length;
  const totalRequiredDocs = applications.reduce((acc, app) => acc + app.total_required, 0);
  const totalCompletedDocs = applications.reduce((acc, app) => acc + app.completed_required, 0);
  const totalPendingDocs = totalRequiredDocs - totalCompletedDocs;

  // Find upcoming deadlines
  const upcomingDeadlines = applications
    .filter((app) => app.deadline && new Date(app.deadline) >= new Date())
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 border border-indigo-100 mb-2">
            <span>Student Document Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Applications Overview
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mt-1">
            Track and manage your university application document readiness in one place.
          </p>
        </div>

        <Link
          href="/applications/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors self-start sm:self-center"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Application
        </Link>
      </div>

      {/* Aggregate Statistics Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Applications
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{totalApps}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Completed Docs
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {totalCompletedDocs}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pending Docs
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            {totalPendingDocs}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Upcoming Deadlines
          </p>
          <p className="mt-2 text-2xl font-bold text-indigo-600">
            {upcomingDeadlines.length}
          </p>
        </div>
      </div>

      {/* Applications List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Your University Applications</h2>
          <span className="text-xs text-slate-500 font-medium">
            {applications.length} {applications.length === 1 ? "application" : "applications"}
          </span>
        </div>

        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4">
              <svg
                className="h-8 w-8"
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
            <h3 className="text-base font-bold text-slate-900">No applications yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Start by adding your target university. PaperTrail will automatically create a personalized document readiness checklist.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/applications/new"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
              >
                + Create Your First Application
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Explore Demo Checklist
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {applications.map((app) => {
              const percentage =
                app.total_required > 0
                  ? Math.round((app.completed_required / app.total_required) * 100)
                  : 100;

              return (
                <div
                  key={app.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header: Name and Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                          {app.country || "International"}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          <Link href={`/applications/${app.id}`}>
                            {app.university_name}
                          </Link>
                        </h3>
                        <p className="text-xs text-slate-600">{app.program_name}</p>
                      </div>

                      <StatusBadge status={app.status} />
                    </div>

                    {/* Metadata details */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-slate-400">Intake / Semester:</span>
                        <p className="font-semibold text-slate-700">
                          {app.intake_semester || "Not specified"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400">Deadline:</span>
                        <p className="font-semibold text-slate-700">
                          {app.deadline
                            ? new Date(app.deadline).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "None set"}
                        </p>
                      </div>
                    </div>

                    {/* Readiness progress */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Document Readiness</span>
                        <span className="font-bold text-indigo-600">
                          {percentage}% ({app.completed_required}/{app.total_required})
                        </span>
                      </div>
                      <ProgressBar percentage={percentage} />
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[11px] text-slate-400 capitalize">
                      {app.degree_level}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/applications/${app.id}/settings`}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                        title="Application settings"
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
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </Link>

                      <Link
                        href={`/applications/${app.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 text-xs font-semibold transition-colors"
                      >
                        View Checklist
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
