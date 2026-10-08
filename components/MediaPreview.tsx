import Image from "next/image";
import { mediaKind, youtubeThumb } from "@/lib/video";

// Vista previa que llena su contenedor (position: relative) para un elemento de
// galería: la foto, el primer fotograma de un video o la miniatura de YouTube.
export default function MediaPreview({
  src,
  sizes,
  className = "object-cover",
  unoptimized = false,
}: {
  src: string;
  sizes: string;
  className?: string;
  unoptimized?: boolean;
}) {
  const kind = mediaKind(src);
  if (kind === "video") {
    return (
      <video
        src={`${src}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full ${className}`}
      />
    );
  }
  const image = kind === "youtube" ? youtubeThumb(src) : src;
  if (!image) return null;
  return <Image src={image} alt="" fill sizes={sizes} unoptimized={unoptimized} className={className} />;
}

export function PlayBadge({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13l10.5-6.5z" />
    </svg>
  );
}
