/**
 * Auth API contracts — aligned with BE `toAuthenticatedUser`.
 * Reads nest `branch`; flat `branchId` is omitted on responses.
 */

export type NamedRef = {
  id: string;
  name: string;
};

/** Backend UserRole as returned by the API. */
export type AuthBackendRole =
  | "ADMIN"
  | "BRANCH_EMPLOYEE"
  | "CUSTOMER_SERVICE";

/** Backend UserStatus as returned by the API. */
export type AuthUserStatus = "ACTIVE" | "INACTIVE" | string;

/**
 * Stable user shape from POST /auth/login and GET /auth/me.
 * Branch assignment is nested only — use `branch?.id`.
 */
export type AuthUserResponse = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: AuthBackendRole;
  status: AuthUserStatus;
  branch: NamedRef | null;
};

/** POST /auth/login success body (before session normalize). */
export type LoginResponse = {
  accessToken: string;
  user: AuthUserResponse;
};

/** POST /auth/logout success body. */
export type LogoutResponse = {
  success: boolean;
  message?: string;
};

/** POST /auth/login body. */
export type LoginPayload = {
  email: string;
  password: string;
};

/** User after `normalizeAuthUser` (auth store). */
export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  /** Display alias — same as fullName */
  name: string;
  phone: string;
  status: AuthUserStatus;
  roles: AuthBackendRole[];
  /** Backend UserRole (ADMIN | BRANCH_EMPLOYEE | CUSTOMER_SERVICE) */
  role: AuthBackendRole;
  branch: NamedRef | null;
};

/** Session after `normalizeAuthSession`. */
export type AuthSession = {
  user: AuthUser;
  roles: AuthBackendRole[];
  branch: NamedRef | null;
  token: string | null;
};
