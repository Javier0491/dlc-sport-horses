"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import type { ConcursoFormState } from "@/app/(admin)/admin/actions";
import { ESTADOS_CONCURSO, type Concurso } from "@/lib/concursos-types";
import { hintClass, inputClass, labelClass } from "./form-styles";
import ImagePreview from "./ImagePreview";
import VideoField from "./VideoField";

const INITIAL: ConcursoFormState = { error: null, saved: false };

// Alta (sin `concurso`) o edición de los datos de un concurso.
export default function ConcursoForm({
  action,
  concurso,
}: {
  action: (prev: ConcursoFormState, formData: FormData) => Promise<ConcursoFormState>;
  concurso?: Concurso;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const [imagen, setImagen] = useState(concurso?.imagen_url ?? "");
  const [inicio, setInicio] = useState(concurso?.fecha_inicio ?? "");
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
        <label className="block sm:col-span-2">
          <span className={labelClass}>Nombre *</span>
          <input
            name="nombre"
            required
            maxLength={120}
            defaultValue={concurso?.nombre}
            placeholder="CSI5* Monterrey"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Fecha de inicio *</span>
          <input
            name="fecha_inicio"
            type="date"
            required
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Fecha de fin *</span>
          <input
            name="fecha_fin"
            type="date"
            required
            min={inicio || undefined}
            defaultValue={concurso?.fecha_fin}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Estado</span>
          <select
            name="estado"
            defaultValue={concurso?.estado ?? "proximo"}
            className={inputClass}
          >
            {ESTADOS_CONCURSO.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className={labelClass}>Imagen (opcional)</span>
          <input
            name="imagen_url"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            maxLength={500}
            placeholder="https://…supabase.co/storage/v1/object/public/media/…"
            className={inputClass}
          />
          <span className={`block ${hintClass}`}>
            Sube la foto en{" "}
            <Link href="/admin/media" target="_blank" className="font-medium text-dlc-cuero underline">
              Medios
            </Link>
            , pulsa «Copiar URL» y pégala aquí.
          </span>
          {imagen && (
            <div className="max-w-xs">
              <ImagePreview url={imagen} alt="Imagen del concurso" />
            </div>
          )}
        </label>
        <VideoField
          name="livestream_url"
          label="Transmisión en vivo (opcional)"
          initial={concurso?.livestream_url ?? ""}
          allowFile={false}
          hint="Enlace de YouTube Live o Vimeo. Se muestra en la web mientras el concurso está «En curso». Con el enlace del canal (youtube.com/channel/…/live) sirve para todos los concursos."
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-end gap-4 border-t border-dlc-arena pt-6">
        {state.saved && !dirty && !pending && (
          <p role="status" className="mr-auto text-sm text-emerald-700">
            Cambios guardados.
          </p>
        )}
        {!concurso && (
          <Link
            href="/admin/concursos"
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
          {pending ? "Guardando…" : concurso ? "Guardar concurso" : "Crear concurso"}
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
