import type { Horse } from "@/lib/catalog";
import { parseVideo } from "@/lib/video";
import HorseGallery from "./HorseGallery";
import VideoPlayer from "./VideoPlayer";

// Banda oscura de la ficha: video del caballo y galería («Conoce a…»): foto
// principal + retrato y las secciones desplegables cargadas en el panel.
// No se muestra si no hay video, ni retrato, ni secciones (la portada ya
// enseña la foto principal).
export default function HorseMedia({ horse }: { horse: Horse }) {
  const video = parseVideo(horse.video);
  const sections = horse.gallery;
  if (!video && !horse.portrait && sections.length === 0) return null;
  const hasPhotos = Boolean(horse.image || horse.portrait || sections.length);

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

        {hasPhotos && (
          <div className={video ? "mt-6" : "mt-14"}>
            <HorseGallery
              name={horse.name}
              main={horse.image}
              portrait={horse.portrait}
              sections={sections}
            />
            <p className="mt-6 text-center text-[10px] uppercase tracking-[0.35em] text-dlc-marfil/40">
              {sections.length > 0 ? (
                <>
                  <span className="hidden md:inline">Pasa el cursor por cada sección para verla</span>
                  <span className="md:hidden">Toca cada sección para verla</span>
                  {" · toca una foto para ampliarla"}
                </>
              ) : (
                "Toca una foto para ampliarla"
              )}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
