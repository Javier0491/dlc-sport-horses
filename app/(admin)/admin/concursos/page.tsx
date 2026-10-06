import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import { ESTADOS_CONCURSO, listConcursos, rangoFechas } from "@/lib/concursos";

export default async function ConcursosAdmin() {
  let concursos: Awaited<ReturnType<typeof listConcursos>> = [];
  let loadError: string | null = null;
  try {
    concursos = await listConcursos();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Error al leer la base de datos.";
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Concursos</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Próximos primero; los pasados quedan al final.
          </p>
        </div>
        <Link
          href="/admin/concursos/nuevo"
          className="rounded-md bg-dlc-negro px-5 py-3 text-sm font-medium text-dlc-marfil transition-colors hover:bg-dlc-cuero"
        >
          + Nuevo Concurso
        </Link>
      </div>

      {loadError ? (
        <p className="mt-8 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </p>
      ) : concursos.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
          Todavía no hay concursos. Usa «+ Nuevo Concurso» para crear el primero.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Concurso</th>
                <th className="px-4 py-3 font-medium">Fechas</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Pruebas</th>
                <th className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {concursos.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/admin/concursos/${c.id}`} className="hover:text-dlc-cuero">
                      {c.nombre}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-neutral-600">
                    {rangoFechas(c.fecha_inicio, c.fecha_fin)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={c.estado} estados={ESTADOS_CONCURSO} />
                  </td>
                  <td className="px-4 py-3 tabular-nums text-neutral-600">{c.totalPruebas}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/concursos/${c.id}`}
                      className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
                    >
                      Abrir
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
