"use client";

import {
  MAX_TEXTO_SECCION,
  SECCIONES_GALERIA,
  type GaleriaSecciones,
} from "@/lib/caballos-types";
import { hintClass, inputClass } from "./form-styles";
import GalleryEditor from "./GalleryEditor";

// Secciones que admiten videos además de fotos (se comprimen antes de subir).
const SECCIONES_CON_VIDEO: string[] = [
  "primera_impresion",
  "presencia",
  "potencial",
  "escenario",
  "papa_resultados",
  "mama_resultados",
];

// Las secciones desplegables de la galería de la ficha («Conoce a…»).
// Cada una envía `galeria_<clave>` (JSON de URLs) y `galeria_<clave>_texto`.
export default function GallerySectionsEditor({
  initial,
  legacy = [],
  onBusyChange,
}: {
  initial: GaleriaSecciones | null;
  legacy?: string[]; // galería anterior sin secciones: arranca en «Primera Impresión»
  onBusyChange?: (busy: boolean) => void;
}) {
  return (
    <div className="space-y-6 sm:col-span-2">
      <div className="rounded-md border border-dlc-oro/40 bg-white p-4 text-sm text-neutral-700">
        <p className="font-medium text-dlc-negro">Cómo subir las fotos de la galería</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            Abre la carpeta de fotos en tu computadora y <strong>arrastra</strong> las que quieras
            hasta el recuadro punteado de la sección (puedes arrastrar varias a la vez). También
            puedes hacer clic en el recuadro para elegirlas.
          </li>
          <li>Espera a que terminen de subir: se optimizan y se guardan solas, sin entrar a Supabase.</li>
          <li>
            En todas las secciones también puedes subir <strong>videos</strong> (MP4, MOV o WEBM):
            se comprimen solos antes de subir para que la página no se haga lenta. Deja la pestaña
            abierta mientras tanto.
          </li>
          <li>Ordénalas con ← → (la primera aparece primero) y quita las que sobren con ✕.</li>
          <li>
            Pulsa <strong>Guardar cambios</strong> al final del formulario. Las secciones vacías no
            aparecen en la web.
          </li>
        </ol>
      </div>

      {SECCIONES_GALERIA.map(({ key, label, sugerencia }, i) => {
        const section = initial?.[key];
        const conVideo = SECCIONES_CON_VIDEO.includes(key);
        const fotos = [...(section?.fotos ?? []), ...(key === "primera_impresion" ? legacy : [])];
        return (
          <div key={key} className="rounded-md border border-dlc-arena bg-white/60 p-4">
            <p className="font-serif text-base font-semibold text-dlc-cuero">
              {String(i + 1).padStart(2, "0")} · {label}
            </p>
            <p className={hintClass}>Sugerencia: {sugerencia}</p>

            <label className="mt-4 block">
              <span className="text-sm font-medium text-dlc-negro">Texto (opcional)</span>
              <textarea
                name={`galeria_${key}_texto`}
                rows={2}
                maxLength={MAX_TEXTO_SECCION}
                defaultValue={section?.texto ?? ""}
                placeholder="Unas líneas que acompañen a estas fotos…"
                className={inputClass}
              />
            </label>

            <div className="mt-4">
              <GalleryEditor
                name={`galeria_${key}`}
                label={conVideo ? `Fotos y videos de «${label}»` : `Fotos de «${label}»`}
                dropLabel={
                  conVideo
                    ? `Arrastra aquí fotos o videos de «${label}» o haz clic para elegirlos`
                    : `Arrastra aquí las fotos de «${label}» o haz clic para elegirlas`
                }
                initial={[...new Set(fotos)]}
                allowVideo={conVideo}
                onBusyChange={onBusyChange}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
