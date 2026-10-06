import type { Horse } from "@/lib/catalog";
import { parseVideo } from "@/lib/video";
import HorseGallery from "./HorseGallery";
import VideoPlayer from "./VideoPlayer";

// Banda oscura de la ficha: video del caballo y galería interactiva.
// Fotos = principal + retrato + galería del panel (sin repetir). No se muestra si
// el caballo no tiene ni video ni al menos dos fotos.
export default function HorseMedia({ horse }: { horse: Horse }) {
  const video = parseVideo(horse.video);
  const images = [...new Set([horse.image, horse.portrait, ...horse.gallery].filter((u): u is string => !!u))];
  if (!video && images.length < 2) return null;

  return (
    <section className="bg-dlc-negro px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <p className="text-[11px] uppercase tracking-[0.5em] text-dlc-oro">
            {video ? "Video · Galería" : "Galería"}
          </p>
          <h2 className="mt-5 font-serif text-4xl font-light text-dlc-marfil sm:text-5xl">
            {video ? `${horse.name} en acción` : `Conoce a ${horse.name}`}
          </h2>
          <span className="mt-7 h-px w-16 bg-dlc-oro" />
        </div>

        {video && (
          <div className="mt-14">
            <VideoPlayer video={video} poster={horse.image ?? horse.portrait} title={`Video de ${horse.name}`} />
          </div>
        )}

        {images.length > 1 && (
          <div className="mt-6">
            <HorseGallery images={images} name={horse.name} />
            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.35em] text-dlc-marfil/40">
              {images.length} fotos · toca una para ampliarla
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
