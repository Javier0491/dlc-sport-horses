"use client";

import Link from "next/link";
import { useState } from "react";
import type { Configuracion, Seccion } from "@/lib/contenido-types";
import ContentForm from "./ContentForm";

// Una pestaña por sección. Los tres formularios quedan montados (solo se ocultan),
// así no se pierde lo escrito al cambiar de pestaña sin guardar.
export default function ContentTabs({
  secciones,
  values,
}: {
  secciones: Seccion[];
  values: Record<string, Configuracion | null>;
}) {
  const [active, setActive] = useState(secciones[0].id);

  return (
    <div>
      <div role="tablist" aria-label="Secciones del sitio" className="flex gap-1 border-b border-dlc-arena">
        {secciones.map((s) => {
          const selected = s.id === active;
          return (
            <button
              key={s.id}
              id={`tab-${s.id}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${s.id}`}
              onClick={() => setActive(s.id)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors ${
                selected
                  ? "border-dlc-cuero font-medium text-dlc-negro"
                  : "border-transparent text-neutral-500 hover:text-dlc-negro"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {secciones.map((s) => (
        <section
          key={s.id}
          id={`panel-${s.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${s.id}`}
          hidden={s.id !== active}
          className="rounded-b-lg border border-t-0 border-dlc-arena bg-dlc-marfil/40 p-6"
        >
          <p className="mb-6 text-sm text-neutral-500">
            Se muestra en{" "}
            <Link href={s.page.href} target="_blank" className="font-medium text-dlc-cuero underline">
              {s.page.name}
            </Link>
            .
          </p>
          {values[s.id] ? (
            <ContentForm seccion={s} values={values[s.id]} />
          ) : (
            <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              No existe la fila &quot;{s.id}&quot; en la tabla configuracion_sitio.
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
