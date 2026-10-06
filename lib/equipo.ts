// Tabla equipo desde el panel (service role key). Solo servidor.
// La lectura pública está en lib/data.ts (getEquipoPublico).
import { isUuid } from "./concursos";
import { AREAS, type Miembro } from "./equipo-types";
import { isAllowedImageUrl } from "./image-url";
import { supabaseAdmin } from "./supabase-admin";

export * from "./equipo-types";
export { isUuid };

const db = () => supabaseAdmin();

function dbError(error: { code?: string; message: string }, action: string): Error {
  // PGRST205: la tabla no existe todavía; PGRST204: falta una columna.
  if (error.code === "PGRST205" || error.code === "PGRST204") {
    return new Error(
      "Falta actualizar la base de datos: ejecuta supabase/schema.sql en el SQL Editor de Supabase.",
    );
  }
  return new Error(`No se pudo ${action}: ${error.message}`);
}

// En el orden de la web: por área, después por «orden» y nombre.
export async function listEquipo(): Promise<Miembro[]> {
  const { data, error } = await db().from("equipo").select("*").order("orden").order("nombre");
  if (error) throw dbError(error, "leer el equipo");
  const rank = (m: Miembro) => AREAS.findIndex((a) => a.value === m.area);
  return (data as Miembro[]).sort((a, b) => rank(a) - rank(b));
}

export async function getMiembro(id: string): Promise<Miembro | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await db().from("equipo").select("*").eq("id", id).maybeSingle();
  if (error) throw dbError(error, "leer la ficha");
  return data as Miembro | null;
}

// ---------------------------------------------------------------------
// Formulario → fila
// ---------------------------------------------------------------------

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

function required(form: FormData, key: string, label: string, max = 120) {
  const value = text(form, key);
  if (!value) throw new Error(`${label} es obligatorio.`);
  if (value.length > max) throw new Error(`${label}: máximo ${max} caracteres.`);
  return value;
}

export function parseMiembroForm(form: FormData) {
  const area = text(form, "area");
  if (!AREAS.some((a) => a.value === area)) throw new Error("Elige un área válida.");

  const foto_url = text(form, "foto_url") || null;
  if (foto_url && !isAllowedImageUrl(foto_url)) {
    throw new Error("Foto: pega un enlace de la sección Medios (Supabase Storage).");
  }
  const bio = text(form, "bio") || null;
  if (bio && bio.length > 1000) throw new Error("Semblanza: máximo 1000 caracteres.");

  const orden = Number(text(form, "orden") || 0);
  if (!Number.isInteger(orden) || orden < 0 || orden > 999) {
    throw new Error("Orden: usa un número entero entre 0 y 999.");
  }

  return {
    nombre: required(form, "nombre", "El nombre"),
    puesto: required(form, "puesto", "El puesto"),
    area,
    foto_url,
    bio,
    orden,
    activo: form.get("activo") === "on",
  };
}

// ---------------------------------------------------------------------
// Escritura
// ---------------------------------------------------------------------

export async function insertMiembro(data: ReturnType<typeof parseMiembroForm>): Promise<string> {
  const { data: row, error } = await db().from("equipo").insert(data).select("id").single();
  if (error) throw dbError(error, "agregar a la persona");
  return row.id as string;
}

export async function updateMiembroRow(id: string, data: ReturnType<typeof parseMiembroForm>) {
  const { data: rows, error } = await db().from("equipo").update(data).eq("id", id).select("id");
  if (error) throw dbError(error, "guardar la ficha");
  if (!rows.length) throw new Error("La persona ya no existe.");
}

export async function deleteMiembroRow(id: string) {
  const { error } = await db().from("equipo").delete().eq("id", id);
  if (error) throw dbError(error, "eliminar a la persona");
}
