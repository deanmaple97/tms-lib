/**
 * Normalize Vite base URL ensuring trailing slash.
 */
export function getBaseUrl() {
  const raw = import.meta.env.VITE_BASE_URL || "/";
  return raw.endsWith("/") ? raw : raw + "/";
}

/**
 * Prefix a relative path with the normalized base.
 * Accepts paths with or without leading slash.
 */
export function withBase(path) {
  const base = getBaseUrl();
  const clean = String(path || "").replace(/^\/+/, "");
  return base + clean;
}