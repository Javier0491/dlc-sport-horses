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
  galeria: string[]; // galería anterior (sin secciones); se pasa a «Primera Impresión» al guardar
  galeria_secciones: GaleriaSecciones | null; // null/ausente antes de ejecutar schema.sql
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

// Galería de la ficha, dividida en secciones desplegables para no saturarla.
// El texto de cada sección es opcional; la sugerencia orienta qué fotos van ahí.
export const SECCIONES_GALERIA = [
  {
    key: "primera_impresion",
    label: "Primera Impresión",
    sugerencia: "Fotos de conformación: de perfil, de frente y de cuerpo completo.",
  },
  {
    key: "presencia",
    label: "Presencia",
    sugerencia: "Retratos, la cabeza, su actitud, en libertad o en la manada.",
  },
  {
    key: "potencial",
    label: "Potencial",
    sugerencia: "Movimiento, salto en libertad, trabajo y entrenamiento.",
  },
  {
    key: "escenario",
    label: "Su escenario",
    sugerencia: "En pista y en concursos: recorridos, premiaciones, competencias.",
  },
] as const;

export type SeccionGaleriaKey = (typeof SECCIONES_GALERIA)[number]["key"];
export type SeccionGaleria = { texto: string | null; fotos: string[] };
export type GaleriaSecciones = Partial<Record<SeccionGaleriaKey, SeccionGaleria>>;

// Fotos por sección de la galería (además de la principal y el retrato).
export const MAX_GALERIA = 12;
export const MAX_TEXTO_SECCION = 400;

export type CaballoOpcion = Pick<Caballo, "id" | "nombre" | "categoria">;
