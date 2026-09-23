export { authApi, authService } from "./api/auth.api";

export type {
  NamedRef,
  AuthBackendRole,
  AuthUserStatus,
  AuthUserResponse,
  LoginResponse,
  LogoutResponse,
  LoginPayload,
  AuthUser,
  AuthSession,
} from "./types/auth.types";

export {
  normalizeAuthUser,
  normalizeAuthSession,
} from "./helpers/auth-session.helper";
