import ContentTabs from "@/components/admin/ContentTabs";
import { SECCIONES, getConfiguracionesAdmin, type Configuracion } from "@/lib/contenido";

export default async function ContenidoAdmin() {
  let values: Record<string, Configuracion | null> = {};
  let loadError: string | null = null;
  try {
    const rows = await getConfiguracionesAdmin();
    values = Object.fromEntries(SECCIONES.map((s) => [s.id, rows.get(s.id) ?? null]));
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Error al leer la base de datos.";
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Contenido Web</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Edita los textos e imágenes de cada sección del sitio público.
      </p>

      <div className="mt-8">
        {loadError ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
          </p>
        ) : (
          <ContentTabs secciones={SECCIONES} values={values} />
        )}
      </div>
    </main>
  );
}
