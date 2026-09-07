type Bucket = { count: number; resetAt: number };

const globalStore = globalThis as typeof globalThis & {
  __alooRateLimit?: Map<string, Bucket>;
};

const store = globalStore.__alooRateLimit || new Map<string, Bucket>();
globalStore.__alooRateLimit = store;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  current.count += 1;
  store.set(key, current);

  return {
    ok: current.count <= limit,
    remaining: Math.max(0, limit - current.count)
  };
}

export function requestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}
