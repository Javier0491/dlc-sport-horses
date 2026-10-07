"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import type { HorseFormState } from "@/app/(admin)/admin/actions";
import {
  CATEGORIAS,
  SEXOS,
  type Caballo,
  type CaballoOpcion,
} from "@/lib/caballos-types";
import { hintClass, inputClass, labelClass } from "./form-styles";
import { useUploadCount } from "./DropArea";
import GalleryEditor from "./GalleryEditor";
import ImageUploadField from "./ImageUploadField";
import VideoField from "./VideoField";

type Props = {
  action: (prev: HorseFormState, formData: FormData) => Promise<HorseFormState>;
  caballo?: Caballo; // vacío = caballo nuevo
  opciones: CaballoOpcion[]; // posibles padres y madres
};

const INITIAL: HorseFormState = { error: null };


function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className={labelClass}>{label}</span>
      {children}
      {hint && <span className={`block ${hintClass}`}>{hint}</span>}
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-lg border border-dlc-arena bg-dlc-marfil/40 p-6">
      <legend className="px-2 font-serif text-lg font-semibold text-dlc-cuero">{title}</legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

export default function HorseForm({ action, caballo, opciones }: Props) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const [uploading, trackUpload] = useUploadCount();
  const [preventa, setPreventa] = useState(caballo?.preventa_activa ?? false);

  // Enviar sin pasar `action` al <form>: así React no vacía los campos si hay un error.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };

  const parents = opciones.filter((o) => o.id !== caballo?.id);
  const mares = opciones.filter((o) => o.categoria === "Yegua");
  const parentOptions = parents.map((o) => (
    <option key={o.id} value={o.id}>
      {o.nombre}
      {o.categoria ? ` · ${o.categoria}` : ""}
    </option>
  ));

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <Section title="Datos básicos">
        <Field
          label="Nombre *"
          hint={caballo ? `Identificador en la web: ${caballo.id}` : undefined}
          className="sm:col-span-2"
        >
          <input
            name="nombre"
            required
            maxLength={120}
            defaultValue={caballo?.nombre}
            className={inputClass}
          />
        </Field>
        <Field label="Categoría *">
          <select
            name="categoria"
            required
            defaultValue={caballo?.categoria ?? ""}
            className={inputClass}
          >
            <option value="" disabled>
              Elige una categoría
            </option>
            {CATEGORIAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Sexo">
          <select name="sexo" defaultValue={caballo?.sexo ?? ""} className={inputClass}>
            <option value="">—</option>
            {SEXOS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Raza">
          <input
            name="raza"
            defaultValue={caballo?.raza ?? ""}
            placeholder="KWPN, Holsteiner…"
            className={inputClass}
          />
        </Field>
        <Field label="Registro">
          <input
            name="registro"
            defaultValue={caballo?.registro ?? ""}
            placeholder="CCDM"
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Características">
        <Field label="Año de nacimiento">
          <input
            name="anio_nacimiento"
            type="number"
            min={1950}
            max={2100}
            defaultValue={caballo?.anio_nacimiento ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Alzada (m)" hint="Entre 1.00 y 2.20">
          <input
            name="alzada"
            type="number"
            step="0.01"
            min={1}
            max={2.2}
            defaultValue={caballo?.alzada ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Color">
          <input
            name="color"
            defaultValue={caballo?.color ?? ""}
            placeholder="Colorado, Alazana…"
            className={inputClass}
          />
        </Field>
        <Field label="Rango de precio" hint="Vacío si no está a la venta">
          <select
            name="precio_rango"
            defaultValue={caballo?.precio_rango ?? ""}
            className={inputClass}
          >
            <option value="">—</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {"$".repeat(n)}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Comportamiento"
          hint="Separado por comas: Amateur Friendly, Fácil Manejo"
          className="sm:col-span-2"
        >
          <input
            name="comportamiento"
            defaultValue={caballo?.comportamiento.join(", ")}
            className={inputClass}
          />
        </Field>
        <Field
          label="Nivel actual"
          hint="Aparece en la progenie de sus padres: 1.30 m, Jóvenes caballos…"
        >
          <input
            name="nivel"
            maxLength={40}
            defaultValue={caballo?.nivel ?? ""}
            placeholder="1.30 m"
            className={inputClass}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="actualmente_saltando"
            defaultChecked={caballo?.actualmente_saltando}
            className="h-4 w-4 accent-dlc-cuero"
          />
          Actualmente saltando
        </label>
      </Section>

      <Section title="Fotos y video">
        <ImageUploadField
          name="imagen_url"
          label="Foto principal"
          initial={caballo?.imagen_url ?? ""}
          onBusyChange={trackUpload}
        />
        <ImageUploadField
          name="retrato_url"
          label="Retrato (opcional)"
          initial={caballo?.retrato_url ?? ""}
          onBusyChange={trackUpload}
        />
        <GalleryEditor initial={caballo?.galeria ?? []} onBusyChange={trackUpload} />
        <VideoField
          name="video_url"
          label="Video del caballo"
          initial={caballo?.video_url ?? ""}
          onBusyChange={trackUpload}
        />
      </Section>

      <Section title="Pedigrí">
        <Field label="Padre">
          <select name="padre_id" defaultValue={caballo?.padre_id ?? ""} className={inputClass}>
            <option value="">— Sin registrar —</option>
            {parentOptions}
          </select>
        </Field>
        <Field label="Madre">
          <select name="madre_id" defaultValue={caballo?.madre_id ?? ""} className={inputClass}>
            <option value="">— Sin registrar —</option>
            {parentOptions}
          </select>
        </Field>
      </Section>

      <Section title="Preventa de Cruzas">
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-3 text-sm">
            {/* Interruptor: checkbox real (accesible) con aspecto de switch. */}
            <input
              type="checkbox"
              name="preventa_activa"
              role="switch"
              checked={preventa}
              onChange={(e) => setPreventa(e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="relative h-6 w-11 shrink-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-dlc-cuero peer-focus-visible:ring-2 peer-focus-visible:ring-dlc-oro after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
            />
            <span>
              <span className="font-medium">Anunciar preventa</span>
              <span className="text-neutral-500">
                {" "}
                · tarjeta «Lista de espera» en la ficha del semental
              </span>
            </span>
          </label>
        </div>
        <Field label="Cruza con (yegua)" hint={preventa ? "Obligatorio con la preventa activa." : undefined}>
          <input
            name="preventa_pareja"
            list="yeguas-dlc"
            maxLength={120}
            required={preventa}
            defaultValue={caballo?.preventa_pareja ?? ""}
            placeholder="Nombre de la yegua"
            className={`${inputClass} ${preventa ? "" : "opacity-60"}`}
          />
          {/* Sugerencias: yeguas del catálogo; también se puede escribir otra. */}
          <datalist id="yeguas-dlc">
            {mares.map((m) => (
              <option key={m.id} value={m.nombre} />
            ))}
          </datalist>
        </Field>
        <Field label="Año proyectado" hint="Año en que nacería el potro.">
          <input
            name="preventa_anio"
            type="number"
            min={2000}
            max={2100}
            defaultValue={caballo?.preventa_anio ?? ""}
            placeholder={String(new Date().getFullYear() + 1)}
            className={`${inputClass} ${preventa ? "" : "opacity-60"}`}
          />
        </Field>
      </Section>

      <div className="flex flex-col gap-4 rounded-lg border border-dlc-arena p-6 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="activo"
            defaultChecked={caballo?.activo ?? true}
            className="h-4 w-4 accent-dlc-cuero"
          />
          <span>
            <span className="font-medium">Publicado</span>
            <span className="text-neutral-500"> · visible en la web</span>
          </span>
        </label>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/caballos"
            className="rounded-md px-4 py-2.5 text-sm text-neutral-600 hover:text-dlc-negro"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={pending || uploading}
            className="rounded-md bg-dlc-negro px-6 py-2.5 text-sm font-medium text-dlc-marfil transition-colors hover:bg-dlc-cuero disabled:opacity-60"
          >
            {pending
              ? "Guardando…"
              : uploading
                ? "Subiendo archivos…"
                : caballo ? "Guardar cambios" : "Crear caballo"}
          </button>
        </div>
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
