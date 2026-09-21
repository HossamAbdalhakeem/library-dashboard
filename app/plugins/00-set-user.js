import { useAuthStore } from "~/store/auth.js";
import { useAcademicYearStore } from "~/store/academicYear.js";
import { useLocalStorage } from "~/composables/useLocalStorage";

export default defineNuxtPlugin(async () => {
  const nuxtApp = useNuxtApp();
  const authStore = useAuthStore(nuxtApp.$pinia);
  const academicYearStore = useAcademicYearStore(nuxtApp.$pinia);
  const token = useLocalStorage("token");

  // Restore cached session first for fast UI, then refresh from API.
  authStore.hydrateFromStorage();
  academicYearStore.hydrateSelectedId();

  if (!token.value) {
    return;
  }

  authStore.token = token.value;

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
  }
});
