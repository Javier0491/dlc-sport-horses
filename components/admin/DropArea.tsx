"use client";

import { useState } from "react";

// Zona de "arrastra aquí o haz clic" que comparten los campos de foto, galería y video.
export default function DropArea({
  onFiles,
  accept,
  multiple = false,
  disabled = false,
  className = "",
  children,
}: {
  onFiles: (files: FileList) => void;
  accept: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children: (dragging: boolean) => React.ReactNode;
}) {
  const [dragging, setDragging] = useState(false);

  return (
    <label
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled && event.dataTransfer.files.length) onFiles(event.dataTransfer.files);
      }}
      className={`group relative flex items-center justify-center overflow-hidden rounded-md border-2 border-dashed bg-white text-center transition-colors ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      } ${dragging ? "border-dlc-cuero bg-dlc-marfil" : "border-dlc-arena hover:border-dlc-cuero"} ${className}`}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          if (event.target.files?.length) onFiles(event.target.files);
          event.target.value = "";
        }}
      />
      {children(dragging)}
    </label>
  );
}

export function UploadIcon({ busy, className = "h-6 w-6" }: { busy?: boolean; className?: string }) {
  if (busy) {
    return (
      <span
        className={`${className} animate-spin rounded-full border-2 border-neutral-300 border-t-dlc-cuero`}
      />
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4M7 9l5-5 5 5" />
      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
    </svg>
  );
}

// Lleva la cuenta de las subidas en curso de un formulario: mientras haya
// alguna, no se guarda (se perdería la foto o el video a medio subir).
export function useUploadCount() {
  const [count, setCount] = useState(0);
  const track = (busy: boolean) => setCount((n) => n + (busy ? 1 : -1));
  return [count > 0, track] as const;
}
