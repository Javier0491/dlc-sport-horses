"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(admin)/admin/actions";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/caballos", label: "Caballos" },
  { href: "/admin/contenido", label: "Contenido Web" },
  { href: "/admin/media", label: "Medios" },
];

// /admin solo se marca activo en su propia página; las secciones también en sus subrutas.
const isActive = (pathname: string, href: string) =>
  href === "/admin" ? pathname === href : pathname.startsWith(href);

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex shrink-0 flex-col bg-dlc-negro text-dlc-marfil md:sticky md:top-0 md:h-screen md:w-60">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="font-serif text-lg font-semibold">Rancho DLC</p>
        <p className="text-[11px] uppercase tracking-widest text-dlc-marfil/50">
          Panel de administración
        </p>
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-1 md:flex-col md:py-6">
        {links.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-white/10 font-medium text-dlc-oro"
                  : "text-dlc-marfil/75 hover:bg-white/5 hover:text-dlc-marfil"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <form action={logout} className="border-t border-white/10 px-3 py-3 md:py-4">
        <button
          type="submit"
          className="w-full rounded-md px-3 py-2 text-left text-sm text-dlc-marfil/60 transition-colors hover:bg-white/5 hover:text-dlc-marfil"
        >
          Cerrar Sesión
        </button>
      </form>
    </aside>
  );
}
