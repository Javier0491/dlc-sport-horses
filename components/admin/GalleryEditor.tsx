"use client";

import Image from "next/image";
import { useState } from "react";
import { MAX_GALERIA } from "@/lib/caballos-types";
import DropArea, { UploadIcon } from "./DropArea";
import { hintClass } from "./form-styles";
import { IMAGE_ACCEPT, isImageFile, uploadImageFile } from "./upload-media";

type Props = { initial: string[]; onBusyChange?: (busy: boolean) => void };

// Galería ordenada de un caballo. Se envía con el formulario como JSON en un
// campo oculto "galeria"; el orden aquí es el orden en la ficha pública.
export default function GalleryEditor({ initial, onBusyChange }: Props) {
  const [urls, setUrls] = useState(initial);
  const [pending, setPending] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Optimiza y sube las fotos una detrás de otra, añadiéndolas al final.
  const addFiles = async (fileList: FileList) => {
    const files = Array.from(fileList).filter(isImageFile);
    if (!files.length) return;
    const room = MAX_GALERIA - urls.length - pending;
    const batch = files.slice(0, Math.max(0, room));
    const errors: string[] = [];
    if (files.length > batch.length) errors.push(`La galería admite hasta ${MAX_GALERIA} fotos.`);
    if (!batch.length) {
      setError(errors[0]);
      return;
    }

    setError(null);
    setPending((n) => n + batch.length);
    onBusyChange?.(true);
    for (const file of batch) {
      try {
        const url = await uploadImageFile(file);
        setUrls((list) => (list.includes(url) ? list : [...list, url]));
      } catch (err) {
        errors.push(`${file.name}: ${err instanceof Error ? err.message : "no se pudo subir."}`);
      }
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
    <div className="sm:col-span-2">
      <input type="hidden" name="galeria" value={JSON.stringify(urls)} />
      <div className="flex items-baseline justify-between gap-4">
        <span className="block text-sm font-medium text-dlc-negro">Galería de fotos</span>
        <span className="text-xs text-neutral-500">
          {urls.length} / {MAX_GALERIA}
        </span>
      </div>
      <p className={hintClass}>
        Se muestran en la ficha junto a la foto principal y el retrato. Arrastra varias fotos a
        la vez; se optimizan y se suben solas.
      </p>

      <DropArea
        accept={IMAGE_ACCEPT}
        multiple
        disabled={urls.length >= MAX_GALERIA}
        onFiles={addFiles}
        className="mt-3 flex-col gap-2 px-6 py-8 text-xs text-neutral-500"
      >
        {() => (
          <>
            <UploadIcon busy={pending > 0} />
            <span className="font-medium text-neutral-600">
              {pending > 0
                ? `Subiendo ${pending} foto${pending === 1 ? "" : "s"}…`
                : urls.length >= MAX_GALERIA
                  ? `Galería completa (${MAX_GALERIA} fotos)`
                  : "Arrastra fotos aquí o haz clic para elegirlas"}
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
                <Image src={url} alt={`Foto ${i + 1}`} fill unoptimized className="object-cover" />
              </div>
              <span className="absolute top-1.5 left-1.5 rounded bg-dlc-negro/70 px-1.5 text-[10px] text-dlc-marfil">
                {i + 1}
              </span>
              <div className="flex justify-between border-t border-dlc-arena text-xs">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label={`Mover la foto ${i + 1} antes`}
                  className="flex-1 py-1.5 hover:bg-dlc-marfil disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === urls.length - 1}
                  aria-label={`Mover la foto ${i + 1} después`}
                  className="flex-1 py-1.5 hover:bg-dlc-marfil disabled:opacity-30"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => setUrls(urls.filter((u) => u !== url))}
                  aria-label={`Quitar la foto ${i + 1}`}
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
