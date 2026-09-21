import { useAuthStore } from "~/store/auth";

export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore();
  authStore.hydrateFromStorage();

  if (authStore.isLoggedIn) {
    return navigateTo("/");
  }
});
