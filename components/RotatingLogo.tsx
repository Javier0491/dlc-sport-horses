"use client";

import type { ModelViewerElement } from "@google/model-viewer";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

// Límites del movimiento: nunca da la vuelta ni muestra el reverso plano.
const SWING = 20; // grados a izquierda/derecha (péndulo y ratón)
const TILT_Y = 15; // grados arriba/abajo (solo con el ratón)
// Un vaivén completo (ida y vuelta) cada 8 s: 4 × 20° / 8 s = 10°/s de media.
const PERIOD_MS = 8000;

// Distancia fija de la cámara: con "auto", model-viewer la aleja al cerrar el campo
// de visión y el logo queda diminuto dentro del Navbar.
const RADIUS = "8.3m";
const orbit = (theta: number, phi = 90) => `${theta}deg ${phi}deg ${RADIUS}`;

// Logo 3D de DLC (public/logo/dlc-logo.glb). Oscila solo como un péndulo y, con el
// ratón encima, se inclina siguiéndolo; al salir, retoma el péndulo.
// El péndulo mueve la cámara (no auto-rotate, que gira el modelo 360° sin respetar
// min/max-camera-orbit). <model-viewer> se carga solo en el navegador.
export default function RotatingLogo({ className = "" }: { className?: string }) {
  const ref = useRef<ModelViewerElement>(null);
  // Quien pide menos movimiento en su sistema ve el logo quieto.
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  useEffect(() => {
    const viewer = ref.current;
    if (!viewer || reducedMotion) return;

    let hovering = false;
    let frame = 0;
    const start = performance.now();

    // Seno: va más lento al llegar a cada extremo, como un péndulo con peso.
    const swing = (now: number) => {
      if (!hovering) {
        const theta = SWING * Math.sin(((now - start) / PERIOD_MS) * 2 * Math.PI);
        viewer.cameraOrbit = orbit(theta);
      }
      frame = requestAnimationFrame(swing);
    };
    frame = requestAnimationFrame(swing);

    // Posición del ratón sobre el logo, de -1 a 1 en cada eje.
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      hovering = true;
      const box = viewer.getBoundingClientRect();
      const x = ((event.clientX - box.left) / box.width) * 2 - 1;
      const y = ((event.clientY - box.top) / box.height) * 2 - 1;
      viewer.cameraOrbit = orbit(x * SWING, 90 + y * TILT_Y);
    };
    const onLeave = () => {
      hovering = false;
    };

    viewer.addEventListener("pointermove", onMove);
    viewer.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      viewer.removeEventListener("pointermove", onMove);
      viewer.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  return (
    <model-viewer
      ref={ref}
      src="/logo/dlc-logo.glb"
      alt="Logo de DLC La Chacona"
      {...(reducedMotion ? {} : { "camera-controls": "" })}
      interaction-prompt="none"
      camera-orbit={orbit(0)}
      min-camera-orbit={orbit(-SWING, 90 - TILT_Y)}
      max-camera-orbit={orbit(SWING, 90 + TILT_Y)}
      field-of-view="9deg"
      /* model-viewer no baja de 12° por defecto. */
      min-field-of-view="5deg"
      disable-zoom=""
      disable-pan=""
      /* El arrastre vertical en móvil sigue desplazando la página. */
      touch-action="pan-y"
      environment-image="neutral"
      exposure="1"
      shadow-intensity="0"
      className={`block bg-transparent ${className}`}
    >
      {/* Sin la barra de carga gris que model-viewer muestra por defecto. */}
      <div slot="progress-bar" />
    </model-viewer>
  );
}
