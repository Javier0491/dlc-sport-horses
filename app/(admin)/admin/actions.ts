"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_SECONDS,
  checkPassword,
  newSessionToken,
  requireAdmin,
} from "@/lib/admin-auth";
import {
  createVideoUpload,
  deleteImage,
  deleteR2Media,
  uploadImage,
  type MediaItem,
} from "@/lib/storage";
import {
  deleteCaballoRow,
  insertCaballo,
  parseCaballoForm,
  updateCaballoRow,
} from "@/lib/caballos";
import { getSeccion, parseConfiguracionForm, updateConfiguracionRow } from "@/lib/contenido";
import {
  deleteConcursoRow,
  deletePruebaRow,
  getConcursoFechas,
  getPruebaConcursoId,
  insertConcurso,
  insertPrueba,
  isUuid,
  parseConcursoForm,
  parsePruebaForm,
  updateConcursoRow,
  updatePruebaRow,
} from "@/lib/concursos";
import { deleteMiembroRow, insertMiembro, parseMiembroForm, updateMiembroRow } from "@/lib/equipo";

export type LoginState = { error: string | null };

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const token = newSessionToken();
  if (!token) return { error: "Falta ADMIN_PASSWORD en el servidor." };
  if (!checkPassword(password)) return { error: "Contraseña incorrecta." };

  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    // "/" y no "/admin": la ruta /api/upload/r2 también necesita la sesión.
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  });
  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function logout() {
  const jar = await cookies();
  jar.delete({ name: ADMIN_COOKIE, path: "/" });
  jar.delete({ name: ADMIN_COOKIE, path: "/admin" }); // sesiones de antes del cambio de ruta
  revalidatePath("/admin", "layout");
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const failure = (err: unknown): { ok: false; error: string } => ({
  ok: false,
  error: err instanceof Error ? err.message : "Error inesperado.",
});

export async function uploadMedia(formData: FormData): Promise<Result<MediaItem>> {
  try {
    await requireAdmin();
    const file = formData.get("file");
    if (!(file instanceof File)) throw new Error("No se recibió ningún archivo.");
    const item = await uploadImage(file);
    revalidatePath("/admin/media");
    return { ok: true, data: item };
  } catch (err) {
    return failure(err);
  }
}

export async function prepareVideoUpload(
  fileName: string,
  type: string,
  size: number,
): Promise<Result<{ signedUrl: string; url: string }>> {
  try {
    await requireAdmin();
    const upload = await createVideoUpload(String(fileName), String(type), Number(size));
    revalidatePath("/admin/media");
    return { ok: true, data: upload };
  } catch (err) {
    return failure(err);
  }
}

export async function deleteMedia(
  path: string,
  store: MediaItem["store"] = "supabase",
): Promise<Result<null>> {
  try {
    await requireAdmin();
    if (store === "r2") await deleteR2Media(String(path));
    else await deleteImage(path);
    revalidatePath("/admin/media");
    return { ok: true, data: null };
  } catch (err) {
    return failure(err);
  }
}

// ---------------------------------------------------------------------
// Caballos
// ---------------------------------------------------------------------

export type HorseFormState = { error: string | null };

// El sitio público lee de la tabla caballos: cada cambio en el panel lo revalida
// completo (portada, catálogos, fichas, simulador y contacto) además del propio panel.
const revalidateSite = () => revalidatePath("/", "layout");

const formFailure = (err: unknown): HorseFormState => ({
  error: err instanceof Error ? err.message : "Error inesperado.",
});

export async function createCaballo(
  _prev: HorseFormState,
  formData: FormData,
): Promise<HorseFormState> {
  try {
    await requireAdmin();
    await insertCaballo(parseCaballoForm(formData));
  } catch (err) {
    return formFailure(err);
  }
  // redirect lanza una excepción de control: va fuera del try.
  revalidateSite();
  redirect("/admin/caballos");
}

export async function updateCaballo(
  id: string,
  _prev: HorseFormState,
  formData: FormData,
): Promise<HorseFormState> {
  try {
    await requireAdmin();
    await updateCaballoRow(parseCaballoForm(formData, id));
  } catch (err) {
    return formFailure(err);
  }
  revalidateSite();
  redirect("/admin/caballos");
}

export async function deleteCaballo(id: string): Promise<Result<null>> {
  try {
    await requireAdmin();
    await deleteCaballoRow(id);
    revalidateSite();
    return { ok: true, data: null };
  } catch (err) {
    return failure(err);
  }
}

// ---------------------------------------------------------------------
// Contenido Web (tabla configuracion_sitio)
// ---------------------------------------------------------------------

export type ContentResult = { ok: true } | { ok: false; error: string };

// Guarda una sección (portada, legado, eventos) y revalida las páginas que la muestran.
export async function updateConfiguracion(
  id: string,
  formData: FormData,
): Promise<ContentResult> {
  try {
    await requireAdmin();
    if (!getSeccion(id)) throw new Error("Sección desconocida.");
    await updateConfiguracionRow(id, parseConfiguracionForm(id, formData));
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Error inesperado." };
  }
  revalidatePath("/");
  revalidatePath("/el-rancho");
  revalidatePath("/concursos");
  revalidatePath("/admin/contenido");
  return { ok: true };
}

// ---------------------------------------------------------------------
// Concursos y pruebas
// ---------------------------------------------------------------------

export type ConcursoFormState = { error: string | null; saved: boolean };

const concursoFailure = (err: unknown): ConcursoFormState => ({
  error: err instanceof Error ? err.message : "Error inesperado.",
  saved: false,
});

// Lista y fichas del panel (layout: incluye /admin/concursos/[id]) y el calendario
// público, para que cada cambio se vea en la web al instante.
const revalidateConcursos = () => {
  revalidatePath("/admin/concursos", "layout");
  revalidatePath("/concursos");
};

export async function createConcurso(
  _prev: ConcursoFormState,
  formData: FormData,
): Promise<ConcursoFormState> {
  let id: string;
  try {
    await requireAdmin();
    id = await insertConcurso(parseConcursoForm(formData));
  } catch (err) {
    return concursoFailure(err);
  }
  revalidateConcursos();
  // Directo a la ficha para empezar a cargar sus pruebas.
  redirect(`/admin/concursos/${id}`);
}

export async function updateConcurso(
  id: string,
  _prev: ConcursoFormState,
  formData: FormData,
): Promise<ConcursoFormState> {
  try {
    await requireAdmin();
    if (!isUuid(id)) throw new Error("Concurso inválido.");
    await updateConcursoRow(id, parseConcursoForm(formData));
  } catch (err) {
    return concursoFailure(err);
  }
  revalidateConcursos();
  return { error: null, saved: true };
}

export async function deleteConcurso(id: string): Promise<Result<null>> {
  try {
    await requireAdmin();
    if (!isUuid(id)) throw new Error("Concurso inválido.");
    await deleteConcursoRow(id);
  } catch (err) {
    return failure(err);
  }
  revalidateConcursos();
  redirect("/admin/concursos");
}

export async function createPrueba(concursoId: string, formData: FormData): Promise<Result<null>> {
  try {
    await requireAdmin();
    if (!isUuid(concursoId)) throw new Error("Concurso inválido.");
    const fechas = await getConcursoFechas(concursoId);
    await insertPrueba(concursoId, parsePruebaForm(formData, fechas));
    revalidateConcursos();
    return { ok: true, data: null };
  } catch (err) {
    return failure(err);
  }
}

export async function updatePrueba(id: string, formData: FormData): Promise<Result<null>> {
  try {
    await requireAdmin();
    if (!isUuid(id)) throw new Error("Prueba inválida.");
    const fechas = await getConcursoFechas(await getPruebaConcursoId(id));
    await updatePruebaRow(id, parsePruebaForm(formData, fechas));
    revalidateConcursos();
    return { ok: true, data: null };
  } catch (err) {
    return failure(err);
  }
}

export async function deletePrueba(id: string): Promise<Result<null>> {
  try {
    await requireAdmin();
    if (!isUuid(id)) throw new Error("Prueba inválida.");
    await deletePruebaRow(id);
    revalidateConcursos();
    return { ok: true, data: null };
  } catch (err) {
    return failure(err);
  }
}

// ---------------------------------------------------------------------
// Equipo
// ---------------------------------------------------------------------

export type MiembroFormState = { error: string | null; saved: boolean };

const revalidateEquipo = () => {
  revalidatePath("/admin/equipo", "layout");
  revalidatePath("/equipo");
};

export async function createMiembro(
  _prev: MiembroFormState,
  formData: FormData,
): Promise<MiembroFormState> {
  try {
    await requireAdmin();
    await insertMiembro(parseMiembroForm(formData));
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error inesperado.", saved: false };
  }
  revalidateEquipo();
  redirect("/admin/equipo");
}

export async function updateMiembro(
  id: string,
  _prev: MiembroFormState,
  formData: FormData,
): Promise<MiembroFormState> {
  try {
    await requireAdmin();
    if (!isUuid(id)) throw new Error("Ficha inválida.");
    await updateMiembroRow(id, parseMiembroForm(formData));
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error inesperado.", saved: false };
  }
  revalidateEquipo();
  return { error: null, saved: true };
}

export async function deleteMiembro(id: string): Promise<Result<null>> {
  try {
    await requireAdmin();
    if (!isUuid(id)) throw new Error("Ficha inválida.");
    await deleteMiembroRow(id);
  } catch (err) {
    return failure(err);
  }
  revalidateEquipo();
  redirect("/admin/equipo");
}
