"use client";

import { useState, useTransition } from "react";
import { deleteMiembro } from "@/app/(admin)/admin/actions";

// Doble paso para no borrar a nadie por un clic. Si sale bien, la acción
// redirige a la lista del equipo.
export default function DeleteMiembroButton({ id, nombre }: { id: string; nombre: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const remove = () =>
    startTransition(async () => {
      const result = await deleteMiembro(id);
      // Solo vuelve si falló (si no, ya redirigió).
      if (result && !result.ok) {
        setError(result.error);
        setConfirming(false);
      }
    });

  return (
    <div className="flex flex-wrap items-center gap-3">
      {confirming ? (
        <>
          <span className="text-sm text-red-700">Se eliminará a {nombre} del equipo.</span>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? "Eliminando…" : "Sí, eliminar"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            Cancelar
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
        >
          Eliminar del equipo
        </button>
      )}
      {error && (
        <p role="alert" className="w-full text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
