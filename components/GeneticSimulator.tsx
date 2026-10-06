"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { heightLabel, type Horse } from "@/lib/catalog";

// "KWPN · 1.68 m", con lo que haya cargado en el panel.
const horseDetails = (h: Horse) =>
  [h.breed, h.height !== null ? heightLabel(h.height) : null].filter(Boolean).join(" · ");

type StallionInput = { breed: string; height: string; temperament: string };
type StallionSource = "externo" | "dlc";
type Status = "idle" | "loading" | "done" | "error" | "limited";
type Result = { imageUrl: string; description: string; title: string };

const LOADING_STEPS = [
  "Analizando pedigrí de la yegua…",
  "Evaluando rasgos del semental…",
  "Proyectando características del potro…",
  "Generando la fotografía del potro…",
];
const STEP_MS = 4000;
const MAX_UPLOAD_PX = 1024;

const labelClass =
  "text-[10px] font-medium uppercase tracking-[0.3em] text-dlc-negro/60";
const fieldClass =
  "mt-2 w-full border border-dlc-cuero/30 bg-white px-4 py-3 text-sm text-dlc-negro outline-none transition-colors duration-300 placeholder:text-dlc-negro/30 focus:border-dlc-cuero";

// Reduce la foto (máx. 1024 px, JPEG) y la convierte a data URL base64 para enviarla a la API.
async function fileToBase64(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_UPLOAD_PX / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

function MareSelector({
  mares,
  selected,
  onSelect,
}: {
  mares: Horse[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Yegua de Rancho DLC" className="space-y-4">
      {mares.map((mare) => {
        const active = mare.id === selected;
        return (
          <button
            key={mare.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(mare.id)}
            className={`flex w-full items-stretch gap-5 border bg-white p-3 text-left transition-colors duration-300 ${
              active
                ? "border-dlc-oro ring-1 ring-dlc-oro"
                : "border-dlc-negro/10 hover:border-dlc-cuero/50"
            }`}
          >
            <div className="relative aspect-square w-28 shrink-0 overflow-hidden bg-dlc-arena sm:w-32">
              {mare.image && (
                <Image
                  src={mare.image}
                  alt={mare.name}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col justify-center py-1">
              <p className="text-[10px] uppercase tracking-[0.3em] text-dlc-oro">
                {horseDetails(mare)}
              </p>
              <p className="mt-2 font-serif text-2xl text-dlc-negro">
                {mare.name}
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {mare.behavior.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-dlc-arena px-3 py-1 text-[10px] tracking-wide text-dlc-negro/70"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
            <span
              className={`mt-1 mr-1 h-4 w-4 shrink-0 rounded-full border ${
                active ? "border-dlc-oro bg-dlc-oro" : "border-dlc-negro/20"
              }`}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}

// Interruptor segmentado: semental del cliente o semental del rancho.
function SourceToggle({
  value,
  onChange,
}: {
  value: StallionSource;
  onChange: (value: StallionSource) => void;
}) {
  const options: { value: StallionSource; label: string }[] = [
    { value: "externo", label: "Semental Externo" },
    { value: "dlc", label: "Semental DLC" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Origen del semental"
      className="grid grid-cols-2 bg-dlc-arena p-1"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={`py-3 text-[10px] font-medium uppercase tracking-[0.3em] transition-colors duration-300 ${
              active
                ? "bg-dlc-negro text-dlc-marfil"
                : "text-dlc-negro/60 hover:text-dlc-negro"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function StallionSelector({
  stallions,
  selected,
  onSelect,
}: {
  stallions: Horse[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Semental de Rancho DLC"
      className="grid grid-cols-2 gap-4"
    >
      {stallions.map((stallion) => {
        const active = stallion.id === selected;
        return (
          <button
            key={stallion.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(stallion.id)}
            className={`group flex flex-col border bg-white text-left transition-colors duration-300 ${
              active
                ? "border-dlc-oro ring-1 ring-dlc-oro"
                : "border-dlc-negro/10 hover:border-dlc-cuero/50"
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-dlc-arena">
              {stallion.image && (
                <Image
                  src={stallion.image}
                  alt={stallion.name}
                  fill
                  sizes="(min-width: 1024px) 280px, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
            </div>
            <div className="p-4">
              <p className="text-[9px] uppercase tracking-[0.3em] text-dlc-oro">
                {horseDetails(stallion)}
              </p>
              <p className="mt-1.5 font-serif text-xl text-dlc-negro">
                {stallion.name}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function PhotoDropzone({
  photoUrl,
  onFile,
}: {
  photoUrl: string | null;
  onFile: (file: File) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (JPG, PNG o WEBP).");
      return;
    }
    setError(null);
    onFile(file);
  };

  return (
    <div>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          accept(event.dataTransfer.files[0]);
        }}
        className={`relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed text-center transition-colors duration-300 ${
          dragging
            ? "border-dlc-oro bg-dlc-marfil"
            : "border-dlc-cuero/40 bg-white hover:border-dlc-cuero"
        }`}
      >
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => accept(event.target.files?.[0])}
        />
        {photoUrl ? (
          <>
            {/* Vista previa local (blob:), no pasa por el optimizador de next/image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt="Foto de tu semental"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute bottom-3 left-3 bg-dlc-marfil px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-dlc-cuero">
              Cambiar foto
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center px-6">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-dlc-oro"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 16V4M7 9l5-5 5 5" />
              <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
            </svg>
            <p className="mt-4 font-serif text-xl text-dlc-negro">
              Arrastra la foto de tu semental
            </p>
            <p className="mt-2 text-xs text-dlc-negro/50">
              o haz clic para seleccionarla
            </p>
          </div>
        )}
      </label>
      {error && <p className="mt-2 text-xs text-red-800">{error}</p>}
    </div>
  );
}

function Spinner() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)),
      STEP_MS,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center py-20 text-center" role="status">
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 rounded-full border border-dlc-oro/20" />
        <span className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-dlc-oro" />
        <span className="absolute inset-3 animate-[spin_2s_linear_infinite_reverse] rounded-full border border-transparent border-b-dlc-cuero" />
      </div>
      <p className="mt-8 text-xs uppercase tracking-[0.3em] text-dlc-cuero">
        {LOADING_STEPS[step]}
      </p>
    </div>
  );
}

export default function GeneticSimulator({
  mares,
  stallions,
}: {
  mares: Horse[];
  stallions: Horse[];
}) {
  const [mareId, setMareId] = useState<string | null>(null);
  const [source, setSource] = useState<StallionSource>("externo");
  const [stallionId, setStallionId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [stallion, setStallion] = useState<StallionInput>({
    breed: "",
    height: "",
    temperament: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null); // validación del formulario
  const [requestError, setRequestError] = useState<string | null>(null); // fallo de la API
  const [retryMinutes, setRetryMinutes] = useState<number | null>(null); // límite por hora alcanzado
  const resultRef = useRef<HTMLDivElement>(null);

  // Libera la URL temporal de la foto anterior.
  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  useEffect(() => {
    if (status !== "loading") return;
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [status]);

  const mare = mares.find((m) => m.id === mareId);
  const dlcStallion =
    source === "dlc" ? stallions.find((s) => s.id === stallionId) : undefined;

  const update = (key: keyof StallionInput) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setStallion({ ...stallion, [key]: event.target.value });

  const generate = async () => {
    if (!mare) return setError("Selecciona una yegua de Rancho DLC.");
    if (source === "dlc" && !dlcStallion)
      return setError("Selecciona un semental de Rancho DLC.");
    if (source === "externo" && !stallion.breed.trim())
      return setError("Indica la raza de tu semental.");
    setError(null);
    setRequestError(null);
    setStatus("loading");

    try {
      const response = await fetch("/api/simulador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Semental DLC: basta el ID, el servidor conoce sus datos.
        body: JSON.stringify(
          dlcStallion
            ? { mareId: mare.id, stallionId: dlcStallion.id }
            : {
                mareId: mare.id,
                stallion,
                photo: photo ? await fileToBase64(photo) : null,
              },
        ),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 429 && data.code === "RATE_LIMIT") {
        setRequestError(data.error);
        setRetryMinutes(
          data.retryAfterSeconds ? Math.ceil(data.retryAfterSeconds / 60) : null,
        );
        setStatus("limited");
        return;
      }

      if (!response.ok || !data.imageUrl) {
        throw new Error(
          data.error ?? "No pudimos generar la proyección. Intenta de nuevo.",
        );
      }

      setResult({
        imageUrl: data.imageUrl,
        description: data.description,
        title: `${mare.name} x ${dlcStallion?.name ?? stallion.breed.trim()}`,
      });
      setStatus("done");
    } catch (err) {
      // fetch lanza TypeError cuando no hay conexión.
      setRequestError(
        err instanceof TypeError
          ? "No hay conexión con el simulador. Revisa tu internet e intenta de nuevo."
          : err instanceof Error
            ? err.message
            : "No pudimos generar la proyección. Intenta de nuevo.",
      );
      setStatus("error");
    }
  };

  return (
    <div>
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Columna 1: Selección DLC */}
        <section>
          <div className="flex items-baseline gap-4">
            <span className="font-serif text-4xl font-light text-dlc-oro">01</span>
            <div>
              <h2 className="font-serif text-2xl text-dlc-negro">Selección DLC</h2>
              <p className="mt-1 text-sm text-dlc-negro/60">
                Elige una yegua de nuestra línea de cría.
              </p>
            </div>
          </div>
          <div className="mt-8">
            <MareSelector mares={mares} selected={mareId} onSelect={setMareId} />
          </div>
        </section>

        {/* Columna 2: Tu Semental */}
        <section>
          <div className="flex items-baseline gap-4">
            <span className="font-serif text-4xl font-light text-dlc-oro">02</span>
            <div>
              <h2 className="font-serif text-2xl text-dlc-negro">Tu Semental</h2>
              <p className="mt-1 text-sm text-dlc-negro/60">
                {source === "dlc"
                  ? "Elige uno de los sementales de Rancho DLC."
                  : "Comparte una foto y sus datos principales."}
              </p>
            </div>
          </div>
          {/* Sin sementales publicados solo queda la opción de semental externo. */}
          {stallions.length > 0 && (
            <div className="mt-8">
              <SourceToggle
                value={source}
                onChange={(value) => {
                  setSource(value);
                  setError(null);
                }}
              />
            </div>
          )}
          {source === "dlc" ? (
            <div className="mt-6">
              <StallionSelector
                stallions={stallions}
                selected={stallionId}
                onSelect={setStallionId}
              />
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              <PhotoDropzone
                photoUrl={photoUrl}
                onFile={(file) => {
                  setPhoto(file);
                  setPhotoUrl(URL.createObjectURL(file));
                }}
              />
              <div>
                <label htmlFor="raza" className={labelClass}>
                  Raza
                </label>
                <input
                  id="raza"
                  value={stallion.breed}
                  onChange={update("breed")}
                  maxLength={80}
                  placeholder="Ej. Holsteiner"
                  className={fieldClass}
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="alzada" className={labelClass}>
                    Alzada
                  </label>
                  <input
                    id="alzada"
                    inputMode="decimal"
                    value={stallion.height}
                    onChange={update("height")}
                    maxLength={80}
                    placeholder="Ej. 1.70 m"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="temperamento" className={labelClass}>
                    Temperamento
                  </label>
                  <input
                    id="temperamento"
                    value={stallion.temperament}
                    onChange={update("temperament")}
                    maxLength={80}
                    placeholder="Ej. Noble y valiente"
                    className={fieldClass}
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="mt-16 flex flex-col items-center">
        <button
          type="button"
          onClick={generate}
          disabled={status === "loading"}
          className="w-full max-w-2xl bg-dlc-oro px-10 py-6 text-xs font-medium uppercase tracking-[0.35em] text-dlc-negro transition-colors duration-500 hover:bg-dlc-negro hover:text-dlc-marfil disabled:cursor-wait disabled:opacity-60"
        >
          Generar Proyección Genética (IA)
        </button>
        {error && (
          <p className="mt-4 text-sm text-red-800" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Resultado */}
      <div ref={resultRef} className="mt-16" aria-live="polite">
        {status === "loading" && <Spinner />}
        {status === "limited" && requestError && (
          <div className="flex flex-col items-center border border-dlc-oro bg-dlc-arena px-6 py-14 text-center">
            <span className="h-px w-12 bg-dlc-oro" />
            <p className="mt-8 font-serif text-2xl text-dlc-negro">
              {requestError}
            </p>
            {retryMinutes && (
              <p className="mt-3 text-sm text-dlc-negro/70">
                Podrás generar una nueva proyección en aproximadamente{" "}
                {retryMinutes} {retryMinutes === 1 ? "minuto" : "minutos"}.
              </p>
            )}
            <p className="mt-6 max-w-md text-sm leading-7 text-dlc-negro/70">
              Mientras tanto, nuestros especialistas pueden asesorarte
              personalmente sobre la cruza ideal para tu semental.
            </p>
            <Link
              href="/contacto"
              className="press mt-8 bg-dlc-negro px-8 py-4 text-xs uppercase tracking-[0.3em] text-dlc-marfil hover:bg-dlc-cuero"
            >
              Hablar con un especialista
            </Link>
          </div>
        )}
        {status === "error" && requestError && (
          <div className="flex flex-col items-center border border-red-900/20 bg-white px-6 py-14 text-center">
            <p className="font-serif text-2xl text-dlc-negro">
              No pudimos generar la proyección
            </p>
            <p className="mt-3 max-w-md text-sm leading-7 text-dlc-negro/70">
              {requestError}
            </p>
            <button
              type="button"
              onClick={generate}
              className="mt-8 border border-dlc-cuero px-6 py-3 text-xs uppercase tracking-[0.3em] text-dlc-cuero transition-colors duration-300 hover:bg-dlc-cuero hover:text-dlc-marfil"
            >
              Intentar de nuevo
            </button>
          </div>
        )}
        {status === "done" && result && (
          <section className="grid overflow-hidden bg-dlc-negro lg:grid-cols-2">
            <div className="relative aspect-[3/2] lg:aspect-auto lg:min-h-[480px]">
              {/* Imagen generada (data URL base64): no pasa por el optimizador de next/image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={result.imageUrl}
                alt={`Proyección del potro: ${result.title}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center px-8 py-14 sm:px-12">
              <p className="text-[11px] uppercase tracking-[0.5em] text-dlc-oro">
                Proyección Genética
              </p>
              <h3 className="mt-4 font-serif text-3xl font-light text-dlc-marfil sm:text-4xl">
                {result.title}
              </h3>
              <span className="mt-6 h-px w-16 bg-dlc-oro" />
              <p className="mt-6 leading-8 text-dlc-marfil/80">
                {result.description}
              </p>
              <p className="mt-8 text-[11px] leading-5 text-dlc-marfil/40">
                Imagen y descripción generadas con inteligencia artificial a
                partir de los datos ingresados. Son ilustrativas y no sustituyen
                una evaluación genética o veterinaria profesional.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
