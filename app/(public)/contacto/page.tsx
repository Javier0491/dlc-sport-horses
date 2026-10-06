import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { horseArticle } from "@/lib/catalog";
import { getEnVenta } from "@/lib/data";
import { delay } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Contacto | Rancho DLC",
  description: "Hablemos de excelencia: contacta al equipo de Rancho DLC.",
};

// Datos de contacto (la dirección sigue siendo ficticia).
const contactInfo = [
  {
    label: "Dirección",
    value: "Carretera a Tlajomulco km 12, Jalisco, México",
    icon: (
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    ),
  },
  {
    label: "Teléfono",
    value: "+52 33 2538 2022",
    href: "tel:+523325382022",
    icon: (
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    ),
  },
  {
    label: "Correo",
    value: "contacto@ranchodlc.com",
    href: "mailto:contacto@ranchodlc.com",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="1" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
  },
];

export default async function Contacto({
  searchParams,
}: PageProps<"/contacto">) {
  // ?semental=valor-dlc (fichas) o ?caballo=hit-one-dlc (potros); solo se acepta si está publicado.
  const { semental, caballo } = await searchParams;
  const requested = [semental, caballo].find((v) => typeof v === "string");
  // Si Supabase falla, el formulario de contacto sigue funcionando sin la lista de caballos.
  const forSale = await getEnVenta().catch(() => []);
  const preselected = forSale.find((h) => h.id === requested)?.id;

  return (
    <main className="flex-1 bg-dlc-marfil px-6 pt-40 pb-24 sm:pt-48">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-2 lg:gap-24">
        <section>
          <p className="enter text-[11px] uppercase tracking-[0.5em] text-dlc-cuero" style={delay(50)}>
            Contacto
          </p>
          <h1
            className="enter mt-5 font-serif text-5xl font-light leading-tight text-dlc-negro sm:text-6xl"
            style={delay(150)}
          >
            Hablemos de Excelencia
          </h1>
          <span className="enter-line mt-8 block h-px w-16 origin-left bg-dlc-oro" style={delay(450)} />
          <p className="enter mt-8 max-w-md leading-8 text-dlc-negro/70" style={delay(550)}>
            Ya sea para conocer a nuestros sementales y potros, agendar una visita o
            consultar al Centro Médico, nuestro equipo te atenderá
            personalmente.
          </p>

          <ul className="mt-12 space-y-8">
            {contactInfo.map((item) => (
              <li key={item.label} className="flex items-start gap-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-dlc-oro text-dlc-cuero">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {item.icon}
                  </svg>
                </span>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-dlc-negro/50">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="mt-1 block text-dlc-negro transition-colors hover:text-dlc-cuero"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-dlc-negro">{item.value}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <ContactForm
            horses={[
              ...forSale.filter((h) => h.category !== "Semental"),
              ...forSale.filter((h) => h.category === "Semental"),
            ].map((h) => ({
              id: h.id,
              name: h.name,
              group: h.category === "Semental" ? "Sementales" : "Potros DLC",
              article: horseArticle(h),
            }))}
            preselected={preselected}
          />
        </section>
      </div>
    </main>
  );
}
