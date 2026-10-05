// Modelo del catálogo público y utilidades sin dependencias de servidor:
// lo usan tanto las páginas (que leen de Supabase en lib/data.ts) como los componentes cliente.
import type { Categoria, Sexo } from "./caballos-types";
import { slugify } from "./slug";

export { slugify };

// Rancho DLC se dedica exclusivamente al salto.
export const DISCIPLINE = "Salto";

export type Ancestor = {
  name: string;
  sire?: Ancestor;
  dam?: Ancestor;
};

// Un caballo publicado (fila activa de public.caballos) con su pedigrí ya armado.
// Los campos opcionales en la base de datos llegan como null.
export type Horse = {
  id: string;
  name: string;
  category: Categoria;
  sex: Sexo | null;
  breed: string | null;
  registry: string | null;
  color: string | null;
  jumping: boolean; // "Actualmente saltando"
  birthYear: number | null;
  height: number | null; // alzada en metros
  behavior: string[];
  priceLevel: number | null; // 1-5; null si no se publica precio
  image: string | null;
  portrait: string | null;
  gallery: string[];
  sire: Ancestor | null;
  dam: Ancestor | null;
};

export const priceLabel = (level: number) => `$${"*".repeat(level)}`;

export const heightLabel = (meters: number) => `${meters.toFixed(2)} m`;

// "el caballo Hit One DLC" / "la yegua Helena DLC" (mensajes de WhatsApp, textos).
export const horseArticle = (h: Pick<Horse, "category" | "sex">) =>
  h.category === "Semental"
    ? "el semental"
    : h.sex === "Yegua" || h.category === "Yegua" || h.category === "Potranca"
      ? "la yegua"
      : "el caballo";

// Parámetros de filtro en la URL: /reproductores?raza=kwpn&precio=3&comportamiento=valiente,facil-manejo
export const FILTER_PARAMS = ["raza", "precio", "comportamiento"] as const;
export type FilterParam = (typeof FILTER_PARAMS)[number];
export type Filters = Partial<Record<FilterParam, string>>;

// /potros?sexo=yegua&linea=diamant-de-semilly&saltando=si
export const FOAL_FILTER_PARAMS = ["sexo", "linea", "saltando", "precio"] as const;
export type FoalFilterParam = (typeof FOAL_FILTER_PARAMS)[number];
export type FoalFilters = Partial<Record<FoalFilterParam, string>>;

// ---------------------------------------------------------------------
// Pedigrí: líneas de sangre y parentescos dentro de una lista de caballos
// ---------------------------------------------------------------------

function walk(tree: Ancestor | null | undefined, visit: (a: Ancestor) => void) {
  if (!tree) return;
  visit(tree);
  walk(tree.sire, visit);
  walk(tree.dam, visit);
}

// Todos los nombres del pedigrí de un caballo (sin repetir).
function ancestorsOf(h: Horse): string[] {
  const names = new Set<string>();
  const add = (a: Ancestor) => names.add(a.name);
  walk(h.sire, add);
  walk(h.dam, add);
  return [...names];
}

// Líneas de sangre compartidas: ancestros presentes en 2 o más caballos de la lista.
export type Bloodline = { name: string; slug: string; count: number };

export function bloodlines(list: Horse[]): Bloodline[] {
  const counts = new Map<string, number>();
  for (const h of list) {
    for (const name of ancestorsOf(h)) counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return [...counts]
    .filter(([, count]) => count >= 2)
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export const hasAncestor = (h: Horse, slug: string) =>
  ancestorsOf(h).some((name) => slugify(name) === slug);

// Parentesco con los demás caballos de la lista, del más cercano al más lejano.
export type Relative = { horse: Horse; relation: string; rank: number };

export function relativesOf(h: Horse, list: Horse[]): Relative[] {
  const mine = new Set(ancestorsOf(h));

  // nombre → nombres de sus padres, según los árboles de la lista.
  const parents = new Map<string, string[]>();
  for (const other of list) {
    const add = (a: Ancestor) =>
      parents.set(a.name, [a.sire?.name, a.dam?.name].filter((n): n is string => !!n));
    walk(other.sire, add);
    walk(other.dam, add);
  }

  return list
    .filter((other) => other.id !== h.id)
    .map((other): Relative | null => {
      const female = other.sex === "Yegua";
      const sibling = female ? "Hermana" : "Hermano";
      const sameSire = !!h.sire && other.sire?.name === h.sire.name;
      const sameDam = !!h.dam && other.dam?.name === h.dam.name;

      if (sameSire && sameDam) return { horse: other, relation: `${sibling} completo${female ? "a" : ""}`, rank: 0 };
      if (sameSire) return { horse: other, relation: `${sibling} de padre · ${h.sire!.name}`, rank: 1 };
      if (sameDam) return { horse: other, relation: `${sibling} de madre · ${h.dam!.name}`, rank: 1 };

      // Solo los ancestros compartidos más cercanos: si comparten a Diamant de Semilly,
      // no se menciona también a su padre Le Tot de Semilly.
      const shared = ancestorsOf(other)
        .filter((name) => mine.has(name))
        .filter((name, _, all) => !all.some((n) => parents.get(n)?.includes(name)));
      if (shared.length === 0) return null;
      return { horse: other, relation: `Comparten a ${shared.slice(0, 2).join(" y ")}`, rank: 2 };
    })
    .filter((r): r is Relative => r !== null)
    .sort((a, b) => a.rank - b.rank || a.horse.name.localeCompare(b.horse.name));
}
