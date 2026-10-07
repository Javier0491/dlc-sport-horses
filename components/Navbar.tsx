"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { delay } from "@/lib/motion";
import RotatingLogo from "./RotatingLogo";

const leftLinks = [
  { href: "/reproductores", label: "Sementales" },
  { href: "/potros", label: "Potros" },
  { href: "/centro-medico", label: "Centro Médico" },
  { href: "/equipo", label: "Equipo" },
];

const rightLinks = [
  { href: "/simulador", label: "Simulador AI" },
  { href: "/concursos", label: "Eventos" },
  { href: "/contacto", label: "Contacto" },
];

// Páginas que empiezan con una foto grande: ahí el menú es transparente hasta
// que se hace scroll, para que la foto llegue hasta arriba.
const HERO_PAGES = ["/", "/reproductores", "/potros", "/centro-medico", "/el-rancho"];

function NavLink({
  href,
  label,
  active,
  light,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  light: boolean; // texto claro sobre la foto del hero
  onClick?: () => void;
}) {
  const color = light
    ? active
      ? "text-dlc-oro"
      : "text-dlc-marfil/90 hover:text-dlc-oro"
    : active
      ? "text-dlc-cuero"
      : "text-dlc-negro hover:text-dlc-cuero";

  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      // Línea dorada que se dibuja desde el centro al pasar el ratón (fija en la página actual).
      className={`relative whitespace-nowrap py-1 text-[11px] uppercase tracking-[0.3em] transition-colors duration-300 after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-center after:bg-dlc-oro after:transition-transform after:duration-300 after:ease-[var(--ease-out)] hover:after:scale-x-100 ${
        active ? "after:scale-x-100" : "after:scale-x-0"
      } ${color}`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  // Las fichas de potro (/potros/<id>) también abren con su foto a pantalla completa.
  const overHero = HERO_PAGES.includes(pathname) || pathname.startsWith("/potros/");
  const light = overHero && !scrolled && !open;

  return (
    <nav
      // Al hacer scroll el fondo entra despacio; al abrir el menú móvil, rápido, para
      // que los enlaces no se encimen con el título del hero.
      className={`fixed top-0 z-50 w-full border-b transition-[background-color,border-color] ${
        open ? "duration-150" : "duration-500"
      } ${light ? "border-transparent bg-transparent" : "border-dlc-oro/40 bg-dlc-marfil"}`}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-5">
        <ul className="hidden items-center justify-end gap-8 pr-10 xl:flex 2xl:gap-12 2xl:pr-14">
          {leftLinks.map((link) => (
            <li key={link.href}>
              <NavLink {...link} active={isActive(link.href)} light={light} />
            </li>
          ))}
        </ul>

        <Link
          href="/"
          onClick={() => setOpen(false)}
          aria-label="Rancho DLC, inicio"
          className="col-start-2 flex flex-col items-center"
        >
          <RotatingLogo className="h-12 w-28" />
          <span className="mt-1 h-px w-8 bg-dlc-oro" />
        </Link>

        <ul className="hidden items-center justify-start gap-8 pl-10 xl:flex 2xl:gap-12 2xl:pl-14">
          {rightLinks.map((link) => (
            <li key={link.href}>
              <NavLink {...link} active={isActive(link.href)} light={light} />
            </li>
          ))}
        </ul>

        {/* Menú móvil */}
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-movil"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="col-start-3 flex h-10 w-10 flex-col items-center justify-center gap-1.5 justify-self-end xl:hidden"
        >
          <span
            className={`h-px w-6 transition-[transform,background-color] duration-300 ${
              light ? "bg-dlc-marfil" : "bg-dlc-negro"
            } ${open ? "translate-y-[3.5px] rotate-45" : ""}`}
          />
          <span
            className={`h-px w-6 transition-[transform,background-color] duration-300 ${
              light ? "bg-dlc-marfil" : "bg-dlc-negro"
            } ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <ul
          id="menu-movil"
          className="flex flex-col items-center gap-6 border-t border-dlc-oro/30 py-8 xl:hidden"
        >
          {[...leftLinks, ...rightLinks].map((link, i) => (
            <li key={link.href} className="menu-in" style={delay(i * 30)}>
              <NavLink
                {...link}
                active={isActive(link.href)}
                light={false}
                onClick={() => setOpen(false)}
              />
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
