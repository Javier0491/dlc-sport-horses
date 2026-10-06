import Image from "next/image";
import Link from "next/link";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";
import { DISCIPLINE } from "@/lib/catalog";
import { POR_DEFECTO } from "@/lib/contenido-types";
import { getConfiguracion, getSementalesActivos } from "@/lib/data";
import { isAllowedImageUrl } from "@/lib/image-url";
import { delay } from "@/lib/motion";

// Pendiente: reactivar el <video> cuando exista (ej. /videos/hero.mp4 en /public).
// const HERO_VIDEO_SRC = "/videos/hero.mp4";

const pillars = [
  {
    title: "Centro Médico",
    text: "Medicina deportiva, neonatología y diagnóstico para cuidar a cada atleta en todas sus etapas.",
    href: "/centro-medico",
    icon: (
      <>
        <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10Z" />
        <path d="M9 12h2v-2h2v2h2" />
      </>
    ),
  },
  {
    title: "Catálogo de Sementales",
    text: "Líneas de sangre seleccionadas exclusivamente para salto, con pedigrí documentado.",
    href: "/reproductores",
    icon: (
      <>
        <path d="M12 4v5" />
        <path d="M12 9 6 15M12 9l6 6" />
        <circle cx="12" cy="3" r="1" />
        <circle cx="6" cy="17" r="2" />
        <circle cx="18" cy="17" r="2" />
      </>
    ),
  },
  {
    title: "Eventos e Instalaciones",
    text: "Pistas, caballerizas y espacios pensados para entrenar, competir y recibir a nuestros clientes.",
    href: "/concursos",
    icon: (
      <>
        <path d="M3 21h18" />
        <path d="M5 21V10l7-5 7 5v11" />
        <path d="M10 21v-6h4v6" />
      </>
    ),
  },
];

export default async function Home() {
  // Portada y Nuestro Legado: tabla configuracion_sitio (se editan en /admin/contenido).
  // El hero lee 'portada'; la sección de legado es un adelanto de /el-rancho ('legado').
  const [portada, legado] = await Promise.all([
    getConfiguracion("portada"),
    getConfiguracion("legado"),
  ]);
  const heroImage =
    portada?.imagen_url && isAllowedImageUrl(portada.imagen_url)
      ? portada.imagen_url
      : POR_DEFECTO.portada.imagen_url;

  // "La Joya de la Corona": el semental publicado de mayor rango de precio (y con foto).
  // Si no hay ninguno, o Supabase falla, la sección no se muestra.
  const stallions = await getSementalesActivos().catch(() => []);
  const featured = stallions
    .filter((s) => s.image)
    .sort((a, b) => (b.priceLevel ?? 0) - (a.priceLevel ?? 0))[0];

  return (
    <main className="flex-1 bg-dlc-negro">
      <section className="relative h-screen w-full overflow-hidden">
        {/* <video
          className="absolute inset-0 h-full w-full object-cover"
          src={HERO_VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        /> */}
        {/* Parallax al hacer scroll (exterior) y zoom lento al cargar (interior). */}
        <div className="parallax absolute inset-0">
          <div className="enter-photo absolute inset-0">
            <Image
              src={heroImage}
              alt=""
              fill
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover object-center"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-dlc-negro/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />

        <div className="hero-out relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <h1
            className="enter font-serif text-5xl font-light tracking-[0.08em] text-dlc-marfil sm:text-7xl lg:text-8xl"
            style={delay(150)}
          >
            {portada?.titulo || POR_DEFECTO.portada.titulo}
          </h1>
          <span className="enter-line mt-8 h-px w-24 bg-dlc-oro" style={delay(550)} />
          <p
            className="enter mt-8 max-w-xl text-sm font-light uppercase leading-7 tracking-[0.25em] text-dlc-marfil/85 sm:text-base"
            style={delay(700)}
          >
            {portada?.subtitulo || POR_DEFECTO.portada.subtitulo}
          </p>
          {portada?.descripcion && (
            <p
              className="enter mt-5 max-w-lg text-sm font-light leading-7 text-dlc-marfil/70 sm:text-base"
              style={delay(850)}
            >
              {portada.descripcion}
            </p>
          )}
        </div>

        <a
          href="#pilares"
          className="enter absolute inset-x-0 bottom-10 z-10 mx-auto flex w-fit flex-col items-center gap-3 text-dlc-marfil/60 transition-colors hover:text-dlc-oro"
          style={delay(1300)}
        >
          <span className="text-[10px] uppercase tracking-[0.4em]">
            Descubrir
          </span>
          <span className="scroll-cue relative h-12 w-px overflow-hidden bg-dlc-marfil/25" />
        </a>
      </section>

      <Marquee />

      {/* Pilares de Excelencia */}
      <section id="pilares" className="bg-dlc-marfil px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center text-center">
            <p className="text-[11px] uppercase tracking-[0.5em] text-dlc-cuero">
              Rancho DLC
            </p>
            <h2 className="mt-5 font-serif text-4xl font-light text-dlc-negro sm:text-5xl">
              Pilares de Excelencia
            </h2>
            <span className="rule-draw mt-7 h-px w-16 bg-dlc-oro" />
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 0.08} className="flex">
                <Link
                  href={pillar.href}
                  className="press group relative isolate flex flex-1 flex-col overflow-hidden border border-dlc-negro/10 bg-white p-10 font-sans hover:border-dlc-oro"
                >
                  {/* Al pasar el ratón, el fondo negro sube desde abajo y el texto se invierte. */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 origin-bottom scale-y-0 bg-dlc-negro transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-y-100"
                  />
                  <span className="flex h-14 w-14 items-center justify-center border border-dlc-oro text-dlc-cuero transition-colors duration-500 group-hover:bg-dlc-oro group-hover:text-dlc-negro">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.25}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {pillar.icon}
                    </svg>
                  </span>
                  <h3 className="mt-8 font-serif text-2xl font-medium text-dlc-negro transition-colors duration-500 group-hover:text-dlc-marfil">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-dlc-negro/70 transition-colors duration-500 group-hover:text-dlc-marfil/70">
                    {pillar.text}
                  </p>
                  <span className="mt-auto pt-8 text-xs uppercase tracking-[0.3em] text-dlc-cuero transition-colors duration-500 group-hover:text-dlc-oro">
                    Descubrir más{" "}
                    <span className="inline-block transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-2">
                      →
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Semental Destacado */}
      {featured?.image && (
        <section className="grid bg-dlc-negro lg:grid-cols-2">
          <Reveal className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[640px]">
            <Image
              src={featured.image}
              alt={featured.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </Reveal>
          <Reveal
            delay={0.2}
            className="flex flex-col justify-center px-6 py-20 sm:px-12 lg:px-20 lg:py-24"
          >
            <p className="text-[11px] uppercase tracking-[0.5em] text-dlc-oro">
              Semental Destacado
            </p>
            <h2 className="mt-5 font-serif text-4xl font-light text-dlc-marfil sm:text-6xl">
              La Joya de la Corona
            </h2>
            <span className="rule-draw mt-8 h-px w-16 bg-dlc-oro" />
            <p className="mt-8 font-serif text-2xl text-dlc-marfil">
              {featured.name}
              <span className="ml-3 font-sans text-xs uppercase tracking-[0.3em] text-dlc-marfil/50">
                {[featured.breed, DISCIPLINE].filter(Boolean).join(" · ")}
              </span>
            </p>
            <p className="mt-6 max-w-lg leading-8 text-dlc-marfil/75">
              {featured.sire ? `Hijo de ${featured.sire.name}, ${featured.name}` : featured.name} concentra lo mejor
              de la genética europea: generaciones de selección rigurosa que se
              traducen en movimiento, carácter y una disposición natural para el
              alto rendimiento.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-8">
              <Link
                href="/reproductores"
                className="press bg-dlc-oro px-10 py-4 text-xs font-medium uppercase tracking-[0.3em] text-dlc-negro hover:bg-dlc-marfil"
              >
                Ver catálogo
              </Link>
              <Link
                href={`/reproductores/${featured.id}`}
                className="text-xs uppercase tracking-[0.3em] text-dlc-marfil/70 underline-offset-8 transition-colors hover:text-dlc-oro hover:underline"
              >
                Ver ficha
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* Nuestro Legado */}
      <section className="bg-dlc-arena px-6 py-32 sm:py-48">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="text-[11px] uppercase tracking-[0.5em] text-dlc-cuero">
            El Rancho
          </p>
          {legado?.titulo && (
            <h2 className="mt-5 font-serif text-4xl font-light text-dlc-negro sm:text-5xl">
              {legado.titulo}
            </h2>
          )}
          <span className="rule-draw mt-8 h-px w-16 bg-dlc-oro" />
          <p className="mt-12 whitespace-pre-line font-serif text-2xl font-light leading-relaxed text-dlc-negro sm:text-3xl sm:leading-relaxed">
            {legado?.descripcion || POR_DEFECTO.legado.descripcion}
          </p>
          <p className="mt-10 font-serif text-lg italic text-dlc-cuero">
            {legado?.subtitulo || POR_DEFECTO.legado.subtitulo}
          </p>
          <Link
            href="/el-rancho"
            className="mt-12 text-xs uppercase tracking-[0.3em] text-dlc-negro/70 underline-offset-8 transition-colors hover:text-dlc-cuero hover:underline"
          >
            Conocer el rancho →
          </Link>
        </div>
      </section>
    </main>
  );
}
