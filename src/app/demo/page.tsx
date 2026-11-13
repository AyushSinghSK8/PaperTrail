"use client";

import { useState, ChangeEvent } from "react";
import Link from "next/link";

interface UploadedFileInfo {
  name: string;
  size: string;
  uploadedAt: string;
}

interface DocumentItem {
  id: string;
  name: string;
  description: string;
  badge: string;
  acceptedTypes: string;
  uploadedFile: UploadedFileInfo | null;
}

const initialDocuments: DocumentItem[] = [
  {
    id: "passport",
    name: "Passport",
    description: "Valid international passport bio-data page (PDF or JPG).",
    badge: "Identity",
    acceptedTypes: ".pdf,.jpg,.jpeg,.png",
    uploadedFile: null,
  },
  {
    id: "class12_marksheet",
    name: "Class 12 Marksheet",
    description: "Official final statement of marks issued by your exam board.",
    badge: "Academic",
    acceptedTypes: ".pdf,.jpg,.jpeg,.png",
    uploadedFile: null,
  },
  {
    id: "class12_transcript",
    name: "Class 12 Transcript",
    description: "Consolidated grade transcripts attested by your institution.",
    badge: "Academic",
    acceptedTypes: ".pdf,.jpg,.jpeg,.png",
    uploadedFile: null,
  },
  {
    id: "ielts_certificate",
    name: "IELTS Certificate",
    description: "Official Test Report Form (TRF) showing individual and overall band scores.",
    badge: "Language",
    acceptedTypes: ".pdf,.jpg,.jpeg,.png",
    uploadedFile: null,
  },
  {
    id: "academic_photograph",
    name: "Academic Photograph",
    description: "Recent color passport-format portrait with a solid neutral background.",
    badge: "Photo",
    acceptedTypes: ".jpg,.jpeg,.png",
    uploadedFile: null,
  },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UniversityDocumentReadinessDashboard() {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);

  const totalRequired = documents.length;
  const uploadedCount = documents.filter((doc) => doc.uploadedFile !== null).length;
  const percentage = Math.round((uploadedCount / totalRequired) * 100);

  const handleFileChange = (docId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const timeString = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            uploadedFile: {
              name: file.name,
              size: formatFileSize(file.size),
              uploadedAt: timeString,
            },
          };
        }
        return doc;
      })
    );

    // Reset input value so re-selecting or replacing with the same file triggers onChange
    event.target.value = "";
  };

  const handleRemoveFile = (docId: string) => {
    setDocuments((prevDocs) =>
      prevDocs.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            uploadedFile: null,
          };
        }
        return doc;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-200">
              {/* PaperTrail Logo Icon */}
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
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                PaperTrail
              </span>
              <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                MVP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-colors"
            >
              Sign In
            </Link>
            <div className="hidden text-right text-xs sm:block pl-2 border-l border-slate-200">
              <p className="font-medium text-slate-700">Student Portal</p>
              <p className="text-slate-500">Demo Session</p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
              ST
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
        {/* A. Dashboard Header */}
        <section className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 border border-indigo-100">
            <span>Student Document Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            University Document Readiness
          </h1>
          <p className="text-sm text-slate-600 sm:text-base max-w-2xl">
            Track and prepare your university application documents. Upload each item to track your document readiness.
          </p>
        </section>

        {/* Top Grid: B. Selected Application & D. Progress Tracking */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* B. Selected Application Card */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Selected Application
                  </p>
                  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                    Demo Data
                  </span>
                </div>
                <h2 className="mt-1 text-lg font-bold text-slate-900">
                  University Admission Application
                </h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                In Progress
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Application Cycle (Sample)</span>
                <p className="font-semibold text-slate-700">Fall 2027 Admissions</p>
              </div>
              <div>
                <span className="text-slate-400">Target Level (Sample)</span>
                <p className="font-semibold text-slate-700">Undergraduate / Graduate</p>
              </div>
              <div>
                <span className="text-slate-400">Reference ID (Sample)</span>
                <p className="font-mono font-medium text-slate-700">PT-APP-2027-089</p>
              </div>
              <div>
                <span className="text-slate-400">Requirement Tier</span>
                <p className="font-semibold text-slate-700">Standard Tier (5 Docs)</p>
              </div>
            </div>
          </section>

          {/* D. Progress Tracking Card */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
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
                  <strong className="text-slate-900 font-bold">{uploadedCount}</strong> of{" "}
                  <strong className="text-slate-900 font-bold">{totalRequired}</strong> documents uploaded
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {totalRequired - uploadedCount} remaining
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

            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
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
                  <span>All 5 documents uploaded! Your checklist readiness is 100%.</span>
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
                    Upload remaining documents below to achieve 100% readiness.
                  </span>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* C. Document Checklist Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Document Checklist</h2>
              <p className="text-xs text-slate-500">
                Checklist of required application documents.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Showing {documents.length} required items
            </div>
          </div>

          <div className="space-y-3">
            {documents.map((doc, index) => {
              const isUploaded = doc.uploadedFile !== null;
              const inputId = `file-input-${doc.id}`;

              return (
                <div
                  key={doc.id}
                  className={`relative rounded-xl border p-4 sm:p-5 transition-all duration-200 ${
                    isUploaded
                      ? "border-emerald-200 bg-white shadow-sm ring-1 ring-emerald-100"
                      : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                  }`}
                >
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
                            {doc.name}
                          </h3>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            {doc.badge}
                          </span>

                          {/* Status Badge */}
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

                        <p className="text-xs text-slate-500">{doc.description}</p>

                        {/* Uploaded File Detail info */}
                        {isUploaded && doc.uploadedFile && (
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-800">
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
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="font-semibold max-w-[200px] truncate sm:max-w-xs">
                                {doc.uploadedFile.name}
                              </span>
                              <span className="text-slate-400">({doc.uploadedFile.size})</span>
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Added at {doc.uploadedFile.uploadedAt}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Functional Upload / Replace / Remove Controls */}
                    <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
                      {/* Hidden Real HTML File Input */}
                      <input
                        type="file"
                        id={inputId}
                        accept={doc.acceptedTypes}
                        onChange={(e) => handleFileChange(doc.id, e)}
                        className="sr-only"
                      />

                      {!isUploaded ? (
                        <label
                          htmlFor={inputId}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2"
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
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                          </svg>
                          Upload File
                        </label>
                      ) : (
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={inputId}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors focus-within:ring-2 focus-within:ring-indigo-500"
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
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                            Replace
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveFile(doc.id)}
                            className="inline-flex items-center justify-center rounded-lg border border-transparent p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                            title="Remove file"
                            aria-label={`Remove ${doc.name}`}
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer info */}
        <footer className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>PaperTrail MVP • University Document Readiness Engine</span>
          <span>In-memory client session • Ready for demo</span>
        </footer>
      </main>
    </div>
  );
}
