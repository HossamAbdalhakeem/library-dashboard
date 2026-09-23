import { storeToRefs } from "pinia";
import { useAuthStore } from "~/store/auth";
import {
  UserRole,
  normalizeUserRole,
  isAdminRole,
  isBranchEmployeeRole,
  isCustomerServiceRole,
  getLayoutForUserRole,
  getUserRoleLabel,
} from "~/enums/userRole";

/**
 * Auth session + role helpers (wraps Pinia auth store).
 */
export function useAuth() {
  const authStore = useAuthStore();
  const { user, token, loading, sessionLoading } = storeToRefs(authStore);

  const role = computed(() =>
    normalizeUserRole(
      authStore.getRole || authStore.user?.role,
      UserRole.ADMIN,
    ),
  );

  const isLoggedIn = computed(() => authStore.isLoggedIn);
  const isAdmin = computed(() => isAdminRole(role.value));
  const isBranchEmployee = computed(() => isBranchEmployeeRole(role.value));
  const isCustomerService = computed(() => isCustomerServiceRole(role.value));

  const branch = computed(() => authStore.getBranch || user.value?.branch || null);
  const branchId = computed(() => branch.value?.id ?? null);

  const roleLabel = computed(() => getUserRoleLabel(role.value));
  const layoutName = computed(() => getLayoutForUserRole(role.value));

  return {
    authStore,
    user,
    token,
    role,
    roleLabel,
    layoutName,
    branch,
    branchId,
    isLoggedIn,
    isAdmin,
    isBranchEmployee,
    isCustomerService,
    loading,
    sessionLoading,
  };
}
