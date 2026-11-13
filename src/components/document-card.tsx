"use client";

import { useState } from "react";
import type { RequirementWithDocument } from "@/types/database";
import { FileUploadButton } from "@/components/file-upload-button";
import { deleteDocument, deleteRequirement, getSignedUrl } from "@/lib/actions/documents";

interface DocumentCardProps {
  requirement: RequirementWithDocument;
  index: number;
  applicationId: string;
  onRefresh: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function DocumentCard({
  requirement,
  index,
  applicationId,
  onRefresh,
}: DocumentCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [deletingFile, setDeletingFile] = useState(false);
  const [deletingReq, setDeletingReq] = useState(false);

  const doc = requirement.uploaded_document;
  const isUploaded = Boolean(doc);

  const handleDownload = async () => {
    if (!doc) return;
    setDownloading(true);
    setError(null);
    try {
      const res = await getSignedUrl(doc.storage_path);
      if (res.success && res.signedUrl) {
        window.open(res.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        setError(res.error || "Failed to download document.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to download document.";
      setError(message);
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!doc) return;
    if (!window.confirm(`Are you sure you want to remove the uploaded file for "${requirement.name}"?`)) {
      return;
    }
    setDeletingFile(true);
    setError(null);
    try {
      const res = await deleteDocument(doc.id, applicationId);
      if (!res.success) {
        setError(res.error || "Failed to remove file.");
      } else {
        onRefresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to remove file.";
      setError(message);
    } finally {
      setDeletingFile(false);
    }
  };

  const handleDeleteRequirement = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete the requirement "${requirement.name}"? Any uploaded file for it will also be deleted.`
      )
    ) {
      return;
    }
    setDeletingReq(true);
    setError(null);
    try {
      const res = await deleteRequirement(requirement.id, applicationId);
      if (!res.success) {
        setError(res.error || "Failed to delete requirement.");
      } else {
        onRefresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete requirement.";
      setError(message);
    } finally {
      setDeletingReq(false);
    }
  };

  return (
    <div
      className={`relative rounded-xl border p-4 sm:p-5 transition-all duration-200 ${
        isUploaded
          ? "border-emerald-200 bg-white shadow-xs ring-1 ring-emerald-100"
          : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
      }`}
    >
      {error && (
        <div className="mb-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700 font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Document Info */}
        <div className="flex items-start gap-3.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
              isUploaded
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {index + 1}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-900 text-base">
                {requirement.name}
              </h3>

              {requirement.is_required ? (
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-100">
                  Required
                </span>
              ) : (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                  Optional
                </span>
              )}

              {/* Uploaded / Missing Status Badge */}
              {isUploaded ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Uploaded
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  Missing
                </span>
              )}
            </div>

            {requirement.description && (
              <p className="text-xs text-slate-500">{requirement.description}</p>
            )}

            {/* Uploaded File Details */}
            {isUploaded && doc && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 hover:bg-slate-200 px-2.5 py-1 font-mono text-[11px] text-slate-800 transition-colors cursor-pointer text-left"
                  title="Click to view/download file"
                >
                  <svg
                    className="h-3.5 w-3.5 text-slate-500 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-semibold max-w-[180px] truncate sm:max-w-xs underline decoration-slate-300">
                    {doc.original_filename}
                  </span>
                  <span className="text-slate-400">
                    ({formatFileSize(doc.file_size)})
                  </span>
                  {downloading && (
                    <svg
                      className="animate-spin ml-1 h-3 w-3 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  )}
                </button>
                <span className="text-[11px] text-slate-400">
                  Added on {formatDate(doc.created_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Functional Action Controls */}
        <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
          {!isUploaded ? (
            <FileUploadButton
              applicationId={applicationId}
              requirementId={requirement.id}
              isReplace={false}
              onUploadSuccess={onRefresh}
              onError={setError}
            />
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
                title="View / Download file"
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
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download
              </button>

              <FileUploadButton
                applicationId={applicationId}
                requirementId={requirement.id}
                isReplace={true}
                onUploadSuccess={onRefresh}
                onError={setError}
              />

              <button
                type="button"
                onClick={handleDeleteFile}
                disabled={deletingFile}
                className="inline-flex items-center justify-center rounded-lg border border-transparent p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                title="Remove file"
                aria-label={`Remove file for ${requirement.name}`}
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Delete requirement button */}
          <button
            type="button"
            onClick={handleDeleteRequirement}
            disabled={deletingReq}
            className="inline-flex items-center justify-center rounded-lg border border-transparent p-1.5 text-slate-300 hover:bg-slate-100 hover:text-slate-600 transition-colors ml-1 cursor-pointer"
            title="Delete this requirement from checklist"
            aria-label={`Delete requirement ${requirement.name}`}
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
