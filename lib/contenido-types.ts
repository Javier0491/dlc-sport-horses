// Textos globales del sitio (tabla public.configuracion_sitio). Sin dependencias de
// servidor: lo usan las páginas, el formulario del panel y la Server Action.

export type Configuracion = {
  id: string;
  titulo: string | null;
  subtitulo: string | null;
  descripcion: string | null;
  imagen_url: string | null;
  // Columna jsonb para extras: video de Eventos y galería expansiva de Nuestro Legado.
  datos: { video_url?: string | null; galeria?: GaleriaItem[] } | null;
  updated_at: string | null;
};

// Una franja de la galería expansiva de El Rancho (components/ExpandingGallery.tsx).
export type GaleriaItem = {
  id: string;
  title: string;
  category: string;
  image_url: string;
  tags: string[];
  href?: string; // botón «Ver más» (opcional)
};

export const GALERIA_LIMITES = { items: 8, title: 40, category: 40, tags: 4, tag: 24, href: 300 };

export type Campo = "titulo" | "subtitulo" | "descripcion" | "imagen_url";

export const CAMPOS: { name: Campo; label: string; kind: "text" | "textarea" | "image"; maxLength: number }[] = [
  { name: "titulo", label: "Título", kind: "text", maxLength: 80 },
  { name: "subtitulo", label: "Subtítulo", kind: "text", maxLength: 160 },
  { name: "descripcion", label: "Descripción", kind: "textarea", maxLength: 2000 },
  { name: "imagen_url", label: "URL de la imagen", kind: "image", maxLength: 500 },
];

export type Seccion = {
  id: "portada" | "legado" | "eventos";
  label: string; // pestaña del panel
  page: { href: string; name: string }; // dónde se ve en el sitio
  hints: Record<Campo, string>; // dónde aparece cada campo
  video?: string; // si existe, la sección tiene campo de video (se guarda en datos.video_url)
  galeria?: string; // si existe, la sección tiene galería expansiva (se guarda en datos.galeria)
};

export const SECCIONES: Seccion[] = [
  {
    id: "portada",
    label: "Portada",
    page: { href: "/", name: "Inicio" },
    hints: {
      titulo: "El titular grande del inicio.",
      subtitulo: "Línea en mayúsculas debajo del titular.",
      descripcion: "Frase corta opcional debajo del subtítulo.",
      imagen_url: "Fondo del inicio. Vacío = se usa la imagen actual.",
    },
  },
  {
    id: "legado",
    label: "Nuestro Legado",
    page: { href: "/el-rancho", name: "El Rancho" },
    hints: {
      titulo: "Título de la página El Rancho y de la sección Nuestro Legado del inicio.",
      subtitulo: "Frase en cursiva debajo del título.",
      descripcion: "Historia del rancho. Deja una línea en blanco para separar párrafos.",
      imagen_url: "Foto principal de la página El Rancho. Vacío = foto de La Chacona.",
    },
    galeria:
      "Galería «Vida en La Chacona» de la página El Rancho. Cada franja se abre al pasar el cursor. Sin franjas, la sección no aparece.",
  },
  {
    id: "eventos",
    label: "Eventos",
    page: { href: "/concursos", name: "Concursos" },
    hints: {
      titulo: "Título de la página Concursos.",
      subtitulo: "Frase en cursiva debajo del título.",
      descripcion: "Texto de introducción del calendario.",
      imagen_url: "Portada del video (opcional). Vacío = fondo negro.",
    },
    video: "Video que aparece en la página Concursos, debajo de la introducción. Vacío = sin video.",
  },
];

export const getSeccion = (id: string) => SECCIONES.find((s) => s.id === id);

// Textos por defecto: la web los usa si un campo está vacío en el panel o si
// Supabase no responde, para que ninguna página quede en blanco.
export const POR_DEFECTO = {
  portada: {
    titulo: "Rancho DLC",
    subtitulo: "Excelencia en Genética Equina y Alto Rendimiento",
    imagen_url: "https://images.unsplash.com/photo-1450052590821-8bf91254a353",
  },
  legado: {
    titulo: "Nuestro Legado",
    subtitulo: "Tradición, cuidado y pasión.",
    descripcion:
      "En el corazón de Jalisco, la tradición ecuestre se vive con paciencia y respeto. Cada potro que nace en Rancho DLC recibe el mismo cuidado que nos enseñaron quienes vinieron antes: atención diaria, entrenamiento sin prisa y una pasión inquebrantable por el alto rendimiento.",
    imagen_url: "/rancho/la-chacona.jpg",
    // Se muestra hasta que se guarde la galería en el panel por primera vez.
    galeria: [
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
    ] satisfies GaleriaItem[] as GaleriaItem[],
  },
  eventos: {
    titulo: "Concursos",
    descripcion:
      "Las pistas donde nuestra genética demuestra su valor. Próximas citas de la temporada.",
  },
};
