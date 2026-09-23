import {
  normalizeUserRole,
  UserRole,
} from "~/enums/userRole";

/**
 * Frontend route allowlists by UserRole (defense in depth).
 * API authorization remains the source of truth.
 */

export const DASHBOARD_HOME = Object.freeze({
  [UserRole.ADMIN]: "/home",
  [UserRole.BRANCH_EMPLOYEE]: "/sales/direct",
  [UserRole.CUSTOMER_SERVICE]: "/books/reserve",
});

const isExactOrChild = (path, prefix) =>
  path === prefix || path.startsWith(`${prefix}/`);

/**
 * @param {string} role UserRole (ADMIN | BRANCH_EMPLOYEE | CUSTOMER_SERVICE)
 * @param {string} path route path
 */
export const canAccessPath = (role, path) => {
  const appRole = normalizeUserRole(role);
  const normalized = String(path || "").split("?")[0] || "";

  if (!normalized || normalized === "/" || normalized === "/login") {
    return true;
  }

  if (appRole === UserRole.ADMIN) {
    return true;
  }

  if (appRole === UserRole.BRANCH_EMPLOYEE) {
    if (isExactOrChild(normalized, "/sales/direct")) return true;
    if (isExactOrChild(normalized, "/reservations/deliver")) return true;
    if (isExactOrChild(normalized, "/reports/branch")) return true;
    // Branch booking page only — not /reservations/manage
    if (normalized === "/reservations") return true;
    return false;
  }

  if (appRole === UserRole.CUSTOMER_SERVICE) {
    if (isExactOrChild(normalized, "/books/reserve")) return true;
    if (isExactOrChild(normalized, "/reports/customer-service")) return true;
    return false;
  }

  return false;
};

export const homeForRole = (role) =>
  DASHBOARD_HOME[normalizeUserRole(role)] || DASHBOARD_HOME[UserRole.ADMIN];
