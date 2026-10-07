"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  IMAGE_ACCEPT,
  isImageFile,
  isVideoFile,
  uploadImageFile,
  uploadVideoFile,
  VIDEO_ACCEPT,
  videoLimitLabel,
} from "./upload-media";

type Upload = { name: string; status: "uploading" | "done" | "error"; error?: string };

export default function MediaDropzone() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);

  const busy = uploads.some((u) => u.status === "uploading");

  const setStatus = (index: number, patch: Partial<Upload>) =>
    setUploads((list) => list.map((u, i) => (i === index ? { ...u, ...patch } : u)));

  // Sube en cuanto se sueltan los archivos, uno detrás de otro.
  const handleFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []).filter((f) => isImageFile(f) || isVideoFile(f));
    if (files.length === 0) return;

    const offset = uploads.length;
    setUploads((list) => [
      ...list,
      ...files.map((f) => ({ name: f.name, status: "uploading" as const })),
    ]);

    for (const [i, file] of files.entries()) {
      try {
        if (isVideoFile(file)) await uploadVideoFile(file);
        else await uploadImageFile(file);
        setStatus(offset + i, { status: "done" });
      } catch (err) {
        setStatus(offset + i, {
          status: "error",
          error: err instanceof Error ? err.message : "No se pudo subir.",
        });
      }
    }
    router.refresh();
  };

  return (
    <div>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragging
            ? "border-blue-500 bg-blue-50"
            : "border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50"
        }`}
      >
        <input
          type="file"
          accept={`${IMAGE_ACCEPT},${VIDEO_ACCEPT}`}
          multiple
          className="sr-only"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
        {busy ? (
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 text-neutral-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 16V4M7 9l5-5 5 5" />
            <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
          </svg>
        )}
        <p className="mt-4 text-sm font-medium">
          {busy ? "Subiendo…" : "Arrastra fotos o videos aquí o haz clic para elegirlos"}
        </p>
        <p className="mt-1 text-xs text-neutral-500">Fotos (se optimizan solas) · Videos MP4, MOV o WEBM hasta {videoLimitLabel()}</p>
      </label>

      {uploads.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm" aria-live="polite">
          {uploads.map((upload, i) => (
            <li key={i} className="flex items-center gap-3">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  upload.status === "uploading"
                    ? "animate-pulse bg-amber-500"
                    : upload.status === "done"
                      ? "bg-green-600"
                      : "bg-red-600"
                }`}
              />
              <span className="truncate text-neutral-700">{upload.name}</span>
              <span className="shrink-0 text-xs text-neutral-500">
                {upload.status === "uploading"
                  ? "subiendo…"
                  : upload.status === "done"
                    ? "subida"
                    : upload.error}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
