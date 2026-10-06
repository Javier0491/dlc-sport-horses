"use client";

import { motion, useReducedMotion } from "framer-motion";

const TAGS = { div: motion.div, li: motion.li, p: motion.p };

// Aparición suave al entrar en pantalla (opacidad + ligero ascenso), una sola vez.
// Se usa desde server components, por eso vive en su propio archivo cliente.
// `as` permite usarlo directamente como <li> o <p> sin envolver en un <div>.
export default function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: keyof typeof TAGS;
}) {
  const reduceMotion = useReducedMotion();
  const Tag = TAGS[as];

  return (
    <Tag
      className={className}
      // Cadena de transform completa: se anima en la GPU (x/y no).
      initial={{ opacity: 0, transform: `translateY(${reduceMotion ? 0 : 20}px)` }}
      whileInView={{ opacity: 1, transform: "translateY(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </Tag>
  );
}
