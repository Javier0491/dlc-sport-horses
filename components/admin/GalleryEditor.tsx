"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MAX_GALERIA } from "@/lib/caballos-types";
import { isAllowedImageUrl } from "@/lib/image-url";
import { hintClass, inputClass } from "./form-styles";

// Galería ordenada de un caballo. Se envía con el formulario como JSON en un
// campo oculto "galeria"; el orden aquí es el orden en la ficha pública.
export default function GalleryEditor({ initial }: { initial: string[] }) {
  const [urls, setUrls] = useState(initial);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Acepta uno o varios enlaces a la vez (separados por espacios o saltos de línea).
  const add = () => {
    const candidates = draft.split(/\s+/).map((u) => u.trim()).filter(Boolean);
    if (!candidates.length) return;
    const invalid = candidates.filter((u) => !isAllowedImageUrl(u));
    const fresh = candidates.filter((u) => isAllowedImageUrl(u) && !urls.includes(u));
    const room = MAX_GALERIA - urls.length;
    setUrls([...urls, ...fresh.slice(0, room)]);
    setDraft("");
    setError(
      invalid.length
        ? `${invalid.length === 1 ? "Un enlace no es" : `${invalid.length} enlaces no son`} de Medios y no se añadió.`
        : fresh.length > room
          ? `La galería admite hasta ${MAX_GALERIA} fotos.`
          : null,
    );
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
        Se muestran en la ficha junto a la foto principal y el retrato. Sube las fotos en{" "}
        <Link href="/admin/media" target="_blank" className="font-medium text-dlc-cuero underline">
          Medios
        </Link>
        , copia sus URL y pégalas aquí (puedes pegar varias a la vez).
      </p>

      <div className="mt-3 flex gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              add();
            }
          }}
          rows={1}
          placeholder="Pega aquí una o varias URL de Medios"
          className={`${inputClass} mt-0 resize-y`}
        />
        <button
          type="button"
          onClick={add}
          disabled={!draft.trim() || urls.length >= MAX_GALERIA}
          className="shrink-0 rounded-md border border-dlc-cuero px-4 text-sm font-medium text-dlc-cuero hover:bg-dlc-cuero hover:text-dlc-marfil disabled:opacity-40"
        >
          Añadir
        </button>
      </div>
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
