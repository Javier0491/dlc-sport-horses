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
import { deleteImage, uploadImage, type MediaItem } from "@/lib/storage";
import {
  deleteCaballoRow,
  insertCaballo,
  parseCaballoForm,
  updateCaballoRow,
} from "@/lib/caballos";

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
    path: "/admin",
    maxAge: ADMIN_SESSION_SECONDS,
  });
  revalidatePath("/admin", "layout");
  return { error: null };
}

export async function logout() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
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

export async function deleteMedia(path: string): Promise<Result<null>> {
  try {
    await requireAdmin();
    await deleteImage(path);
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
