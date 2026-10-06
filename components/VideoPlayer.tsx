"use client";

import Image from "next/image";
import { useState } from "react";
import { embedUrl, type Video } from "@/lib/video";

// Portada con botón de "play"; el reproductor (YouTube, Vimeo o <video>) se carga
// solo al pulsarlo, para no frenar la página con iframes pesados.
export default function VideoPlayer({
  video,
  poster,
  title,
  live = false,
  cta = live ? "Ver transmisión" : "Ver video",
}: {
  video: Video;
  poster?: string | null;
  title: string;
  live?: boolean;
  cta?: string;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-dlc-negro shadow-2xl shadow-black/40">
      {playing ? (
        video.kind === "file" ? (
          <video src={video.src} controls autoPlay playsInline className="h-full w-full bg-black" />
        ) : (
          <iframe
            src={embedUrl(video)}
            title={title}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        )
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`${cta}: ${title}`}
          className="group absolute inset-0 flex items-center justify-center"
        >
          {poster && (
            <Image
              src={poster}
              alt=""
              fill
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="object-cover opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:opacity-50"
            />
          )}
          <span className="absolute inset-0 bg-gradient-to-t from-dlc-negro/80 via-transparent to-dlc-negro/30" />

          {live && (
            <span className="absolute top-5 left-5 flex items-center gap-2 bg-red-600 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white">
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              En vivo
            </span>
          )}

          {/* Botón de play con anillo que "respira" */}
          <span className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
            <span className="absolute inset-0 animate-ping rounded-full bg-dlc-oro/30 [animation-duration:2.2s] motion-reduce:hidden" />
            <span className="relative flex h-full w-full items-center justify-center rounded-full bg-dlc-oro text-dlc-negro shadow-xl transition-transform duration-500 group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 sm:h-9 sm:w-9" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
              </svg>
            </span>
          </span>

          <span className="absolute inset-x-0 bottom-6 text-center text-[11px] uppercase tracking-[0.4em] text-dlc-marfil/85">
            {cta}
          </span>
        </button>
      )}
    </div>
  );
}
