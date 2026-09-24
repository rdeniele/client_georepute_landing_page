/**
 * Sliding-window request budget, per key. Pure (no `server-only`, injectable
 * clock) so it can be tested; the app uses it through lib/services/rateLimit.ts.
 *
 * In-memory, so it is per server instance. On serverless hosting a determined
 * attacker can spread requests across instances, which makes this a brake on
 * casual abuse and runaway clicking, not a hard guarantee. It backs up the
 * provider's own limits; it does not replace them.
 */
export type Budget = { ok: boolean; retryAfterSeconds: number };

const MAX_KEYS = 5000;

export function createBudget(now: () => number = Date.now) {
  const buckets = new Map<string, number[]>();

  return function withinBudget(key: string, max: number, windowMs: number): Budget {
    const t = now();

    // Bound memory: when many distinct keys accumulate, drop the ones with no recent activity.
    if (buckets.size > MAX_KEYS) {
      for (const [k, stamps] of buckets) {
        if (!stamps.length || t - stamps[stamps.length - 1] >= windowMs) buckets.delete(k);
      }
    }

    const stamps = (buckets.get(key) ?? []).filter((s) => t - s < windowMs);
    if (stamps.length >= max) {
      buckets.set(key, stamps);
      return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (t - stamps[0])) / 1000)) };
    }
    stamps.push(t);
    buckets.set(key, stamps);
    return { ok: true, retryAfterSeconds: 0 };
  };
}
