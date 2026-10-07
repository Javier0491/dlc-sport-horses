// Prepara en el navegador una foto antes de subirla a Medios: la reduce a un
// tamaño razonable para la web y la recomprime, de modo que las fotos de
// cámara o celular (a menudo de 10 MB o más) entren en el límite de 8 MB.
const MAX_SIDE = 2560;
const QUALITY = 0.85;
const KEEP_BELOW_BYTES = 1.5 * 1024 * 1024; // más pequeñas que esto se suben tal cual
const UPLOADABLE = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

export async function prepareImage(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file); // respeta la orientación EXIF
  } catch {
    if (UPLOADABLE.includes(file.type)) return file; // el servidor decidirá
    throw new Error("Formato no compatible (usa JPG, PNG, WEBP o AVIF).");
  }

  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  if (scale === 1 && file.size <= KEEP_BELOW_BYTES && UPLOADABLE.includes(file.type)) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // WEBP pesa menos; si el navegador no sabe codificarlo, devuelve PNG y usamos JPG.
  let blob = await encode(canvas, "image/webp");
  if (!blob || blob.type !== "image/webp") blob = await encode(canvas, "image/jpeg");
  if (!blob) throw new Error("No se pudo procesar la imagen.");

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const name = `${file.name.replace(/\.[^.]+$/, "") || "imagen"}.${ext}`;
  return new File([blob], name, { type: blob.type });
}
