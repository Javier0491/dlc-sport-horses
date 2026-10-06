// Tipos y opciones de la tabla caballos, sin dependencias de servidor (los usa el formulario).
export const CATEGORIAS = ["Semental", "Yegua", "Potro", "Potranca"] as const;
export const SEXOS = ["Entero", "Castrado", "Yegua"] as const;

export type Categoria = (typeof CATEGORIAS)[number];
export type Sexo = (typeof SEXOS)[number];

export type Caballo = {
  id: string;
  nombre: string;
  categoria: Categoria | null; // null = ancestro externo (solo pedigrí)
  sexo: Sexo | null;
  raza: string | null;
  registro: string | null;
  color: string | null;
  actualmente_saltando: boolean;
  anio_nacimiento: number | null;
  alzada: number | null;
  comportamiento: string[];
  precio_rango: number | null;
  imagen_url: string | null;
  retrato_url: string | null;
  galeria: string[];
  padre_id: string | null;
  madre_id: string | null;
  activo: boolean;
  nivel: string | null; // nivel deportivo actual: '1.30 m', 'Jóvenes caballos'
  preventa_activa: boolean; // anuncia una cruza futura en la ficha del semental
  preventa_pareja: string | null; // yegua de esa cruza
  preventa_anio: number | null; // año proyectado del potro
  video_url: string | null; // YouTube, Vimeo o .mp4 (ver lib/video.ts)
  creado_en: string;
  actualizado_en: string;
};

// Lo que escribe el panel: la base de datos pone creado_en y actualizado_en.
export type CaballoInput = Omit<Caballo, "creado_en" | "actualizado_en">;

// Fotos de la galería de un caballo (además de la principal y el retrato).
export const MAX_GALERIA = 24;

export type CaballoOpcion = Pick<Caballo, "id" | "nombre" | "categoria">;
