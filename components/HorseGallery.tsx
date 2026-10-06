"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// Mosaico de fotos (la primera grande) + visor a pantalla completa con flechas,
// teclado (← → Esc), deslizamiento en móvil y tira de miniaturas.
const VISIBLE = 5; // fotos en el mosaico; el resto se ve en el visor ("+N")

export default function HorseGallery({ images, name }: { images: string[]; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (step: number) => setIndex((i) => (i + step + images.length) % images.length),
    [images.length],
  );

  const open = (i: number) => {
    setIndex(i);
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
  const extra = images.length - VISIBLE;

  return (
    <>
      <ul className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] md:grid-cols-4">
        {images.slice(0, VISIBLE).map((src, i) => (
          <li key={src} className={i === 0 ? "col-span-2 row-span-2" : ""}>
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={`Ver foto ${i + 1} de ${images.length} de ${name}`}
              className="group relative block h-full w-full overflow-hidden bg-dlc-negro"
            >
              <Image
                src={src}
                alt={`${name}, foto ${i + 1}`}
                fill
                sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
              />
              <span className="absolute inset-0 bg-dlc-negro/0 transition-colors duration-500 group-hover:bg-dlc-negro/30" />
              {/* Lupa al pasar el ratón */}
              <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-dlc-oro/80 text-dlc-oro backdrop-blur-sm">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <circle cx="11" cy="11" r="6" />
                    <path d="m20 20-4.5-4.5M11 8v6M8 11h6" />
                  </svg>
                </span>
              </span>
              {i === VISIBLE - 1 && extra > 0 && (
                <span className="absolute inset-0 flex items-center justify-center bg-dlc-negro/60 font-serif text-3xl text-dlc-marfil">
                  +{extra}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

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
            <Image
              key={images[index]}
              src={images[index]}
              alt={`${name}, foto ${index + 1}`}
              fill
              sizes="100vw"
              className="animate-[fadeIn_.4s_ease-out] object-contain"
            />
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
                    aria-label={`Ver foto ${i + 1}`}
                    aria-current={i === index}
                    className={`relative block h-14 w-20 overflow-hidden transition-opacity ${
                      i === index ? "ring-2 ring-dlc-oro" : "opacity-50 hover:opacity-100"
                    }`}
                  >
                    <Image src={src} alt="" fill sizes="80px" className="object-cover" />
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
