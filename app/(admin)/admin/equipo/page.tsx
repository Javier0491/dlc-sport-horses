import Image from "next/image";
import Link from "next/link";
import { areaLabel, iniciales, listEquipo, type Miembro } from "@/lib/equipo";
import { isAllowedImageUrl } from "@/lib/image-url";

export default async function EquipoAdmin() {
  let equipo: Miembro[] = [];
  let loadError: string | null = null;
  try {
    equipo = await listEquipo();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Error al leer la base de datos.";
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Equipo</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Dirección, equipo médico y fotografía. Se muestran en{" "}
            <Link href="/equipo" target="_blank" className="underline hover:text-dlc-negro">
              /equipo
            </Link>{" "}
            en este orden.
          </p>
        </div>
        <Link
          href="/admin/equipo/nuevo"
          className="rounded-md bg-dlc-negro px-5 py-3 text-sm font-medium text-dlc-marfil transition-colors hover:bg-dlc-cuero"
        >
          + Agregar persona
        </Link>
      </div>

      {loadError ? (
        <p className="mt-8 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </p>
      ) : equipo.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
          Todavía no hay nadie en el equipo. Usa «+ Agregar persona» para empezar.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Puesto</th>
                <th className="px-4 py-3 font-medium">Área</th>
                <th className="px-4 py-3 font-medium">Orden</th>
                <th className="px-4 py-3 font-medium">Web</th>
                <th className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {equipo.map((m) => (
                <tr key={m.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/equipo/${m.id}`} className="flex items-center gap-3 hover:text-dlc-cuero">
                      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-dlc-arena text-[11px] text-dlc-cuero">
                        {m.foto_url && isAllowedImageUrl(m.foto_url) ? (
                          <Image src={m.foto_url} alt="" fill sizes="36px" className="object-cover" />
                        ) : (
                          iniciales(m.nombre)
                        )}
                      </span>
                      {m.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{m.puesto}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-600">{areaLabel(m.area)}</td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">{m.orden}</td>
                  <td className="px-4 py-3 text-neutral-600">{m.activo ? "Visible" : "Oculto"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/equipo/${m.id}`}
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
