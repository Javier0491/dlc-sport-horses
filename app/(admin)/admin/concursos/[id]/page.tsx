import Link from "next/link";
import { notFound } from "next/navigation";
import ConcursoForm from "@/components/admin/ConcursoForm";
import DeleteConcursoButton from "@/components/admin/DeleteConcursoButton";
import PruebasManager from "@/components/admin/PruebasManager";
import StatusBadge from "@/components/admin/StatusBadge";
import { ESTADOS_CONCURSO, getConcurso, rangoFechas } from "@/lib/concursos";
import { updateConcurso } from "../../actions";

export default async function EditarConcurso({ params }: PageProps<"/admin/concursos/[id]">) {
  const { id } = await params;
  const concurso = await getConcurso(id);
  if (!concurso) notFound();

  const { pruebas, ...datos } = concurso;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <Link href="/admin/concursos" className="text-sm text-neutral-500 hover:text-dlc-negro">
        ← Concursos
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl font-semibold">{concurso.nombre}</h1>
        <StatusBadge value={concurso.estado} estados={ESTADOS_CONCURSO} />
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        {rangoFechas(concurso.fecha_inicio, concurso.fecha_fin)}
      </p>

      <div className="mt-8">
        <ConcursoForm action={updateConcurso.bind(null, concurso.id)} concurso={datos} />
      </div>

      <PruebasManager concurso={datos} pruebas={pruebas} />

      <div className="mt-16 border-t border-neutral-200 pt-6">
        <DeleteConcursoButton id={concurso.id} totalPruebas={pruebas.length} />
      </div>
    </main>
  );
}
