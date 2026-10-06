import type { CSSProperties } from "react";

// Retraso de las animaciones de entrada (.enter, .enter-line en globals.css).
export const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
