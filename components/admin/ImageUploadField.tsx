"use client";

import Image from "next/image";
import { useState } from "react";
import { isAllowedImageUrl } from "@/lib/image-url";
import { labelClass } from "./form-styles";
import { IMAGE_ACCEPT, uploadImageFile } from "./upload-image";

type Props = {
  name: string;
  label: string;
  initial?: string;
  onBusyChange?: (busy: boolean) => void;
};

// Campo de foto: se arrastra (o elige) la imagen, se optimiza y se sube a
// Medios; la URL resultante viaja con el formulario en un campo oculto.
export default function ImageUploadField({ name, label, initial = "", onBusyChange }: Props) {
  const [url, setUrl] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file || busy) return;
    setBusy(true);
    onBusyChange?.(true);
    setError(null);
    try {
      setUrl(await uploadImageFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir.");
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  };

  const showImage = url && isAllowedImageUrl(url);

  return (
    <div>
      <input type="hidden" name={name} value={url} />
      <span className={labelClass}>{label}</span>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files[0]);
        }}
        className={`group relative mt-1 flex aspect-[4/3] w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border-2 border-dashed bg-white text-center transition-colors ${
          dragging ? "border-dlc-cuero bg-dlc-marfil" : "border-dlc-arena hover:border-dlc-cuero"
        }`}
      >
        <input
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        {showImage && (
          <Image src={url} alt={label} fill unoptimized className="object-cover" />
        )}
        <span
          className={`relative flex flex-col items-center gap-2 px-4 text-xs ${
            showImage
              ? "rounded-md bg-dlc-negro/70 py-3 text-dlc-marfil opacity-0 transition-opacity group-hover:opacity-100"
              : "text-neutral-500"
          } ${busy || dragging ? "opacity-100" : ""}`}
        >
          {busy ? (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-dlc-cuero" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
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
          <span className="font-medium">
            {busy
              ? "Subiendo…"
              : showImage
                ? "Arrastra otra foto o haz clic para cambiarla"
                : "Arrastra la foto aquí o haz clic para elegirla"}
          </span>
        </span>
      </label>
      <div className="mt-1.5 flex items-center justify-between gap-3 text-xs">
        {error ? (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        ) : (
          <span className="text-neutral-500">Se optimiza y se sube sola a Medios.</span>
        )}
        {url && !busy && (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="shrink-0 text-red-700 hover:underline"
          >
            Quitar foto
          </button>
        )}
      </div>
    </div>
  );
}
