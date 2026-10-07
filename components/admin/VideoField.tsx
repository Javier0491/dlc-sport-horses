"use client";

import { useState } from "react";
import { parseVideo, VIDEO_HINT } from "@/lib/video";
import DropArea, { UploadIcon } from "./DropArea";
import { hintClass, inputClass, labelClass } from "./form-styles";
import { uploadVideoFile, VIDEO_ACCEPT, videoLimitLabel } from "./upload-media";

const SOURCE = { youtube: "YouTube", vimeo: "Vimeo", file: "archivo de video" } as const;

// Campo de video: se arrastra un archivo (se sube directo a Medios) o se pega un
// enlace de YouTube/Vimeo, y confirma al momento qué reconoció.
export default function VideoField({
  name,
  label,
  initial,
  hint = VIDEO_HINT,
  allowFile = true,
  onBusyChange,
  onChange,
}: {
  name: string;
  label: string;
  initial: string;
  hint?: string;
  allowFile?: boolean; // false = solo enlaces (p. ej. transmisiones en vivo)
  onBusyChange?: (busy: boolean) => void;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const [progress, setProgress] = useState<number | null>(null); // null = sin subida en curso
  const [error, setError] = useState<string | null>(null);
  const video = parseVideo(value);
  const valid = video && (allowFile || video.kind !== "file");
  const uploading = progress !== null;

  const change = (next: string) => {
    setValue(next);
    onChange?.(next);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file || uploading) return;
    setError(null);
    setProgress(0);
    onBusyChange?.(true);
    try {
      change(await uploadVideoFile(file, setProgress));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo subir el video.");
    } finally {
      setProgress(null);
      onBusyChange?.(false);
    }
  };

  const status = error ? (
    <span className="text-red-600">{error}</span>
  ) : !value.trim() ? (
    hint
  ) : valid ? (
    <span className="text-emerald-700">✓ {video.kind === "file" ? "Video subido." : `Enlace de ${SOURCE[video.kind]} reconocido.`}</span>
  ) : (
    <span className="text-red-600">Enlace no reconocido. {hint}</span>
  );

  const linkInput = (
    <input
      value={video?.kind === "file" ? "" : value}
      onChange={(e) => change(e.target.value)}
      maxLength={500}
      placeholder="https://www.youtube.com/watch?v=…"
      aria-label={`${label}: enlace`}
      className={inputClass}
    />
  );

  if (!allowFile) {
    return (
      <label className="block sm:col-span-2">
        <input type="hidden" name={name} value={value} />
        <span className={labelClass}>{label}</span>
        {linkInput}
        <span className={`block ${hintClass}`}>{status}</span>
      </label>
    );
  }

  return (
    <div className="sm:col-span-2">
      <input type="hidden" name={name} value={value} />
      <span className={labelClass}>{label}</span>

      {video?.kind === "file" && !uploading ? (
        <div className="mt-1 max-w-xl">
          <video
            src={video.src}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full rounded-md border border-dlc-arena bg-black"
          />
          <div className="mt-1.5 flex items-center justify-between gap-3 text-xs">
            <label className="cursor-pointer font-medium text-dlc-cuero hover:underline">
              Cambiar video
              <input
                type="file"
                accept={VIDEO_ACCEPT}
                className="sr-only"
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <button type="button" onClick={() => change("")} className="text-red-700 hover:underline">
              Quitar video
            </button>
          </div>
        </div>
      ) : (
        <>
          <DropArea
            accept={VIDEO_ACCEPT}
            disabled={uploading}
            onFiles={(files) => handleFile(files[0])}
            className="mt-1 max-w-xl flex-col gap-2 px-6 py-10 text-xs text-neutral-500"
          >
            {() =>
              uploading ? (
                <>
                  <UploadIcon busy />
                  <span className="font-medium text-neutral-600">
                    Subiendo video… {Math.round(progress * 100)} %
                  </span>
                  <span className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-dlc-arena">
                    <span
                      className="block h-full bg-dlc-cuero transition-[width]"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </span>
                  <span>No cierres esta página hasta que termine.</span>
                </>
              ) : (
                <>
                  <UploadIcon />
                  <span className="font-medium text-neutral-600">
                    Arrastra el video aquí o haz clic para elegirlo
                  </span>
                  <span>MP4, MOV o WEBM · máx. {videoLimitLabel()}</span>
                </>
              )
            }
          </DropArea>
          <span className="mt-3 block text-xs text-neutral-500">
            o pega un enlace de YouTube o Vimeo (mejor para videos largos):
          </span>
          {linkInput}
        </>
      )}
      <span className={`block ${hintClass}`}>{status}</span>
    </div>
  );
}
