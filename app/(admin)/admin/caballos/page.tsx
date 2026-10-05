import Image from "next/image";
import Link from "next/link";
import DeleteHorseButton from "@/components/admin/DeleteHorseButton";
import { countAncestros, listCaballos, type Caballo, type Categoria } from "@/lib/caballos";
import { isAllowedImageUrl } from "@/lib/image-url";

const categoryStyles: Record<Categoria, string> = {
  Semental: "bg-amber-50 text-amber-800 ring-amber-200",
  Yegua: "bg-rose-50 text-rose-800 ring-rose-200",
  Potro: "bg-sky-50 text-sky-800 ring-sky-200",
  Potranca: "bg-violet-50 text-violet-800 ring-violet-200",
};

function Thumbnail({ caballo }: { caballo: Caballo }) {
  const src = caballo.imagen_url;
  if (!src || !isAllowedImageUrl(src)) {
    return (
      <div className="flex h-14 w-14 items-center justify-center rounded-md bg-neutral-100 text-[10px] text-neutral-400">
        Sin foto
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={caballo.nombre}
      width={56}
      height={56}
      className="h-14 w-14 rounded-md object-cover"
    />
  );
}

export default async function CaballosAdmin() {
  let rows: Caballo[] = [];
  let ancestros = 0;
  let loadError: string | null = null;
  try {
    [rows, ancestros] = await Promise.all([listCaballos(), countAncestros()]);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Error al leer la base de datos.";
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Caballos</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {rows.length} caballos en el catálogo
            {ancestros > 0 && ` · ${ancestros} ancestros de pedigrí (no se listan)`}.
          </p>
        </div>
        <Link
          href="/admin/caballos/nuevo"
          className="rounded-md bg-dlc-negro px-5 py-3 text-sm font-medium text-dlc-marfil transition-colors hover:bg-dlc-cuero"
        >
          + Nuevo Caballo
        </Link>
      </div>

      {loadError ? (
        <p className="mt-8 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {loadError}
        </p>
      ) : rows.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-500">
          Todavía no hay caballos. Usa «+ Nuevo Caballo» para crear el primero.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border border-neutral-200">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Foto</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Raza</th>
                <th className="px-4 py-3 font-medium">Web</th>
                <th className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {rows.map((h) => (
                <tr key={h.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-2">
                    <Thumbnail caballo={h} />
                  </td>
                  <td className="px-4 py-2 font-medium">{h.nombre}</td>
                  <td className="px-4 py-2">
                    {h.categoria && (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${categoryStyles[h.categoria]}`}
                      >
                        {h.categoria}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-neutral-600">
                    {h.raza ?? <span className="text-neutral-400">—</span>}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {h.activo ? (
                      <span className="text-emerald-700">Publicado</span>
                    ) : (
                      <span className="text-neutral-400">Oculto</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/caballos/${h.id}`}
                        className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-100"
                      >
                        Editar
                      </Link>
                      <DeleteHorseButton id={h.id} nombre={h.nombre} />
                    </div>
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
