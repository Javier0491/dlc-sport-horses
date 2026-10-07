import { uploadMedia } from "@/app/(admin)/admin/actions";
import { prepareImage } from "@/lib/prepare-image";

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

// Acepta también HEIC/HEIF (iPhone): el navegador que sepa leerlas las convierte.
export const IMAGE_ACCEPT = "image/*";
