import { useAuthStore } from "~/store/auth";

const CUSTOMER_SERVICE_ROLES = new Set([
  "CUSTOMER_SERVICE",
  "CUSTOMER-SERVICE",
  "SOCIAL",
]);

export function useBookingRole() {
  const authStore = useAuthStore();

  const bookingRole = computed(() => {
    const roles = authStore.getRoles || authStore.user?.roles || [];
    const list = Array.isArray(roles) ? roles : [roles];

    if (
      list.some((role) =>
        CUSTOMER_SERVICE_ROLES.has(String(role || "").toUpperCase()),
      )
    ) {
      return "CUSTOMER_SERVICE";
    }

    const dashboardRole = String(
      authStore.user?.role || authStore.getRole || "",
    ).toUpperCase();

    if (CUSTOMER_SERVICE_ROLES.has(dashboardRole)) {
      return "CUSTOMER_SERVICE";
    }

    return authStore.user?.role || authStore.getRole || "";
  });

  const isCustomerService = computed(() => {
    const role = String(bookingRole.value || "").toUpperCase();
    return CUSTOMER_SERVICE_ROLES.has(role);
  });

  return {
    bookingRole,
    isCustomerService,
  };
}
