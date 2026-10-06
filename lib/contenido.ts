// Escritura de public.configuracion_sitio desde el panel (service role key). Solo servidor.
// La lectura pública está en lib/data.ts (getConfiguracion).
import { CAMPOS, getSeccion, type Configuracion } from "./contenido-types";
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
  if (getSeccion(id)?.video) {
    const video_url = String(form.get("video_url") ?? "").trim();
    if (video_url && !parseVideo(video_url)) {
      throw new Error("Video: pega un enlace de YouTube o Vimeo (o un .mp4 de Medios).");
    }
    data.datos = { video_url: video_url || null };
  }
  return data;
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
