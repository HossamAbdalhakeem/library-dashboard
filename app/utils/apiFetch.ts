import { useLocalStorage } from "~/composables/useLocalStorage";

type FetchOptions = Parameters<typeof $fetch>[1];

export class ApiError extends Error {
  code: string;
  status?: number;

  constructor(code: string, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const stripSlash = (value = "") => String(value || "").trim().replace(/\/$/, "");

export const getApiOrigin = () => {
  const config = useRuntimeConfig();
  return stripSlash(config.public.baseUrl || "");
};

const PUBLIC_PATHS = ["/auth/login"];

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
  const code = String(
    body?.statusCode || body?.code || body?.error || "REQUEST_FAILED",
  );
  const message = extractMessage(body) || error?.message || "Request failed.";
  return new ApiError(code, String(message), error?.status || error?.statusCode);
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
  options: FetchOptions = {},
) => {
  if (!baseURL) {
    throw new ApiError("MISSING_API_BASE", "API base URL is not configured.");
  }

  // No token → fail locally (no network). Used after logout while UI is still mounted.
  if (!isPublicPath(path) && !getStoredToken()) {
    throw new ApiError("SESSION_CLEARED", "Not authenticated.", 401);
  }

  try {
    return await $fetch<T>(path, {
      ...options,
      params: cleanParams(
        withAcademicYearParams(
          (options.params || {}) as Record<string, any>,
        ),
      ),
      baseURL,
      headers: getAuthHeaders({
        ...((options.headers || {}) as Record<string, string>),
      }),
    });
  } catch (error) {
    throw toApiError(error);
  }
};

/** NestJS REST API requests */
export const apiFetch = async <T = any>(
  path: string,
  options: FetchOptions = {},
) => {
  return request<T>(getApiOrigin(), path, options);
};

/** Auth endpoints on the same NestJS API */
export const authFetch = async <T = any>(
  path: string,
  options: FetchOptions = {},
) => {
  return request<T>(getApiOrigin(), path, options);
};
