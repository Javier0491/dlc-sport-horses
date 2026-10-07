import { prepareVideoUpload, uploadMedia } from "@/app/(admin)/admin/actions";
import { MAX_R2_VIDEO_BYTES, MAX_VIDEO_BYTES, MAX_VIDEO_MB } from "@/lib/media-limits";
import { prepareImage } from "@/lib/prepare-image";

// Subidas del panel. Destino principal: Cloudflare R2 (multimedia pesada, URL
// prefirmada de /api/upload/r2). Si R2 no está configurado en el servidor, se
// usa Supabase Storage como antes. En ambos casos se devuelve la URL pública
// que el formulario guarda en Supabase.

// Acepta también HEIC/HEIF (iPhone): el navegador que sepa leerlas las convierte.
export const IMAGE_ACCEPT = "image/*";
export const VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";

export const isImageFile = (f: File) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name);
export const isVideoFile = (f: File) => f.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(f.name);

// Límite de video que se muestra en el panel ("2 GB" con R2, "50 MB" con Supabase).
export function videoLimitLabel() {
  const mb = (r2Available === false ? MAX_VIDEO_BYTES : MAX_R2_VIDEO_BYTES) / 1024 / 1024;
  return mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`;
}

const OFFLINE = "No se pudo subir. Revisa tu conexión.";

// null = aún no se sabe; se descubre en la primera subida.
let r2Available: boolean | null = null;

type Progress = (fraction: number) => void;

// PUT del archivo a una URL firmada, con progreso (fetch no informa el avance).
function put(url: string, file: Blob, headers: Record<string, string>, onProgress?: Progress) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    for (const [name, value] of Object.entries(headers)) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let detail = `error ${xhr.status}`;
      try {
        detail = JSON.parse(xhr.responseText).message ?? detail;
      } catch {}
      reject(new Error(`No se pudo subir el archivo (${detail}).`));
    };
    xhr.onerror = () => reject(new Error(OFFLINE));
    xhr.send(file);
  });
}

// Sube a R2. Devuelve null si R2 no está disponible (para usar Supabase).
async function uploadToR2(file: File, contentType: string, onProgress?: Progress) {
  if (r2Available === false) return null;
  let res: Response;
  try {
    res = await fetch("/api/upload/r2", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fileName: file.name, contentType, size: file.size }),
    });
  } catch {
    throw new Error(OFFLINE);
  }
  if (res.status === 503) {
    r2Available = false;
    return null;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "No se pudo preparar la subida.");
  r2Available = true;

  await put(
    data.uploadUrl,
    file,
    { "content-type": contentType, "cache-control": "public, max-age=31536000, immutable" },
    onProgress,
  );
  return data.publicUrl as string;
}

// Optimiza la foto en el navegador y la sube. Devuelve la URL pública.
export async function uploadImageFile(file: File, onProgress?: Progress): Promise<string> {
  if (r2Available !== false) {
    const hd = await prepareImage(file, "hd");
    const url = await uploadToR2(hd, hd.type, onProgress);
    if (url) return url;
  }

  // Respaldo: Supabase Storage vía Server Action (máx. 8 MB).
  const prepared = await prepareImage(file, "web");
  const formData = new FormData();
  formData.append("file", prepared);
  let result: Awaited<ReturnType<typeof uploadMedia>>;
  try {
    result = await uploadMedia(formData);
  } catch {
    // Ej. archivo mayor que el límite de las Server Actions o sin conexión.
    throw new Error(OFFLINE);
  }
  if (!result.ok) throw new Error(result.error);
  return result.data.url;
}

// Sube un video directo del navegador al almacenamiento. Informa el progreso 0–1.
export async function uploadVideoFile(file: File, onProgress?: Progress): Promise<string> {
  const type = file.type || (/\.mov$/i.test(file.name) ? "video/quicktime" : /\.webm$/i.test(file.name) ? "video/webm" : "video/mp4");

  const url = await uploadToR2(file, type, onProgress);
  if (url) return url;

  // Respaldo: Supabase Storage con un permiso de subida firmado por el servidor.
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error(`El video supera los ${MAX_VIDEO_MB} MB. Súbelo a YouTube y pega el enlace.`);
  }
  const ticket = await prepareVideoUpload(file.name, type, file.size).catch(() => null);
  if (!ticket) throw new Error(OFFLINE);
  if (!ticket.ok) throw new Error(ticket.error);
  await put(
    ticket.data.signedUrl,
    file,
    { "content-type": type, "cache-control": "max-age=31536000", "x-upsert": "false" },
    onProgress,
  );
  return ticket.data.url;
}
