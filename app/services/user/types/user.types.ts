/**
 * User API contracts — aligned with BE `toUserResponse`.
 * Reads nest `branch`; flat `branchId` is omitted on responses.
 */

export type NamedRef = {
  id: string;
  name: string;
};

/** Entity status as returned by the API. */
export type UserStatus = "ACTIVE" | "INACTIVE";

/** Role as returned by the API. */
export type UserRole =
  | "ADMIN"
  | "CUSTOMER_SERVICE"
  | "BRANCH_EMPLOYEE";

/**
 * Stable response from:
 * GET /users, GET /users/:id,
 * POST /users, PATCH /users/:id, PATCH /users/:id/status
 */
export type UserResponse = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole | string;
  status: UserStatus | string;
  branch: NamedRef | null;
  createdAt?: string;
  updatedAt?: string;
};

/** GET /users query params (client-side filters). */
export type UserQuery = {
  search?: string;
};

/** POST /users body. */
export type UserPayload = {
  email: string;
  fullName: string;
  password?: string;
  phone?: string;
  role: UserRole | string;
  branchId?: string | null;
};

/** PATCH /users/:id body. */
export type UserUpdatePayload = {
  email?: string;
  fullName?: string;
  password?: string;
  phone?: string;
  role?: UserRole | string;
  branchId?: string | null;
};

/** PATCH /users/:id/status body. */
export type UserStatusPayload = {
  status: UserStatus;
};

/** List/table row after `normalizeUserListItem`. */
export type UserListItem = UserResponse & {
  roleLabel: string;
  branchName: string;
  statusLabel: string;
};
