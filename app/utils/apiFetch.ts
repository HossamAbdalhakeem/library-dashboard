import { useAuth } from "~/composables/useAuth";
import { useLocalStorage } from "~/composables/useLocalStorage";
import { resolveApiErrorMessage } from "~/utils/api-errors/messages";

type FetchOptions = Parameters<typeof $fetch>[1];

export type ApiFetchOptions = NonNullable<FetchOptions> & {
  /**
   * Cancel this read when the route changes.
   * Writes are never cancelled. Set false for a GET that must finish
   * across a redirect (academic years after login).
   */
  abortOnNavigate?: boolean;
};

/** Thrown when a read is cancelled because the user left the page. */
export const REQUEST_ABORTED = "REQUEST_ABORTED";

let routeController: AbortController | null = null;

const getRouteSignal = () => {
  if (!import.meta.client) return undefined;
  if (!routeController || routeController.signal.aborted) {
    routeController = new AbortController();
  }
  return routeController.signal;
};

/** Drop in-flight GET requests started on the page being left. */
export const abortRouteRequests = () => {
  if (!import.meta.client) return;
  routeController?.abort();
  routeController = new AbortController();
};

const isAbortError = (error: any) =>
  error?.name === "AbortError" || error?.cause?.name === "AbortError";

export const isRequestAborted = (error: any) =>
  error?.code === REQUEST_ABORTED || isAbortError(error);

export class ApiError extends Error {
  code: string;
  status?: number;
  detail?: string;

  constructor(
    code: string,
    message: string,
    status?: number,
    detail?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

const stripSlash = (value = "") => String(value || "").trim().replace(/\/$/, "");

export const getApiOrigin = () => {
  const config = useRuntimeConfig();
  return stripSlash(config.public.baseUrl || "");
};

/** Login stays callable without a staff token. */
const PUBLIC_PATHS = ["/admin-api/auth/login"];

/** Backend code for a rejected bearer token (invalid or failed auth). */
const AUTH_SESSION_END_CODE = "AUTHENTICATION_FAILED";

let endingSession = false;

const endSession = async () => {
  if (endingSession) return;
  endingSession = true;

  try {
    await useAuth().logout();
  } catch (error) {
    console.error("Failed to end session after authentication failure", error);
    try {
      await navigateTo("/login");
    } catch {
      // Navigation can be unavailable during early boot.
    }
  } finally {
    endingSession = false;
  }
};

const isPublicPath = (path: string) => {
  const normalized = String(path || "").split("?")[0] || "";
  return PUBLIC_PATHS.some(
    (prefix) =>
      normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
};

const getStoredToken = () => {
  try {
    return useLocalStorage("token").value || null;
  } catch {
    return null;
  }
};

const getAuthHeaders = (extra: Record<string, string> = {}) => {
  const token = getStoredToken();

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
};

const extractMessage = (body: any): string => {
  const message = body?.message;

  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.join(", ");
  if (message && typeof message === "object") {
    if (typeof message.message === "string") return message.message;
    if (Array.isArray(message.message)) return message.message.join(", ");
  }

  return body?.error || "Request failed.";
};

const toApiError = (error: any) => {
  const body = error?.data || error;
  // Prefer backend ErrorCode string over numeric HTTP statusCode.
  const code = String(body?.code || body?.error || "REQUEST_FAILED");
  const detail =
    typeof body?.detail === "string" ? body.detail : undefined;
  const fallback =
    extractMessage(body) || error?.message || "Request failed.";
  const message = resolveApiErrorMessage(code, String(fallback));
  return new ApiError(
    code,
    message,
    error?.status || error?.statusCode || body?.status,
    detail,
  );
};

export const asData = <T = any>(response: any): T => {
  if (response && typeof response === "object" && "data" in response) {
    return response.data as T;
  }

  return response as T;
};

export type PaginationMeta = {
  total: number;
  current_page: number;
  to: number;
  per_page: number;
};

export type PaginatedResponse<T = any> = {
  data: T[];
  pagination: PaginationMeta;
};

export const asList = <T = any>(response: any): T[] => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const asPaginated = <T = any>(
  response: any,
): PaginatedResponse<T> => ({
  data: asList<T>(response),
  pagination: response?.pagination || {
    total: asList(response).length,
    current_page: 1,
    to: asList(response).length,
    per_page: asList(response).length || 20,
  },
});

export const firstRow = <T = any>(response: any): T | null => {
  const list = asList<T>(response);
  if (list.length) return list[0] ?? null;
  const data = asData(response);
  return data && !Array.isArray(data) ? (data as T) : null;
};

const cleanParams = (params: Record<string, any> = {}) => {
  const out: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    out[key] = value;
  });

  return out;
};

const getAcademicYearId = () => {
  try {
    return useLocalStorage("academicYearId").value || null;
  } catch {
    return null;
  }
};

/** Always attach academicYearId as a query param when available. */
const withAcademicYearParams = (params: Record<string, any> = {}) => {
  const next = { ...params };

  if (next.academicYearId != null && next.academicYearId !== "") return next;

  const academicYearId = getAcademicYearId();
  if (academicYearId) next.academicYearId = academicYearId;
  return next;
};

const request = async <T = any>(
  baseURL: string,
  path: string,
  options: ApiFetchOptions = {},
) => {
  if (!baseURL) {
    throw new ApiError("MISSING_API_BASE", "API base URL is not configured.");
  }

  // No token → fail locally (no network). Used after logout while UI is still mounted.
  if (!isPublicPath(path) && !getStoredToken()) {
    throw new ApiError("SESSION_CLEARED", "Not authenticated.", 401);
  }

  const { abortOnNavigate = true, ...fetchOptions } = options;
  const method = String(fetchOptions.method || "GET").toUpperCase();
  const signal =
    method === "GET" && abortOnNavigate
      ? getRouteSignal()
      : fetchOptions.signal;

  try {
    return await $fetch<T>(path, {
      ...fetchOptions,
      signal,
      params: cleanParams(
        withAcademicYearParams(
          (fetchOptions.params || {}) as Record<string, any>,
        ),
      ),
      baseURL,
      headers: getAuthHeaders({
        ...((fetchOptions.headers || {}) as Record<string, string>),
      }),
    });
  } catch (error) {
    if (isAbortError(error)) {
      throw new ApiError(REQUEST_ABORTED, REQUEST_ABORTED);
    }

    const apiError = toApiError(error);

    if (apiError.code === AUTH_SESSION_END_CODE && !isPublicPath(path)) {
      await endSession();
    }

    throw apiError;
  }
};

/** NestJS REST API requests */
export const apiFetch = async <T = any>(
  path: string,
  options: ApiFetchOptions = {},
) => {
  return request<T>(getApiOrigin(), path, options);
};

/** Binary/file downloads (CSV, etc.) */
export const apiFetchBlob = async (
  path: string,
  options: ApiFetchOptions = {},
) => {
  return request<Blob>(getApiOrigin(), path, {
    ...options,
    responseType: "blob",
  });
};

/** Auth endpoints on the same NestJS API */
export const authFetch = async <T = any>(
  path: string,
  options: ApiFetchOptions = {},
) => {
  return request<T>(getApiOrigin(), path, options);
};
