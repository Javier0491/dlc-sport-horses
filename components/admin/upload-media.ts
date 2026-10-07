import { prepareVideoUpload, uploadMedia } from "@/app/(admin)/admin/actions";
import { MAX_VIDEO_BYTES, MAX_VIDEO_MB } from "@/lib/media-limits";
import { prepareImage } from "@/lib/prepare-image";

// Acepta también HEIC/HEIF (iPhone): el navegador que sepa leerlas las convierte.
export const IMAGE_ACCEPT = "image/*";
export const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";

export const isImageFile = (f: File) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name);
export const isVideoFile = (f: File) => f.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(f.name);

// Optimiza la foto en el navegador y la sube a Medios (Supabase Storage).
// Devuelve la URL pública lista para guardar en el formulario.
export async function uploadImageFile(file: File): Promise<string> {
  const prepared = await prepareImage(file);
  const formData = new FormData();
  formData.append("file", prepared);
  let result: Awaited<ReturnType<typeof uploadMedia>>;
  try {
    result = await uploadMedia(formData);
  } catch {
    // Ej. archivo mayor que el límite de las Server Actions o sin conexión.
    throw new Error("No se pudo subir. Revisa tu conexión.");
  }
  if (!result.ok) throw new Error(result.error);
  return result.data.url;
}

// Sube un video directo del navegador a Supabase con un permiso firmado por el
// servidor (los videos no caben en una Server Action). Informa el progreso 0–1.
export async function uploadVideoFile(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(`El video supera los ${MAX_VIDEO_MB} MB. Súbelo a YouTube y pega el enlace.`);
  }
  const type = file.type || (/\.mov$/i.test(file.name) ? "video/quicktime" : "video/mp4");
  const ticket = await prepareVideoUpload(file.name, type, file.size).catch(() => null);
  if (!ticket) throw new Error("No se pudo subir. Revisa tu conexión.");
  if (!ticket.ok) throw new Error(ticket.error);

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", ticket.data.signedUrl);
    xhr.setRequestHeader("content-type", type);
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = `error ${xhr.status}`;
      try {
        message = JSON.parse(xhr.responseText).message ?? message;
      } catch {}
      reject(new Error(`No se pudo subir el video: ${message}`));
    };
    xhr.onerror = () => reject(new Error("No se pudo subir. Revisa tu conexión."));
    xhr.send(file);
  });
  return ticket.data.url;
}
