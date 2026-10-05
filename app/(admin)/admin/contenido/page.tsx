// Maqueta: las tarjetas todavía no abren ningún editor.
const blocks = [
  {
    title: "Editar Portada",
    description: "Imagen principal, titular y llamada a la acción de la página de inicio.",
  },
  {
    title: "Editar Textos Nuestro Legado",
    description: "Historia del rancho y los textos de la sección Nuestro Legado.",
  },
  {
    title: "Editar Eventos",
    description: "Concursos y eventos próximos que se muestran en el sitio.",
  },
];

export default function ContenidoAdmin() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Contenido Web</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Edita los textos e imágenes de cada sección del sitio público.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blocks.map(({ title, description }) => (
          <li
            key={title}
            className="flex flex-col rounded-lg border border-neutral-200 p-6"
          >
            <h2 className="font-medium">{title}</h2>
            <p className="mt-1 flex-1 text-sm text-neutral-500">{description}</p>
            <span className="mt-6 self-start rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-500">
              Próximamente
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
