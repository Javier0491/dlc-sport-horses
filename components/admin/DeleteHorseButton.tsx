"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCaballo } from "@/app/(admin)/admin/actions";

// Doble clic: el primero pide confirmación en el propio botón.
export default function DeleteHorseButton({ id, nombre }: { id: string; nombre: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setDeleting(true);
    const result = await deleteCaballo(id).catch(() => null);
    if (result?.ok) {
      router.refresh();
    } else {
      setError(result?.error ?? "No se pudo eliminar.");
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <button
          type="button"
          onClick={remove}
          disabled={deleting}
          aria-label={`Confirmar eliminación de ${nombre}`}
          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {deleting ? "Eliminando…" : "¿Eliminar?"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={deleting}
          className="text-xs text-neutral-500 hover:text-neutral-900"
        >
          Cancelar
        </button>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-2">
      {error && (
        <span role="alert" className="text-xs text-red-600">
          {error}
        </span>
      )}
      <button
        type="button"
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
      >
        Eliminar
      </button>
    </span>
  );
}
