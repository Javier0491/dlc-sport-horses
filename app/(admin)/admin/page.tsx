import Link from "next/link";
import { CATEGORIAS, listCaballos, type Caballo } from "@/lib/caballos";

const sections = [
  {
    href: "/admin/caballos",
    title: "Caballos",
    description: "Alta, edición y baja de sementales, yeguas y potros.",
  },
  {
    href: "/admin/contenido",
    title: "Contenido Web",
    description: "Textos de la portada, Nuestro Legado y eventos.",
  },
  {
    href: "/admin/media",
    title: "Medios",
    description: "Sube fotos y copia su URL para usarlas en el sitio.",
  },
];

export default async function AdminDashboard() {
  // Si Supabase falla, el panel sigue funcionando: las cifras muestran "—".
  const caballos: Caballo[] | null = await listCaballos().catch(() => null);
  const stats = CATEGORIAS.map((categoria) => ({
    label: categoria,
    value: caballos ? caballos.filter((c) => c.categoria === categoria).length : "—",
  }));

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Resumen del sitio y accesos rápidos.
      </p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-neutral-200 p-5">
            <dt className="text-xs font-medium uppercase tracking-widest text-neutral-500">
              {label}
            </dt>
            <dd className="mt-2 text-3xl font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {sections.map(({ href, title, description }) => (
          <li key={href}>
            <Link
              href={href}
              className="block h-full rounded-lg border border-neutral-200 p-5 transition-colors hover:border-neutral-400"
            >
              <p className="font-medium">{title} →</p>
              <p className="mt-1 text-sm text-neutral-500">{description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
