import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import FloatingCta from "@/components/FloatingCta";
import HorseMedia from "@/components/HorseMedia";
import PedigreeTree, { type LineLink } from "@/components/PedigreeTree";
import {
  bloodlines,
  heightLabel,
  horseArticle,
  levelLabel,
  relativesOf,
} from "@/lib/catalog";
import { getCaballoBySlug, getPotrosActivos } from "@/lib/data";

const getFoal = (id: string) => getCaballoBySlug(id, ["Potro", "Potranca"]);

// Se pregeneran los potros publicados; los que se publiquen después se generan
// al primer acceso. El panel revalida estas páginas al guardar cambios.
export async function generateStaticParams() {
  const foals = await getPotrosActivos().catch(() => []);
  return foals.map((foal) => ({ id: foal.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/potros/[id]">): Promise<Metadata> {
  const { id } = await params;
  const foal = await getFoal(id);
  if (!foal) return {};

  const lineage = foal.sire && foal.dam ? `: ${foal.sire.name} x ${foal.dam.name}` : "";
  const details = [
    foal.sex,
    foal.height !== null ? heightLabel(foal.height) : null,
    foal.color,
  ].filter(Boolean);
  const description =
    `${foal.name}${foal.birthYear ? ` (${foal.birthYear})` : ""}${lineage}.` +
    (details.length ? ` ${details.join(", ")}.` : "");
  return {
    title: `${foal.name} | Potros | Rancho DLC`,
    description,
    // Vista previa al compartir el enlace (WhatsApp, redes).
    openGraph: {
      title: foal.name,
      description,
      images: foal.image ? [foal.image] : undefined,
    },
  };
}

export default async function FichaPotro({
  params,
}: PageProps<"/potros/[id]">) {
  const { id } = await params;
  const foal = await getFoal(id);
  if (!foal) notFound();

  const foals = await getPotrosActivos();
  const lines = new Map(bloodlines(foals).map((l) => [l.name, l]));
  const lineLink: LineLink = (name) => {
    const line = lines.get(name);
    return line ? { href: `/potros?linea=${line.slug}`, count: line.count } : undefined;
  };

  const relatives = relativesOf(foal, foals);
  const contactHref = `/contacto?caballo=${foal.id}`;

  // Solo los datos cargados en el panel.
  const facts = [
    { label: "Sexo", value: foal.sex },
    { label: "Año de nacimiento", value: foal.birthYear !== null ? String(foal.birthYear) : null },
    { label: "Alzada", value: foal.height !== null ? heightLabel(foal.height) : null },
    { label: "Color", value: foal.color },
    { label: "Registro", value: foal.registry },
    {
      label: "Estado",
      value: foal.jumping
        ? `Actualmente saltando${foal.level ? ` · ${levelLabel(foal.level)}` : ""}`
        : "En formación",
    },
  ].filter((fact) => fact.value);

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] w-full overflow-hidden bg-dlc-negro">
        {foal.image && (
          <Image
            src={foal.image}
            alt={foal.name}
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dlc-negro/90 via-dlc-negro/20 to-dlc-negro/30" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-12">
          <Link
            href="/potros"
            className="text-[11px] uppercase tracking-[0.4em] text-dlc-marfil/70 transition-colors hover:text-dlc-oro"
          >
            ← Catálogo de Potros
          </Link>
          <p className="mt-6 text-[11px] uppercase tracking-[0.5em] text-dlc-oro">
            {[foal.birthYear, foal.sex, foal.registry].filter(Boolean).join(" · ")}
          </p>
          <h1 className="mt-3 font-serif text-6xl font-light leading-none tracking-[0.02em] text-dlc-marfil sm:text-8xl">
            {foal.name}
          </h1>
          {foal.sire && foal.dam && (
            <p className="mt-6 text-lg text-dlc-marfil/85 sm:text-xl">
              <span className="font-semibold">{foal.sire.name}</span>
              <span className="mx-3 font-serif text-dlc-oro">x</span>
              <span className="font-semibold">{foal.dam.name}</span>
            </p>
          )}
          {foal.jumping && (
            <span className="mt-6 w-fit bg-dlc-oro px-4 py-2 text-[10px] font-medium uppercase tracking-[0.3em] text-dlc-negro">
              Actualmente saltando
              {foal.level && <span className="normal-case"> · {levelLabel(foal.level)}</span>}
            </span>
          )}
        </div>
      </section>

      {/* Video y galería */}
      <HorseMedia horse={foal} />

      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:py-24">
        {/* Datos y retrato */}
        <section>
          <p className="text-[11px] uppercase tracking-[0.4em] text-dlc-cuero">
            Ficha
          </p>
          <dl className="mt-6 divide-y divide-dlc-negro/10 border-y border-dlc-negro/10">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-baseline justify-between gap-6 py-4"
              >
                <dt className="text-xs uppercase tracking-[0.3em] text-dlc-negro/50">
                  {fact.label}
                </dt>
                <dd className="font-serif text-xl text-dlc-negro">{fact.value}</dd>
              </div>
            ))}
          </dl>

          {foal.portrait && (
            <div className="relative mt-10 aspect-[4/5] overflow-hidden bg-dlc-negro">
              <Image
                src={foal.portrait}
                alt={`Retrato de ${foal.name}`}
                fill
                sizes="(min-width: 1024px) 35vw, 100vw"
                className="object-cover object-top"
              />
            </div>
          )}
        </section>

        {/* Pedigrí */}
        <section className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.4em] text-dlc-cuero">
            Pedigrí
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium text-dlc-negro sm:text-4xl">
            Árbol genealógico
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
            Tres generaciones. Los ancestros resaltados con ◆ son líneas de
            sangre que comparten otros caballos de Rancho DLC: tócalos para
            verlos.
          </p>
          <div className="mt-8">
            <PedigreeTree sire={foal.sire} dam={foal.dam} lineLink={lineLink} />
          </div>

          {relatives.length > 0 && (
            <div className="mt-16">
              <p className="text-[11px] uppercase tracking-[0.4em] text-dlc-cuero">
                Familia DLC
              </p>
              <h3 className="mt-3 font-serif text-2xl text-dlc-negro">
                Parientes en nuestro catálogo
              </h3>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {relatives.map(({ horse: relative, relation }) => {
                  const thumb = relative.portrait ?? relative.image;
                  return (
                  <li key={relative.id}>
                    <Link
                      href={`/potros/${relative.id}`}
                      className="group flex items-center gap-4 border border-dlc-negro/10 bg-white p-3 transition-colors duration-300 hover:border-dlc-oro"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-dlc-negro">
                        {thumb && (
                          <Image
                            src={thumb}
                            alt={relative.name}
                            fill
                            sizes="64px"
                            className="object-cover object-top"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif text-lg leading-tight text-dlc-negro group-hover:text-dlc-cuero">
                          {relative.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{relation}</p>
                      </div>
                    </Link>
                  </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* CTA */}
      <section id="cta" className="bg-dlc-cuero px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="font-serif text-3xl font-light text-dlc-marfil sm:text-4xl">
              ¿Te interesa {horseArticle(foal)} {foal.name}?
            </h2>
            <p className="mt-3 text-dlc-marfil/75">
              Agenda una visita o solicita videos, historial y condiciones.
            </p>
          </div>
          <Link
            href={contactHref}
            className="press shrink-0 bg-dlc-oro px-10 py-4 text-xs font-medium uppercase tracking-[0.3em] text-dlc-negro hover:bg-dlc-negro hover:text-dlc-marfil"
          >
            Solicitar información
          </Link>
        </div>
      </section>

      <FloatingCta
        href={contactHref}
        label="Solicitar información"
        targetId="cta"
      />
    </main>
  );
}
