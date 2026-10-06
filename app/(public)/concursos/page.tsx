import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { estadoLabel, ESTADOS_PRUEBA, fechaLarga, hora12 } from "@/lib/concursos-types";
import { POR_DEFECTO } from "@/lib/contenido-types";
import { getConcursosPublicos, getConfiguracion, type ConcursoPublico } from "@/lib/data";
import { isAllowedImageUrl } from "@/lib/image-url";
import { parseVideo } from "@/lib/video";
import VideoPlayer from "@/components/VideoPlayer";
import { delay } from "@/lib/motion";

// Transmisión de un concurso, solo si es de YouTube o Vimeo.
const streamOf = (c: ConcursoPublico) => {
  const video = parseVideo(c.livestream_url);
  return video && video.kind !== "file" ? video : null;
};

// Banda "En vivo": reproductor + qué se está saltando ahora y qué sigue.
function EnVivo({ concurso }: { concurso: ConcursoPublico }) {
  const video = streamOf(concurso)!;
  const ahora = concurso.pruebas.find((p) => p.estado === "en_curso");
  const siguiente = concurso.pruebas.find((p) => p.estado === "abierta");
  const poster =
    concurso.imagen_url && isAllowedImageUrl(concurso.imagen_url) ? concurso.imagen_url : null;

  return (
    <article className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.4em] text-red-500">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-red-500 motion-reduce:hidden" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            En vivo ahora
          </p>
          <h2 className="mt-4 font-serif text-4xl font-light text-dlc-marfil sm:text-5xl">
            {concurso.nombre}
          </h2>
        </div>
        <dl className="flex gap-10 text-left">
          {ahora && (
            <div>
              <dt className="text-[10px] uppercase tracking-[0.35em] text-dlc-oro">En pista</dt>
              <dd className="mt-1 text-dlc-marfil">{ahora.nombre}</dd>
            </div>
          )}
          {siguiente && (
            <div>
              <dt className="text-[10px] uppercase tracking-[0.35em] text-dlc-marfil/50">Siguiente</dt>
              <dd className="mt-1 text-dlc-marfil/80">
                <span className="text-dlc-oro">{hora12(siguiente.hora_inicio)}</span> · {siguiente.nombre}
              </dd>
            </div>
          )}
        </dl>
      </div>
      <div className="mt-8">
        <VideoPlayer video={video} poster={poster} title={`Transmisión en vivo: ${concurso.nombre}`} live />
      </div>
    </article>
  );
}

// Las fechas de Postgres no tienen hora: se formatean en UTC para no moverlas un día.
const parte = (iso: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es-MX", { timeZone: "UTC", ...options }).format(
    new Date(`${iso}T00:00:00Z`),
  );

// Bloque de fecha de la tarjeta: "5 – 7" grande y "nov 2026" debajo.
function bloqueFechas(inicio: string, fin: string) {
  const dia = (iso: string) => parte(iso, { day: "numeric" });
  const mes = (iso: string) => parte(iso, { month: "short" }).replace(".", "");
  const anio = parte(fin, { year: "numeric" });
  return {
    dias: inicio === fin ? dia(inicio) : `${dia(inicio)} – ${dia(fin)}`,
    mes: mes(inicio) === mes(fin) ? `${mes(fin)} ${anio}` : `${mes(inicio)} – ${mes(fin)} ${anio}`,
  };
}

// Pruebas agrupadas por día, en el orden en que llegan (fecha y hora).
function porDia(pruebas: ConcursoPublico["pruebas"]) {
  const dias = new Map<string, ConcursoPublico["pruebas"]>();
  for (const p of pruebas) dias.set(p.fecha, [...(dias.get(p.fecha) ?? []), p]);
  return [...dias];
}

function ConcursoCard({ concurso }: { concurso: ConcursoPublico }) {
  const { dias, mes } = bloqueFechas(concurso.fecha_inicio, concurso.fecha_fin);
  const enCurso = concurso.estado === "activo";
  const imagen =
    concurso.imagen_url && isAllowedImageUrl(concurso.imagen_url) ? concurso.imagen_url : null;

  return (
    <article className="grid overflow-hidden border border-dlc-negro/10 bg-white transition-colors duration-500 hover:border-dlc-oro md:grid-cols-[280px_1fr]">
      {/* Fechas sobre negro (con la imagen del concurso de fondo, si tiene) */}
      <div className="relative flex min-h-[220px] flex-col justify-between overflow-hidden bg-dlc-negro p-8">
        {imagen && (
          <>
            <Image
              src={imagen}
              alt=""
              fill
              sizes="(min-width: 768px) 280px, 100vw"
              className="object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dlc-negro via-dlc-negro/60 to-dlc-negro/30" />
          </>
        )}
        <p className="relative flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-dlc-oro">
          {enCurso && (
            <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-dlc-oro" />
          )}
          {enCurso ? "En curso" : "Próximo"}
        </p>
        <div className="relative">
          <p className="font-serif text-6xl font-light leading-none text-dlc-marfil">{dias}</p>
          <p className="mt-3 text-xs uppercase tracking-[0.35em] text-dlc-marfil/60">{mes}</p>
        </div>
      </div>

      <div className="p-8 sm:p-10">
        <h2 className="font-serif text-3xl font-medium text-dlc-negro sm:text-4xl">
          {concurso.nombre}
        </h2>
        {streamOf(concurso) &&
          (enCurso ? (
            <a
              href="#en-vivo"
              className="mt-4 inline-flex items-center gap-2 bg-red-600 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white transition-colors hover:bg-red-700"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Ver en vivo
            </a>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-dlc-cuero">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <circle cx="12" cy="12" r="2" />
                <path d="M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2" />
              </svg>
              Transmisión en vivo durante el concurso
            </p>
          ))}
        <span className="mt-6 block h-px w-10 bg-dlc-oro" />

        {concurso.pruebas.length === 0 ? (
          <p className="mt-6 text-sm italic text-dlc-negro/50">Programa de pruebas por anunciar.</p>
        ) : (
          <div className="mt-6 space-y-8">
            {porDia(concurso.pruebas).map(([fecha, pruebas]) => (
              <section key={fecha}>
                <h3 className="text-[10px] uppercase tracking-[0.35em] text-dlc-cuero">
                  {fechaLarga(fecha)}
                </h3>
                <ul className="mt-3 divide-y divide-dlc-negro/10 border-y border-dlc-negro/10">
                  {pruebas.map((p) => (
                    <li key={p.id} className="flex items-baseline gap-5 py-3">
                      <span className="w-20 shrink-0 font-serif text-lg tabular-nums text-dlc-oro">
                        {hora12(p.hora_inicio)}
                      </span>
                      <span
                        className={`flex-1 text-dlc-negro ${p.estado === "finalizada" ? "text-dlc-negro/40 line-through decoration-dlc-negro/20" : ""}`}
                      >
                        {p.nombre}
                      </span>
                      {p.estado !== "abierta" && (
                        <span className="shrink-0 text-[9px] uppercase tracking-[0.25em] text-dlc-negro/45">
                          {estadoLabel(ESTADOS_PRUEBA, p.estado)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}



export default async function Concursos() {
  // Encabezado: fila 'eventos' de configuracion_sitio (se edita en /admin/contenido).
  const [eventos, concursos] = await Promise.all([
    getConfiguracion("eventos"),
    getConcursosPublicos(),
  ]);
  // Concursos en curso con transmisión: se muestran arriba, listos para ver.
  const enVivo = concursos.filter((c) => c.estado === "activo" && streamOf(c));
  // Video de la sección (YouTube, Vimeo o .mp4), editable en /admin/contenido → Eventos.
  const videoEventos = parseVideo(eventos?.datos?.video_url);

  return (
    <main className="flex-1 bg-dlc-marfil px-6 pt-40 pb-32">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="enter text-[11px] uppercase tracking-[0.5em] text-dlc-cuero" style={delay(50)}>
          Calendario
        </p>
        <h1
          className="enter mt-5 font-serif text-5xl font-light text-dlc-negro sm:text-7xl"
          style={delay(150)}
        >
          {eventos?.titulo || POR_DEFECTO.eventos.titulo}
        </h1>
        <span className="enter-line mt-8 h-px w-16 bg-dlc-oro" style={delay(450)} />
        {eventos?.subtitulo && (
          <p className="mt-8 font-serif text-lg italic text-dlc-cuero">{eventos.subtitulo}</p>
        )}
        <p className="mt-6 max-w-xl whitespace-pre-line leading-8 text-dlc-negro/70">
          {eventos?.descripcion || POR_DEFECTO.eventos.descripcion}
        </p>
      </div>

      {videoEventos && (
        <div className="mx-auto mt-16 max-w-4xl">
          <VideoPlayer
            video={videoEventos}
            poster={
              eventos?.imagen_url && isAllowedImageUrl(eventos.imagen_url) ? eventos.imagen_url : null
            }
            title={eventos?.titulo || POR_DEFECTO.eventos.titulo}
          />
        </div>
      )}

      {enVivo.length > 0 && (
        <section id="en-vivo" className="-mx-6 mt-20 scroll-mt-24 space-y-20 bg-dlc-negro px-6 py-16 sm:py-20">
          {enVivo.map((c) => (
            <EnVivo key={c.id} concurso={c} />
          ))}
        </section>
      )}

      {concursos.length > 0 ? (
        <ol className="mx-auto mt-24 max-w-5xl space-y-10">
          {concursos.map((concurso) => (
            <li key={concurso.id}>
              <Reveal>
                <ConcursoCard concurso={concurso} />
              </Reveal>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mx-auto mt-24 flex max-w-2xl flex-col items-center border border-dlc-oro/40 bg-white px-8 py-16 text-center">
          <span aria-hidden="true" className="h-3 w-3 rotate-45 border border-dlc-oro" />
          <p className="mt-8 font-serif text-3xl font-light text-dlc-negro">
            El calendario de la temporada se publicará muy pronto.
          </p>
          <p className="mt-4 max-w-md text-sm leading-7 text-dlc-negro/60">
            Escríbenos y te avisaremos en cuanto anunciemos las próximas fechas.
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
