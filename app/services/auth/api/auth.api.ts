import { authFetch } from "~/utils/apiFetch";
import { useLocalStorage } from "~/composables/useLocalStorage";
import { normalizeAuthSession } from "../helpers/auth-session.helper";
import type {
  LoginPayload,
  LoginResponse,
  LogoutResponse,
  AuthUserResponse,
  AuthSession,
} from "../types/auth.types";

export const authApi = {
  /** POST /auth/login → AuthSession */
  async login(payload: LoginPayload): Promise<AuthSession> {
    const session = await authFetch<LoginResponse>("/auth/login", {
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
    return normalizeAuthSession(session.user, token);
  },

  /** POST /auth/logout → LogoutResponse */
  async logout(): Promise<LogoutResponse> {
    return await authFetch<LogoutResponse>("/auth/logout", {
      method: "POST",
      body: {},
    });
  },

  /** GET /auth/me → AuthSession */
  async getCurrentUser(): Promise<AuthSession> {
    const user = await authFetch<AuthUserResponse>("/auth/me", {
      method: "GET",
    });
    return normalizeAuthSession(user, useLocalStorage("token").value);
  },

  /** GET /auth/me → AuthSession */
  async me(): Promise<AuthSession> {
    return this.getCurrentUser();
  },
};

/** @deprecated Prefer `authApi` */
export const authService = authApi;
