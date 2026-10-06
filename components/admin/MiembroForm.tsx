"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import type { MiembroFormState } from "@/app/(admin)/admin/actions";
import { AREAS, type Miembro } from "@/lib/equipo-types";
import { hintClass, inputClass, labelClass } from "./form-styles";
import ImagePreview from "./ImagePreview";

const INITIAL: MiembroFormState = { error: null, saved: false };

// Alta (sin `miembro`) o edición de una persona del equipo.
export default function MiembroForm({
  action,
  miembro,
}: {
  action: (prev: MiembroFormState, formData: FormData) => Promise<MiembroFormState>;
  miembro?: Miembro;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const [foto, setFoto] = useState(miembro?.foto_url ?? "");
  // El aviso de "guardado" desaparece en cuanto se vuelve a editar.
  const [dirty, setDirty] = useState(false);

  // Sin `action` en el <form>: así React no vacía los campos si hay un error.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setDirty(false);
    startTransition(() => formAction(formData));
  };

  return (
    <form
      onSubmit={onSubmit}
      onChange={() => setDirty(true)}
      className="rounded-lg border border-dlc-arena bg-dlc-marfil/40 p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Nombre *</span>
          <input
            name="nombre"
            required
            maxLength={120}
            defaultValue={miembro?.nombre}
            placeholder="MVZ. Ana López"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Puesto *</span>
          <input
            name="puesto"
            required
            maxLength={120}
            defaultValue={miembro?.puesto}
            placeholder="Médico veterinario"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Área</span>
          <select name="area" defaultValue={miembro?.area ?? "medico"} className={inputClass}>
            {AREAS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          <span className={`block ${hintClass}`}>Sección de la página Equipo donde aparece.</span>
        </label>
        <label className="block">
          <span className={labelClass}>Orden</span>
          <input
            name="orden"
            type="number"
            min={0}
            max={999}
            defaultValue={miembro?.orden ?? 0}
            className={inputClass}
          />
          <span className={`block ${hintClass}`}>Menor número = aparece primero dentro de su área.</span>
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Semblanza (opcional)</span>
          <textarea
            name="bio"
            maxLength={1000}
            rows={4}
            defaultValue={miembro?.bio ?? ""}
            placeholder="Especialidad, trayectoria, certificaciones…"
            className={inputClass}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Foto (opcional)</span>
          <input
            name="foto_url"
            value={foto}
            onChange={(e) => setFoto(e.target.value)}
            maxLength={500}
            placeholder="https://…supabase.co/storage/v1/object/public/media/…"
            className={inputClass}
          />
          <span className={`block ${hintClass}`}>
            Sube la foto en{" "}
            <Link href="/admin/media" target="_blank" className="font-medium text-dlc-cuero underline">
              Medios
            </Link>
            , pulsa «Copiar URL» y pégala aquí. Mejor vertical (retrato). Sin foto se muestran sus iniciales.
          </span>
          {foto && (
            <div className="max-w-[200px]">
              <ImagePreview url={foto} alt="Foto" />
            </div>
          )}
        </label>
        <label className="flex items-center gap-3 sm:col-span-2">
          <input
            name="activo"
            type="checkbox"
            defaultChecked={miembro?.activo ?? true}
            className="h-4 w-4 accent-dlc-cuero"
          />
          <span className="text-sm text-dlc-negro">Visible en la web</span>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-4 border-t border-dlc-arena pt-6">
        {state.saved && !dirty && !pending && (
          <p role="status" className="mr-auto text-sm text-emerald-700">
            Cambios guardados.
          </p>
        )}
        {!miembro && (
          <Link
            href="/admin/equipo"
            className="rounded-md px-4 py-2.5 text-sm text-neutral-600 hover:text-dlc-negro"
          >
            Cancelar
          </Link>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-dlc-negro px-6 py-2.5 text-sm font-medium text-dlc-marfil transition-colors hover:bg-dlc-cuero disabled:opacity-60"
        >
          {pending ? "Guardando…" : miembro ? "Guardar" : "Agregar al equipo"}
        </button>
      </div>

      {state.error && (
        <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  );
}
