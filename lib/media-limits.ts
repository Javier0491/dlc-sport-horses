// Límites de subida compartidos por el panel (navegador) y lib/storage.ts (servidor).
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
// Límite por archivo del plan gratuito de Supabase; en Pro se puede subir
// (Storage → Settings) y cambiar aquí.
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_VIDEO_MB = MAX_VIDEO_BYTES / 1024 / 1024;
