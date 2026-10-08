"use client";

import { useState } from "react";
import { GALERIA_LIMITES as L, type GaleriaItem } from "@/lib/contenido-types";
import { hintClass, inputClass, labelClass } from "./form-styles";
import ImageUploadField from "./ImageUploadField";

// Editor de la galería expansiva de El Rancho: lista ordenada de franjas (foto,
// título, categoría, etiquetas y enlace). Viaja con el formulario como JSON en
// el campo oculto `galeria`; el orden aquí es el orden en la web.
export default function ExpandingGalleryEditor({
  initial,
  hint,
  onBusyChange,
  onChange,
}: {
  initial: GaleriaItem[];
  hint: string;
  onBusyChange?: (busy: boolean) => void;
  onChange?: () => void;
}) {
  const [items, setItems] = useState(initial);
  // Las etiquetas se escriben separadas por comas; se guarda el texto tal cual
  // mientras se edita para no comerse la coma que se acaba de escribir.
  const [tagText, setTagText] = useState<Record<string, string>>(() =>
    Object.fromEntries(initial.map((item) => [item.id, item.tags.join(", ")])),
  );

  const update = (next: GaleriaItem[]) => {
    setItems(next);
    onChange?.();
  };
  const edit = (id: string, patch: Partial<GaleriaItem>) =>
    update(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    update(next);
  };
  const add = () =>
    update([...items, { id: crypto.randomUUID(), title: "", category: "", image_url: "", tags: [] }]);

  return (
    <div>
      <input type="hidden" name="galeria" value={JSON.stringify(items)} />
      <div className="flex items-baseline justify-between gap-4">
        <span className={labelClass}>Galería expansiva</span>
        <span className="text-xs text-neutral-500">
          {items.length} / {L.items} franjas
        </span>
      </div>
      <p className={hintClass}>{hint}</p>

      <ol className="mt-4 space-y-4">
        {items.map((item, i) => (
          <li key={item.id} className="rounded-md border border-dlc-arena bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="font-serif text-sm font-semibold text-dlc-cuero">
                {String(i + 1).padStart(2, "0")} · {item.title || "Nueva franja"}
              </span>
              <div className="flex gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label={`Mover la franja ${i + 1} antes`}
                  className="rounded border border-dlc-arena px-2.5 py-1 hover:bg-dlc-marfil disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === items.length - 1}
                  aria-label={`Mover la franja ${i + 1} después`}
                  className="rounded border border-dlc-arena px-2.5 py-1 hover:bg-dlc-marfil disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => update(items.filter((x) => x.id !== item.id))}
                  className="rounded border border-red-200 px-2.5 py-1 text-red-700 hover:bg-red-50"
                >
                  Quitar
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
              <ImageUploadField
                name={`galeria_foto_${i}`}
                label="Foto"
                initial={item.image_url}
                hint="Horizontal, de buena resolución."
                onBusyChange={onBusyChange}
                onChange={(url) => edit(item.id, { image_url: url })}
              />
              <div className="grid content-start gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Título</span>
                  <input
                    value={item.title}
                    maxLength={L.title}
                    required
                    onChange={(e) => edit(item.id, { title: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>Categoría</span>
                  <input
                    value={item.category}
                    maxLength={L.category}
                    placeholder="El rancho, Potro…"
                    onChange={(e) => edit(item.id, { category: e.target.value })}
                    className={inputClass}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelClass}>Etiquetas</span>
                  <input
                    value={tagText[item.id] ?? item.tags.join(", ")}
                    placeholder="Instalaciones, Pistas"
                    onChange={(e) => {
                      setTagText((t) => ({ ...t, [item.id]: e.target.value }));
                      edit(item.id, {
                        tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                          .slice(0, L.tags),
                      });
                    }}
                    className={inputClass}
                  />
                  <span className={`block ${hintClass}`}>Separadas por comas, hasta {L.tags}.</span>
                </label>
                <label className="block sm:col-span-2">
                  <span className={labelClass}>Enlace del botón «Ver más» (opcional)</span>
                  <input
                    value={item.href ?? ""}
                    maxLength={L.href}
                    placeholder="/potros/belcanto-dlc"
                    onChange={(e) => edit(item.id, { href: e.target.value || undefined })}
                    className={inputClass}
                  />
                  <span className={`block ${hintClass}`}>Vacío = sin botón.</span>
                </label>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={add}
        disabled={items.length >= L.items}
        className="mt-4 rounded-md border-2 border-dashed border-dlc-arena px-4 py-2.5 text-sm text-neutral-600 hover:border-dlc-cuero hover:text-dlc-negro disabled:opacity-50"
      >
        {items.length >= L.items ? `Máximo ${L.items} franjas` : "+ Añadir franja"}
      </button>
    </div>
  );
}
