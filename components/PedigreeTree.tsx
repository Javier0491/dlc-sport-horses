import Link from "next/link";
import type { Ancestor } from "@/lib/catalog";

const LINE = "bg-dlc-oro/60";

// Si un ancestro es una línea de sangre compartida en el catálogo, su tarjeta enlaza
// al catálogo filtrado por esa línea y muestra cuántos caballos la llevan.
export type LineLink = (name: string) => { href: string; count: number } | undefined;

function AncestorCard({
  name,
  role,
  lineLink,
}: {
  name: string;
  role?: string;
  lineLink?: LineLink;
}) {
  const line = lineLink?.(name);
  const content = (
    <>
      {role && (
        <p className="text-[8px] font-medium uppercase tracking-[0.3em] text-dlc-cuero">
          {role}
        </p>
      )}
      <p className="font-serif text-sm leading-tight text-dlc-negro sm:text-base">
        {name}
      </p>
      {line && (
        <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-dlc-cuero/80">
          ◆ {line.count} en DLC
        </p>
      )}
    </>
  );

  const base = "block w-28 shrink-0 border px-3 py-2.5 sm:w-36";
  return line ? (
    <Link
      href={line.href}
      title={`Ver los caballos DLC con sangre de ${name}`}
      className={`${base} border-dlc-oro bg-dlc-arena ring-1 ring-dlc-oro/40 transition-colors duration-300 hover:bg-dlc-oro/25`}
    >
      {content}
    </Link>
  ) : (
    <div className={`${base} border-dlc-oro bg-dlc-marfil`}>{content}</div>
  );
}

// Rama hacia un ancestro: línea horizontal + media línea vertical que forma la "llave".
function Branch({
  side,
  children,
}: {
  side: "top" | "bottom";
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center py-1.5 pl-4">
      <span className={`absolute left-0 top-1/2 h-px w-4 ${LINE}`} />
      <span
        className={`absolute left-0 w-px ${LINE} ${
          side === "top" ? "top-1/2 bottom-0" : "top-0 bottom-1/2"
        }`}
      />
      {children}
    </div>
  );
}

function PedigreeNode({
  ancestor,
  role,
  lineLink,
}: {
  ancestor: Ancestor | null;
  role?: string;
  lineLink?: LineLink;
}) {
  // Padre o madre sin registrar en el panel.
  if (!ancestor) {
    return (
      <div className="block w-28 shrink-0 border border-dashed border-dlc-oro/60 px-3 py-2.5 sm:w-36">
        {role && (
          <p className="text-[8px] font-medium uppercase tracking-[0.3em] text-dlc-cuero">
            {role}
          </p>
        )}
        <p className="font-serif text-sm leading-tight text-dlc-negro/40 sm:text-base">
          Sin registrar
        </p>
      </div>
    );
  }

  const hasParents = ancestor.sire || ancestor.dam;

  return (
    <div className="flex items-center">
      <AncestorCard name={ancestor.name} role={role} lineLink={lineLink} />
      {hasParents && (
        <>
          <span className={`h-px w-4 shrink-0 ${LINE}`} />
          <div className="flex flex-col">
            {ancestor.sire && (
              <Branch side="top">
                <PedigreeNode ancestor={ancestor.sire} lineLink={lineLink} />
              </Branch>
            )}
            {ancestor.dam && (
              <Branch side="bottom">
                <PedigreeNode ancestor={ancestor.dam} lineLink={lineLink} />
              </Branch>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function PedigreeTree({
  sire,
  dam,
  lineLink,
}: {
  sire: Ancestor | null;
  dam: Ancestor | null;
  lineLink?: LineLink;
}) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex w-max flex-col gap-6">
        <PedigreeNode ancestor={sire} role="Padre" lineLink={lineLink} />
        <span className="h-px w-full bg-dlc-negro/10" />
        <PedigreeNode ancestor={dam} role="Madre" lineLink={lineLink} />
      </div>
    </div>
  );
}
