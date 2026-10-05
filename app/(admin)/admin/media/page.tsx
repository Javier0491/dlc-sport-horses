import MediaDropzone from "@/components/admin/MediaDropzone";
import MediaGallery from "@/components/admin/MediaGallery";
import { listImages, type MediaItem } from "@/lib/storage";

export default async function MediaAdmin() {
  let items: MediaItem[] = [];
  let loadError: string | null = null;
  try {
    items = await listImages();
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Error al cargar el bucket.";
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Medios</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Sube fotos y copia su URL para usarla en la base de datos.
      </p>

      <section className="mt-8">
        <MediaDropzone />
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-medium text-neutral-700">
          Biblioteca{" "}
          <span className="text-neutral-400">({items.length})</span>
        </h2>
        {loadError ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {loadError}
          </p>
        ) : (
          <MediaGallery items={items} />
        )}
      </section>
    </main>
  );
}
