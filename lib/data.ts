// Lectura pública de caballos desde Supabase (tabla public.caballos, ver supabase/schema.sql).
// Usa la anon key. Además del RLS, cada consulta filtra activo = true: un caballo oculto
// en el panel nunca debe llegar a la web aunque cambien las políticas.
import { cache } from "react";
import { SECCIONES_GALERIA, type Caballo, type Categoria } from "./caballos-types";
import type { Ancestor, GallerySection, Horse, Offspring } from "./catalog";
import type { Configuracion } from "./contenido-types";
import { hoyEnMexico, type Concurso, type Prueba } from "./concursos-types";
import type { Miembro } from "./equipo-types";
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

// Secciones de la galería en su orden fijo. La galería anterior (sin secciones)
// se muestra en «Primera Impresión» hasta que se guarde el caballo en el panel.
function gallerySections(c: Caballo): GallerySection[] {
  const saved = c.galeria_secciones ?? {};
  return SECCIONES_GALERIA.flatMap(({ key, label }) => {
    const section = saved[key];
    const photos = [
      ...(section?.fotos ?? []),
      ...(key === "primera_impresion" ? (c.galeria ?? []) : []),
    ];
    const text = section?.texto?.trim() || null;
    return photos.length || text ? [{ key, label, text, photos: [...new Set(photos)] }] : [];
  });
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
    gallery: gallerySections(c),
    sire: tree(c.padre_id, pedigri, GENERATIONS),
    dam: tree(c.madre_id, pedigri, GENERATIONS),
    // "?? null": antes de ejecutar schema.sql estas columnas aún no existen.
    level: c.nivel ?? null,
    video: c.video_url ?? null,
    presale:
      c.preventa_activa && c.preventa_pareja
        ? { mare: c.preventa_pareja, year: c.preventa_anio ?? null }
        : null,
  };
}

const fichaHref = (c: Caballo) =>
  c.categoria === "Semental"
    ? `/reproductores/${c.id}`
    : c.categoria === "Potro" || c.categoria === "Potranca"
      ? `/potros/${c.id}`
      : null; // las yeguas no tienen ficha pública

// Hijos publicados de un caballo (por padre_id o madre_id) que compiten o tienen
// un nivel asignado. Los más jóvenes primero.
export async function getProgenie(id: string): Promise<Offspring[]> {
  return (await getActivos())
    .filter((c) => (c.padre_id === id || c.madre_id === id) && (c.actualmente_saltando || c.nivel))
    .sort((a, b) => (b.anio_nacimiento ?? 0) - (a.anio_nacimiento ?? 0) || a.nombre.localeCompare(b.nombre))
    .map((c) => ({
      id: c.id,
      name: c.nombre,
      birthYear: c.anio_nacimiento,
      level: c.nivel ?? null,
    video: c.video_url ?? null,
      jumping: c.actualmente_saltando,
      href: fichaHref(c),
    }));
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

// ---------------------------------------------------------------------
// Textos globales (tabla configuracion_sitio: 'portada', 'legado', 'eventos')
// ---------------------------------------------------------------------

// null si la fila no existe o Supabase falla: la página usa sus textos por defecto
// (nunca debe caerse por esto).
export const getConfiguracion = cache(async (id: string): Promise<Configuracion | null> => {
  const { data, error } = await supabase
    .from("configuracion_sitio")
    .select("id, titulo, subtitulo, descripcion, imagen_url, datos, updated_at")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.warn(`[data] No se pudo leer configuracion_sitio "${id}": ${error.message}`);
    return null;
  }
  return data as Configuracion | null;
});

// ---------------------------------------------------------------------
// Calendario de concursos (tablas concursos y pruebas)
// ---------------------------------------------------------------------

export type ConcursoPublico = Pick<
  Concurso,
  "id" | "nombre" | "fecha_inicio" | "fecha_fin" | "estado" | "imagen_url" | "livestream_url"
> & { pruebas: Pick<Prueba, "id" | "nombre" | "fecha" | "hora_inicio" | "estado">[] };

// Concursos 'proximo' o 'activo' que no han terminado, del más cercano al más
// lejano, con sus pruebas por fecha y hora. Si un concurso quedó en 'proximo'
// después de su fecha de fin, tampoco se muestra (no anunciar algo ya pasado).
// Si Supabase falla, la página muestra el aviso de calendario por publicar.
export async function getConcursosPublicos(): Promise<ConcursoPublico[]> {
  const { data, error } = await supabase
    .from("concursos")
    // "*" (no una lista de columnas): si falta alguna columna nueva en la base de
    // datos, la consulta sigue funcionando en vez de dejar el calendario vacío.
    .select("*, pruebas(id, nombre, fecha, hora_inicio, estado)")
    .in("estado", ["proximo", "activo"])
    .gte("fecha_fin", hoyEnMexico())
    .order("fecha_inicio")
    .order("fecha", { referencedTable: "pruebas" })
    .order("hora_inicio", { referencedTable: "pruebas" });
  if (error) {
    console.warn(`[data] No se pudieron leer los concursos: ${error.message}`);
    return [];
  }
  return (data as ConcursoPublico[]).map((c) => ({ ...c, livestream_url: c.livestream_url ?? null }));
}

// ---------------------------------------------------------------------
// Equipo (tabla equipo): solo las personas visibles
// ---------------------------------------------------------------------

export type MiembroPublico = Pick<Miembro, "id" | "nombre" | "puesto" | "area" | "foto_url" | "bio">;

// Si la tabla aún no existe o Supabase falla, la página muestra su aviso de «muy pronto».
export async function getEquipoPublico(): Promise<MiembroPublico[]> {
  const { data, error } = await supabase
    .from("equipo")
    .select("id, nombre, puesto, area, foto_url, bio")
    .eq("activo", true)
    .order("orden")
    .order("nombre");
  if (error) {
    console.warn(`[data] No se pudo leer el equipo: ${error.message}`);
    return [];
  }
  return data as MiembroPublico[];
}
