/**
 * Frontend route allowlists by dashboard role (defense in depth).
 * API authorization remains the source of truth.
 */

export const DASHBOARD_HOME = Object.freeze({
  admin: "/home",
  branch: "/sales/direct",
  social: "/books/reserve",
});

export const normalizeDashboardRole = (value) => {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");

  if (
    raw === "branch" ||
    raw === "library_employee" ||
    raw === "branch_employee"
  ) {
    return "branch";
  }

  if (raw === "social" || raw === "customer_service") {
    return "social";
  }

  if (raw === "admin" || raw === "administrator") {
    return "admin";
  }

  return "admin";
};

const isExactOrChild = (path, prefix) =>
  path === prefix || path.startsWith(`${prefix}/`);

/**
 * @param {string} role dashboard role (admin|branch|social) or raw API role
 * @param {string} path route path
 */
export const canAccessPath = (role, path) => {
  const appRole = normalizeDashboardRole(role);
  const normalized = String(path || "").split("?")[0] || "";

  if (!normalized || normalized === "/" || normalized === "/login") {
    return true;
  }

  if (appRole === "admin") {
    return true;
  }

  if (appRole === "branch") {
    if (isExactOrChild(normalized, "/sales/direct")) return true;
    if (isExactOrChild(normalized, "/reservations/deliver")) return true;
    if (isExactOrChild(normalized, "/reports/branch")) return true;
    // Branch booking page only — not /reservations/manage
    if (normalized === "/reservations") return true;
    return false;
  }

  if (appRole === "social") {
    if (isExactOrChild(normalized, "/books/reserve")) return true;
    if (isExactOrChild(normalized, "/reports/customer-service")) return true;
    return false;
  }

  return false;
};

export const homeForRole = (role) =>
  DASHBOARD_HOME[normalizeDashboardRole(role)] || DASHBOARD_HOME.admin;
