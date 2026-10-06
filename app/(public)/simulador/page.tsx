import type { Metadata } from "next";
import GeneticSimulator from "@/components/GeneticSimulator";
import Link from "next/link";
import { getSementalesActivos, getYeguasActivas } from "@/lib/data";
import { delay } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Simulador de Cruza | Rancho DLC",
  description:
    "Proyecta con IA las características de un potro cruzando tu semental con una yegua de Rancho DLC.",
};

export default async function Simulador() {
  // Yeguas base y "Semental DLC": los publicados en el panel.
  const [mares, stallions] = await Promise.all([
    getYeguasActivas(),
    getSementalesActivos(),
  ]);

  return (
    <main className="flex-1 bg-dlc-marfil px-6 pt-40 pb-24 sm:pt-48">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col items-center text-center">
          <p className="enter text-[11px] uppercase tracking-[0.5em] text-dlc-cuero" style={delay(50)}>
            Simulador AI
          </p>
          <h1
            className="enter mt-5 font-serif text-5xl font-light text-dlc-negro sm:text-6xl"
            style={delay(150)}
          >
            Simulador de Cruza
          </h1>
          <span className="enter-line mt-8 h-px w-16 bg-dlc-oro" style={delay(450)} />
          <p className="enter mt-8 max-w-2xl leading-8 text-dlc-negro/70" style={delay(550)}>
            Combina una yegua de nuestra línea de cría con tu semental o con
            uno de los nuestros, y descubre una proyección de las características que podría heredar
            el potro.
          </p>
        </header>

        <div className="mt-20">
          {mares.length > 0 ? (
            <GeneticSimulator mares={mares} stallions={stallions} />
          ) : (
            <div className="flex flex-col items-center text-center">
              <p className="font-serif text-3xl font-light text-dlc-negro">
                El simulador estará disponible muy pronto.
              </p>
              <Link
                href="/contacto"
                className="press mt-10 bg-dlc-negro px-8 py-4 text-xs uppercase tracking-[0.3em] text-dlc-marfil hover:bg-dlc-cuero"
              >
                Contactar
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
