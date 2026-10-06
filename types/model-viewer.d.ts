// <model-viewer> (de @google/model-viewer) como elemento JSX: React 19 pasa estos
// atributos tal cual al custom element.
import type { ModelViewerElement } from "@google/model-viewer";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerAttributes = {
  src: string;
  alt: string;
  "camera-orbit"?: string;
  "min-camera-orbit"?: string;
  "max-camera-orbit"?: string;
  "touch-action"?: "pan-x" | "pan-y" | "none";
  "field-of-view"?: string;
  "min-field-of-view"?: string;
  "camera-controls"?: string;
  "disable-zoom"?: string;
  "disable-pan"?: string;
  "interaction-prompt"?: "auto" | "none";
  "environment-image"?: string;
  exposure?: string;
  "shadow-intensity"?: string;
  loading?: "auto" | "lazy" | "eager";
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": DetailedHTMLProps<HTMLAttributes<ModelViewerElement>, ModelViewerElement> &
        ModelViewerAttributes;
    }
  }
}
