import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteMiembroButton from "@/components/admin/DeleteMiembroButton";
import MiembroForm from "@/components/admin/MiembroForm";
import { areaLabel, getMiembro } from "@/lib/equipo";
import { updateMiembro } from "../../actions";

export default async function EditarMiembro({ params }: PageProps<"/admin/equipo/[id]">) {
  const { id } = await params;
  const miembro = await getMiembro(id);
  if (!miembro) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/admin/equipo" className="text-sm text-neutral-500 hover:text-dlc-negro">
        ← Equipo
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold">{miembro.nombre}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {miembro.puesto} · {areaLabel(miembro.area)}
      </p>

      <div className="mt-8">
        <MiembroForm action={updateMiembro.bind(null, miembro.id)} miembro={miembro} />
      </div>

      <div className="mt-16 border-t border-neutral-200 pt-6">
        <DeleteMiembroButton id={miembro.id} nombre={miembro.nombre} />
      </div>
    </main>
  );
}
