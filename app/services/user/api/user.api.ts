import { apiFetch, firstRow, asList } from "~/utils/apiFetch";
import type {
  UserQuery,
  UserPayload,
  UserUpdatePayload,
  UserStatusPayload,
  UserResponse,
} from "../types/user.types";

export const userApi = {
  /** GET /users → UserResponse[] */
  async getUsers(params: UserQuery = {}): Promise<UserResponse[]> {
    return asList<UserResponse>(
      await apiFetch("/users", { method: "GET", params }),
    );
  },

  /** POST /users → UserResponse | null */
  async createUser(payload: UserPayload): Promise<UserResponse | null> {
    return firstRow<UserResponse>(
      await apiFetch("/users", {
        method: "POST",
        body: payload,
      }),
    );
  },

  /** PATCH /users/:id → UserResponse | null */
  async updateUser(
    id: string,
    payload: UserUpdatePayload,
  ): Promise<UserResponse | null> {
    return firstRow<UserResponse>(
      await apiFetch(`/users/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },

  /** PATCH /users/:id/status → UserResponse | null */
  async updateUserStatus(
    id: string,
    payload: UserStatusPayload,
  ): Promise<UserResponse | null> {
    return firstRow<UserResponse>(
      await apiFetch(`/users/${id}/status`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },
};

/** @deprecated Prefer `userApi` */
export const userService = userApi;
