"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CatalogStallion } from "@/lib/data";
import { slugify, type Filters } from "@/lib/catalog";
import {
  ALL,
  CatalogLayout,
  CatalogResults,
  ClearFiltersLink,
  FilterGroup,
  PriceBadge,
  SingleFilter,
  chipClass,
  optionsFrom,
  priceOptions,
  syncUrl,
  validOr,
} from "./CatalogParts";

type FilterState = {
  raza: string;
  precio: string;
  comportamiento: string[]; // multi-selección: el caballo debe tener todas
};

const EMPTY_FILTERS: FilterState = { raza: ALL, precio: ALL, comportamiento: [] };

const isDefined = <T,>(value: T | null): value is T => value !== null;

function HorseCard({ horse }: { horse: CatalogStallion }) {
  return (
    <Link
      href={`/reproductores/${horse.id}`}
      className="group flex flex-col border border-dlc-negro/10 bg-white transition-colors duration-500 hover:border-dlc-oro"
    >
      <div className="relative aspect-square overflow-hidden bg-dlc-arena">
        {horse.image ? (
          <Image
            src={horse.image}
            alt={horse.name}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-serif text-3xl tracking-[0.35em] text-dlc-cuero/30">
            DLC
          </span>
        )}
        {horse.priceLevel && <PriceBadge level={horse.priceLevel} />}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-dlc-oro">
          {[horse.breed, horse.birthYear].filter(Boolean).join(" · ")}
        </p>
        <h3 className="mt-3 font-serif text-3xl font-medium text-dlc-negro">
          {horse.name}
        </h3>
        {horse.sireName && (
          <p className="mt-2 font-sans text-xs tracking-wide text-gray-500">
            {horse.sireName}
            {horse.damSireName && ` x ${horse.damSireName}`}
          </p>
        )}
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {horse.behavior.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-dlc-arena px-3 py-1 text-[10px] tracking-wide text-dlc-negro/70"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}

export default function StallionCatalog({
  stallions,
  initialFilters,
}: {
  stallions: CatalogStallion[];
  initialFilters: Filters;
}) {
  // Las opciones salen de los propios datos, así nunca hay un filtro sin caballos.
  const options = {
    raza: optionsFrom(stallions.map((s) => s.breed).filter(isDefined)),
    precio: priceOptions(stallions.map((s) => s.priceLevel).filter(isDefined)),
    comportamiento: optionsFrom(stallions.flatMap((s) => s.behavior).sort()),
  };

  const [filters, setFilters] = useState<FilterState>({
    raza: validOr(initialFilters.raza, options.raza),
    precio: validOr(initialFilters.precio, options.precio),
    comportamiento: (initialFilters.comportamiento ?? "")
      .split(",")
      .filter((tag) => options.comportamiento.some((o) => o.value === tag)),
  });

  const updateFilters = (next: FilterState) => {
    setFilters(next);
    syncUrl(next);
  };

  const toggleBehavior = (tag: string) =>
    updateFilters({
      ...filters,
      comportamiento: filters.comportamiento.includes(tag)
        ? filters.comportamiento.filter((t) => t !== tag)
        : [...filters.comportamiento, tag],
    });

  const clearFilters = () => updateFilters(EMPTY_FILTERS);

  const filtered = stallions.filter((s) => {
    const tags = s.behavior.map(slugify);
    return (
      (filters.raza === ALL || filters.raza === slugify(s.breed ?? "")) &&
      (filters.precio === ALL || filters.precio === String(s.priceLevel)) &&
      filters.comportamiento.every((tag) => tags.includes(tag))
    );
  });

  const hasFilters =
    filters.raza !== ALL ||
    filters.precio !== ALL ||
    filters.comportamiento.length > 0;

  // Base de datos sin sementales publicados: no tiene sentido mostrar filtros.
  if (stallions.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-32 text-center">
        <span className="h-px w-16 bg-dlc-oro" />
        <p className="mt-10 font-serif text-3xl font-light text-dlc-negro">
          Muy pronto presentaremos nuestros sementales.
        </p>
        <p className="mt-4 text-sm leading-7 text-dlc-negro/60">
          Mientras tanto, nuestro equipo puede asesorarte personalmente.
        </p>
        <Link
          href="/contacto"
          className="mt-10 bg-dlc-negro px-8 py-4 text-xs uppercase tracking-[0.3em] text-dlc-marfil transition-colors duration-500 hover:bg-dlc-cuero"
        >
          Contactar
        </Link>
      </div>
    );
  }

  return (
    <CatalogLayout
      filters={
        <>
          <FilterGroup
            label="Comportamiento"
            hint="Elige uno o varios rasgos de temperamento."
          >
            {options.comportamiento.map((item) => {
              const active = filters.comportamiento.includes(item.value);
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleBehavior(item.value)}
                  className={`rounded-full ${chipClass(active)}`}
                >
                  {item.label}
                </button>
              );
            })}
          </FilterGroup>
          <SingleFilter
            label="Raza"
            allLabel="Todas"
            options={options.raza}
            value={filters.raza}
            onChange={(raza) => updateFilters({ ...filters, raza })}
          />
          <SingleFilter
            label="Rango de Precio"
            allLabel="Todos"
            options={options.precio}
            value={filters.precio}
            onChange={(precio) => updateFilters({ ...filters, precio })}
          />
          {hasFilters && <ClearFiltersLink onClick={clearFilters} />}
        </>
      }
    >
      <CatalogResults
        count={filtered.length}
        singular="semental"
        plural="sementales"
        onClear={clearFilters}
      >
        {filtered.map((horse) => (
          <HorseCard key={horse.id} horse={horse} />
        ))}
      </CatalogResults>
    </CatalogLayout>
  );
}
