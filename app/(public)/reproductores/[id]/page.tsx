import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import FloatingCta from "@/components/FloatingCta";
import HorseMedia from "@/components/HorseMedia";
import PedigreeTree from "@/components/PedigreeTree";
import { DISCIPLINE, heightLabel, priceLabel } from "@/lib/catalog";
import { whatsappUrl } from "@/lib/contact";
import { getCaballoBySlug, getProgenie, getSementalesActivos } from "@/lib/data";

const getStallion = (id: string) => getCaballoBySlug(id, ["Semental"]);

// Se pregeneran los sementales publicados; los que se publiquen después se generan
// al primer acceso. El panel revalida estas páginas al guardar cambios.
export async function generateStaticParams() {
  const stallions = await getSementalesActivos().catch(() => []);
  return stallions.map((stallion) => ({ id: stallion.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/reproductores/[id]">): Promise<Metadata> {
  const { id } = await params;
  const stallion = await getStallion(id);
  if (!stallion) return {};

  const description = [
    `${stallion.name}: ${[stallion.breed, DISCIPLINE].filter(Boolean).join(", ")}.`,
    stallion.sire && `Por ${stallion.sire.name}.`,
  ]
    .filter(Boolean)
    .join(" ");
  return {
    title: `${stallion.name} | Sementales | Rancho DLC`,
    description,
    openGraph: {
      title: stallion.name,
      description,
      images: stallion.image ? [stallion.image] : undefined,
    },
  };
}

export default async function Semental({
  params,
}: PageProps<"/reproductores/[id]">) {
  const { id } = await params;
  const stallion = await getStallion(id);
  if (!stallion) notFound();

  // Solo los datos cargados en el panel.
  const facts = [
    { label: "Raza", value: stallion.breed },
    { label: "Disciplina", value: DISCIPLINE },
    { label: "Alzada", value: stallion.height !== null ? heightLabel(stallion.height) : null },
    { label: "Año de nacimiento", value: stallion.birthYear !== null ? String(stallion.birthYear) : null },
  ].filter((fact) => fact.value);

  const contactHref = `/contacto?semental=${stallion.id}`;
  const progeny = await getProgenie(stallion.id);

  // Preventa: mensaje de WhatsApp ya escrito con la cruza concreta.
  const presale = stallion.presale;
  const presaleCross = presale ? `${stallion.name} × ${presale.mare}` : "";
  const presaleHref = presale
    ? whatsappUrl(
        `Hola, quiero entrar a la lista de espera de la cruza ${presaleCross}` +
          (presale.year ? ` (potro ${presale.year})` : "") +
          ". ¿Me pueden compartir disponibilidad y condiciones?",
      )
    : "";

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[380px] w-full overflow-hidden bg-dlc-negro">
        {stallion.image && (
          <Image
            src={stallion.image}
            alt={stallion.name}
            fill
            sizes="100vw"
            loading="eager"
            fetchPriority="high"
            className="object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-dlc-negro/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-dlc-negro/80 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-12">
          <Link
            href="/reproductores"
            className="text-[11px] uppercase tracking-[0.4em] text-dlc-marfil/70 transition-colors hover:text-dlc-oro"
          >
            ← Catálogo de Sementales
          </Link>
          <h1 className="mt-4 font-serif text-6xl font-light leading-none tracking-[0.02em] text-dlc-marfil sm:text-8xl lg:text-9xl">
            {stallion.name}
          </h1>
          <span className="mt-6 h-px w-16 bg-dlc-oro" />
        </div>
      </section>

      {/* Video y galería */}
      <HorseMedia horse={stallion} />

      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
        {/* Datos y galería */}
        <section>
          <p className="text-[11px] uppercase tracking-[0.4em] text-dlc-cuero">
            Ficha
          </p>
          <dl className="mt-6 divide-y divide-dlc-negro/10 border-y border-dlc-negro/10">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-baseline justify-between gap-6 py-5"
              >
                <dt className="text-xs uppercase tracking-[0.3em] text-dlc-negro/50">
                  {fact.label}
                </dt>
                <dd className="font-serif text-xl text-dlc-negro">
                  {fact.value}
                </dd>
              </div>
            ))}
            {stallion.priceLevel && (
              <div className="flex items-center justify-between gap-6 py-5">
                <dt className="text-xs uppercase tracking-[0.3em] text-dlc-negro/50">
                  Rango de Precio
                </dt>
                <dd className="flex items-baseline gap-3 bg-dlc-arena px-4 py-2">
                  <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-dlc-negro/60">
                    Price Range
                  </span>
                  <span className="font-serif text-lg tracking-[0.15em] text-dlc-cuero">
                    {priceLabel(stallion.priceLevel)}
                  </span>
                </dd>
              </div>
            )}
          </dl>

          {stallion.behavior.length > 0 && (
            <>
              <p className="mt-14 text-[11px] uppercase tracking-[0.4em] text-dlc-cuero">
                Comportamiento
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {stallion.behavior.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-dlc-arena px-4 py-1.5 text-xs tracking-wide text-dlc-negro/75"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </>
          )}

        </section>

        {/* Pedigrí */}
        <section className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.4em] text-dlc-cuero">
            Pedigrí
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium text-dlc-negro">
            Árbol genealógico
          </h2>
          <p className="mt-2 text-sm text-gray-500">Tres generaciones</p>
          <div className="mt-8">
            <PedigreeTree sire={stallion.sire} dam={stallion.dam} />
          </div>

          {/* Progenie: hijos publicados que compiten o tienen nivel asignado */}
          {progeny.length > 0 && (
            <div className="mt-16">
              <p className="text-[11px] uppercase tracking-[0.4em] text-dlc-cuero">
                Progenie
              </p>
              <h2 className="mt-3 font-serif text-3xl font-medium text-dlc-negro">
                Resultados de sus hijos
              </h2>
              <ul className="mt-8 divide-y divide-dlc-negro/10 border-y border-dlc-negro/10">
                {progeny.map((child) => {
                  const content = (
                    <>
                      <span className="min-w-0">
                        <span className="block truncate font-serif text-xl text-dlc-negro transition-colors group-hover:text-dlc-cuero">
                          {child.name}
                        </span>
                        {child.birthYear && (
                          <span className="mt-1 block text-[10px] uppercase tracking-[0.3em] text-dlc-negro/45">
                            {child.birthYear}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 border border-dlc-oro/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-dlc-cuero">
                        {child.level ?? "En competencia"}
                      </span>
                    </>
                  );
                  return (
                    <li key={child.id}>
                      {child.href ? (
                        <Link
                          href={child.href}
                          className="group flex items-center justify-between gap-6 py-4"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div className="flex items-center justify-between gap-6 py-4">
                          {content}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* Preventa de cruzas */}
      {presale && (
        <section className="bg-dlc-negro px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl border border-dlc-oro/40 px-6 py-12 text-center sm:px-12 sm:py-16">
            <p className="text-[11px] uppercase tracking-[0.5em] text-dlc-oro">
              Preventa de cruzas
            </p>
            <h2 className="mt-6 font-serif text-3xl font-light text-dlc-marfil sm:text-5xl">
              {stallion.name}
              <span className="mx-4 text-dlc-oro">×</span>
              {presale.mare}
            </h2>
            <span className="mx-auto mt-8 block h-px w-16 bg-dlc-oro" />
            <p className="mt-8 text-sm uppercase tracking-[0.3em] text-dlc-marfil/70">
              {presale.year ? `Potro proyectado ${presale.year}` : "Próxima temporada"}
            </p>
            <p className="mx-auto mt-6 max-w-xl leading-8 text-dlc-marfil/60">
              Lugares limitados. Reserva tu prioridad para esta cruza y recibe la
              información antes que nadie.
            </p>
            <a
              href={presaleHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-block bg-dlc-oro px-10 py-4 text-xs font-medium uppercase tracking-[0.3em] text-dlc-negro transition-colors duration-500 hover:bg-dlc-marfil"
            >
              Entrar a Lista de Espera
            </a>
          </div>
        </section>
      )}

      {/* CTA */}
      <section id="cta" className="bg-dlc-cuero px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="font-serif text-3xl font-light text-dlc-marfil sm:text-4xl">
              ¿Interesado en {stallion.name}?
            </h2>
            <p className="mt-3 text-dlc-marfil/75">
              Nuestro equipo te comparte disponibilidad, condiciones y
              documentación completa.
            </p>
          </div>
          <Link
            href={contactHref}
            className="shrink-0 bg-dlc-oro px-10 py-4 text-xs font-medium uppercase tracking-[0.3em] text-dlc-negro transition-colors duration-500 hover:bg-dlc-negro hover:text-dlc-marfil"
          >
            Solicitar información
          </Link>
        </div>
      </section>

      {/* Botón flotante: se oculta al llegar a la banda CTA */}
      <FloatingCta
        href={contactHref}
        label="Solicitar información"
        targetId="cta"
      />
    </main>
  );
}
