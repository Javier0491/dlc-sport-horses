"use client";

import { useState } from "react";
import { parseVideo, VIDEO_HINT } from "@/lib/video";
import { hintClass, inputClass, labelClass } from "./form-styles";

const SOURCE = { youtube: "YouTube", vimeo: "Vimeo", file: "archivo de video" } as const;

// Campo de enlace de video que confirma al momento qué reconoció.
export default function VideoField({
  name,
  label,
  initial,
  hint = VIDEO_HINT,
  allowFile = true,
}: {
  name: string;
  label: string;
  initial: string;
  hint?: string;
  allowFile?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const video = parseVideo(value);
  const valid = video && (allowFile || video.kind !== "file");

  return (
    <label className="block sm:col-span-2">
      <span className={labelClass}>{label}</span>
      <input
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={500}
        placeholder="https://www.youtube.com/watch?v=…"
        className={inputClass}
      />
      <span className={`block ${hintClass}`}>
        {!value.trim() ? (
          hint
        ) : valid ? (
          <span className="text-emerald-700">✓ Enlace de {SOURCE[video.kind]} reconocido.</span>
        ) : (
          <span className="text-red-600">Enlace no reconocido. {hint}</span>
        )}
      </span>
    </label>
  );
}
