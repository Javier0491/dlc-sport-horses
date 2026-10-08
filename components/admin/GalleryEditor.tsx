"use client";

import Image from "next/image";
import { useState } from "react";
import { MAX_GALERIA } from "@/lib/caballos-types";
import { isVideoUrl } from "@/lib/video";
import DropArea, { UploadIcon } from "./DropArea";
import { hintClass } from "./form-styles";
import {
  IMAGE_ACCEPT,
  VIDEO_ACCEPT,
  isImageFile,
  isVideoFile,
  uploadImageFile,
  uploadVideoFile,
} from "./upload-media";

type Props = {
  name: string; // campo oculto del formulario (JSON con la lista de URLs)
  label: string;
  hint?: string;
  dropLabel?: string;
  initial: string[];
  allowVideo?: boolean; // admite videos además de fotos (se comprimen antes de subir)
  onBusyChange?: (busy: boolean) => void;
};

const percent = (fraction: number) => `${Math.round(fraction * 100)} %`;

// Lista ordenada de fotos (una sección de la galería de un caballo). Se envía
// con el formulario como JSON en un campo oculto; el orden aquí es el orden en
// la ficha pública.
export default function GalleryEditor({
  name,
  label,
  hint,
  dropLabel = "Arrastra fotos aquí o haz clic para elegirlas",
  initial,
  allowVideo = false,
  onBusyChange,
}: Props) {
  const [urls, setUrls] = useState(initial);
  const [pending, setPending] = useState(0);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const item = allowVideo ? "archivo" : "foto";

  // Comprime el video en el navegador (1080p, MP4) y luego lo sube.
  const uploadVideo = async (file: File) => {
    setVideoStatus("Preparando video…");
    const { compressVideo } = await import("@/lib/compress-video"); // solo se descarga si hay videos
    const small = await compressVideo(file, (p) => setVideoStatus(`Comprimiendo video… ${percent(p)}`));
    setVideoStatus("Subiendo video…");
    return uploadVideoFile(small, (p) => setVideoStatus(`Subiendo video… ${percent(p)}`));
  };

  // Optimiza y sube las fotos (y videos) uno detrás de otro, añadiéndolos al final.
  const addFiles = async (fileList: FileList) => {
    const files = Array.from(fileList).filter((f) => isImageFile(f) || (allowVideo && isVideoFile(f)));
    if (!files.length) return;
    const room = MAX_GALERIA - urls.length - pending;
    const batch = files.slice(0, Math.max(0, room));
    const errors: string[] = [];
    if (files.length > batch.length) errors.push(`«${label}» admite hasta ${MAX_GALERIA} ${item}s.`);
    if (!batch.length) {
      setError(errors[0]);
      return;
    }

    setError(null);
    setPending((n) => n + batch.length);
    onBusyChange?.(true);
    for (const file of batch) {
      try {
        const url = isVideoFile(file) ? await uploadVideo(file) : await uploadImageFile(file);
        setUrls((list) => (list.includes(url) ? list : [...list, url]));
      } catch (err) {
        errors.push(`${file.name}: ${err instanceof Error ? err.message : "no se pudo subir."}`);
      }
      setVideoStatus(null);
      setPending((n) => n - 1);
    }
    onBusyChange?.(false);
    setError(errors.length ? errors.join(" ") : null);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= urls.length) return;
    const next = [...urls];
    [next[from], next[to]] = [next[to], next[from]];
    setUrls(next);
  };

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <div className="flex items-baseline justify-between gap-4">
        <span className="block text-sm font-medium text-dlc-negro">{label}</span>
        <span className="text-xs text-neutral-500">
          {urls.length} / {MAX_GALERIA}
        </span>
      </div>
      {hint && <p className={hintClass}>{hint}</p>}

      <DropArea
        accept={allowVideo ? `${IMAGE_ACCEPT},${VIDEO_ACCEPT}` : IMAGE_ACCEPT}
        multiple
        disabled={urls.length >= MAX_GALERIA}
        onFiles={addFiles}
        className="mt-3 flex-col gap-2 px-6 py-8 text-xs text-neutral-500"
      >
        {() => (
          <>
            <UploadIcon busy={pending > 0} />
            <span className="font-medium text-neutral-600">
              {videoStatus
                ? `${videoStatus}${pending > 1 ? ` (quedan ${pending})` : ""}`
                : pending > 0
                  ? `Subiendo ${pending} ${item}${pending === 1 ? "" : "s"}…`
                  : urls.length >= MAX_GALERIA
                    ? `Sección completa (${MAX_GALERIA} ${item}s)`
                    : dropLabel}
            </span>
          </>
        )}
      </DropArea>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}

      {urls.length > 0 && (
        <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {urls.map((url, i) => (
            <li key={url} className="group relative overflow-hidden rounded-md border border-dlc-arena bg-white">
              <div className="relative aspect-[4/3]">
                {isVideoUrl(url) ? (
                  <>
                    <video src={`${url}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    <span className="absolute right-1.5 bottom-1.5 rounded bg-dlc-negro/70 px-1.5 text-[10px] text-dlc-marfil">
                      ▶ Video
                    </span>
                  </>
                ) : (
                  <Image src={url} alt={`Foto ${i + 1}`} fill unoptimized className="object-cover" />
                )}
              </div>
              <span className="absolute top-1.5 left-1.5 rounded bg-dlc-negro/70 px-1.5 text-[10px] text-dlc-marfil">
                {i + 1}
              </span>
              <div className="flex justify-between border-t border-dlc-arena text-xs">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label={`Mover el elemento ${i + 1} antes`}
                  className="flex-1 py-1.5 hover:bg-dlc-marfil disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === urls.length - 1}
                  aria-label={`Mover el elemento ${i + 1} después`}
                  className="flex-1 py-1.5 hover:bg-dlc-marfil disabled:opacity-30"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => setUrls(urls.filter((u) => u !== url))}
                  aria-label={`Quitar el elemento ${i + 1}`}
                  className="flex-1 py-1.5 text-red-700 hover:bg-red-50"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
