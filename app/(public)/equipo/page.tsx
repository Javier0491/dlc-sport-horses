import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getEquipoPublico, type MiembroPublico } from "@/lib/data";
import { AREAS, iniciales } from "@/lib/equipo-types";
import { isAllowedImageUrl } from "@/lib/image-url";

export const metadata: Metadata = {
  title: "Nuestro Equipo | Rancho DLC",
  description: "Dirección, equipo médico y fotografía de Rancho DLC.",
};

function Tarjeta({ miembro }: { miembro: MiembroPublico }) {
  const foto = miembro.foto_url && isAllowedImageUrl(miembro.foto_url) ? miembro.foto_url : null;

  return (
    <article className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-dlc-negro">
        {foto ? (
          <Image
            src={foto}
            alt={miembro.nombre}
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover grayscale-[35%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center font-serif text-6xl font-light tracking-[0.1em] text-dlc-oro/70"
          >
            {iniciales(miembro.nombre)}
          </span>
        )}
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-dlc-negro/60 to-transparent" />
      </div>
      <h3 className="mt-6 font-serif text-2xl font-medium text-dlc-negro">{miembro.nombre}</h3>
      <p className="mt-2 text-[10px] uppercase tracking-[0.35em] text-dlc-cuero">{miembro.puesto}</p>
      <span className="mt-4 block h-px w-8 bg-dlc-oro transition-all duration-500 group-hover:w-16" />
      {miembro.bio && (
        <p className="mt-4 whitespace-pre-line text-sm leading-7 text-dlc-negro/65">{miembro.bio}</p>
      )}
    </article>
  );
}

export default async function Equipo() {
  const equipo = await getEquipoPublico();
  // Una sección por área, en el orden de AREAS; las vacías no se muestran.
  const secciones = AREAS.map((area) => ({
    ...area,
    miembros: equipo.filter((m) => m.area === area.value),
  })).filter((s) => s.miembros.length > 0);

  return (
    <main className="flex-1 bg-dlc-marfil px-6 pt-40 pb-32">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="text-[11px] uppercase tracking-[0.5em] text-dlc-cuero">Rancho DLC</p>
        <h1 className="mt-5 font-serif text-5xl font-light text-dlc-negro sm:text-7xl">
          Nuestro Equipo
        </h1>
        <span className="mt-8 h-px w-16 bg-dlc-oro" />
        <p className="mt-8 max-w-xl leading-8 text-dlc-negro/70">
          Las personas detrás de cada caballo: quienes dirigen el rancho, quienes cuidan su salud
          y quien captura su historia.
        </p>
      </div>

      {secciones.length > 0 ? (
        <div className="mx-auto mt-24 max-w-6xl space-y-28">
          {secciones.map((seccion) => (
            <section key={seccion.value} id={seccion.value} className="scroll-mt-32">
              <div className="flex flex-col gap-4 border-b border-dlc-negro/10 pb-8 md:flex-row md:items-end md:justify-between">
                <h2 className="font-serif text-4xl font-light text-dlc-negro sm:text-5xl">
                  {seccion.titulo}
                </h2>
                <p className="max-w-sm text-sm leading-7 text-dlc-negro/60 md:text-right">
                  {seccion.descripcion}
                </p>
              </div>
              <ul className="mt-12 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                {seccion.miembros.map((miembro, i) => (
                  <li key={miembro.id}>
                    <Reveal delay={(i % 3) * 0.1}>
                      <Tarjeta miembro={miembro} />
                    </Reveal>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="mx-auto mt-24 flex max-w-2xl flex-col items-center border border-dlc-oro/40 bg-white px-8 py-16 text-center">
          <span aria-hidden="true" className="h-3 w-3 rotate-45 border border-dlc-oro" />
          <p className="mt-8 font-serif text-3xl font-light text-dlc-negro">
            Muy pronto presentaremos a nuestro equipo.
          </p>
          <Link
            href="/contacto"
            className="mt-10 bg-dlc-negro px-8 py-4 text-xs uppercase tracking-[0.3em] text-dlc-marfil transition-colors duration-500 hover:bg-dlc-cuero"
          >
            Contactar
          </Link>
        </div>
      )}
    </main>
  );
}
