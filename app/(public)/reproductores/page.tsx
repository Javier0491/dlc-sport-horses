import type { Metadata } from "next";
import StallionCatalog from "@/components/StallionCatalog";
import { getCatalogStallions } from "@/lib/data";
import { FILTER_PARAMS, type Filters } from "@/lib/catalog";
import { delay } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Catálogo de Sementales | Rancho DLC",
  description: "Sementales de Rancho DLC: genética probada para salto.",
};

export default async function Reproductores({
  searchParams,
}: PageProps<"/reproductores">) {
  // Los filtros vienen en la URL para que ventas pueda compartir enlaces pre-filtrados.
  const params = await searchParams;
  const initialFilters: Filters = {};
  for (const key of FILTER_PARAMS) {
    const value = params[key];
    if (typeof value === "string") initialFilters[key] = value;
  }

  // Sementales activos en Supabase (tabla caballos).
  const stallions = await getCatalogStallions();

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="flex h-[40vh] min-h-[320px] flex-col items-center justify-center bg-dlc-negro px-6 pt-24 text-center">
        <p className="enter text-[11px] uppercase tracking-[0.5em] text-dlc-oro" style={delay(100)}>
          Sementales
        </p>
        <h1
          className="enter mt-5 font-serif text-4xl font-light tracking-[0.04em] text-dlc-marfil sm:text-6xl"
          style={delay(200)}
        >
          Catálogo de Sementales
        </h1>
        <span className="enter-line mt-7 h-px w-16 bg-dlc-oro" style={delay(500)} />
      </section>

      <StallionCatalog stallions={stallions} initialFilters={initialFilters} />
    </main>
  );
}
