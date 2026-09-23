/** Shared helpers for domain label maps. */

export const DEFAULT_METRIC_COLOR = "#94a3b8";

export const UNSPECIFIED_LABEL = "غير محدد";

export const getLabel = (map, key, fallback = key || "—") => {
  if (key == null || key === "") return fallback;
  const normalized = String(key);
  return map[normalized] || map[normalized.toUpperCase()] || fallback;
};
