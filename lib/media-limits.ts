// Límites de subida compartidos por el panel (navegador) y el servidor.

// Supabase Storage (respaldo si R2 no está configurado).
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
// Límite por archivo del plan gratuito de Supabase.
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_VIDEO_MB = MAX_VIDEO_BYTES / 1024 / 1024;

// Cloudflare R2: multimedia pesada. Una subida directa (PUT) admite hasta 5 GB.
export const MAX_R2_IMAGE_BYTES = 50 * 1024 * 1024;
export const MAX_R2_VIDEO_BYTES = 2 * 1024 * 1024 * 1024;
