import { useAuth } from "~/composables/useAuth";
import { canAccessPath, homeForRole } from "~/utils/routeAccess";

export default defineNuxtRouteMiddleware(async (to) => {
  const { authStore, isLoggedIn, role } = useAuth();
  authStore.hydrateFromStorage();

  if (!isLoggedIn.value && to.path !== "/login") {
    return navigateTo("/login");
  }

  if (isLoggedIn.value && to.path === "/login") {
    return navigateTo("/");
  }

  if (!isLoggedIn.value) return;

  if (!canAccessPath(role.value, to.path)) {
    return navigateTo(homeForRole(role.value));
  }
});
