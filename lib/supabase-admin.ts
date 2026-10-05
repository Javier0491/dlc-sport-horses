// Cliente de Supabase con la service role key: salta el RLS.
// Solo se usa en el servidor (Server Actions y páginas del panel); nunca llega al navegador.
import { createClient } from "@supabase/supabase-js";

// Se crea al usarse (no al importar) para que el build no falle sin las variables.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en las variables de entorno.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
