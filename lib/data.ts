// Lectura pública de caballos desde Supabase (tabla public.caballos, ver supabase/schema.sql).
// Usa la anon key. Además del RLS, cada consulta filtra activo = true: un caballo oculto
// en el panel nunca debe llegar a la web aunque cambien las políticas.
import { cache } from "react";
import type { Caballo, Categoria } from "./caballos-types";
import type { Ancestor, Horse } from "./catalog";
import { supabase } from "./supabase";

// Pedigrí a 3 generaciones (padres, abuelos y bisabuelos).
const GENERATIONS = 3;

// Una fila de la vista public.pedigri (incluye ancestros no activos).
type PedigriRow = Pick<Caballo, "id" | "nombre" | "padre_id" | "madre_id">;

// cache(): una sola consulta por petición aunque la llamen generateMetadata y la página.
const getActivos = cache(async (): Promise<Caballo[]> => {
  const { data, error } = await supabase
    .from("caballos")
    .select("*")
    .eq("activo", true)
    .not("categoria", "is", null)
    .order("nombre");
  if (error) throw new Error(`No se pudieron cargar los caballos: ${error.message}`);
  return data as Caballo[];
});

// No es crítico: si falla, los caballos se muestran igual, solo sin pedigrí.
const getPedigri = cache(async (): Promise<Map<string, PedigriRow>> => {
  const { data, error } = await supabase
    .from("pedigri")
    .select("id, nombre, padre_id, madre_id")
    .limit(10000);
  if (error) {
    console.warn(`[data] Pedigrí no disponible (¿falta la vista public.pedigri?): ${error.message}`);
    return new Map();
  }
  return new Map((data as PedigriRow[]).map((row) => [row.id, row]));
});

function tree(
  id: string | null,
  pedigri: Map<string, PedigriRow>,
  depth: number,
  seen = new Set<string>(),
): Ancestor | null {
  const row = id ? pedigri.get(id) : undefined;
  if (!row || seen.has(row.id)) return null; // el Set evita ciclos por datos mal cargados
  const next = new Set(seen).add(row.id);
  const parent = (parentId: string | null) =>
    depth > 1 ? tree(parentId, pedigri, depth - 1, next) ?? undefined : undefined;
  return { name: row.nombre, sire: parent(row.padre_id), dam: parent(row.madre_id) };
}

function toHorse(c: Caballo, pedigri: Map<string, PedigriRow>): Horse {
  return {
    id: c.id,
    name: c.nombre,
    category: c.categoria!,
    sex: c.sexo,
    breed: c.raza,
    registry: c.registro,
    color: c.color,
    jumping: c.actualmente_saltando,
    birthYear: c.anio_nacimiento,
    height: c.alzada === null ? null : Number(c.alzada),
    behavior: c.comportamiento,
    priceLevel: c.precio_rango,
    image: c.imagen_url,
    portrait: c.retrato_url,
    gallery: c.galeria,
    sire: tree(c.padre_id, pedigri, GENERATIONS),
    dam: tree(c.madre_id, pedigri, GENERATIONS),
  };
}

const getHorses = cache(async (): Promise<Horse[]> => {
  const [activos, pedigri] = await Promise.all([getActivos(), getPedigri()]);
  return activos.map((c) => toHorse(c, pedigri));
});

const byCategory = async (...categorias: Categoria[]) =>
  (await getHorses()).filter((h) => categorias.includes(h.category));

export const getSementalesActivos = () => byCategory("Semental");
export const getYeguasActivas = () => byCategory("Yegua");
export const getPotrosActivos = () => byCategory("Potro", "Potranca");

// Caballos que se pueden consultar en Contacto (sementales y crías).
export const getEnVenta = () => byCategory("Semental", "Potro", "Potranca");

// null si no existe, no está publicado o no es de las categorías pedidas.
export async function getCaballoBySlug(
  id: string,
  categorias?: Categoria[],
): Promise<Horse | null> {
  const horse = (await getHorses()).find((h) => h.id === id);
  if (!horse || (categorias && !categorias.includes(horse.category))) return null;
  return horse;
}

// Lo que necesita una tarjeta del catálogo de sementales.
export type CatalogStallion = {
  id: string;
  name: string;
  breed: string | null;
  birthYear: number | null;
  image: string | null;
  priceLevel: number | null;
  behavior: string[];
  sireName: string | null; // padre
  damSireName: string | null; // abuelo materno
};

export async function getCatalogStallions(): Promise<CatalogStallion[]> {
  return (await getSementalesActivos()).map((h) => ({
    id: h.id,
    name: h.name,
    breed: h.breed,
    birthYear: h.birthYear,
    image: h.image,
    priceLevel: h.priceLevel,
    behavior: h.behavior,
    sireName: h.sire?.name ?? null,
    damSireName: h.dam?.sire?.name ?? null,
  }));
}
