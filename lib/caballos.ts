// Tabla public.caballos (ver supabase/schema.sql). Solo servidor: usa la service role key.
import {
  CATEGORIAS,
  MAX_GALERIA,
  MAX_TEXTO_SECCION,
  SECCIONES_GALERIA,
  SEXOS,
  type Caballo,
  type CaballoInput,
  type CaballoOpcion,
  type GaleriaSecciones,
} from "./caballos-types";
import { isAllowedImageUrl } from "./image-url";
import { slugify } from "./slug";
import { supabaseAdmin } from "./supabase-admin";
import { parseVideo, VIDEO_HINT } from "./video";

export * from "./caballos-types";

const table = () => supabaseAdmin().from("caballos");

// Errores de Postgres traducidos para el cliente.
function dbError(error: { code?: string; message: string }, action: string): Error {
  switch (error.code) {
    case "PGRST204": // columna que la API no conoce
      return new Error(
        "Falta actualizar la base de datos: ejecuta supabase/schema.sql en el SQL Editor de Supabase.",
      );
    case "23505":
      return new Error("Ya existe un caballo con ese nombre.");
    case "23503":
      return new Error("El padre o la madre seleccionados ya no existen.");
    case "23514":
      return new Error("Algún dato está fuera de rango (año, alzada o precio).");
    default:
      return new Error(`No se pudo ${action}: ${error.message}`);
  }
}

// Caballos del catálogo (con categoría). Los ancestros solo existen para el pedigrí.
export async function listCaballos(): Promise<Caballo[]> {
  const { data, error } = await table()
    .select("*")
    .not("categoria", "is", null)
    .order("creado_en", { ascending: false })
    .order("nombre");
  if (error) throw dbError(error, "leer los caballos");
  return data as Caballo[];
}

export async function countAncestros(): Promise<number> {
  const { count, error } = await table()
    .select("id", { count: "exact", head: true })
    .is("categoria", null);
  if (error) throw dbError(error, "contar los ancestros");
  return count ?? 0;
}

// Todos los caballos (catálogo y ancestros) para elegir padre y madre.
export async function listOpciones(): Promise<CaballoOpcion[]> {
  const { data, error } = await table()
    .select("id, nombre, categoria")
    .order("nombre")
    .limit(5000);
  if (error) throw dbError(error, "leer la lista de padres");
  return data as CaballoOpcion[];
}

export async function getCaballo(id: string): Promise<Caballo | null> {
  const { data, error } = await table().select("*").eq("id", id).maybeSingle();
  if (error) throw dbError(error, "leer el caballo");
  return data as Caballo | null;
}

export async function insertCaballo(input: CaballoInput) {
  const { error } = await table().insert(input);
  if (error) throw dbError(error, "crear el caballo");
}

// El id del formulario de edición es el de la ruta, así que no cambia.
export async function updateCaballoRow(input: CaballoInput) {
  const { data, error } = await table().update(input).eq("id", input.id).select("id");
  if (error) throw dbError(error, "guardar los cambios");
  if (!data.length) throw new Error("El caballo ya no existe.");
}

export async function deleteCaballoRow(id: string) {
  const { error } = await table().delete().eq("id", id);
  if (error) throw dbError(error, "eliminar el caballo");
}

// ---------------------------------------------------------------------
// Formulario del panel → CaballoInput (mismas reglas que los CHECK de la tabla)
// ---------------------------------------------------------------------

const text = (form: FormData, key: string) => {
  const value = String(form.get(key) ?? "").trim();
  return value || null;
};

function number(form: FormData, key: string, label: string, min: number, max: number) {
  const raw = text(form, key)?.replace(",", ".");
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${label} debe estar entre ${min} y ${max}.`);
  }
  return value;
}

function oneOf<T extends string>(form: FormData, key: string, options: readonly T[]) {
  const value = text(form, key);
  return value && (options as readonly string[]).includes(value) ? (value as T) : null;
}

function imageUrl(form: FormData, key: string, label: string) {
  const value = text(form, key);
  if (value && !isAllowedImageUrl(value)) {
    throw new Error(`${label}: pega un enlace de la sección Medios (Supabase Storage).`);
  }
  return value;
}

// Cada sección de la galería llega como JSON (lista ordenada de URLs) desde el editor del panel.
function photoList(form: FormData, key: string, label: string): string[] {
  const unreadable = new Error(`${label}: las fotos no se pudieron leer. Recarga la página e inténtalo de nuevo.`);
  let urls: unknown;
  try {
    urls = JSON.parse(String(form.get(key) ?? "[]"));
  } catch {
    throw unreadable;
  }
  if (!Array.isArray(urls) || urls.some((u) => typeof u !== "string")) throw unreadable;
  const unique = [...new Set(urls.map((u: string) => u.trim()).filter(Boolean))];
  if (unique.length > MAX_GALERIA) throw new Error(`${label}: admite hasta ${MAX_GALERIA} fotos.`);
  if (unique.some((u) => !isAllowedImageUrl(u))) {
    throw new Error(`${label}: hay una foto que no es de Medios. Quítala y vuelve a subirla.`);
  }
  return unique;
}

function gallerySections(form: FormData): GaleriaSecciones {
  const sections: GaleriaSecciones = {};
  for (const { key, label } of SECCIONES_GALERIA) {
    const fotos = photoList(form, `galeria_${key}`, label);
    const texto = text(form, `galeria_${key}_texto`);
    if (texto && texto.length > MAX_TEXTO_SECCION) {
      throw new Error(`${label}: el texto admite hasta ${MAX_TEXTO_SECCION} caracteres.`);
    }
    if (fotos.length || texto) sections[key] = { texto, fotos };
  }
  return sections;
}

function video(form: FormData) {
  const value = text(form, "video_url");
  if (value && !parseVideo(value)) throw new Error(`Video: ${VIDEO_HINT}`);
  return value;
}

// El id (slug) sale del nombre al crear y no cambia al editar.
export function parseCaballoForm(form: FormData, id?: string): CaballoInput {
  const nombre = text(form, "nombre");
  if (!nombre) throw new Error("El nombre es obligatorio.");
  if (nombre.length > 120) throw new Error("El nombre no puede pasar de 120 caracteres.");

  const slug = id ?? slugify(nombre);
  if (!slug) throw new Error("El nombre debe contener letras o números.");

  const categoria = oneOf(form, "categoria", CATEGORIAS);
  if (!categoria) throw new Error("Elige una categoría.");

  const anio = number(form, "anio_nacimiento", "El año de nacimiento", 1950, 2100);
  if (anio !== null && !Number.isInteger(anio)) throw new Error("El año debe ser un número entero.");

  const precio = number(form, "precio_rango", "El rango de precio", 1, 5);

  const nivel = text(form, "nivel");
  if (nivel && nivel.length > 40) throw new Error("El nivel no puede pasar de 40 caracteres.");

  // Preventa: solo tiene sentido con la yegua de la cruza indicada.
  const preventa_activa = form.get("preventa_activa") === "on";
  const preventa_pareja = text(form, "preventa_pareja");
  if (preventa_pareja && preventa_pareja.length > 120) {
    throw new Error("El nombre de la yegua de la cruza no puede pasar de 120 caracteres.");
  }
  if (preventa_activa && !preventa_pareja) {
    throw new Error("Para activar la preventa, indica con qué yegua será la cruza.");
  }
  const preventa_anio = number(form, "preventa_anio", "El año de la cruza", 2000, 2100);
  if (preventa_anio !== null && !Number.isInteger(preventa_anio)) {
    throw new Error("El año de la cruza debe ser un número entero.");
  }

  const padre_id = text(form, "padre_id");
  const madre_id = text(form, "madre_id");
  if (padre_id === slug || madre_id === slug) {
    throw new Error("Un caballo no puede ser su propio padre o madre.");
  }

  return {
    id: slug,
    nombre,
    categoria,
    sexo: oneOf(form, "sexo", SEXOS),
    raza: text(form, "raza"),
    registro: text(form, "registro"),
    color: text(form, "color"),
    actualmente_saltando: form.get("actualmente_saltando") === "on",
    anio_nacimiento: anio,
    alzada: number(form, "alzada", "La alzada (m)", 1, 2.2),
    comportamiento: (text(form, "comportamiento") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    precio_rango: precio === null ? null : Math.round(precio),
    imagen_url: imageUrl(form, "imagen_url", "Foto principal"),
    retrato_url: imageUrl(form, "retrato_url", "Retrato"),
    padre_id,
    madre_id,
    activo: form.get("activo") === "on",
    nivel,
    preventa_activa,
    preventa_pareja,
    preventa_anio,
    galeria: [], // la galería anterior ya va dentro de «Primera Impresión»
    galeria_secciones: gallerySections(form),
    video_url: video(form),
  };
}
