import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FoalCatalog from "@/components/FoalCatalog";
import { FOAL_FILTER_PARAMS, bloodlines, type FoalFilters } from "@/lib/catalog";
import { getPotrosActivos } from "@/lib/data";
import { delay } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Catálogo de Potros | Rancho DLC",
  description:
    "Caballos deportivos criados en Rancho DLC: pedigrí europeo de salto, crecidos en manada.",
};

export default async function Potros({ searchParams }: PageProps<"/potros">) {
  // Filtros en la URL para compartir enlaces pre-filtrados (/potros?sexo=yegua).
  const params = await searchParams;
  const initialFilters: FoalFilters = {};
  for (const key of FOAL_FILTER_PARAMS) {
    const value = params[key];
    if (typeof value === "string") initialFilters[key] = value;
  }

  // Potros y potrancas publicados en el panel.
  const foals = await getPotrosActivos();
  const jumping = foals.filter((f) => f.jumping).length;

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative flex h-[70vh] min-h-[480px] items-end overflow-hidden bg-dlc-negro">
        <div className="parallax absolute inset-0">
          <div className="enter-photo absolute inset-0">
            <Image
              src="/rancho/manada.jpg"
              alt="Potros de Rancho DLC en manada"
              fill
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover object-center"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-dlc-negro/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-dlc-negro/90 via-dlc-negro/20 to-transparent" />

        <div className="hero-out relative z-10 mx-auto w-full max-w-7xl px-6 pb-14">
          <p className="enter text-[11px] uppercase tracking-[0.5em] text-dlc-oro" style={delay(100)}>
            DLC Sport Horses · La Chacona
          </p>
          <h1
            className="enter mt-5 font-serif text-5xl font-light tracking-[0.02em] text-dlc-marfil sm:text-7xl"
            style={delay(200)}
          >
            Catálogo de Potros
          </h1>
          <span className="enter-line mt-7 block h-px w-16 origin-left bg-dlc-oro" style={delay(500)} />
          <p className="enter mt-7 max-w-2xl leading-8 text-dlc-marfil/80" style={delay(650)}>
            Nuestros potros crecen en manada, desarrollando de forma natural el
            equilibrio, la confianza y las habilidades sociales que serán la
            base de su futuro como caballos deportivos.
          </p>
          <p className="mt-4 font-serif text-lg italic text-dlc-oro">
            La excelencia comienza en libertad.
          </p>

          <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-4">
            {[
              { value: foals.length, label: "Caballos" },
              { value: jumping, label: "Actualmente saltando" },
              { value: "3", label: "Generaciones de pedigrí" },
            ].map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-serif text-4xl font-light text-dlc-marfil">
                  {stat.value}
                </dd>
                <dd className="mt-1 text-[10px] uppercase tracking-[0.3em] text-dlc-marfil/60">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {foals.length > 0 ? (
        <FoalCatalog
          foals={foals}
          lines={bloodlines(foals)}
          initialFilters={initialFilters}
        />
      ) : (
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-32 text-center">
          <span className="rule-draw h-px w-16 bg-dlc-oro" />
          <p className="mt-10 font-serif text-3xl font-light text-dlc-negro">
            Muy pronto presentaremos nuestros potros.
          </p>
          <Link
            href="/contacto"
            className="press mt-10 bg-dlc-negro px-8 py-4 text-xs uppercase tracking-[0.3em] text-dlc-marfil hover:bg-dlc-cuero"
          >
            Contactar
          </Link>
        </div>
      )}
    </main>
  );
}
