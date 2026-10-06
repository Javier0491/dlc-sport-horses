// Módulo de concursos (tablas concursos y pruebas). Sin dependencias de servidor:
// lo usan las páginas del panel, los formularios y las Server Actions.

// Mismos valores que los CHECK de la base de datos (concursos_estado_check y
// pruebas_estado_check): cualquier otro lo rechaza Postgres.
export const ESTADOS_CONCURSO = [
  { value: "proximo", label: "Próximo" },
  { value: "activo", label: "En curso" },
  { value: "finalizado", label: "Finalizado" },
] as const;

export const ESTADOS_PRUEBA = [
  { value: "abierta", label: "Abierta" },
  { value: "en_curso", label: "En curso" },
  { value: "finalizada", label: "Finalizada" },
] as const;

export type EstadoConcurso = (typeof ESTADOS_CONCURSO)[number]["value"];
export type EstadoPrueba = (typeof ESTADOS_PRUEBA)[number]["value"];

export type Concurso = {
  id: string;
  nombre: string;
  fecha_inicio: string; // 'YYYY-MM-DD'
  fecha_fin: string;
  estado: string | null;
  imagen_url: string | null;
  livestream_url: string | null; // YouTube Live o Vimeo (ver lib/video.ts)
  created_at: string;
};

export type Prueba = {
  id: string;
  concurso_id: string | null;
  nombre: string;
  fecha: string; // 'YYYY-MM-DD'
  hora_inicio: string; // 'HH:MM:SS'
  estado: string | null;
  created_at: string;
};

export type ConcursoConPruebas = Concurso & { pruebas: Prueba[] };

export const estadoLabel = (
  lista: readonly { value: string; label: string }[],
  value: string | null,
) => lista.find((e) => e.value === value)?.label ?? value ?? "—";

// Las fechas de Postgres no tienen hora: se formatean en UTC para que la zona
// horaria del navegador no las mueva un día.
const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es-MX", { timeZone: "UTC", ...options });
const toDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

export const fechaLarga = (iso: string) =>
  fmt({ weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(toDate(iso));

// "5 – 7 nov 2026", o un solo día si inicio y fin coinciden.
export function rangoFechas(inicio: string, fin: string) {
  const corto = fmt({ day: "numeric", month: "short", year: "numeric" });
  if (inicio === fin) return corto.format(toDate(inicio));
  return `${fmt({ day: "numeric", month: "short" }).format(toDate(inicio))} – ${corto.format(toDate(fin))}`;
}

export const horaCorta = (time: string) => time.slice(0, 5); // '09:30:00' → '09:30'

// '16:30:00' → '4:30 PM' (formato del calendario público).
export function hora12(time: string) {
  const [h, m] = time.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

// Fecha de hoy en México ('YYYY-MM-DD'): decide qué concursos ya terminaron.
export const hoyEnMexico = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Mexico_City" }).format(new Date());
