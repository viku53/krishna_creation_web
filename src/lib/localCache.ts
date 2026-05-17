/** 2 months in milliseconds */
export const TWO_MONTHS_MS = 2 * 30 * 24 * 60 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  expiresAt: number; // Unix timestamp in ms
}

/**
 * Store a value in localStorage with an expiry timestamp.
 * Silent on quota errors — cache is best-effort.
 */
export function cacheSet<T>(key: string, data: T, ttlMs = TWO_MONTHS_MS): void {
  try {
    const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Quota exceeded or private-browsing — just skip caching
  }
}

/**
 * Retrieve a cached value. Returns `null` if missing or expired.
 */
export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Invalidate a cache entry manually (e.g. on user action).
 */
export function cacheClear(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
