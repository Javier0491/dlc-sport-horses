import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en las variables de entorno.",
  );
}

// Esta clave lleva NEXT_PUBLIC_: Next.js la incrusta en el JavaScript del navegador
// en cuanto algún componente cliente la usa. Debe ser la pública (sb_publishable_… o
// el JWT "anon"); una secreta salta el RLS y daría acceso total a la base de datos.
function isSecretKey(key: string) {
  if (key.startsWith("sb_secret_")) return true;
  try {
    const payload = JSON.parse(Buffer.from(key.split(".")[1] ?? "", "base64url").toString());
    return payload.role === "service_role";
  } catch {
    return false;
  }
}

if (isSecretKey(supabaseAnonKey)) {
  const message =
    "NEXT_PUBLIC_SUPABASE_ANON_KEY contiene una clave SECRETA de Supabase. Usa la clave " +
    "pública (Supabase → Project Settings → API Keys → Publishable key).";
  // En producción no arranca; en desarrollo avisa para no cortar el trabajo.
  if (process.env.NODE_ENV === "production") throw new Error(message);
  console.warn(`[supabase] ${message}`);
}

// Next.js guarda las respuestas de fetch en su caché de datos y, sin esto, las de
// Supabase quedaban un año (y sobrevivían a cada build): la web no veía los cambios
// hechos directamente en Supabase. Con 60 s las páginas siguen siendo estáticas y
// rápidas; lo que se guarda desde el panel se publica al instante (revalidatePath).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 60 } }),
  },
});
