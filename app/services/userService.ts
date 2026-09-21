import { apiFetch, firstRow } from "~/utils/apiFetch";

const ROLE_MAP: Record<string, string> = {
  admin: "ADMIN",
  ADMIN: "ADMIN",
  social: "CUSTOMER_SERVICE",
  customer_service: "CUSTOMER_SERVICE",
  CUSTOMER_SERVICE: "CUSTOMER_SERVICE",
  branch: "BRANCH_EMPLOYEE",
  library_employee: "BRANCH_EMPLOYEE",
  BRANCH_EMPLOYEE: "BRANCH_EMPLOYEE",
};

const STATUS_MAP: Record<string, string> = {
  active: "ACTIVE",
  ACTIVE: "ACTIVE",
  inactive: "INACTIVE",
  INACTIVE: "INACTIVE",
  blocked: "INACTIVE",
  pending: "INACTIVE",
};

const userBody = (payload: Record<string, any>) => {
  const body: Record<string, any> = {
    email: payload.email,
    fullName: payload.fullName || payload.full_name || payload.name,
    role: ROLE_MAP[payload.role] || payload.role,
  };

  if (payload.password) body.password = payload.password;
  if (payload.phone != null && payload.phone !== "") body.phone = payload.phone;

  const branchId = payload.branchId ?? payload.branch_id;
  if (branchId) body.branchId = branchId;

  return body;
};

export const userService = {
  async getUsers(params: Record<string, any> = {}) {
    return await apiFetch("/users", { method: "GET", params });
  },

  async getUser(id: string) {
    return firstRow(await apiFetch(`/users/${id}`, { method: "GET" }));
  },

  async createUser(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/users", {
        method: "POST",
        body: userBody(payload),
      }),
    );
  },

  async updateUser(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/users/${id}`, {
        method: "PATCH",
        body: userBody(payload),
      }),
    );
  },

  async updateUserStatus(id: string, status: string | boolean) {
    const resolved =
      typeof status === "boolean"
        ? status
          ? "ACTIVE"
          : "INACTIVE"
        : STATUS_MAP[status] || status;

    return firstRow(
      await apiFetch(`/users/${id}/status`, {
        method: "PATCH",
        body: { status: resolved },
      }),
    );
  },
};
