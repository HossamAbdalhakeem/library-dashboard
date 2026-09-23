import { getStatusTagLabel } from "~/utils/status-tags/catalog";
import { getUserRoleLabel, UserRole } from "~/enums/userRole";

export const emptyUserForm = () => ({
  fullName: "",
  email: "",
  password: "",
  phone: "",
  role: UserRole.BRANCH_EMPLOYEE,
  branchId: null,
  isActive: true,
});

/** Map API user → form (nested branch only). */
export const mapUserToForm = (user) => ({
  fullName: user?.fullName || "",
  email: user?.email || "",
  password: "",
  phone: user?.phone || "",
  role: user?.role || UserRole.BRANCH_EMPLOYEE,
  branchId: user?.branch?.id || null,
  isActive: user ? user.status !== "INACTIVE" : true,
});

export const buildUserPayload = (form) => {
  const payload = {
    fullName: String(form.fullName || "").trim(),
    email: String(form.email || "").trim(),
    phone: form.phone || undefined,
    role: form.role,
  };

  if (form.password) payload.password = form.password;
  if (form.branchId) payload.branchId = form.branchId;

  return payload;
};

export const normalizeUserListItem = (user) => ({
  ...user,
  fullName: user.fullName || "-",
  email: user.email || "-",
  roleLabel: getUserRoleLabel(user.role),
  branchName: user.branch?.name || "-",
  statusLabel: getStatusTagLabel("entity", user.status),
});

export const buildUserListQuery = ({ filters = {} } = {}) => {
  const params = {};
  if (filters.search?.trim()) params.search = filters.search.trim();
  return params;
};
