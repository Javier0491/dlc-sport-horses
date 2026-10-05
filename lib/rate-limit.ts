// Rate limiting básico en memoria (ventana deslizante por clave, p. ej. IP).
// Limitación: la memoria es por proceso. En serverless (Vercel) cada instancia lleva su
// propia cuenta y se reinicia en cada arranque en frío; para un límite global estricto,
// mover el registro a Supabase o a un store compartido (Redis/Upstash).

type Bucket = number[]; // marcas de tiempo (ms) de los intentos dentro de la ventana

export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}) {
  const buckets = new Map<string, Bucket>();

  return function check(key: string) {
    const now = Date.now();
    const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);

    // Limpieza oportunista para que el Map no crezca sin control.
    if (buckets.size > 10_000) {
      for (const [k, times] of buckets) {
        if (times.every((t) => now - t >= windowMs)) buckets.delete(k);
      }
    }

    if (recent.length >= limit) {
      buckets.set(key, recent);
      const retryAfterMs = windowMs - (now - recent[0]);
      return { allowed: false as const, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
    }

    recent.push(now);
    buckets.set(key, recent);
    return { allowed: true as const, remaining: limit - recent.length };
  };
}

// IP del cliente según los headers del proxy (Vercel y la mayoría de hostings los fijan).
export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}
