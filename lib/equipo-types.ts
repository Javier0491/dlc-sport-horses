// Módulo de equipo (tabla public.equipo). Sin dependencias de servidor:
// lo usan la página /equipo, el panel y las Server Actions.

// Mismos valores que el CHECK equipo_area_check de la base de datos. El orden de
// la lista es el orden de las secciones en la web.
export const AREAS = [
  {
    value: "direccion",
    label: "Dirección",
    titulo: "Dirección",
    descripcion: "Quienes guían la visión y el día a día de Rancho DLC.",
  },
  {
    value: "medico",
    label: "Equipo médico",
    titulo: "Equipo Médico",
    descripcion: "Veterinarios y especialistas que cuidan la salud de cada caballo.",
  },
  {
    value: "fotografia",
    label: "Fotografía",
    titulo: "Fotografía",
    descripcion: "La mirada detrás de cada imagen de nuestros caballos.",
  },
] as const;

export type Area = (typeof AREAS)[number]["value"];

export type Miembro = {
  id: string;
  nombre: string;
  puesto: string;
  area: Area;
  foto_url: string | null;
  bio: string | null;
  orden: number;
  activo: boolean;
  created_at: string;
};

export const areaLabel = (value: string) => AREAS.find((a) => a.value === value)?.label ?? value;

// "María José Pérez" → "MP" (cuando la persona aún no tiene foto).
export const iniciales = (nombre: string) => {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
};
