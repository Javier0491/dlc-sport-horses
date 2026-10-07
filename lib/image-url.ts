// Subdominio público r2.dev de un bucket de Cloudflare R2 (pub-<id>.r2.dev).
export const isR2Host = (hostname: string) => /^pub-[a-z0-9]+\.r2\.dev$/.test(hostname);

// Hosts de imagen que next/image acepta (deben coincidir con images.remotePatterns de next.config.ts).
// Se usa en el servidor para validar lo que se guarda y en el navegador para la vista previa.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

export function isAllowedImageUrl(value: string) {
  // Fotos locales de /public, p. ej. /caballos/hit-one-dlc.jpg
  if (value.startsWith("/") && !value.startsWith("//")) return true;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  if (url.hostname === "images.unsplash.com") return true;
  if (isR2Host(url.hostname)) return true;

  const isSupabase = supabaseHost
    ? url.hostname === supabaseHost
    : url.hostname.endsWith(".supabase.co");
  return isSupabase && url.pathname.startsWith("/storage/v1/object/public/");
}
