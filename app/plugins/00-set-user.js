import { useAuthStore } from "~/store/auth.js";
import { useAcademicYearStore } from "~/store/academicYear.js";
import { useLocalStorage } from "~/composables/useLocalStorage";

/**
 * Session restore on app boot / hard refresh.
 * Does not block Nuxt mount — sets authStore.sessionLoading so app.vue
 * can show a spinner while fetchUser + fetchYears run.
 */
export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp();
  const authStore = useAuthStore(nuxtApp.$pinia);
  const academicYearStore = useAcademicYearStore(nuxtApp.$pinia);
  const token = useLocalStorage("token");

  authStore.hydrateFromStorage();
  academicYearStore.hydrateSelectedId();

  if (!token.value) {
    authStore.sessionLoading = false;
    return;
  }

  authStore.token = token.value;
  authStore.sessionLoading = true;

  void (async () => {
    try {
      await authStore.fetchUser();
      if (authStore.isLoggedIn) {
        await academicYearStore.fetchYears().catch((error) => {
          console.error("Failed to load academic years:", error);
        });
      }
    } catch (error) {
      console.error("Failed to restore user session:", error);
      authStore.removeUser();
      academicYearStore.clear();
      await navigateTo("/login");
    } finally {
      authStore.sessionLoading = false;
    }
  })();
});
