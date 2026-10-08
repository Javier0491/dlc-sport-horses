"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GallerySection } from "@/lib/catalog";
import { isVideoUrl } from "@/lib/video";
import ExpandingStrips from "./ExpandingStrips";

// Galería de la ficha: foto principal (3:2, el caballo completo) y retrato, y
// debajo las secciones («Primera Impresión», «Presencia»…) como franjas que se
// abren al pasar el cursor (o al tocarlas): su portada es la primera foto y,
// abiertas, muestran el texto y las miniaturas. Cualquier foto abre el visor a
// pantalla completa (flechas, teclado ← → Esc, deslizar en móvil). Las
// secciones pueden tener videos: se muestra su primer fotograma y se
// reproducen en el visor.

const MAX_MINIS = 6; // miniaturas por sección; el resto se ve en el visor

function Thumb({
  src,
  alt,
  sizes,
  onOpen,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  onOpen: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Ampliar: ${alt}`}
      className={`group relative block w-full overflow-hidden bg-dlc-negro ${className}`}
    >
      {isVideoUrl(src) ? (
        <video
          src={`${src}#t=0.1`}
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
      )}
      <span className="absolute inset-0 bg-dlc-negro/0 transition-colors duration-500 group-hover:bg-dlc-negro/25" />
      <span
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 group-hover:opacity-100 ${
          isVideoUrl(src) ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-dlc-oro/80 text-dlc-oro backdrop-blur-sm">
          {isVideoUrl(src) ? (
            <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13l10.5-6.5z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <circle cx="11" cy="11" r="6" />
              <path d="m20 20-4.5-4.5M11 8v6M8 11h6" />
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}

// Miniatura dentro de una franja abierta: abre el visor en esa foto o video.
function Mini({ src, label, onOpen }: { src: string; label: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      className="relative block h-12 w-16 overflow-hidden ring-1 ring-dlc-marfil/20 transition-all hover:ring-2 hover:ring-dlc-oro sm:h-14 sm:w-20"
    >
      {isVideoUrl(src) ? (
        <>
          <video src={`${src}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-dlc-negro/30 text-dlc-marfil">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13l10.5-6.5z" />
            </svg>
          </span>
        </>
      ) : (
        <Image src={src} alt="" fill sizes="80px" className="object-cover" />
      )}
    </button>
  );
}

// "4 fotos", "3 fotos · 1 video".
function countLabel(items: string[]) {
  const videos = items.filter(isVideoUrl).length;
  const photos = items.length - videos;
  return [
    photos && `${photos} ${photos === 1 ? "foto" : "fotos"}`,
    videos && `${videos} ${videos === 1 ? "video" : "videos"}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

export default function HorseGallery({
  name,
  main,
  portrait,
  sections,
}: {
  name: string;
  main: string | null;
  portrait: string | null;
  sections: GallerySection[];
}) {
  // Todas las fotos en orden para el visor (sin repetir).
  const images = [
    ...new Set([main, portrait, ...sections.flatMap((s) => s.photos)].filter((u): u is string => !!u)),
  ];

  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (step: number) => setIndex((i) => (i + step + images.length) % images.length),
    [images.length],
  );

  const openViewer = (src: string) => {
    setIndex(Math.max(0, images.indexOf(src)));
    dialog.current?.showModal();
  };

  // Flechas del teclado mientras el visor está abierto (Esc lo cierra el <dialog>).
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go]);


  if (images.length === 0) return null;

  return (
    <>
      {(main || portrait) && (
        <div className={`grid gap-3 ${main && portrait ? "md:grid-cols-[2fr_1fr]" : ""}`}>
          {main && (
            <Thumb
              src={main}
              alt={`${name}, foto principal`}
              sizes="(min-width: 768px) 66vw, 100vw"
              onOpen={() => openViewer(main)}
              className="aspect-[3/2]"
            />
          )}
          {portrait && (
            <Thumb
              src={portrait}
              alt={`${name}, retrato`}
              sizes="(min-width: 768px) 33vw, 100vw"
              onOpen={() => openViewer(portrait)}
              className={main ? "aspect-[3/4] md:aspect-auto md:h-full" : "aspect-[3/4] md:max-w-sm"}
            />
          )}
        </div>
      )}

      {sections.length > 0 && (
        <div className="mt-10">
          <ExpandingStrips
            sizes="(min-width: 768px) 70vw, 100vw"
            strips={sections.map((section, i) => ({
              key: section.key,
              label: section.label,
              image: section.photos[0] ?? null,
              content: (
                <>
                  <p className="text-[11px] uppercase tracking-[0.5em] text-dlc-oro">
                    {String(i + 1).padStart(2, "0")}
                    {section.photos.length > 0 && ` · ${countLabel(section.photos)}`}
                  </p>
                  <h3 className="mt-3 whitespace-nowrap font-serif text-3xl font-light text-dlc-marfil sm:text-5xl">
                    {section.label}
                  </h3>
                  <span className="mt-5 block h-px w-12 bg-dlc-oro" />
                  {section.text && (
                    <p className="mt-5 line-clamp-4 max-w-xl text-sm leading-7 text-dlc-marfil/80">
                      {section.text}
                    </p>
                  )}
                  {section.photos.length > 0 && (
                    <>
                      <ul className="mt-6 flex flex-wrap gap-2">
                        {section.photos.slice(0, MAX_MINIS).map((src, n) => (
                          <li key={src}>
                            <Mini
                              src={src}
                              label={`${isVideoUrl(src) ? "Ver video" : "Ampliar foto"} ${n + 1} de ${section.label}`}
                              onOpen={() => openViewer(src)}
                            />
                          </li>
                        ))}
                        {section.photos.length > MAX_MINIS && (
                          <li>
                            <button
                              type="button"
                              onClick={() => openViewer(section.photos[MAX_MINIS])}
                              aria-label={`Ver ${section.photos.length - MAX_MINIS} más de ${section.label}`}
                              className="flex h-12 w-16 items-center justify-center border border-dlc-marfil/30 text-xs text-dlc-marfil/80 transition-colors hover:border-dlc-oro hover:text-dlc-oro sm:h-14 sm:w-20"
                            >
                              +{section.photos.length - MAX_MINIS}
                            </button>
                          </li>
                        )}
                      </ul>
                      <button
                        type="button"
                        onClick={() => openViewer(section.photos[0])}
                        className="press mt-7 inline-block bg-dlc-oro px-7 py-3 text-[11px] font-medium uppercase tracking-[0.3em] text-dlc-negro hover:bg-dlc-marfil"
                      >
                        Ver galería
                      </button>
                    </>
                  )}
                </>
              ),
            }))}
          />
        </div>
      )}

      <dialog
        ref={dialog}
        aria-label={`Galería de ${name}`}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-dlc-negro/97 p-0 text-dlc-marfil backdrop:bg-black/80"
      >
        <div
          className="flex h-full flex-col"
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.4em] text-dlc-oro">
              {name} · <span className="tabular-nums">{index + 1} / {images.length}</span>
            </p>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="Cerrar galería"
              className="flex h-10 w-10 items-center justify-center text-2xl text-dlc-marfil/80 hover:text-dlc-oro"
            >
              ✕
            </button>
          </div>

          <div className="relative min-h-0 flex-1">
            {isVideoUrl(images[index]) ? (
              <video
                key={images[index]}
                src={images[index]}
                controls
                autoPlay
                playsInline
                aria-label={`${name}, video ${index + 1}`}
                className="absolute inset-0 h-full w-full animate-[fadeIn_.4s_ease-out] object-contain"
              />
            ) : (
              <Image
                key={images[index]}
                src={images[index]}
                alt={`${name}, foto ${index + 1}`}
                fill
                sizes="100vw"
                className="animate-[fadeIn_.4s_ease-out] object-contain"
              />
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Foto anterior"
                  className="absolute top-1/2 left-3 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-dlc-marfil/30 bg-dlc-negro/50 text-xl transition-colors hover:border-dlc-oro hover:text-dlc-oro sm:left-6"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Foto siguiente"
                  className="absolute top-1/2 right-3 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-dlc-marfil/30 bg-dlc-negro/50 text-xl transition-colors hover:border-dlc-oro hover:text-dlc-oro sm:right-6"
                >
                  →
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <ul className="flex justify-center gap-2 overflow-x-auto px-5 py-4">
              {images.map((src, i) => (
                <li key={src} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Ver ${isVideoUrl(src) ? "video" : "foto"} ${i + 1}`}
                    aria-current={i === index}
                    className={`relative block h-14 w-20 overflow-hidden transition-opacity ${
                      i === index ? "ring-2 ring-dlc-oro" : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    {isVideoUrl(src) ? (
                      <video src={`${src}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    ) : (
                      <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </>
  );
}
