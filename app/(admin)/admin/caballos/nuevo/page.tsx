import Link from "next/link";
import HorseForm from "@/components/admin/HorseForm";
import { listOpciones } from "@/lib/caballos";
import { createCaballo } from "../../actions";

export default async function NuevoCaballo() {
  const opciones = await listOpciones();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/admin/caballos" className="text-sm text-neutral-500 hover:text-dlc-negro">
        ← Caballos
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold">Nuevo caballo</h1>
      <div className="mt-8">
        <HorseForm action={createCaballo} opciones={opciones} />
      </div>
    </main>
  );
}
