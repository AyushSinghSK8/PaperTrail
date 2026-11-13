"use client";

import { useState, useRef, ChangeEvent } from "react";
import { uploadDocument } from "@/lib/actions/documents";

interface FileUploadButtonProps {
  applicationId: string;
  requirementId?: string;
  isReplace?: boolean;
  onUploadSuccess?: () => void;
  onError?: (errorMessage: string) => void;
}

export function FileUploadButton({
  applicationId,
  requirementId,
  isReplace = false,
  onUploadSuccess,
  onError,
}: FileUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input immediately so selecting the same file triggers change again
    e.target.value = "";

    // Client-side validations
    if (file.size > 10 * 1024 * 1024) {
      const msg = `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`;
      onError?.(msg);
      return;
    }

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      const msg = `Unsupported file type (${file.type}). Allowed formats are PDF, JPEG, and PNG.`;
      onError?.(msg);
      return;
    }

    setUploading(true);
    onError?.(""); // Clear any previous error

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", applicationId);
      if (requirementId) {
        formData.append("requirementId", requirementId);
      }

      const res = await uploadDocument(formData);

      if (!res.success) {
        onError?.(res.error || "Failed to upload document.");
      } else {
        onUploadSuccess?.();
      }
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred during upload.";
      onError?.(message);
    } finally {
      setUploading(false);
    }
  };

  const triggerPicker = () => {
    inputRef.current?.click();
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        onChange={handleFileChange}
        className="sr-only"
        disabled={uploading}
      />

      {!isReplace ? (
        <button
          type="button"
          onClick={triggerPicker}
          disabled={uploading}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:opacity-60 transition-colors"
        >
          {uploading ? (
            <>
              <svg
                className="animate-spin -ml-0.5 mr-1 h-3.5 w-3.5 text-white"
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
              Uploading...
            </>
          ) : (
            <>
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
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={triggerPicker}
          disabled={uploading}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 transition-colors"
        >
          {uploading ? (
            <>
              <svg
                className="animate-spin -ml-0.5 mr-1 h-3.5 w-3.5 text-slate-600"
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
              Replacing...
            </>
          ) : (
            <>
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
            </>
          )}
        </button>
      )}
    </div>
  );
}
