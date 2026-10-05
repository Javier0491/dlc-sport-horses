// Acceso provisional al panel con una contraseña (ADMIN_PASSWORD).
// Sustituir por Supabase Auth cuando haya usuarios de verdad.
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "dlc_admin";
export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

// La cookie guarda un HMAC derivado de la contraseña, nunca la contraseña.
// Cambiar ADMIN_PASSWORD invalida todas las sesiones abiertas.
function sessionToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("dlc-admin-session").digest("hex");
}

const safeEqual = (a: string, b: string) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
};

export const isAdminConfigured = () => Boolean(process.env.ADMIN_PASSWORD);

export function checkPassword(candidate: string) {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password) && safeEqual(candidate, password!);
}

export function newSessionToken() {
  return sessionToken();
}

export async function isAdmin() {
  // Leer la cookie antes de cualquier return hace la ruta siempre dinámica
  // (si no, Next podría prerenderizar el login en el build).
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  const expected = sessionToken();
  return Boolean(value && expected) && safeEqual(value!, expected!);
}

// Las Server Actions son endpoints públicos: cada una debe llamar a esto.
export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("No autorizado.");
}
