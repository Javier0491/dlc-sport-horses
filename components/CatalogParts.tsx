// Piezas compartidas por los catálogos (sementales y potros).
import { priceLabel, slugify } from "@/lib/catalog";

export const ALL = "all";

export type Option = { value: string; label: string };

export const chipClass = (active: boolean) =>
  active
    ? "border border-dlc-cuero bg-dlc-cuero px-4 py-2 text-xs tracking-wide text-dlc-marfil"
    : "border border-dlc-cuero/30 px-4 py-2 text-xs tracking-wide text-dlc-negro/80 transition-colors duration-300 hover:border-dlc-cuero hover:text-dlc-cuero";

// Una opción por valor distinto; el valor es el slug que va en la URL.
export function optionsFrom(
  values: string[],
  toLabel = (v: string) => v,
): Option[] {
  return [...new Set(values)].map((v) => ({
    value: slugify(v),
    label: toLabel(v),
  }));
}

export const priceOptions = (levels: number[]) =>
  optionsFrom(levels.map(String).sort(), (v) => priceLabel(Number(v)));

// Ignora valores de la URL que no correspondan a ninguna opción.
export const validOr = (value: string | undefined, options: Option[]) =>
  value && options.some((o) => o.value === value) ? value : ALL;

// Refleja los filtros activos en la URL sin recargar la página.
export function syncUrl(params: Record<string, string | string[]>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const joined = Array.isArray(value) ? value.join(",") : value;
    if (joined && joined !== ALL) search.set(key, joined);
  }
  // Las comas se dejan legibles en el enlace compartido.
  const query = search.toString().replaceAll("%2C", ",");
  window.history.replaceState(
    null,
    "",
    query ? `?${query}` : window.location.pathname,
  );
}

export function FilterGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-[11px] font-medium uppercase tracking-[0.35em] text-dlc-negro/60">
        {label}
      </h2>
      {hint && <p className="mt-1 text-[11px] text-dlc-negro/40">{hint}</p>}
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function SingleFilter({
  label,
  allLabel,
  options,
  value,
  onChange,
}: {
  label: string;
  allLabel: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FilterGroup label={label}>
      {[{ value: ALL, label: allLabel }, ...options].map((item) => (
        <button
          key={item.value}
          type="button"
          aria-pressed={item.value === value}
          onClick={() => onChange(item.value)}
          className={chipClass(item.value === value)}
        >
          {item.label}
        </button>
      ))}
    </FilterGroup>
  );
}

export function ClearFiltersLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs uppercase tracking-[0.3em] text-dlc-cuero underline-offset-4 hover:underline"
    >
      Limpiar filtros
    </button>
  );
}

export function PriceBadge({ level }: { level: number }) {
  return (
    <div className="absolute bottom-4 left-4 flex items-baseline gap-3 bg-dlc-marfil px-4 py-2">
      <span className="text-[9px] font-medium uppercase tracking-[0.3em] text-dlc-negro/60">
        Price Range
      </span>
      <span className="font-serif text-base tracking-[0.15em] text-dlc-cuero">
        {priceLabel(level)}
      </span>
    </div>
  );
}

// Contador + grid, o estado vacío si ningún caballo coincide.
export function CatalogResults({
  count,
  singular,
  plural,
  onClear,
  children,
}: {
  count: number;
  singular: string;
  plural: string;
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p
        className="mb-8 text-xs uppercase tracking-[0.3em] text-dlc-negro/50"
        aria-live="polite"
      >
        {count} {count === 1 ? singular : plural}
      </p>

      {count === 0 ? (
        <div className="flex flex-col items-center border border-dlc-cuero/20 px-6 py-20 text-center">
          <p className="font-serif text-2xl text-dlc-negro">
            Ningún resultado coincide con estos filtros.
          </p>
          <button
            type="button"
            onClick={onClear}
            className="mt-8 border border-dlc-cuero px-6 py-3 text-xs uppercase tracking-[0.3em] text-dlc-cuero transition-colors duration-300 hover:bg-dlc-cuero hover:text-dlc-marfil"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
          {children}
        </div>
      )}
    </section>
  );
}

export function CatalogLayout({
  filters,
  children,
}: {
  filters: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[240px_1fr] lg:gap-16 lg:py-24">
      <aside className="space-y-10 lg:sticky lg:top-24 lg:self-start">
        {filters}
      </aside>
      {children}
    </div>
  );
}
