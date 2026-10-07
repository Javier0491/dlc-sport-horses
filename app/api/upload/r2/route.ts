import { isAdmin } from "@/lib/admin-auth";
import { MAX_R2_IMAGE_BYTES, MAX_R2_VIDEO_BYTES } from "@/lib/media-limits";
import { isR2Configured, presignUpload } from "@/lib/r2";
import { slugify } from "@/lib/slug";

// Firma una subida directa del navegador a Cloudflare R2. Solo para el panel.
// Respuestas: 200 { uploadUrl, publicUrl } · 503 si R2 no está configurado
// (el panel vuelve a Supabase Storage) · 4xx con { error } si se rechaza.
const TYPES: Record<string, { ext: string; folder: "fotos" | "videos"; max: number }> = {
  "image/jpeg": { ext: "jpg", folder: "fotos", max: MAX_R2_IMAGE_BYTES },
  "image/png": { ext: "png", folder: "fotos", max: MAX_R2_IMAGE_BYTES },
  "image/webp": { ext: "webp", folder: "fotos", max: MAX_R2_IMAGE_BYTES },
  "image/avif": { ext: "avif", folder: "fotos", max: MAX_R2_IMAGE_BYTES },
  "video/mp4": { ext: "mp4", folder: "videos", max: MAX_R2_VIDEO_BYTES },
  "video/webm": { ext: "webm", folder: "videos", max: MAX_R2_VIDEO_BYTES },
  "video/quicktime": { ext: "mov", folder: "videos", max: MAX_R2_VIDEO_BYTES },
};

const error = (message: string, status: number) => Response.json({ error: message }, { status });

export async function POST(request: Request) {
  if (!(await isAdmin())) return error("Tu sesión caducó: cierra sesión y vuelve a entrar al panel.", 401);
  if (!isR2Configured()) return error("R2 no está configurado.", 503);

  let body: { fileName?: unknown; contentType?: unknown; size?: unknown };
  try {
    body = await request.json();
  } catch {
    return error("Solicitud inválida.", 400);
  }
  const fileName = typeof body.fileName === "string" ? body.fileName.slice(0, 200) : "";
  const contentType = typeof body.contentType === "string" ? body.contentType : "";
  const size = typeof body.size === "number" ? body.size : NaN;

  const type = TYPES[contentType];
  if (!type) return error("Formato no permitido (fotos JPG, PNG, WEBP o AVIF; videos MP4, MOV o WEBM).", 415);
  if (!Number.isInteger(size) || size <= 0) return error("Tamaño de archivo inválido.", 400);
  if (size > type.max) {
    const mb = type.max / 1024 / 1024;
    return error(`El archivo supera los ${mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`}.`, 413);
  }

  // Prefijo de tiempo: evita choques de nombre y ordena por fecha de subida.
  const base = slugify(fileName.replace(/\.[^.]+$/, "")) || type.folder.slice(0, -1);
  const key = `${type.folder}/${Date.now()}-${base}.${type.ext}`;

  try {
    return Response.json(await presignUpload(key, contentType, size));
  } catch (err) {
    console.error("[r2] presign", err);
    return error("No se pudo preparar la subida a R2.", 500);
  }
}
