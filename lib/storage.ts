// Biblioteca de medios (fotos y videos): Supabase Storage (bucket público "media")
// y Cloudflare R2 para lo que se sube desde el panel cuando está configurado.
// Solo se usa en el servidor: escribe con la service role key, que nunca llega al navegador.
import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, MAX_VIDEO_MB } from "./media-limits";
import { deleteR2Object, isPanelKey, isR2Configured, listR2Objects, r2PublicUrl } from "./r2";
import { slugify } from "./slug";
import { supabaseAdmin } from "./supabase-admin";

const BUCKET = "media";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};
const VIDEO_EXT = /\.(mp4|webm|mov)$/i;

export type MediaItem = {
  path: string;
  url: string;
  size: number;
  createdAt: string | null;
  kind: "image" | "video";
  store: "supabase" | "r2";
};

function bucket() {
  return supabaseAdmin().storage.from(BUCKET);
}

// Si el proyecto de Supabase aún no tiene el bucket, se crea al primer uso.
async function ensureBucket() {
  const { error } = await supabaseAdmin().storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_VIDEO_BYTES,
    allowedMimeTypes: [...Object.keys(ALLOWED_TYPES), ...Object.keys(VIDEO_TYPES)],
  });
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`No se pudo crear el bucket "${BUCKET}": ${error.message}`);
  }
}

const isMissingBucket = (error: { message: string } | null) =>
  !!error && /bucket not found|related resource does not exist/i.test(error.message);

// Nombre único: prefijo de tiempo (evita choques y ordena por fecha) + nombre limpio.
function storagePath(fileName: string, ext: string, fallback: string) {
  const base = slugify(fileName.replace(/\.[^.]+$/, "")) || fallback;
  return `${Date.now()}-${base}.${ext}`;
}

export async function uploadImage(file: File): Promise<MediaItem> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("Formato no permitido (usa JPG, PNG, WEBP o AVIF).");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("La imagen supera los 8 MB.");

  const path = storagePath(file.name, ext, "imagen");

  const storage = bucket();
  const upload = () =>
    storage.upload(path, file, { contentType: file.type, cacheControl: "31536000" });
  let { error } = await upload();
  if (isMissingBucket(error)) {
    await ensureBucket();
    ({ error } = await upload());
  }
  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);

  return {
    path,
    url: storage.getPublicUrl(path).data.publicUrl,
    size: file.size,
    createdAt: new Date().toISOString(),
    kind: "image",
    store: "supabase",
  };
}

// Los videos pesan más que el límite de las Server Actions: el servidor solo firma
// un permiso de subida y el navegador envía el archivo directo a Supabase.
export async function createVideoUpload(
  fileName: string,
  type: string,
  size: number,
): Promise<{ signedUrl: string; url: string }> {
  const ext = VIDEO_TYPES[type] ?? (VIDEO_EXT.exec(fileName)?.[1].toLowerCase() || null);
  if (!ext) throw new Error("Formato no permitido (usa MP4, MOV o WEBM).");
  if (size > MAX_VIDEO_BYTES) {
    throw new Error(`El video supera los ${MAX_VIDEO_MB} MB. Súbelo a YouTube y pega el enlace.`);
  }
  const path = storagePath(fileName, ext, "video");

  const storage = bucket();
  let { data, error } = await storage.createSignedUploadUrl(path);
  if (isMissingBucket(error)) {
    await ensureBucket();
    ({ data, error } = await storage.createSignedUploadUrl(path));
  }
  if (error || !data) throw new Error(`No se pudo preparar la subida: ${error?.message}`);
  return { signedUrl: data.signedUrl, url: storage.getPublicUrl(path).data.publicUrl };
}

export async function listMedia(): Promise<MediaItem[]> {
  const storage = bucket();
  const { data, error } = await storage.list("", {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (isMissingBucket(error)) return []; // aún no se ha subido nada
  if (error) throw new Error(`No se pudo leer el bucket: ${error.message}`);

  return data
    .filter((file) => file.id && !file.name.startsWith("."))
    .map((file) => ({
      path: file.name,
      url: storage.getPublicUrl(file.name).data.publicUrl,
      size: Number(file.metadata?.size ?? 0),
      createdAt: file.created_at ?? null,
      kind: VIDEO_EXT.test(file.name) ? ("video" as const) : ("image" as const),
      store: "supabase" as const,
    }));
}

export async function deleteImage(path: string): Promise<void> {
  // Solo archivos de la raíz del bucket, que es donde se sube todo.
  if (!path || path.includes("/") || path.startsWith(".")) {
    throw new Error("Ruta de imagen inválida.");
  }
  const { error } = await bucket().remove([path]);
  if (error) throw new Error(`No se pudo eliminar la imagen: ${error.message}`);
}

// Lo subido a Cloudflare R2 (carpetas fotos/ y videos/), con el mismo formato.
export async function listR2Media(): Promise<MediaItem[]> {
  if (!isR2Configured()) return [];
  const objects = await listR2Objects();
  return objects
    .filter((o) => isPanelKey(o.key))
    .map((o) => ({
      path: o.key,
      url: r2PublicUrl(o.key),
      size: o.size,
      createdAt: o.lastModified,
      kind: o.key.startsWith("videos/") ? ("video" as const) : ("image" as const),
      store: "r2" as const,
    }));
}

export async function deleteR2Media(key: string): Promise<void> {
  if (!isPanelKey(key)) throw new Error("Ruta de archivo inválida.");
  await deleteR2Object(key);
}
