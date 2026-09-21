import { useAuthStore } from "~/store/auth";
import { canAccessPath, homeForRole } from "~/utils/routeAccess";

// Only the old public pages should be redirected here.
// Dashboard routes such as /products/create, /inventory, /reservations, /reports, etc. stay available.
const legacyPublicPaths = [
  "/features",
  "/how",
  "/shop",
  "/privacy",
  "/creators",
];

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();
  authStore.hydrateFromStorage();

  const isLegacyPublicRoute =
    legacyPublicPaths.includes(to.path) ||
    legacyPublicPaths.some((path) => to.path.startsWith(`${path}/`));

  if (isLegacyPublicRoute) {
    return navigateTo(authStore.isLoggedIn ? "/" : "/login");
  }

  if (!authStore.isLoggedIn && to.path !== "/login") {
    return navigateTo("/login");
  }

  if (authStore.isLoggedIn && to.path === "/login") {
    return navigateTo("/");
  }

  if (!authStore.isLoggedIn) return;

  const role = authStore.user?.role || authStore.getRole;
  if (!canAccessPath(role, to.path)) {
    return navigateTo(homeForRole(role));
  }
});
