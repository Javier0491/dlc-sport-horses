"use client";

import Image from "next/image";
import { useState } from "react";
import { isAllowedImageUrl } from "@/lib/image-url";
import DropArea, { UploadIcon } from "./DropArea";
import { labelClass } from "./form-styles";
import { IMAGE_ACCEPT, uploadImageFile } from "./upload-media";

type Props = {
  name: string;
  label: string;
  initial?: string;
  hint?: string;
  aspect?: string; // clase de Tailwind, p. ej. "aspect-[3/4]" para retratos
  className?: string;
  onBusyChange?: (busy: boolean) => void;
  onChange?: (url: string) => void;
};

// Campo de foto: se arrastra (o elige) la imagen, se optimiza y se sube a
// Medios; la URL resultante viaja con el formulario en un campo oculto.
export default function ImageUploadField({
  name,
  label,
  initial = "",
  hint = "Se optimiza y se sube sola a Medios.",
  aspect = "aspect-[4/3]",
  className = "",
  onBusyChange,
  onChange,
}: Props) {
  const [url, setUrl] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const change = (next: string) => {
    setUrl(next);
    onChange?.(next);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || busy) return;
    setBusy(true);
    onBusyChange?.(true);
    setError(null);
    try {
      change(await uploadImageFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir.");
    } finally {
      setBusy(false);
      onBusyChange?.(false);
    }
  };

  const showImage = url && isAllowedImageUrl(url);

  return (
    <div className={className}>
      <input type="hidden" name={name} value={url} />
      <span className={labelClass}>{label}</span>
      <DropArea
        accept={IMAGE_ACCEPT}
        disabled={busy}
        onFiles={(files) => handleFile(files[0])}
        className={`mt-1 w-full ${aspect}`}
      >
        {(dragging) => (
          <>
            {showImage && <Image src={url} alt={label} fill unoptimized className="object-cover" />}
            <span
              className={`relative flex flex-col items-center gap-2 px-4 text-xs ${
                showImage
                  ? "rounded-md bg-dlc-negro/70 py-3 text-dlc-marfil opacity-0 transition-opacity group-hover:opacity-100"
                  : "text-neutral-500"
              } ${busy || dragging ? "opacity-100" : ""}`}
            >
              <UploadIcon busy={busy} />
              <span className="font-medium">
                {busy
                  ? "Subiendo…"
                  : showImage
                    ? "Arrastra otra foto o haz clic para cambiarla"
                    : "Arrastra la foto aquí o haz clic para elegirla"}
              </span>
            </span>
          </>
        )}
      </DropArea>
      <div className="mt-1.5 flex items-start justify-between gap-3 text-xs">
        {error ? (
          <p role="alert" className="text-red-600">
            {error}
          </p>
        ) : (
          <span className="text-neutral-500">{hint}</span>
        )}
        {url && !busy && (
          <button
            type="button"
            onClick={() => change("")}
            className="shrink-0 text-red-700 hover:underline"
          >
            Quitar foto
          </button>
        )}
      </div>
    </div>
  );
}
