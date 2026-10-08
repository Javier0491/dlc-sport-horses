import type { ReactNode } from "react";
import MediaPreview from "./MediaPreview";

// Franjas expansivas (acordeón de fotos): franjas oscuras con el número y el
// título en vertical; la que tiene el cursor se abre y muestra su contenido.
// En pantallas táctiles se abre tocándola, y con el teclado al llegar con Tab.
// En móvil las franjas van apiladas. Lo usan la galería de El Rancho y las
// secciones «Conoce a…» de la ficha del caballo.

export type Strip = {
  key: string;
  label: string;
  image: string | null; // foto, video o enlace de YouTube de fondo (de un video, su primer fotograma)
  content: ReactNode; // lo que aparece al abrirse, abajo a la izquierda
};

export default function ExpandingStrips({ strips, sizes }: { strips: Strip[]; sizes: string }) {
  return (
    // En móvil van apiladas: con más de 4, la columna crece para que la abierta quepa.
    <ul
      className={`flex w-full flex-col gap-2 md:h-[600px] md:flex-row ${strips.length > 4 ? "h-[900px]" : "h-[720px]"}`}
    >
      {strips.map((strip, i) => (
        <li
          key={strip.key}
          tabIndex={0}
          aria-label={strip.label}
          // Abierta: con el cursor, al tocarla (foco) o con el teclado dentro (foco visible).
          className="group relative min-h-0 min-w-0 flex-1 overflow-hidden bg-dlc-negro transition-all duration-700 ease-in-out outline-none hover:flex-[5] focus:flex-[5] focus-visible:ring-2 focus-visible:ring-dlc-oro has-[:focus-visible]:flex-[5]"
        >
          {strip.image && (
            <MediaPreview
              src={strip.image}
              sizes={sizes}
              className="object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-105 group-focus:scale-105"
            />
          )}
          {/* Overlay: oscuro en reposo, se aclara al abrirse */}
          <div className="absolute inset-0 bg-black/60 transition-colors duration-700 group-hover:bg-black/30 group-focus:bg-black/30 group-has-[:focus-visible]:bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-dlc-negro/95 via-dlc-negro/20 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus:opacity-100 group-has-[:focus-visible]:opacity-100" />

          {/* Cerrada: número y título en vertical */}
          <div
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center gap-4 transition-opacity duration-300 group-hover:opacity-0 group-focus:opacity-0 group-has-[:focus-visible]:opacity-0 md:flex-col"
          >
            <span className="font-serif text-xs tabular-nums text-dlc-oro">{String(i + 1).padStart(2, "0")}</span>
            <span className="whitespace-nowrap font-serif text-lg font-light tracking-[0.2em] text-dlc-marfil uppercase md:rotate-180 md:[writing-mode:vertical-rl]">
              {strip.label}
            </span>
          </div>

          {/* Abierta. Sin clics mientras está cerrada: el primer toque solo la abre. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 opacity-0 transition-opacity duration-500 group-hover:pointer-events-auto group-hover:opacity-100 group-hover:delay-200 group-focus:pointer-events-auto group-focus:opacity-100 group-focus:delay-200 group-has-[:focus-visible]:pointer-events-auto group-has-[:focus-visible]:opacity-100 sm:p-10">
            {strip.content}
          </div>
        </li>
      ))}
    </ul>
  );
}
