import Link from "next/link";
import { notFound } from "next/navigation";
import HorseForm from "@/components/admin/HorseForm";
import { getCaballo, listOpciones } from "@/lib/caballos";
import { updateCaballo } from "../../actions";

export default async function EditarCaballo({ params }: PageProps<"/admin/caballos/[id]">) {
  const { id } = await params;
  const [caballo, opciones] = await Promise.all([getCaballo(id), listOpciones()]);
  if (!caballo) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/admin/caballos" className="text-sm text-neutral-500 hover:text-dlc-negro">
        ← Caballos
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold">{caballo.nombre}</h1>
      <div className="mt-8">
        <HorseForm
          action={updateCaballo.bind(null, caballo.id)}
          caballo={caballo}
          opciones={opciones}
        />
      </div>
    </main>
  );
}
