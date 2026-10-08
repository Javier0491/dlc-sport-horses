"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { updateConfiguracion } from "@/app/(admin)/admin/actions";
import { CAMPOS, POR_DEFECTO, type Configuracion, type Seccion } from "@/lib/contenido-types";
import { hintClass, inputClass, labelClass } from "./form-styles";
import { useUploadCount } from "./DropArea";
import ExpandingGalleryEditor from "./ExpandingGalleryEditor";
import ImageUploadField from "./ImageUploadField";
import VideoField from "./VideoField";

type Status = { kind: "idle" } | { kind: "saved" } | { kind: "error"; message: string };

// Formulario de una sección de configuracion_sitio (Título, Subtítulo, Descripción, Imagen).
export default function ContentForm({
  seccion,
  values,
}: {
  seccion: Seccion;
  values: Configuracion | null;
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [uploading, trackUpload] = useUploadCount();

  // Sin `action` en el <form>: así React no vacía los campos tras guardar.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateConfiguracion(seccion.id, formData).catch(() => null);
      setStatus(
        result?.ok
          ? { kind: "saved" }
          : { kind: "error", message: result?.error ?? "No se pudo guardar." },
      );
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      // El aviso de "guardado" desaparece en cuanto se vuelve a editar.
      onChange={() => setStatus({ kind: "idle" })}
      className="space-y-6"
    >
      {CAMPOS.map((field) =>
        field.kind === "image" ? (
          <ImageUploadField
            key={field.name}
            name={field.name}
            label={field.label}
            initial={values?.imagen_url ?? ""}
            hint={seccion.hints[field.name]}
            className="max-w-sm"
            onBusyChange={trackUpload}
            onChange={() => setStatus({ kind: "idle" })}
          />
        ) : (
          <label key={field.name} className="block">
            <span className={labelClass}>{field.label}</span>
            {field.kind === "textarea" ? (
              <textarea
                name={field.name}
                defaultValue={values?.descripcion ?? ""}
                maxLength={field.maxLength}
                rows={6}
                className={inputClass}
              />
            ) : (
              <input
                name={field.name}
                defaultValue={values?.[field.name] ?? ""}
                maxLength={field.maxLength}
                className={inputClass}
              />
            )}
            <span className={`block ${hintClass}`}>{seccion.hints[field.name]}</span>
          </label>
        ),
      )}

      {seccion.video && (
        <VideoField
          name="video_url"
          label="Video"
          initial={values?.datos?.video_url ?? ""}
          hint={seccion.video}
          onBusyChange={trackUpload}
          onChange={() => setStatus({ kind: "idle" })}
        />
      )}

      {seccion.galeria && (
        <ExpandingGalleryEditor
          // Sin guardar todavía: se parte de la galería que ya se ve en la web.
          initial={values?.datos?.galeria ?? POR_DEFECTO.legado.galeria}
          hint={seccion.galeria}
          onBusyChange={trackUpload}
          onChange={() => setStatus({ kind: "idle" })}
        />
      )}

      <div className="flex flex-wrap items-center justify-end gap-4 border-t border-dlc-arena pt-6">
        {status.kind === "saved" && !pending && (
          <p role="status" className="mr-auto text-sm text-emerald-700">
            Guardado. Ya se ve en{" "}
            <Link href={seccion.page.href} target="_blank" className="underline">
              {seccion.page.name}
            </Link>
            .
          </p>
        )}
        <button
          type="submit"
          disabled={pending || uploading}
          className="rounded-md bg-dlc-negro px-6 py-2.5 text-sm font-medium text-dlc-marfil transition-colors hover:bg-dlc-cuero disabled:opacity-60"
        >
          {pending ? "Guardando…" : uploading ? "Subiendo archivos…" : `Guardar ${seccion.label}`}
        </button>
      </div>

      {status.kind === "error" && (
        <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {status.message}
        </p>
      )}
    </form>
  );
}
