"use client";

import Image from "next/image";
import { useState } from "react";
import { isAllowedImageUrl } from "@/lib/image-url";

// Vista previa del enlace pegado en un campo de imagen del panel.
export default function ImagePreview({ url, alt }: { url: string; alt: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const value = url.trim();

  let message: string | null = null;
  if (!value) message = "Sin foto";
  else if (!isAllowedImageUrl(value)) message = "Enlace no válido: cópialo desde Medios";
  else if (failedUrl === value) message = "No se pudo cargar la imagen";

  return (
    <div className="relative mt-3 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-dlc-arena bg-white text-xs text-neutral-400">
      {message ?? (
        <Image
          src={value}
          alt={alt}
          fill
          unoptimized
          className="object-cover"
          onError={() => setFailedUrl(value)}
        />
      )}
    </div>
  );
}
