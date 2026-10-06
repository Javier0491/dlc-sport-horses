"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useState } from "react";
import {
  hasAncestor,
  heightLabel,
  slugify,
  type Bloodline,
  type FoalFilters,
  type Horse,
} from "@/lib/catalog";
import {
  ALL,
  CatalogLayout,
  CatalogResults,
  ClearFiltersLink,
  PriceBadge,
  SingleFilter,
  optionsFrom,
  priceOptions,
  syncUrl,
  validOr,
} from "./CatalogParts";

// Cuántas líneas de sangre se muestran antes de "Ver todas".
const VISIBLE_LINES = 8;

type FilterState = { sexo: string; linea: string; saltando: string; precio: string };

const EMPTY_FILTERS: FilterState = { sexo: ALL, linea: ALL, saltando: ALL, precio: ALL };

function FoalCard({ foal }: { foal: Horse }) {
  // La alzada va en minúsculas ("1.68 m") dentro de la línea en mayúsculas.
  const details = [
    foal.sex,
    foal.height !== null && (
      <span className="normal-case">{heightLabel(foal.height)}</span>
    ),
    foal.color,
  ].filter(Boolean);
  // Sin foto principal se usa el retrato, y viceversa.
  const photo = foal.image ?? foal.portrait;
  const hoverPhoto = foal.image && foal.portrait;

  return (
    <Link
      href={`/potros/${foal.id}`}
      className="group flex flex-col border border-dlc-negro/10 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-dlc-oro hover:shadow-xl hover:shadow-dlc-negro/10"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-dlc-negro">
        {photo ? (
          <Image
            src={photo}
            alt={foal.name}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
            className={`object-cover transition-opacity duration-700 ${hoverPhoto ? "group-hover:opacity-0" : ""}`}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center font-serif text-3xl tracking-[0.35em] text-dlc-marfil/20">
            DLC
          </span>
        )}
        {/* Al pasar el mouse aparece el retrato */}
        {hoverPhoto && (
          <Image
            src={hoverPhoto}
            alt=""
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
            className="scale-105 object-cover object-[50%_25%] opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100"
          />
        )}
        {foal.birthYear && (
          <span className="absolute top-4 left-4 bg-dlc-negro/70 px-3 py-1.5 font-serif text-sm tracking-[0.2em] text-dlc-marfil backdrop-blur-sm">
            {foal.birthYear}
          </span>
        )}
        {foal.jumping && (
          <span className="absolute top-4 right-4 bg-dlc-oro px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.25em] text-dlc-negro">
            Actualmente saltando
          </span>
        )}
        {foal.priceLevel && <PriceBadge level={foal.priceLevel} />}
        {foal.video && (
          <span className="absolute right-4 bottom-4 flex items-center gap-1.5 bg-dlc-negro/75 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.25em] text-dlc-marfil backdrop-blur-sm">
            <svg viewBox="0 0 24 24" className="h-3 w-3 text-dlc-oro" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
            </svg>
            Video
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-dlc-oro">
          {details.map((detail, i) => (
            <Fragment key={i}>
              {i > 0 && " · "}
              {detail}
            </Fragment>
          ))}
        </p>
        <h3 className="mt-3 font-serif text-3xl font-medium text-dlc-negro">
          {foal.name}
        </h3>

        {/* Linaje destacado: Padre x Madre */}
        <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-end gap-3 border-t border-dlc-oro/40 pt-5 font-sans">
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-dlc-negro/45">
              Padre
            </p>
            <p className="mt-1 text-lg font-semibold leading-tight text-dlc-cuero">
              {foal.sire?.name ?? "—"}
            </p>
          </div>
          <span className="pb-0.5 font-serif text-xl text-dlc-oro">x</span>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-[0.3em] text-dlc-negro/45">
              Madre
            </p>
            <p className="mt-1 text-lg font-semibold leading-tight text-dlc-cuero">
              {foal.dam?.name ?? "—"}
            </p>
          </div>
        </div>
        {foal.dam?.sire && (
          <p className="mt-3 text-right text-xs text-gray-500">
            Abuelo materno: {foal.dam.sire.name}
          </p>
        )}

        <span className="mt-auto pt-6 text-[10px] uppercase tracking-[0.3em] text-dlc-negro/50 transition-colors group-hover:text-dlc-cuero">
          Ver ficha y pedigrí{" "}
          <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

export default function FoalCatalog({
  foals,
  lines,
  initialFilters,
}: {
  foals: Horse[];
  lines: Bloodline[];
  initialFilters: FoalFilters;
}) {
  const options = {
    sexo: optionsFrom(["Entero", "Castrado", "Yegua"].filter((s) => foals.some((f) => f.sex === s))),
    linea: lines.map((l) => ({ value: l.slug, label: `${l.name} (${l.count})` })),
    saltando: [{ value: "si", label: "Actualmente saltando" }],
    precio: priceOptions(foals.flatMap((f) => (f.priceLevel ? [f.priceLevel] : []))),
  };

  const [showAllLines, setShowAllLines] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    sexo: validOr(initialFilters.sexo, options.sexo),
    linea: validOr(initialFilters.linea, options.linea),
    saltando: validOr(initialFilters.saltando, options.saltando),
    precio: validOr(initialFilters.precio, options.precio),
  });

  const updateFilters = (next: FilterState) => {
    setFilters(next);
    syncUrl(next);
  };

  const clearFilters = () => updateFilters(EMPTY_FILTERS);

  const filtered = foals.filter(
    (f) =>
      (filters.sexo === ALL || filters.sexo === slugify(f.sex ?? "")) &&
      (filters.linea === ALL || hasAncestor(f, filters.linea)) &&
      (filters.saltando === ALL || f.jumping) &&
      (filters.precio === ALL || filters.precio === String(f.priceLevel)),
  );

  const hasFilters = Object.values(filters).some((v) => v !== ALL);
  const activeLine = lines.find((l) => l.slug === filters.linea);

  // Las líneas más frecuentes primero; la seleccionada siempre visible.
  const visibleLines = showAllLines
    ? options.linea
    : options.linea.filter(
        (o, i) => i < VISIBLE_LINES || o.value === filters.linea,
      );

  return (
    <CatalogLayout
      filters={
        <>
          <SingleFilter
            label="Sexo"
            allLabel="Todos"
            options={options.sexo}
            value={filters.sexo}
            onChange={(sexo) => updateFilters({ ...filters, sexo })}
          />
          <SingleFilter
            label="Competencia"
            allLabel="Todos"
            options={options.saltando}
            value={filters.saltando}
            onChange={(saltando) => updateFilters({ ...filters, saltando })}
          />
          <div>
            <SingleFilter
              label="Línea de sangre"
              allLabel="Todas"
              options={visibleLines}
              value={filters.linea}
              onChange={(linea) => updateFilters({ ...filters, linea })}
            />
            {options.linea.length > VISIBLE_LINES && (
              <button
                type="button"
                onClick={() => setShowAllLines((v) => !v)}
                className="mt-3 text-[10px] uppercase tracking-[0.3em] text-dlc-cuero underline-offset-4 hover:underline"
              >
                {showAllLines
                  ? "Ver menos"
                  : `Ver todas (${options.linea.length})`}
              </button>
            )}
          </div>
          {options.precio.length > 0 && (
            <SingleFilter
              label="Rango de Precio"
              allLabel="Todos"
              options={options.precio}
              value={filters.precio}
              onChange={(precio) => updateFilters({ ...filters, precio })}
            />
          )}
          {hasFilters && <ClearFiltersLink onClick={clearFilters} />}
        </>
      }
    >
      <div>
        {activeLine && (
          <div className="mb-8 border-l-2 border-dlc-oro bg-dlc-arena px-6 py-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-dlc-cuero">
              Línea de sangre
            </p>
            <p className="mt-1 font-serif text-2xl text-dlc-negro">
              {activeLine.name}
            </p>
            <p className="mt-1 text-sm text-dlc-negro/60">
              Caballos de Rancho DLC que llevan esta sangre en su pedigrí.
            </p>
          </div>
        )}
        <CatalogResults
          count={filtered.length}
          singular="caballo"
          plural="caballos"
          onClear={clearFilters}
        >
          {filtered.map((foal) => (
            <FoalCard key={foal.id} foal={foal} />
          ))}
        </CatalogResults>
      </div>
    </CatalogLayout>
  );
}
