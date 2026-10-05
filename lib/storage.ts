// Biblioteca de medios en Supabase Storage (bucket público "media").
// Solo se usa en el servidor: escribe con la service role key, que nunca llega al navegador.
import { slugify } from "./slug";
import { supabaseAdmin } from "./supabase-admin";

const BUCKET = "media";

export const MAX_MEDIA_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export type MediaItem = {
  path: string;
  url: string;
  size: number;
  createdAt: string | null;
};

function bucket() {
  return supabaseAdmin().storage.from(BUCKET);
}

export async function uploadImage(file: File): Promise<MediaItem> {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error("Formato no permitido (usa JPG, PNG, WEBP o AVIF).");
  if (file.size > MAX_MEDIA_BYTES) throw new Error("La imagen supera los 8 MB.");

  // Prefijo de tiempo: evita choques de nombre y ordena por fecha de subida.
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "imagen";
  const path = `${Date.now()}-${base}.${ext}`;

  const storage = bucket();
  const { error } = await storage.upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
  });
  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);

  return {
    path,
    url: storage.getPublicUrl(path).data.publicUrl,
    size: file.size,
    createdAt: new Date().toISOString(),
  };
}

export async function listImages(): Promise<MediaItem[]> {
  const storage = bucket();
  const { data, error } = await storage.list("", {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error) throw new Error(`No se pudo leer el bucket: ${error.message}`);

  return data
    .filter((file) => file.id && !file.name.startsWith("."))
    .map((file) => ({
      path: file.name,
      url: storage.getPublicUrl(file.name).data.publicUrl,
      size: Number(file.metadata?.size ?? 0),
      createdAt: file.created_at ?? null,
    }));
}

export async function deleteImage(path: string): Promise<void> {
  // Solo archivos de la raíz del bucket, que es donde sube uploadImage.
  if (!path || path.includes("/") || path.startsWith(".")) {
    throw new Error("Ruta de imagen inválida.");
  }
  const { error } = await bucket().remove([path]);
  if (error) throw new Error(`No se pudo eliminar la imagen: ${error.message}`);
}
