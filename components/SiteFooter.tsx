import Link from "next/link";
import { WHATSAPP_NUMBER, whatsappUrl } from "@/lib/contact";

const LINKS = [
  { href: "/reproductores", label: "Sementales" },
  { href: "/potros", label: "Potros" },
  { href: "/el-rancho", label: "El Rancho" },
  { href: "/centro-medico", label: "Centro Médico" },
  { href: "/equipo", label: "Equipo" },
  { href: "/concursos", label: "Eventos" },
  { href: "/simulador", label: "Simulador AI" },
  { href: "/contacto", label: "Contacto" },
];

// +523325382022 → "+52 33 2538 2022"
const TELEFONO = `+${WHATSAPP_NUMBER.replace(/^(\d{2})(\d{2})(\d{4})(\d{4})$/, "$1 $2 $3 $4")}`;
const CORREO = "contacto@ranchodlc.com";

// Subrayado dorado que crece desde la izquierda al pasar el ratón.
const linkClass =
  "relative w-fit text-sm text-dlc-marfil/70 transition-colors duration-300 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-dlc-oro after:transition-transform after:duration-300 after:ease-[var(--ease-out)] hover:text-dlc-marfil hover:after:scale-x-100";

// Pie de todas las páginas públicas: cierre con llamada a la acción, mapa del sitio y contacto.
export default function SiteFooter() {
  return (
    <footer className="overflow-hidden bg-dlc-negro text-dlc-marfil">
      {/* Cierre */}
      <div className="mx-auto flex max-w-7xl flex-col gap-10 border-b border-dlc-marfil/10 px-6 py-20 md:flex-row md:items-end md:justify-between sm:py-24">
        <div>
          <p className="text-[11px] uppercase tracking-[0.5em] text-dlc-oro">Rancho DLC</p>
          <h2 className="mt-5 max-w-xl font-serif text-4xl font-light leading-tight sm:text-6xl">
            Hablemos de excelencia.
          </h2>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/contacto"
            className="press bg-dlc-oro px-8 py-4 text-xs font-medium uppercase tracking-[0.3em] text-dlc-negro hover:bg-dlc-marfil"
          >
            Agendar una visita
          </Link>
          <a
            href={whatsappUrl("Hola, me gustaría recibir información sobre Rancho DLC.")}
            target="_blank"
            rel="noopener noreferrer"
            className="press border border-dlc-marfil/30 px-8 py-4 text-xs uppercase tracking-[0.3em] text-dlc-marfil hover:border-dlc-oro hover:text-dlc-oro"
          >
            WhatsApp
          </a>
        </div>
      </div>

      {/* Mapa del sitio y contacto */}
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl">Rancho DLC</p>
          <p className="mt-3 max-w-xs text-sm leading-7 text-dlc-marfil/50">
            Excelencia en genética equina y alto rendimiento. Jalisco, México.
          </p>
        </div>
        <nav aria-label="Pie de página">
          <p className="text-[10px] uppercase tracking-[0.4em] text-dlc-oro">Explorar</p>
          <ul className="mt-5 grid grid-cols-2 gap-x-8 gap-y-3 lg:grid-cols-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-dlc-oro">Contacto</p>
          <ul className="mt-5 flex flex-col gap-3">
            <li>
              <a href={`tel:+${WHATSAPP_NUMBER}`} className={linkClass}>
                {TELEFONO}
              </a>
            </li>
            <li>
              <a href={`mailto:${CORREO}`} className={linkClass}>
                {CORREO}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Marca gigante que sube al llegar al final de la página (ver .footer-mark) */}
      <p
        aria-hidden="true"
        className="footer-mark pointer-events-none select-none bg-gradient-to-b from-dlc-oro/35 to-dlc-oro/0 bg-clip-text pb-4 text-center font-serif text-[26vw] font-light leading-[0.8] tracking-[0.04em] text-transparent"
      >
        DLC
      </p>

      <div className="border-t border-dlc-marfil/10">
        <p className="mx-auto max-w-7xl px-6 py-5 text-[10px] uppercase tracking-[0.35em] text-dlc-marfil/40">
          © {new Date().getFullYear()} Rancho DLC · DLC Sport Horses
        </p>
      </div>
    </footer>
  );
}
