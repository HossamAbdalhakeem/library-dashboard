import { normalizeUserRole, UserRole } from "~/enums/userRole";

/**
 * Normalize /auth/login user or /auth/me payload for the auth store.
 * Expects nested `branch: { id, name }` from the API — no flat FK guessing.
 * `role` is the backend UserRole enum (ADMIN | BRANCH_EMPLOYEE | CUSTOMER_SERVICE).
 */
export const normalizeAuthUser = (user = {}) => {
  const role = normalizeUserRole(user.role, UserRole.ADMIN);
  const branch =
    user.branch?.id != null
      ? { id: user.branch.id, name: user.branch.name || "" }
      : null;

  const fullName = user.fullName || user.email || "";

  return {
    id: user.id,
    email: user.email,
    fullName,
    /** Display alias — same as fullName */
    name: fullName,
    phone: user.phone || "",
    status: user.status,
    /** Backend UserRole */
    role,
    /** Kept for getters that expect a roles list */
    roles: [role],
    branch,
  };
};

export const normalizeAuthSession = (user, token = null) => {
  const normalizedUser = normalizeAuthUser(user);
  return {
    user: normalizedUser,
    roles: normalizedUser.roles,
    branch: normalizedUser.branch,
    token,
  };
};
