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
  creado_en: string;
  actualizado_en: string;
};

// Lo que escribe el panel: la base de datos pone galeria, creado_en y actualizado_en.
export type CaballoInput = Omit<Caballo, "galeria" | "creado_en" | "actualizado_en">;

export type CaballoOpcion = Pick<Caballo, "id" | "nombre" | "categoria">;
