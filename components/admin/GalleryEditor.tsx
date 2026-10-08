"use client";

import { useState } from "react";
import { MAX_GALERIA } from "@/lib/caballos-types";
import { mediaKind, youtubeThumb } from "@/lib/video";
import MediaPreview from "../MediaPreview";
import DropArea, { UploadIcon } from "./DropArea";
import { hintClass, inputClass } from "./form-styles";
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
  allowVideo?: boolean; // admite videos (se comprimen antes de subir) y enlaces de YouTube
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
  const [link, setLink] = useState("");
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

  // Enlace de un video de YouTube: se guarda tal cual y se reproduce en la ficha.
  const addLink = () => {
    const url = link.trim();
    if (!url) return;
    if (!youtubeThumb(url)) {
      setError("Ese enlace no es de un video de YouTube (p. ej. https://youtu.be/…).");
      return;
    }
    if (urls.length + pending >= MAX_GALERIA) {
      setError(`«${label}» admite hasta ${MAX_GALERIA} ${item}s.`);
      return;
    }
    setError(null);
    setUrls((list) => (list.includes(url) ? list : [...list, url]));
    setLink("");
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
      {allowVideo && (
        <div className="mt-2 flex items-end gap-2">
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            // Enter añade el enlace en vez de enviar todo el formulario.
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addLink();
              }
            }}
            placeholder="O pega un enlace de YouTube: https://youtu.be/…"
            aria-label={`Enlace de YouTube para «${label}»`}
            className={inputClass}
          />
          <button
            type="button"
            onClick={addLink}
            disabled={!link.trim() || urls.length >= MAX_GALERIA}
            className="shrink-0 rounded-md border border-dlc-arena bg-white px-4 py-2 text-sm hover:border-dlc-cuero disabled:opacity-50"
          >
            Añadir
          </button>
        </div>
      )}
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
                <MediaPreview src={url} sizes="200px" unoptimized />
                {mediaKind(url) !== "image" && (
                  <span className="absolute right-1.5 bottom-1.5 rounded bg-dlc-negro/70 px-1.5 text-[10px] text-dlc-marfil">
                    {mediaKind(url) === "youtube" ? "▶ YouTube" : "▶ Video"}
                  </span>
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
