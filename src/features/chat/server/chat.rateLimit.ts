import 'server-only';
import { headers } from 'next/headers';

// In-memory abuse / cost guard — protects OpenAI credits from being drained by anonymous traffic.
// Three tiers: per-IP burst (per minute), per-IP per day, and a GLOBAL daily ceiling that hard-caps
// total spend regardless of how many IPs hit it. The VPS runs a single PM2 instance, so module-level
// state is sufficient here. Tune the numbers below to your budget.
const MINUTE_MS = 60_000;
const PER_IP_PER_MIN = 8;
const PER_IP_PER_DAY = 60;
const GLOBAL_PER_DAY = 1500;

const ipMinute = new Map<string, number[]>();
const ipDay = new Map<string, { day: number; count: number }>();
let globalDay = { day: -1, count: 0 };

const dayOf = (now: number): number => Math.floor(now / 86_400_000);

/** Best-effort client identifier from proxy headers; falls back to a shared 'local' bucket. */
async function clientKey(): Promise<string> {
  try {
    const h = await headers();
    const fwd = h.get('x-forwarded-for');
    if (fwd) return fwd.split(',')[0]!.trim();
    return h.get('x-real-ip') ?? 'local';
  } catch {
    return 'local';
  }
}

/**
 * Returns true when the current request should be rejected. A rejected request is NOT counted as a
 * hit; a permitted one is recorded against all three tiers.
 */
export async function isRateLimited(): Promise<boolean> {
  const key = await clientKey();
  const now = Date.now();
  const day = dayOf(now);

  // Global daily ceiling — the backstop against distributed abuse draining credits.
  if (globalDay.day !== day) globalDay = { day, count: 0 };
  if (globalDay.count >= GLOBAL_PER_DAY) return true;

  // Per-IP burst (per-minute) limit.
  const recent = (ipMinute.get(key) ?? []).filter((t) => now - t < MINUTE_MS);
  if (recent.length >= PER_IP_PER_MIN) {
    ipMinute.set(key, recent);
    return true;
  }

  // Per-IP daily limit.
  const perDay = ipDay.get(key);
  const dayCount = perDay && perDay.day === day ? perDay.count : 0;
  if (dayCount >= PER_IP_PER_DAY) return true;

  // Passed all tiers — record the hit.
  recent.push(now);
  ipMinute.set(key, recent);
  ipDay.set(key, { day, count: dayCount + 1 });
  globalDay.count += 1;

  pruneStale(now, day);
  return false;
}

/** Bound memory growth by dropping entries that can no longer affect any limit. */
function pruneStale(now: number, day: number): void {
  if (ipMinute.size > 5000) {
    for (const [k, v] of ipMinute) {
      const fresh = v.filter((t) => now - t < MINUTE_MS);
      if (fresh.length) ipMinute.set(k, fresh);
      else ipMinute.delete(k);
    }
  }
  if (ipDay.size > 20000) {
    for (const [k, v] of ipDay) if (v.day !== day) ipDay.delete(k);
  }
}
