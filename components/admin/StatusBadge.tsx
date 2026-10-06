import { estadoLabel } from "@/lib/concursos-types";

// Colores por estado de concursos y pruebas.
const STYLES: Record<string, string> = {
  proximo: "bg-sky-50 text-sky-800 ring-sky-200",
  abierta: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  activo: "bg-amber-50 text-amber-800 ring-amber-200",
  en_curso: "bg-amber-50 text-amber-800 ring-amber-200",
  finalizado: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  finalizada: "bg-neutral-100 text-neutral-600 ring-neutral-200",
};

export default function StatusBadge({
  value,
  estados,
}: {
  value: string | null;
  estados: readonly { value: string; label: string }[];
}) {
  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
        STYLES[value ?? ""] ?? "bg-neutral-100 text-neutral-700 ring-neutral-200"
      }`}
    >
      {estadoLabel(estados, value)}
    </span>
  );
}
