export const UserRole = Object.freeze({
  ADMIN: "ADMIN",
  CUSTOMER_SERVICE: "CUSTOMER_SERVICE",
  BRANCH_EMPLOYEE: "BRANCH_EMPLOYEE",
});

export const USER_ROLE_LABELS = Object.freeze({
  [UserRole.ADMIN]: "مدير",
  [UserRole.CUSTOMER_SERVICE]: "خدمة العملاء",
  [UserRole.BRANCH_EMPLOYEE]: "موظف فرع",
});

export const USER_ROLE_OPTIONS = Object.freeze(
  Object.values(UserRole).map((value) => ({
    label: USER_ROLE_LABELS[value],
    value,
  })),
);

export const isUserRole = (value) =>
  Object.values(UserRole).includes(String(value || "").toUpperCase());

export const normalizeUserRole = (value, fallback = UserRole.ADMIN) => {
  const next = String(value || "").toUpperCase();
  return isUserRole(next) ? next : fallback;
};

export const getUserRoleLabel = (value) => {
  const role = normalizeUserRole(value, "");
  return USER_ROLE_LABELS[role] || value || "-";
};

export const isAdminRole = (value) =>
  normalizeUserRole(value, "") === UserRole.ADMIN;

export const isCustomerServiceRole = (value) =>
  normalizeUserRole(value, "") === UserRole.CUSTOMER_SERVICE;

export const isBranchEmployeeRole = (value) =>
  normalizeUserRole(value, "") === UserRole.BRANCH_EMPLOYEE;

export const userRoleRequiresBranch = (value) => isBranchEmployeeRole(value);
