const THEME_KEY = "app-theme";
const DARK_CLASS = "app-dark";

const normalizeTheme = (value) => (value === "light" ? "light" : "dark");

const applyDomTheme = (mode) => {
  if (!import.meta.client || typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add(DARK_CLASS);
  } else {
    root.classList.remove(DARK_CLASS);
  }
};

/**
 * App color theme (dark default). Persists to localStorage and toggles
 * `.app-dark` on <html> for PrimeVue + CSS variable schemes.
 */
export const useTheme = () => {
  const theme = useState("app-theme", () => "dark");
  const isDark = computed(() => theme.value === "dark");

  const applyTheme = (next) => {
    const mode = normalizeTheme(next);
    theme.value = mode;
    applyDomTheme(mode);
    useLocalStorage(THEME_KEY, "dark").value = mode;
  };

  const toggleTheme = () => {
    applyTheme(isDark.value ? "light" : "dark");
  };

  const initTheme = () => {
    const stored = useLocalStorage(THEME_KEY, "dark").value;
    applyTheme(normalizeTheme(stored));
  };

  return {
    theme,
    isDark,
    applyTheme,
    toggleTheme,
    initTheme,
  };
};
