import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getApplication } from "@/lib/actions/applications";
import { ApplicationSettingsForm } from "@/components/application-settings-form";

export const instant = false;

export default async function ApplicationSettingsPage({
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header and Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Link
          href={`/applications/${id}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
          title="Back to application"
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
            Application Settings
          </h1>
          <p className="text-xs text-slate-500">
            Edit parameters or remove {application.university_name} from your dashboard.
          </p>
        </div>
      </div>

      <ApplicationSettingsForm application={application} />
    </div>
  );
}
