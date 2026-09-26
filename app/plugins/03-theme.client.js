export default defineNuxtPlugin(() => {
  const { theme, initTheme } = useTheme();
  initTheme();

  // Keep <html> class in sync with saved theme so Nuxt head does not
  // re-apply a stale dark class after refresh.
  useHead({
    htmlAttrs: {
      class: computed(() => (theme.value === "dark" ? "app-dark" : "")),
    },
  });
});
