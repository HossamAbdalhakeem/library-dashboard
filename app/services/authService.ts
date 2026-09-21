import { authFetch } from "~/utils/apiFetch";
import { useLocalStorage } from "~/composables/useLocalStorage";

const DASHBOARD_ROLES = {
  admin: "admin",
  library_employee: "branch",
  customer_service: "social",
} as const;

export const mapDashboardRole = (roles: string[] = []) => {
  const normalized = roles.map((role) => String(role || "").toUpperCase());

  if (normalized.includes("ADMIN")) return DASHBOARD_ROLES.admin;
  if (normalized.includes("BRANCH_EMPLOYEE") || normalized.includes("LIBRARY_EMPLOYEE")) {
    return DASHBOARD_ROLES.library_employee;
  }
  if (normalized.includes("CUSTOMER_SERVICE")) {
    return DASHBOARD_ROLES.customer_service;
  }

  return DASHBOARD_ROLES.admin;
};

const toRoleList = (user: Record<string, any> = {}) => {
  if (user.role) return [user.role];
  const roles = user.roles || [];
  return (Array.isArray(roles) ? roles : [roles]).filter(Boolean);
};

const normalizeAuth = (
  payload: Record<string, any> = {},
  token: string | null = null,
) => {
  const user = payload.user || payload;
  const roles = toRoleList(user);
  const branch =
    user.branch && user.branch.id
      ? {
          id: user.branch.id,
          name: user.branch.name || "",
        }
      : null;
  const branchId = branch?.id || user.branchId || user.branch_id || null;
  const branches = branch
    ? [branch]
    : branchId
      ? [{ id: branchId, name: "" }]
      : payload.branches || [];

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.fullName || user.full_name || user.name || user.email,
      name: user.fullName || user.full_name || user.name || user.email,
      phone: user.phone || "",
      roles,
      branch,
      branches,
      role: mapDashboardRole(roles),
      branch_id: branchId,
      branchId,
      status: user.status,
    },
    roles,
    branches,
    token,
  };
};

export const authService = {
  async login(payload: { email: string; password: string }) {
    const session = await authFetch<{
      accessToken: string;
      user: Record<string, any>;
    }>("/auth/login", {
      method: "POST",
      body: {
        email: payload.email,
        password: payload.password,
      },
    });

    const token = session?.accessToken || null;
    if (!token) {
      throw new Error("Login failed: no access token returned.");
    }

    useLocalStorage("token").value = token;
    return normalizeAuth(session, token);
  },

  async logout() {
    return await authFetch<{ success: boolean; message?: string }>("/auth/logout", {
      method: "POST",
      body: {},
    });
  },

  async getCurrentUser() {
    const user = await authFetch<Record<string, any>>("/auth/me", {
      method: "GET",
    });
    return normalizeAuth({ user }, useLocalStorage("token").value);
  },

  async me() {
    return this.getCurrentUser();
  },
};
