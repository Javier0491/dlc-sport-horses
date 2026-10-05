import Reveal from "@/components/Reveal";

// Eventos de ejemplo: sustituir por el calendario real del rancho.
const events = [
  {
    date: "Noviembre 2026",
    category: "CSI5*",
    title: "CSI5* Monterrey",
    location: "Monterrey, Nuevo León",
    text: "Salto internacional de cinco estrellas. Nuestros binomios compiten en las pruebas de 1.45 m y en el Gran Premio del domingo.",
  },
  {
    date: "Febrero 2027",
    category: "Grand Prix",
    title: "Otomi Grand Prix",
    location: "San Miguel de Allende, Guanajuato",
    text: "Temporada de invierno en una de las sedes ecuestres más reconocidas del país, con caballos jóvenes debutando en categoría.",
  },
  {
    date: "Abril 2027",
    category: "Circuito Internacional",
    title: "Global Champions Tour",
    location: "Ciudad de México",
    text: "La élite mundial del salto. Una vitrina para la genética DLC frente a jinetes y criadores de todo el mundo.",
  },
];

export default function Concursos() {
  return (
    <main className="flex-1 bg-dlc-marfil px-6 pt-40 pb-32">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <p className="text-[11px] uppercase tracking-[0.5em] text-dlc-cuero">
          Calendario
        </p>
        <h1 className="mt-5 font-serif text-5xl font-light text-dlc-negro sm:text-7xl">
          Concursos
        </h1>
        <span className="mt-8 h-px w-16 bg-dlc-oro" />
        <p className="mt-8 max-w-xl leading-8 text-dlc-negro/70">
          Las pistas donde nuestra genética demuestra su valor. Próximas
          citas de la temporada.
        </p>
      </div>

      <ol className="relative mx-auto mt-24 max-w-5xl space-y-16 md:space-y-24">
        {/* Línea vertical: a la izquierda en móvil, centrada en escritorio. */}
        <span
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-4 w-px bg-dlc-cuero/20 md:left-1/2 md:-translate-x-1/2"
        />

        {events.map((event, i) => {
          const left = i % 2 === 0;
          return (
            <li
              key={event.title}
              className="relative grid pl-12 md:grid-cols-2 md:gap-24 md:pl-0"
            >
              <span
                aria-hidden="true"
                className="absolute top-10 left-4 h-3 w-3 -translate-x-1/2 rotate-45 border border-dlc-oro bg-dlc-marfil md:left-1/2"
              />
              <Reveal
                className={
                  left ? "md:col-start-1 md:text-right" : "md:col-start-2"
                }
              >
                <article className="border border-dlc-negro/10 bg-white p-8 transition-colors duration-500 hover:border-dlc-oro sm:p-10">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-dlc-oro">
                    {event.date} · {event.category}
                  </p>
                  <h2 className="mt-4 font-serif text-3xl font-medium text-dlc-negro">
                    {event.title}
                  </h2>
                  <p className="mt-2 text-xs uppercase tracking-[0.25em] text-dlc-negro/50">
                    {event.location}
                  </p>
                  <span
                    className={`mt-6 block h-px w-10 bg-dlc-oro ${left ? "md:ml-auto" : ""}`}
                  />
                  <p className="mt-6 text-sm leading-7 text-dlc-negro/70">
                    {event.text}
                  </p>
                </article>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
