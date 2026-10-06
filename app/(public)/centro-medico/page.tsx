import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { delay } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Centro Médico Equino | Rancho DLC",
  description:
    "Tecnología, ciencia y bienestar al servicio del alto rendimiento.",
};

// Placeholder: reemplazar por una foto propia de las instalaciones (ej. /images/centro-medico.jpg en /public).
const HERO_IMAGE_SRC =
  "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=2000&q=80";

const specialties = [
  {
    title: "Medicina Deportiva y Rehabilitación",
    description:
      "Diagnóstico de claudicaciones, seguimiento del rendimiento y programas de rehabilitación para devolver a cada atleta a la pista en su mejor forma.",
  },
  {
    title: "Neonatología y Cuidados Intensivos",
    description:
      "Atención especializada desde las primeras horas de vida, con monitoreo constante para potros y yeguas en periodos críticos.",
  },
  {
    title: "Cirugía y Hospitalización",
    description:
      "Procedimientos quirúrgicos y recuperación en instalaciones diseñadas para la seguridad, la higiene y el confort del caballo.",
  },
  {
    title: "Laboratorio Clínico y Rayos X",
    description:
      "Análisis clínicos e imagenología diagnóstica para decisiones médicas rápidas, precisas y fundamentadas.",
  },
];

export default function CentroMedico() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-dlc-negro">
        <div className="parallax absolute inset-0" aria-hidden="true">
          <div
            className="enter-photo absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_IMAGE_SRC})` }}
          />
        </div>
        <div className="absolute inset-0 bg-dlc-negro/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-dlc-negro/70 via-transparent to-transparent" />

        <div className="hero-out relative z-10 flex h-full flex-col items-center justify-center px-6 pt-24 text-center">
          <p className="enter text-[11px] uppercase tracking-[0.5em] text-dlc-oro" style={delay(100)}>
            Rancho DLC
          </p>
          <h1
            className="enter mt-6 font-serif text-4xl font-light tracking-[0.04em] text-dlc-marfil sm:text-6xl lg:text-7xl"
            style={delay(200)}
          >
            Centro Médico Equino
          </h1>
          <span className="enter-line mt-8 h-px w-16 bg-dlc-oro" style={delay(500)} />
          <p
            className="enter mt-8 max-w-2xl text-sm font-light uppercase leading-7 tracking-[0.2em] text-dlc-marfil/85 sm:text-base"
            style={delay(650)}
          >
            Tecnología, ciencia y bienestar al servicio del alto rendimiento
          </p>
        </div>
      </section>

      {/* Introducción */}
      <section className="bg-dlc-marfil px-6 py-24 text-dlc-negro sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1fr_2fr] md:gap-20">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-dlc-cuero">
              Nuestro compromiso
            </p>
            <h2 className="mt-4 font-serif text-3xl font-medium leading-tight sm:text-4xl">
              La salud es el origen de todo gran desempeño.
            </h2>
            <span className="rule-draw mt-8 block h-px w-12 origin-left bg-dlc-oro" />
          </div>
          <div className="space-y-6 text-base leading-8 text-dlc-negro/75 sm:text-lg">
            <p>
              En Rancho DLC entendemos que la genética abre la puerta al
              talento, pero es el cuidado médico el que le permite expresarse.
              Por eso integramos la medicina veterinaria en cada etapa de la
              vida de nuestros caballos: desde el nacimiento hasta la alta
              competencia.
            </p>
            <p>
              Nuestro equipo combina diagnóstico preciso, prevención y
              tratamiento especializado con un principio innegociable: el
              bienestar del caballo por encima de todo.
            </p>
            <Link
              href="/equipo#medico"
              className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-dlc-cuero"
            >
              Conoce al equipo médico
              <span className="inline-block transition-transform duration-500 ease-[var(--ease-out)] group-hover:translate-x-2">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Especialidades */}
      <section className="bg-dlc-marfil px-6 pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col items-center text-center">
            <p className="text-[11px] uppercase tracking-[0.4em] text-dlc-cuero">
              Especialidades
            </p>
            <h2 className="mt-4 font-serif text-3xl font-medium text-dlc-negro sm:text-4xl">
              Áreas de atención
            </h2>
          </div>

          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {specialties.map((specialty, index) => (
              <Reveal
                as="li"
                key={specialty.title}
                delay={index * 0.06}
                className="group flex flex-col border border-dlc-oro/40 bg-dlc-arena p-8 font-sans transition-colors duration-500 hover:border-dlc-cuero"
              >
                <span className="font-serif text-4xl font-light text-dlc-oro">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-6 h-px w-16 origin-left scale-x-[0.625] bg-dlc-cuero/40 transition-[transform,background-color] duration-500 ease-[var(--ease-out)] group-hover:scale-x-100 group-hover:bg-dlc-cuero" />
                <h3 className="mt-6 text-lg font-medium leading-snug text-dlc-negro">
                  {specialty.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-dlc-negro/70">
                  {specialty.description}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dlc-cuero px-6 py-20 sm:py-24">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="font-serif text-3xl font-light text-dlc-marfil sm:text-4xl">
              Contactar a nuestros especialistas
            </h2>
            <p className="mt-4 max-w-xl text-dlc-marfil/75">
              Agenda una valoración o consulta los servicios disponibles para
              tu caballo.
            </p>
          </div>
          <Link
            href="/contacto"
            className="press shrink-0 bg-dlc-oro px-10 py-4 text-xs font-medium uppercase tracking-[0.3em] text-dlc-negro hover:bg-dlc-negro hover:text-dlc-marfil"
          >
            Contactar
          </Link>
        </div>
      </section>
    </main>
  );
}
