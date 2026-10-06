// Franja de palabras que se desliza sin fin (animación en globals.css: .marquee-track).
// Dos copias idénticas: al llegar a la mitad, la animación vuelve a empezar sin salto.
const WORDS = [
  "Salto",
  "Genética de élite",
  "Centro Médico",
  "Alto rendimiento",
  "Pedigrí documentado",
  "Jalisco, México",
];

function Row({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {[...WORDS, ...WORDS].map((word, i) => (
        <li
          key={i}
          className="flex items-center gap-10 pr-10 font-serif text-2xl font-light italic text-dlc-marfil/90 sm:text-3xl"
        >
          <span className="whitespace-nowrap">{word}</span>
          <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-dlc-oro" />
        </li>
      ))}
    </ul>
  );
}

export default function Marquee() {
  return (
    <div className="overflow-hidden border-y border-dlc-oro/20 bg-dlc-negro py-7 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div className="marquee-track flex w-max">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
