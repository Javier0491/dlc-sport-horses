"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const SIZE = 12;
// Rígido a propósito: al ser el único puntero, el retraso debe ser mínimo.
const SPRING = { stiffness: 1200, damping: 60, mass: 0.3 };

// Punto dorado que sustituye al cursor nativo en escritorio con ratón.
// En móvil/táctil no se muestra y el cursor nativo no se toca (ver globals.css).
export default function CustomCursor() {
  const x = useMotionValue(-SIZE);
  const y = useMotionValue(-SIZE);
  const smoothX = useSpring(x, SPRING);
  const smoothY = useSpring(y, SPRING);
  // No se muestra hasta el primer movimiento, para que no aparezca en la esquina.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // La clase oculta el cursor nativo; se quita al salir del sitio público.
    document.body.classList.add("custom-cursor");
    return () => document.body.classList.remove("custom-cursor");
  }, []);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX - SIZE / 2);
      y.set(event.clientY - SIZE / 2);
      setVisible(true);
    };
    const hide = () => setVisible(false);

    window.addEventListener("pointermove", move);
    document.documentElement.addEventListener("mouseleave", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("mouseleave", hide);
    };
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 cursor-dot z-[100] hidden rounded-full bg-dlc-oro transition-opacity duration-300"
      style={{
        width: SIZE,
        height: SIZE,
        x: smoothX,
        y: smoothY,
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
