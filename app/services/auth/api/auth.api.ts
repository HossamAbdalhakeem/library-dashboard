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
  /** POST /admin-api/auth/login → AuthSession */
  async login(payload: LoginPayload): Promise<AuthSession> {
    const session = await authFetch<LoginResponse>("/admin-api/auth/login", {
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

  /** POST /admin-api/auth/logout → LogoutResponse */
  async logout(): Promise<LogoutResponse> {
    return await authFetch<LogoutResponse>("/admin-api/auth/logout", {
      method: "POST",
      body: {},
    });
  },

  /** GET /admin-api/auth/me → AuthSession */
  async getCurrentUser(): Promise<AuthSession> {
    const user = await authFetch<AuthUserResponse>("/admin-api/auth/me", {
      method: "GET",
      // Session restore runs during the refresh navigation. Do not cancel it.
      abortOnNavigate: false,
    });
    return normalizeAuthSession(user, useLocalStorage("token").value);
  },
};

/** @deprecated Prefer `authApi` */
export const authService = authApi;
