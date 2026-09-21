/**
 * Drop-in replacement for useCookie that persists to localStorage.
 * Same `.value` get/set API; null/empty clears the key.
 * Safe on SSR (reads/writes no-op / return default until client).
 */
export const useLocalStorage = (key, defaultValue = null) => {
  const canUse = () => import.meta.client && typeof localStorage !== "undefined";

  return {
    get value() {
      if (!canUse()) return defaultValue;
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? defaultValue : raw;
      } catch {
        return defaultValue;
      }
    },
    set value(next) {
      if (!canUse()) return;
      try {
        if (next === undefined || next === null || next === "") {
          localStorage.removeItem(key);
          return;
        }
        localStorage.setItem(key, String(next));
      } catch {
        // ignore quota / private mode errors
      }
    },
  };
};
