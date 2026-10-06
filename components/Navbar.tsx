"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

function NavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`whitespace-nowrap text-[11px] uppercase tracking-[0.3em] transition-colors duration-300 hover:text-dlc-cuero ${
        active ? "text-dlc-cuero" : "text-dlc-negro"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-dlc-oro/40 bg-dlc-marfil text-dlc-negro">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 py-5">
        <ul className="hidden items-center justify-end gap-8 pr-10 xl:flex 2xl:gap-12 2xl:pr-14">
          {leftLinks.map((link) => (
            <li key={link.href}>
              <NavLink {...link} active={isActive(link.href)} />
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
              <NavLink {...link} active={isActive(link.href)} />
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
            className={`h-px w-6 bg-dlc-negro transition-transform duration-300 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-6 bg-dlc-negro transition-transform duration-300 ${
              open ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <ul
          id="menu-movil"
          className="flex flex-col items-center gap-6 border-t border-dlc-oro/30 py-8 xl:hidden"
        >
          {[...leftLinks, ...rightLinks].map((link) => (
            <li key={link.href}>
              <NavLink
                {...link}
                active={isActive(link.href)}
                onClick={() => setOpen(false)}
              />
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
