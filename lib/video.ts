// Enlaces de video y transmisiones en vivo: YouTube, Vimeo o un archivo .mp4/.webm/.mov
// del bucket de Supabase. Sin dependencias de servidor (lo usan el panel y la web).
import { isAllowedImageUrl } from "./image-url";

export type Video =
  | { kind: "youtube"; embed: string }
  | { kind: "vimeo"; embed: string }
  | { kind: "file"; src: string };

const YT_ID = /^[\w-]{11}$/;

function youtube(url: URL): string | null {
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | null = null;

  if (host === "youtu.be") id = url.pathname.slice(1);
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const [, first, second] = url.pathname.split("/");
    if (first === "watch") id = url.searchParams.get("v");
    else if (["embed", "live", "shorts", "v"].includes(first)) id = second ?? null;
    // Enlace al canal en vivo: youtube.com/channel/UC…/live → siempre muestra la
    // transmisión activa del canal, sin cambiar el enlace en cada concurso.
    else if (first === "channel" && second?.startsWith("UC")) {
      return `https://www.youtube-nocookie.com/embed/live_stream?channel=${second}`;
    }
  }
  return id && YT_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

function vimeo(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);
  if (host === "vimeo.com" && parts[0] === "event" && /^\d+$/.test(parts[1] ?? "")) {
    return `https://vimeo.com/event/${parts[1]}/embed`; // transmisión en vivo de Vimeo
  }
  const id =
    host === "player.vimeo.com" && parts[0] === "video" ? parts[1] : host === "vimeo.com" ? parts[0] : null;
  return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
}

export function parseVideo(value: string | null | undefined): Video | null {
  const raw = value?.trim();
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;

  const yt = youtube(url);
  if (yt) return { kind: "youtube", embed: yt };
  const vm = vimeo(url);
  if (vm) return { kind: "vimeo", embed: vm };
  // Archivo propio subido al bucket público de Supabase.
  if (/\.(mp4|webm|mov)$/i.test(url.pathname) && isAllowedImageUrl(raw)) return { kind: "file", src: raw };
  return null;
}

// URL del reproductor con reproducción automática (se carga al pulsar "play").
export function embedUrl(video: Exclude<Video, { kind: "file" }>, autoplay = true) {
  const url = new URL(video.embed);
  if (autoplay) url.searchParams.set("autoplay", "1");
  if (video.kind === "youtube") url.searchParams.set("rel", "0");
  return url.toString();
}

// Archivo de video (no foto) en una lista de medios, p. ej. la galería del caballo.
export function isVideoUrl(value: string) {
  try {
    return /\.(mp4|webm|mov)$/i.test(new URL(value, "https://x").pathname);
  } catch {
    return false;
  }
}

// Elemento de una galería: foto, archivo de video o enlace de YouTube.
export type MediaKind = "image" | "video" | "youtube";

export function mediaKind(value: string): MediaKind {
  if (parseVideo(value)?.kind === "youtube") return "youtube";
  return isVideoUrl(value) ? "video" : "image";
}

// Miniatura de un video de YouTube (null para transmisiones de canal, que no tienen).
export function youtubeThumb(value: string): string | null {
  const video = parseVideo(value);
  const id = video?.kind === "youtube" ? /\/embed\/([\w-]{11})$/.exec(video.embed)?.[1] : null;
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export const VIDEO_HINT =
  "Arrastra un video (MP4, MOV o WEBM) o pega un enlace de YouTube o Vimeo.";
