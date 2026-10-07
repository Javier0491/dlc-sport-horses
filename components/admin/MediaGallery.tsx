"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteMedia } from "@/app/(admin)/admin/actions";
import type { MediaItem } from "@/lib/storage";

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;

function MediaCard({ item }: { item: MediaItem }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = async () => {
    await navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const remove = async () => {
    setDeleting(true);
    const result = await deleteMedia(item.path, item.store).catch(() => null);
    if (result?.ok) {
      router.refresh();
    } else {
      setError(result?.error ?? "No se pudo eliminar.");
      setDeleting(false);
      setConfirming(false);
    }
  };

  return (
    <li
      className={`overflow-hidden rounded-lg border border-neutral-200 transition-opacity ${
        deleting ? "opacity-40" : ""
      }`}
    >
      <a href={item.url} target="_blank" rel="noreferrer" className="block bg-neutral-100">
        {item.kind === "video" ? (
          <video
            src={item.url}
            muted
            playsInline
            preload="metadata"
            className="aspect-[4/3] w-full bg-black object-cover"
          />
        ) : (
          <>
            {/* URL de Supabase Storage: no pasa por el optimizador de next/image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.url}
              alt={item.path}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </>
        )}
      </a>
      <div className="space-y-2 p-3">
        <p className="truncate text-xs text-neutral-500" title={item.path}>
          {item.store === "r2" ? "R2" : "Supabase"} · {item.path} · {formatSize(item.size)}
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={item.url}
            onFocus={(event) => event.target.select()}
            aria-label={`URL de ${item.path}`}
            className="min-w-0 flex-1 rounded border border-neutral-200 bg-neutral-50 px-2 py-1 font-mono text-[11px] text-neutral-700"
          />
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded border border-neutral-300 px-2 py-1 text-xs hover:bg-neutral-100"
          >
            {copied ? "Copiada" : "Copiar"}
          </button>
        </div>
        <div className="flex items-center justify-end gap-3 text-xs">
          {confirming ? (
            <>
              <span className="text-neutral-500">¿Eliminar?</span>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="text-neutral-500 hover:text-neutral-900"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={remove}
                disabled={deleting}
                className="font-medium text-red-600 hover:text-red-800"
              >
                {deleting ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="text-red-600/80 hover:text-red-700"
            >
              Eliminar
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </li>
  );
}

export default function MediaGallery({ items }: { items: MediaItem[] }) {
  if (items.length === 0) {
    return (
      <p className="mt-4 rounded-lg border border-neutral-200 p-10 text-center text-sm text-neutral-500">
        Aún no hay fotos ni videos subidos.
      </p>
    );
  }

  return (
    <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <MediaCard key={`${item.store}:${item.path}`} item={item} />
      ))}
    </ul>
  );
}
