import { useAuth } from "~/composables/useAuth";

export default defineNuxtRouteMiddleware(async () => {
  const { authStore, isLoggedIn } = useAuth();
  authStore.hydrateFromStorage();

  if (isLoggedIn.value) {
    return navigateTo("/");
  }
});
