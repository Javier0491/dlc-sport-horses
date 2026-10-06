import Link from "next/link";
import ConcursoForm from "@/components/admin/ConcursoForm";
import { createConcurso } from "../../actions";

export default function NuevoConcurso() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/admin/concursos" className="text-sm text-neutral-500 hover:text-dlc-negro">
        ← Concursos
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold">Nuevo concurso</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Al crearlo podrás añadir sus pruebas.
      </p>
      <div className="mt-8">
        <ConcursoForm action={createConcurso} />
      </div>
    </main>
  );
}
