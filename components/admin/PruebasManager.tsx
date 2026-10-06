"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { createPrueba, deletePrueba, updatePrueba } from "@/app/(admin)/admin/actions";
import {
  ESTADOS_PRUEBA,
  fechaLarga,
  horaCorta,
  type Concurso,
  type Prueba,
} from "@/lib/concursos-types";
import { inputClass, labelClass } from "./form-styles";
import StatusBadge from "./StatusBadge";

function DeletePruebaButton({ prueba }: { prueba: Prueba }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const remove = () =>
    startTransition(async () => {
      const result = await deletePrueba(prueba.id).catch(() => null);
      if (result?.ok) {
        router.refresh();
      } else {
        setError(result?.error ?? "No se pudo eliminar.");
        setConfirming(false);
      }
    });

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label={`Confirmar eliminación de ${prueba.nombre}`}
          className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "Eliminando…" : "¿Eliminar?"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
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

// Tabla de pruebas de un concurso + modal para añadir o editar.
export default function PruebasManager({
  concurso,
  pruebas,
}: {
  concurso: Pick<Concurso, "id" | "fecha_inicio" | "fecha_fin">;
  pruebas: Prueba[];
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<Prueba | null>(null); // null = prueba nueva
  // Cambia en cada apertura para que el formulario se monte limpio.
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const open = (prueba: Prueba | null) => {
    setEditing(prueba);
    setError(null);
    setFormKey((k) => k + 1);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await (editing
        ? updatePrueba(editing.id, formData)
        : createPrueba(concurso.id, formData)
      ).catch(() => null);
      if (result?.ok) {
        close();
        router.refresh();
      } else {
        setError(result?.error ?? "No se pudo guardar la prueba.");
      }
    });
  };

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Pruebas</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {pruebas.length === 1 ? "1 prueba" : `${pruebas.length} pruebas`} en este concurso.
          </p>
        </div>
        <button
          type="button"
          onClick={() => open(null)}
          className="rounded-md bg-dlc-negro px-5 py-3 text-sm font-medium text-dlc-marfil transition-colors hover:bg-dlc-cuero"
        >
          + Nueva Prueba
        </button>
      </div>

      {pruebas.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
          Todavía no hay pruebas. Usa «+ Nueva Prueba» para añadir la primera.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Prueba</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Hora</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {pruebas.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">{p.nombre}</td>
                  <td className="whitespace-nowrap px-4 py-3 capitalize text-neutral-600">
                    {fechaLarga(p.fecha)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">{horaCorta(p.hora_inicio)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge value={p.estado} estados={ESTADOS_PRUEBA} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => open(p)}
                        className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
                      >
                        Editar
                      </button>
                      <DeletePruebaButton prueba={p} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de alta/edición. Clic fuera del recuadro o Esc lo cierran. */}
      <dialog
        ref={dialog}
        aria-labelledby="prueba-dialog-title"
        onClick={(e) => e.target === e.currentTarget && !pending && close()}
        className="m-auto w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-lg p-0 shadow-2xl backdrop:bg-dlc-negro/60 backdrop:backdrop-blur-sm"
      >
        <div className="bg-dlc-negro px-6 py-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-dlc-oro">Concurso</p>
          <h3 id="prueba-dialog-title" className="mt-1 font-serif text-2xl text-dlc-marfil">
            {editing ? "Editar prueba" : "Nueva prueba"}
          </h3>
        </div>

        <form key={formKey} onSubmit={onSubmit} className="space-y-5 bg-white p-6">
          <label className="block">
            <span className={labelClass}>Nombre *</span>
            <input
              name="nombre"
              required
              maxLength={120}
              autoFocus
              defaultValue={editing?.nombre}
              placeholder="Gran Premio 1.40 m"
              className={inputClass}
            />
          </label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>Fecha *</span>
              <input
                name="fecha"
                type="date"
                required
                min={concurso.fecha_inicio}
                max={concurso.fecha_fin}
                defaultValue={editing?.fecha ?? concurso.fecha_inicio}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Hora de inicio *</span>
              <input
                name="hora_inicio"
                type="time"
                required
                defaultValue={editing ? horaCorta(editing.hora_inicio) : "09:00"}
                className={inputClass}
              />
            </label>
          </div>
          <label className="block">
            <span className={labelClass}>Estado</span>
            <select name="estado" defaultValue={editing?.estado ?? "abierta"} className={inputClass}>
              {ESTADOS_PRUEBA.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>

          {error && (
            <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-neutral-100 pt-5">
            <button
              type="button"
              onClick={close}
              disabled={pending}
              className="rounded-md px-4 py-2.5 text-sm text-neutral-600 hover:text-dlc-negro"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-dlc-negro px-6 py-2.5 text-sm font-medium text-dlc-oro transition-colors hover:bg-dlc-cuero hover:text-dlc-marfil disabled:opacity-60"
            >
              {pending ? "Guardando…" : editing ? "Guardar prueba" : "Añadir prueba"}
            </button>
          </div>
        </form>
      </dialog>
    </section>
  );
}
