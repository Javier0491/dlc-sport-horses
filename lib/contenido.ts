// Escritura de public.configuracion_sitio desde el panel (service role key). Solo servidor.
// La lectura pública está en lib/data.ts (getConfiguracion).
import { CAMPOS, GALERIA_LIMITES, getSeccion, type Configuracion, type GaleriaItem } from "./contenido-types";
import { isAllowedImageUrl } from "./image-url";
import { supabaseAdmin } from "./supabase-admin";
import { parseVideo } from "./video";

export * from "./contenido-types";

const COLUMNS = "id, titulo, subtitulo, descripcion, imagen_url, datos, updated_at";

// Todas las secciones para el panel, indexadas por id.
export async function getConfiguracionesAdmin(): Promise<Map<string, Configuracion>> {
  const { data, error } = await supabaseAdmin().from("configuracion_sitio").select(COLUMNS);
  if (error) throw new Error(`No se pudo leer configuracion_sitio: ${error.message}`);
  return new Map((data as Configuracion[]).map((row) => [row.id, row]));
}

// Formulario → columnas. Solo se aceptan los campos editables (y el video si la sección lo tiene).
export function parseConfiguracionForm(id: string, form: FormData) {
  const data: Record<string, unknown> = {};
  for (const field of CAMPOS) {
    const value = String(form.get(field.name) ?? "").trim();
    if (value.length > field.maxLength) {
      throw new Error(`${field.label}: máximo ${field.maxLength} caracteres.`);
    }
    if (field.kind === "image" && value && !isAllowedImageUrl(value)) {
      throw new Error(`${field.label}: pega un enlace de la sección Medios (Supabase Storage).`);
    }
    data[field.name] = value || null;
  }
  // datos se reescribe completo: cada sección guarda solo sus propios extras.
  const seccion = getSeccion(id);
  const datos: Record<string, unknown> = {};
  if (seccion?.video) {
    const video_url = String(form.get("video_url") ?? "").trim();
    if (video_url && !parseVideo(video_url)) {
      throw new Error("Video: pega un enlace de YouTube o Vimeo (o un .mp4 de Medios).");
    }
    datos.video_url = video_url || null;
  }
  if (seccion?.galeria) datos.galeria = parseGaleria(form.get("galeria"));
  if (Object.keys(datos).length) data.datos = datos;
  return data;
}

// Enlace del botón: una página del sitio (/potros/…) o una dirección https.
function isAllowedHref(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

// La galería expansiva llega del editor como JSON (lista ordenada de franjas).
function parseGaleria(raw: FormDataEntryValue | null): GaleriaItem[] {
  const L = GALERIA_LIMITES;
  const unreadable = new Error("Galería: no se pudo leer. Recarga la página e inténtalo de nuevo.");
  let list: unknown;
  try {
    list = JSON.parse(String(raw ?? "[]"));
  } catch {
    throw unreadable;
  }
  if (!Array.isArray(list)) throw unreadable;
  if (list.length > L.items) throw new Error(`Galería: admite hasta ${L.items} franjas.`);

  return list.map((entry, i): GaleriaItem => {
    const n = `Galería, franja ${i + 1}`;
    const item = (entry ?? {}) as Record<string, unknown>;
    const str = (key: string) => (typeof item[key] === "string" ? (item[key] as string).trim() : "");
    const title = str("title");
    const category = str("category");
    const image_url = str("image_url");
    const href = str("href");
    const tags = (Array.isArray(item.tags) ? item.tags : [])
      .filter((t): t is string => typeof t === "string")
      .map((t) => t.trim())
      .filter(Boolean);

    if (!title) throw new Error(`${n}: falta el título.`);
    if (title.length > L.title) throw new Error(`${n}: el título admite hasta ${L.title} caracteres.`);
    if (category.length > L.category) throw new Error(`${n}: la categoría admite hasta ${L.category} caracteres.`);
    if (!image_url) throw new Error(`${n} («${title}»): falta la foto.`);
    if (!isAllowedImageUrl(image_url)) throw new Error(`${n} («${title}»): la foto no es de Medios. Vuelve a subirla.`);
    if (tags.length > L.tags) throw new Error(`${n} («${title}»): admite hasta ${L.tags} etiquetas.`);
    if (tags.some((t) => t.length > L.tag)) throw new Error(`${n} («${title}»): cada etiqueta admite hasta ${L.tag} caracteres.`);
    if (href && (href.length > L.href || !isAllowedHref(href))) {
      throw new Error(`${n} («${title}»): el enlace debe empezar con / (p. ej. /potros) o con https://.`);
    }

    const id = /^[\w-]{1,60}$/.test(str("id")) ? str("id") : `franja-${i + 1}`;
    return { id, title, category, image_url, tags, ...(href ? { href } : {}) };
  });
}

export async function updateConfiguracionRow(id: string, data: Record<string, unknown>) {
  const { data: rows, error } = await supabaseAdmin()
    .from("configuracion_sitio")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");
  if (error) throw new Error(`No se pudo guardar: ${error.message}`);
  if (!rows.length) throw new Error(`La sección "${id}" no existe en configuracion_sitio.`);
}
