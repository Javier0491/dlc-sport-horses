import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ExpandingGallery from "@/components/ExpandingGallery";
import Reveal from "@/components/Reveal";
import { POR_DEFECTO } from "@/lib/contenido-types";
import { getConfiguracion } from "@/lib/data";
import { isAllowedImageUrl } from "@/lib/image-url";
import { delay } from "@/lib/motion";

// Textos de la fila 'legado' de configuracion_sitio (se editan en /admin/contenido).
async function getLegado() {
  const legado = await getConfiguracion("legado");
  return {
    titulo: legado?.titulo || POR_DEFECTO.legado.titulo,
    subtitulo: legado?.subtitulo || POR_DEFECTO.legado.subtitulo,
    descripcion: legado?.descripcion || POR_DEFECTO.legado.descripcion,
    imagen:
      legado?.imagen_url && isAllowedImageUrl(legado.imagen_url)
        ? legado.imagen_url
        : POR_DEFECTO.legado.imagen_url,
    // Sin guardar en el panel = galería por defecto; guardada vacía = no se muestra.
    galeria: legado?.datos?.galeria ?? POR_DEFECTO.legado.galeria,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const { titulo, subtitulo } = await getLegado();
  return { title: `${titulo} | Rancho DLC`, description: subtitulo };
}

export default async function ElRancho() {
  const { titulo, subtitulo, descripcion, imagen, galeria } = await getLegado();
  // Una línea en blanco en el panel separa párrafos.
  const parrafos = descripcion.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative flex h-[70vh] min-h-[480px] items-end overflow-hidden bg-dlc-negro">
        <div className="parallax absolute inset-0">
          <div className="enter-photo absolute inset-0">
            <Image
              src={imagen}
              alt={titulo}
              fill
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover object-center"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-dlc-negro/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-dlc-negro/90 via-dlc-negro/20 to-transparent" />

        <div className="hero-out relative z-10 mx-auto w-full max-w-7xl px-6 pb-14">
          <p className="enter text-[11px] uppercase tracking-[0.5em] text-dlc-oro" style={delay(100)}>
            El Rancho · La Chacona
          </p>
          <h1
            className="enter mt-5 font-serif text-5xl font-light tracking-[0.02em] text-dlc-marfil sm:text-7xl"
            style={delay(200)}
          >
            {titulo}
          </h1>
          <span className="enter-line mt-7 block h-px w-16 origin-left bg-dlc-oro" style={delay(500)} />
          <p className="enter mt-7 font-serif text-lg italic text-dlc-oro sm:text-xl" style={delay(650)}>
            {subtitulo}
          </p>
        </div>
      </section>

      {/* Historia */}
      <section className="bg-dlc-marfil px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-3xl space-y-8">
          {parrafos.map((parrafo, i) => (
            <Reveal
              as="p"
              key={i}
              className={
                i === 0
                  ? "font-serif text-2xl font-light leading-relaxed text-dlc-negro sm:text-3xl sm:leading-relaxed"
                  : "whitespace-pre-line leading-8 text-dlc-negro/75"
              }
            >
              {parrafo}
            </Reveal>
          ))}
        </div>
      </section>

      {/* Galería expansiva */}
      {galeria.length > 0 && (
        <section className="bg-dlc-negro px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-14 flex flex-col items-center text-center">
              <p className="text-[11px] uppercase tracking-[0.5em] text-dlc-oro">Galería</p>
              <h2 className="mt-5 font-serif text-4xl font-light text-dlc-marfil sm:text-5xl">
                Vida en La Chacona
              </h2>
              <span className="mt-7 h-px w-16 bg-dlc-oro" />
            </div>
            <ExpandingGallery items={galeria} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-dlc-cuero px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
          <h2 className="font-serif text-3xl font-light text-dlc-marfil sm:text-4xl">
            Conoce La Chacona en persona.
          </h2>
          <Link
            href="/contacto"
            className="press shrink-0 bg-dlc-oro px-10 py-4 text-xs font-medium uppercase tracking-[0.3em] text-dlc-negro hover:bg-dlc-negro hover:text-dlc-marfil"
          >
            Agendar una visita
          </Link>
        </div>
      </section>
    </main>
  );
}
