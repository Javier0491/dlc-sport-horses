// Prepara en el navegador una foto antes de subirla: la reduce y la recomprime
// (y convierte HEIC u otros formatos que el navegador sepa leer).
// - "web" (Supabase, máx. 8 MB): 2560 px, para que las fotos de celular quepan.
// - "hd" (Cloudflare R2): 4096 px (4K) con más calidad, para fotos en alta resolución.
const PRESETS = {
  web: { maxSide: 2560, quality: 0.85, keepBelow: 1.5 * 1024 * 1024 },
  hd: { maxSide: 4096, quality: 0.92, keepBelow: 12 * 1024 * 1024 },
};
const UPLOADABLE = ["image/jpeg", "image/png", "image/webp", "image/avif"];

function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function prepareImage(file: File, preset: keyof typeof PRESETS = "web"): Promise<File> {
  const { maxSide, quality, keepBelow } = PRESETS[preset];
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file); // respeta la orientación EXIF
  } catch {
    if (UPLOADABLE.includes(file.type)) return file; // el servidor decidirá
    throw new Error("Formato no compatible (usa JPG, PNG, WEBP o AVIF).");
  }

  const { width, height } = bitmap;
  const scale = Math.min(1, maxSide / Math.max(width, height));
  if (scale === 1 && file.size <= keepBelow && UPLOADABLE.includes(file.type)) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // WEBP pesa menos; si el navegador no sabe codificarlo, devuelve PNG y usamos JPG.
  let blob = await encode(canvas, "image/webp", quality);
  if (!blob || blob.type !== "image/webp") blob = await encode(canvas, "image/jpeg", quality);
  if (!blob) throw new Error("No se pudo procesar la imagen.");

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const name = `${file.name.replace(/\.[^.]+$/, "") || "imagen"}.${ext}`;
  return new File([blob], name, { type: blob.type });
}
