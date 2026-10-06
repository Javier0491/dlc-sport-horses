import Link from "next/link";
import MiembroForm from "@/components/admin/MiembroForm";
import { createMiembro } from "../../actions";

export default function NuevoMiembro() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/admin/equipo" className="text-sm text-neutral-500 hover:text-dlc-negro">
        ← Equipo
      </Link>
      <h1 className="mt-2 font-serif text-3xl font-semibold">Agregar persona</h1>
      <div className="mt-8">
        <MiembroForm action={createMiembro} />
      </div>
    </main>
  );
}
