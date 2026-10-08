import Image from "next/image";
import Link from "next/link";

// Galería expansiva (acordeón de fotos): franjas oscuras con el título en
// vertical; la que tiene el cursor (o el foco del teclado) se abre y muestra
// título, categoría, etiquetas y botón. En móvil las franjas van apiladas.

export type ExpandingGalleryItem = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  tags: string[];
  href?: string;
};

// Datos temporales para probar el efecto; luego vendrán del panel.
export const GALERIA_TEMPORAL: ExpandingGalleryItem[] = [
  {
    id: "la-chacona",
    title: "La Chacona",
    category: "El rancho",
    image_url: "/rancho/la-chacona.jpg",
    tags: ["Instalaciones", "Pistas", "Caballerizas"],
    href: "/contacto",
  },
  {
    id: "manada",
    title: "La manada",
    category: "En libertad",
    image_url: "/rancho/manada.jpg",
    tags: ["Potreros", "Crianza"],
  },
  {
    id: "rio",
    title: "El río",
    category: "Paisaje",
    image_url: "/rancho/rio.jpg",
    tags: ["Naturaleza", "Paseos"],
  },
  {
    id: "belcanto-dlc",
    title: "Belcanto DLC",
    category: "Potro",
    image_url: "/caballos/belcanto-dlc.jpg",
    tags: ["Conformación", "Salto"],
    href: "/potros/belcanto-dlc",
  },
  {
    id: "calisto-dlc",
    title: "Calisto DLC",
    category: "Potro",
    image_url: "/caballos/calisto-dlc.jpg",
    tags: ["Movimiento", "Presencia"],
    href: "/potros/calisto-dlc",
  },
  {
    id: "comanche-dlc",
    title: "Comanche DLC",
    category: "Potro",
    image_url: "/caballos/comanche-dlc.jpg",
    tags: ["Potencial", "Pista"],
    href: "/potros/comanche-dlc",
  },
];

export default function ExpandingGallery({ items = GALERIA_TEMPORAL }: { items?: ExpandingGalleryItem[] }) {
  return (
    <ul className="flex h-[720px] w-full flex-col gap-2 md:h-[600px] md:flex-row">
      {items.map((item, i) => (
        <li
          key={item.id}
          tabIndex={0}
          className="group relative min-h-0 min-w-0 flex-1 overflow-hidden bg-dlc-negro transition-all duration-700 ease-in-out outline-none hover:flex-[5] focus-within:flex-[5] focus-visible:ring-2 focus-visible:ring-dlc-oro"
        >
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-105 group-focus-within:scale-105"
          />
          {/* Overlay: oscuro en reposo, se aclara al abrirse */}
          <div className="absolute inset-0 bg-black/60 transition-colors duration-700 group-hover:bg-black/30 group-focus-within:bg-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-dlc-negro/90 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 group-focus-within:opacity-100" />

          {/* Colapsada: número y título en vertical */}
          <div className="absolute inset-0 flex items-center justify-center gap-4 transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0 md:flex-col">
            <span className="font-serif text-xs tabular-nums text-dlc-oro">{String(i + 1).padStart(2, "0")}</span>
            <span className="whitespace-nowrap font-serif text-lg font-light tracking-[0.2em] text-dlc-marfil uppercase md:[writing-mode:vertical-rl] md:rotate-180">
              {item.title}
            </span>
          </div>

          {/* Abierta: contenido completo */}
          <div className="absolute inset-x-0 bottom-0 p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:delay-200 group-focus-within:opacity-100 group-focus-within:delay-200 sm:p-10">
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
          </div>
        </li>
      ))}
    </ul>
  );
}
