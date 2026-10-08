import Link from "next/link";
import type { GaleriaItem } from "@/lib/contenido-types";
import ExpandingStrips from "./ExpandingStrips";

// Galería expansiva de El Rancho: cada franja se abre y muestra título,
// categoría, etiquetas y botón. Las franjas se editan en /admin/contenido →
// Nuestro Legado.
export default function ExpandingGallery({ items }: { items: GaleriaItem[] }) {
  return (
    <ExpandingStrips
      sizes="(min-width: 768px) 60vw, 100vw"
      strips={items.map((item) => ({
        key: item.id,
        label: item.title,
        image: item.image_url,
        content: (
          <>
            <p className="text-[11px] uppercase tracking-[0.5em] text-dlc-oro">{item.category}</p>
            <h3 className="mt-3 whitespace-nowrap font-serif text-3xl font-light text-dlc-marfil sm:text-5xl">
              {item.title}
            </h3>
            <span className="mt-5 block h-px w-12 bg-dlc-oro" />
            {item.tags.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <li
                    key={tag}
                    className="border border-dlc-marfil/30 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-dlc-marfil/80"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            {item.href && (
              <Link
                href={item.href}
                className="press mt-7 inline-block bg-dlc-oro px-7 py-3 text-[11px] font-medium uppercase tracking-[0.3em] text-dlc-negro hover:bg-dlc-marfil"
              >
                Ver más
              </Link>
            )}
          </>
        ),
      }))}
    />
  );
}
