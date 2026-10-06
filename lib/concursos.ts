// Tablas concursos y pruebas desde el panel (service role key). Solo servidor.
import {
  ESTADOS_CONCURSO,
  ESTADOS_PRUEBA,
  type Concurso,
  type ConcursoConPruebas,
} from "./concursos-types";
import { isAllowedImageUrl } from "./image-url";
import { supabaseAdmin } from "./supabase-admin";
import { parseVideo } from "./video";

export * from "./concursos-types";

const db = () => supabaseAdmin();

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID.test(value);

function dbError(error: { code?: string; message: string }, action: string): Error {
  if (error.code === "PGRST204") {
    return new Error(
      "Falta actualizar la base de datos: ejecuta supabase/schema.sql en el SQL Editor de Supabase.",
    );
  }
  if (error.code === "23503") {
    return new Error(`No se pudo ${action}: tiene inscripciones registradas.`);
  }
  return new Error(`No se pudo ${action}: ${error.message}`);
}

// Próximos y en curso primero (del más cercano al más lejano); después los
// pasados, del más reciente al más antiguo.
export async function listConcursos(): Promise<(Concurso & { totalPruebas: number })[]> {
  const { data, error } = await db()
    .from("concursos")
    .select("*, pruebas(count)")
    .order("fecha_inicio");
  if (error) throw dbError(error, "leer los concursos");

  const today = new Date().toISOString().slice(0, 10);
  const rows = (data as (Concurso & { pruebas: { count: number }[] })[]).map(
    ({ pruebas, ...c }) => ({ ...c, totalPruebas: pruebas[0]?.count ?? 0 }),
  );
  const upcoming = rows.filter((c) => c.fecha_fin >= today);
  const past = rows.filter((c) => c.fecha_fin < today).reverse();
  return [...upcoming, ...past];
}

export async function getConcurso(id: string): Promise<ConcursoConPruebas | null> {
  if (!isUuid(id)) return null;
  const { data, error } = await db()
    .from("concursos")
    .select("*, pruebas(*)")
    .eq("id", id)
    .order("fecha", { referencedTable: "pruebas" })
    .order("hora_inicio", { referencedTable: "pruebas" })
    .maybeSingle();
  if (error) throw dbError(error, "leer el concurso");
  return data as ConcursoConPruebas | null;
}

// ---------------------------------------------------------------------
// Formularios → filas
// ---------------------------------------------------------------------

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

function required(form: FormData, key: string, label: string, max = 120) {
  const value = text(form, key);
  if (!value) throw new Error(`${label} es obligatorio.`);
  if (value.length > max) throw new Error(`${label}: máximo ${max} caracteres.`);
  return value;
}

function date(form: FormData, key: string, label: string) {
  const value = text(form, key);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new Error(`${label}: indica una fecha válida.`);
  }
  return value;
}

function oneOf(form: FormData, key: string, options: readonly { value: string }[], label: string) {
  const value = text(form, key);
  if (!options.some((o) => o.value === value)) throw new Error(`Elige un ${label} válido.`);
  return value;
}

export function parseConcursoForm(form: FormData) {
  const fecha_inicio = date(form, "fecha_inicio", "Fecha de inicio");
  const fecha_fin = date(form, "fecha_fin", "Fecha de fin");
  if (fecha_fin < fecha_inicio) {
    throw new Error("La fecha de fin no puede ser anterior a la de inicio.");
  }
  const imagen_url = text(form, "imagen_url") || null;
  if (imagen_url && !isAllowedImageUrl(imagen_url)) {
    throw new Error("Imagen: pega un enlace de la sección Medios (Supabase Storage).");
  }
  const livestream_url = text(form, "livestream_url") || null;
  if (livestream_url && (!parseVideo(livestream_url) || parseVideo(livestream_url)?.kind === "file")) {
    throw new Error("Transmisión en vivo: pega un enlace de YouTube o Vimeo.");
  }
  return {
    nombre: required(form, "nombre", "El nombre"),
    fecha_inicio,
    fecha_fin,
    estado: oneOf(form, "estado", ESTADOS_CONCURSO, "estado"),
    imagen_url,
    livestream_url,
  };
}

// La fecha de la prueba debe caer dentro de las fechas del concurso.
export function parsePruebaForm(form: FormData, concurso: Pick<Concurso, "fecha_inicio" | "fecha_fin">) {
  const fecha = date(form, "fecha", "Fecha");
  if (fecha < concurso.fecha_inicio || fecha > concurso.fecha_fin) {
    throw new Error("La fecha de la prueba debe estar dentro de las fechas del concurso.");
  }
  const hora = text(form, "hora_inicio");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora.slice(0, 5))) {
    throw new Error("Hora de inicio: indica una hora válida.");
  }
  return {
    nombre: required(form, "nombre", "El nombre"),
    fecha,
    hora_inicio: hora.slice(0, 5),
    estado: oneOf(form, "estado", ESTADOS_PRUEBA, "estado"),
  };
}

// ---------------------------------------------------------------------
// Escritura
// ---------------------------------------------------------------------

export async function insertConcurso(data: ReturnType<typeof parseConcursoForm>): Promise<string> {
  const { data: row, error } = await db().from("concursos").insert(data).select("id").single();
  if (error) throw dbError(error, "crear el concurso");
  return row.id as string;
}

export async function updateConcursoRow(id: string, data: ReturnType<typeof parseConcursoForm>) {
  // Las pruebas ya cargadas deben seguir cabiendo en las fechas nuevas.
  const { count, error: countError } = await db()
    .from("pruebas")
    .select("id", { count: "exact", head: true })
    .eq("concurso_id", id)
    .or(`fecha.lt.${data.fecha_inicio},fecha.gt.${data.fecha_fin}`);
  if (countError) throw dbError(countError, "revisar las pruebas");
  if (count) {
    throw new Error(
      `${count === 1 ? "Hay 1 prueba" : `Hay ${count} pruebas`} fuera de las fechas nuevas: cámbialas primero.`,
    );
  }

  const { data: rows, error } = await db().from("concursos").update(data).eq("id", id).select("id");
  if (error) throw dbError(error, "guardar el concurso");
  if (!rows.length) throw new Error("El concurso ya no existe.");
}

// Borra primero sus pruebas. Si alguna tiene inscripciones, la base de datos lo
// impide y no se borra nada.
export async function deleteConcursoRow(id: string) {
  const { error: pruebasError } = await db().from("pruebas").delete().eq("concurso_id", id);
  if (pruebasError) throw dbError(pruebasError, "eliminar el concurso");
  const { error } = await db().from("concursos").delete().eq("id", id);
  if (error) throw dbError(error, "eliminar el concurso");
}

export async function getConcursoFechas(id: string) {
  const { data, error } = await db()
    .from("concursos")
    .select("fecha_inicio, fecha_fin")
    .eq("id", id)
    .maybeSingle();
  if (error) throw dbError(error, "leer el concurso");
  if (!data) throw new Error("El concurso ya no existe.");
  return data as Pick<Concurso, "fecha_inicio" | "fecha_fin">;
}

export async function insertPrueba(concursoId: string, data: ReturnType<typeof parsePruebaForm>) {
  const { error } = await db().from("pruebas").insert({ ...data, concurso_id: concursoId });
  if (error) throw dbError(error, "crear la prueba");
}

export async function getPruebaConcursoId(id: string): Promise<string> {
  const { data, error } = await db().from("pruebas").select("concurso_id").eq("id", id).maybeSingle();
  if (error) throw dbError(error, "leer la prueba");
  if (!data?.concurso_id) throw new Error("La prueba ya no existe.");
  return data.concurso_id as string;
}

export async function updatePruebaRow(id: string, data: ReturnType<typeof parsePruebaForm>) {
  const { data: rows, error } = await db().from("pruebas").update(data).eq("id", id).select("id");
  if (error) throw dbError(error, "guardar la prueba");
  if (!rows.length) throw new Error("La prueba ya no existe.");
}

export async function deletePruebaRow(id: string) {
  const { error } = await db().from("pruebas").delete().eq("id", id);
  if (error) throw dbError(error, "eliminar la prueba");
}

