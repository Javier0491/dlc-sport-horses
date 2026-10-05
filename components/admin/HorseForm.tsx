"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import type { HorseFormState } from "@/app/(admin)/admin/actions";
import {
  CATEGORIAS,
  SEXOS,
  type Caballo,
  type CaballoOpcion,
} from "@/lib/caballos-types";
import { isAllowedImageUrl } from "@/lib/image-url";

type Props = {
  action: (prev: HorseFormState, formData: FormData) => Promise<HorseFormState>;
  caballo?: Caballo; // vacío = caballo nuevo
  opciones: CaballoOpcion[]; // posibles padres y madres
};

const INITIAL: HorseFormState = { error: null };

const inputClass =
  "mt-1.5 w-full rounded-md border border-dlc-arena bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-dlc-cuero focus:ring-2 focus:ring-dlc-oro/30";
const labelClass = "block text-sm font-medium text-dlc-negro";
const hintClass = "mt-1 text-xs text-neutral-500";

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

function ImagePreview({ url, alt }: { url: string; alt: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const value = url.trim();

  let message: string | null = null;
  if (!value) message = "Sin foto";
  else if (!isAllowedImageUrl(value)) message = "Enlace no válido: cópialo desde Medios";
  else if (failedUrl === value) message = "No se pudo cargar la imagen";

  return (
    <div className="relative mt-3 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-dlc-arena bg-white text-xs text-neutral-400">
      {message ?? (
        <Image
          src={value}
          alt={alt}
          fill
          unoptimized
          className="object-cover"
          onError={() => setFailedUrl(value)}
        />
      )}
    </div>
  );
}

export default function HorseForm({ action, caballo, opciones }: Props) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const [imagen, setImagen] = useState(caballo?.imagen_url ?? "");
  const [retrato, setRetrato] = useState(caballo?.retrato_url ?? "");

  // Enviar sin pasar `action` al <form>: así React no vacía los campos si hay un error.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  };

  const parents = opciones.filter((o) => o.id !== caballo?.id);
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

      <Section title="Fotos">
        <p className="text-sm text-neutral-600 sm:col-span-2">
          Sube la foto en{" "}
          <Link href="/admin/media" target="_blank" className="font-medium text-dlc-cuero underline">
            Medios
          </Link>
          , pulsa «Copiar URL» y pégala aquí.
        </p>
        <Field label="Foto principal (imagen_url)">
          <input
            name="imagen_url"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            placeholder="https://…supabase.co/storage/v1/object/public/media/…"
            className={inputClass}
          />
          <ImagePreview url={imagen} alt="Foto principal" />
        </Field>
        <Field label="Retrato (opcional)">
          <input
            name="retrato_url"
            value={retrato}
            onChange={(e) => setRetrato(e.target.value)}
            placeholder="https://…supabase.co/storage/v1/object/public/media/…"
            className={inputClass}
          />
          <ImagePreview url={retrato} alt="Retrato" />
        </Field>
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
            disabled={pending}
            className="rounded-md bg-dlc-negro px-6 py-2.5 text-sm font-medium text-dlc-marfil transition-colors hover:bg-dlc-cuero disabled:opacity-60"
          >
            {pending ? "Guardando…" : caballo ? "Guardar cambios" : "Crear caballo"}
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
