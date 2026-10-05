"use client";

import { useEffect, useState } from "react";
import { whatsappUrl } from "@/lib/contact";

const GENERAL = "general";

const labelClass =
  "text-[10px] font-medium uppercase tracking-[0.3em] text-dlc-negro/60";
const fieldClass =
  "mt-2 w-full border-b border-dlc-cuero/50 bg-transparent px-0 py-3 text-sm text-dlc-negro outline-none transition-colors duration-500 placeholder:text-dlc-negro/30 focus:border-dlc-oro";

export default function ContactForm({
  horses,
  preselected,
}: {
  // article: "el semental", "el caballo", "la yegua"… para el mensaje de WhatsApp.
  horses: { id: string; name: string; group: string; article: string }[];
  preselected?: string;
}) {
  const [horse, setHorse] = useState(preselected ?? GENERAL);
  // Si se llega desde una ficha, el caballo queda fijo hasta que el usuario pida cambiarlo.
  const [locked, setLocked] = useState(Boolean(preselected));
  const [redirecting, setRedirecting] = useState(false);

  const selectedHorse = horses.find((h) => h.id === horse);
  const horseName = selectedHorse?.name;

  // El aviso de éxito desaparece solo después de unos segundos.
  useEffect(() => {
    if (!redirecting) return;
    const timeout = setTimeout(() => setRedirecting(false), 5000);
    return () => clearTimeout(timeout);
  }, [redirecting]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const field = (name: string) => String(data.get(name) ?? "").trim();
    const nombre = field("nombre");
    const correo = field("correo");
    const mensaje = field("mensaje");

    // Incluye todos los datos para no perderlos mientras no se guarden en Supabase.
    // El WhatsApp del cliente llega solo, porque es el número desde el que escribe.
    const text = [
      selectedHorse
        ? `Hola, me interesa obtener más información sobre ${selectedHorse.article} ${selectedHorse.name}.`
        : "Hola, me comunico desde la página web.",
      `Mi nombre es: ${nombre}`,
      `Mi correo es: ${correo}`,
      mensaje && `Mensaje adicional: ${mensaje}`,
    ]
      .filter(Boolean)
      .join("\n");

    // TODO: Insert lead into Supabase 'prospectos' table
    // await supabase.from("prospectos").insert({
    //   nombre,
    //   whatsapp: data.get("whatsapp"),
    //   correo: data.get("correo"),
    //   caballo: horse === GENERAL ? null : horse,
    //   mensaje: data.get("mensaje"),
    // });

    window.open(whatsappUrl(text), "_blank", "noopener,noreferrer");

    setRedirecting(true);
    form.reset();
    setHorse(preselected ?? GENERAL);
    setLocked(Boolean(preselected));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 border border-dlc-cuero/30 bg-dlc-arena p-8 sm:p-10"
    >
      <p
        role="status"
        className={`items-center gap-3 border border-dlc-oro bg-dlc-marfil px-4 py-3 text-xs uppercase tracking-[0.25em] text-dlc-cuero ${
          redirecting ? "flex" : "hidden"
        }`}
      >
        <span className="h-px w-6 bg-dlc-oro" />
        Redirigiendo a WhatsApp...
      </p>

      <div>
        <label htmlFor="nombre" className={labelClass}>
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          autoComplete="name"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="whatsapp" className={labelClass}>
            WhatsApp
          </label>
          <input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            required
            autoComplete="tel"
            placeholder="+52"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="correo" className={labelClass}>
            Correo
          </label>
          <input
            id="correo"
            name="correo"
            type="email"
            required
            autoComplete="email"
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="caballo" className={labelClass}>
          Caballo de Interés
        </label>
        {locked && horseName ? (
          <div className="mt-2 flex items-center justify-between gap-4 border border-dlc-oro bg-dlc-marfil px-4 py-3">
            <input type="hidden" name="caballo" value={horse} />
            <span id="caballo" className="font-serif text-lg text-dlc-negro">
              {horseName}
            </span>
            <button
              type="button"
              onClick={() => setLocked(false)}
              className="text-[10px] uppercase tracking-[0.3em] text-dlc-cuero underline-offset-4 hover:underline"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <select
            id="caballo"
            name="caballo"
            value={horse}
            onChange={(event) => setHorse(event.target.value)}
            className={fieldClass}
          >
            <option value={GENERAL}>Consulta general</option>
            {[...new Set(horses.map((h) => h.group))].map((group) => (
              <optgroup key={group} label={group}>
                {horses.filter((h) => h.group === group).map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        )}
      </div>

      <div>
        <label htmlFor="mensaje" className={labelClass}>
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={5}
          className={`${fieldClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-dlc-negro py-4 text-xs font-medium uppercase tracking-[0.35em] text-dlc-marfil transition-colors duration-500 hover:bg-dlc-cuero"
      >
        Enviar
      </button>
    </form>
  );
}
