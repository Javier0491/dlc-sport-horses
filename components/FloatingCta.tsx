"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Botón flotante que se oculta cuando el bloque CTA (targetId) entra en pantalla.
export default function FloatingCta({
  href,
  label,
  targetId,
}: {
  href: string;
  label: string;
  targetId: string;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) =>
      setHidden(entry.isIntersecting),
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  return (
    <Link
      href={href}
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : undefined}
      className={`fixed right-6 bottom-6 z-40 bg-dlc-cuero px-6 py-4 text-[11px] font-medium uppercase tracking-[0.3em] text-dlc-marfil shadow-lg shadow-dlc-negro/20 transition-all duration-500 hover:bg-dlc-negro ${
        hidden ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100"
      }`}
    >
      {label}
    </Link>
  );
}
