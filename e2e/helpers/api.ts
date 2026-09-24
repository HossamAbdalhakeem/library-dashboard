import { request, type APIRequestContext } from "@playwright/test";
import { e2eEnv, type RoleKey } from "./env";

export type LoginResult = {
  token: string;
  user: Record<string, unknown>;
  academicYearId?: string | null;
};

const unwrapData = <T>(body: unknown): T => {
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
};

export class ApiClient {
  constructor(
    private readonly api: APIRequestContext,
    private token: string | null = null,
    private academicYearId: string | null = null,
  ) {}

  static async create(token?: string | null, academicYearId?: string | null) {
    const api = await request.newContext({
      baseURL: e2eEnv.apiBaseUrl(),
      extraHTTPHeaders: {
        Accept: "application/json",
      },
    });
    return new ApiClient(api, token || null, academicYearId || null);
  }

  async dispose() {
    await this.api.dispose();
  }

  private headers(extra: Record<string, string> = {}) {
    return {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...extra,
    };
  }

  private withYearParams(
    params: Record<string, string | number | boolean> = {},
  ) {
    if (params.academicYearId != null || !this.academicYearId) return params;
    return { ...params, academicYearId: this.academicYearId };
  }

  async loginAs(role: RoleKey): Promise<LoginResult> {
    const { email, password } = e2eEnv.credentials(role);
    return this.loginWithCredentials(email, password, role);
  }

  /** Login with arbitrary credentials (e.g. newly created / inactive users). */
  async loginWithCredentials(
    email: string,
    password: string,
    label = "user",
  ): Promise<LoginResult> {
    const response = await this.api.post("/auth/login", {
      data: { email, password },
      headers: this.headers(),
    });

    if (!response.ok()) {
      const text = await response.text();
      const retryAfter = Number(response.headers()["retry-after"] || 0);
      const err = new Error(
        `API login failed for ${label} (${response.status()}): ${text}`,
      ) as Error & { retryAfterMs?: number; status?: number };
      if (retryAfter > 0) err.retryAfterMs = retryAfter * 1000;
      err.status = response.status();
      throw err;
    }

    const body = await response.json();
    const payload = unwrapData<{
      accessToken?: string;
      user?: Record<string, unknown>;
    }>(body);

    const token = payload?.accessToken;
    const user = payload?.user || {};
    if (!token) {
      throw new Error(`API login for ${label} returned no accessToken`);
    }

    this.token = token;

    let academicYearId: string | null = null;
    try {
      const yearsRes = await this.api.get("/academic-years", {
        headers: this.headers(),
      });
      if (yearsRes.ok()) {
        const yearsBody = await yearsRes.json();
        const years = unwrapData<Array<{ id?: string; status?: string }>>(
          yearsBody,
        );
        const list = Array.isArray(years) ? years : [];
        const active =
          list.find((y) => String(y.status || "").toUpperCase() === "ACTIVE") ||
          list[0];
        academicYearId = active?.id ? String(active.id) : null;
      }
    } catch {
      // optional
    }

    this.academicYearId = academicYearId;
    return { token, user, academicYearId };
  }

  async get(path: string, params?: Record<string, string | number | boolean>) {
    const response = await this.api.get(path, {
      headers: this.headers(),
      params: this.withYearParams(params),
    });
    if (!response.ok()) {
      throw new Error(
        `GET ${path} failed (${response.status()}): ${await response.text()}`,
      );
    }
    return response.json();
  }

  async post(
    path: string,
    data?: unknown,
    params?: Record<string, string | number | boolean>,
  ) {
    const response = await this.api.post(path, {
      headers: this.headers(),
      data,
      params: this.withYearParams(params),
    });
    if (!response.ok()) {
      throw new Error(
        `POST ${path} failed (${response.status()}): ${await response.text()}`,
      );
    }
    return response.json();
  }

  async patch(
    path: string,
    data?: unknown,
    params?: Record<string, string | number | boolean>,
  ) {
    const response = await this.api.patch(path, {
      headers: this.headers(),
      data,
      params: this.withYearParams(params),
    });
    if (!response.ok()) {
      throw new Error(
        `PATCH ${path} failed (${response.status()}): ${await response.text()}`,
      );
    }
    return response.json();
  }

  async createReservation(payload: {
    studentId: string;
    productId: string;
    quantity?: number;
    deposit: number;
    method?: string;
    branchId?: string;
    proofReference?: string;
  }) {
    return this.post("/reservations", {
      quantity: 1,
      method: "CASH",
      ...payload,
    });
  }

  async createSale(payload: {
    studentId: string;
    productId: string;
    quantity?: number;
    method?: string;
    proofReference?: string;
  }) {
    return this.post("/sales", {
      quantity: 1,
      method: "CASH",
      ...payload,
    });
  }

  async deliverReservation(
    id: string,
    payload: { method?: string; proofReference?: string } = {},
  ) {
    return this.post(`/reservations/${id}/deliver`, payload);
  }

  async cancelReservation(
    id: string,
    payload: { refundMethod?: string; proofReference?: string } = {},
  ) {
    return this.post(`/reservations/${id}/cancel`, payload);
  }

  async createReturn(payload: Record<string, unknown>) {
    return this.post("/returns", payload);
  }

  async searchStudents(search = "") {
    const body = await this.get("/students", {
      per_page: 20,
      ...(search ? { search } : {}),
    });
    const data = unwrapData<{ data?: unknown[] } | unknown[]>(body);
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  }

  async listProducts(params: Record<string, string | number> = {}) {
    const body = await this.get("/products", { per_page: 50, ...params });
    const data = unwrapData<{ data?: unknown[] } | unknown[]>(body);
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  }

  async listBranches() {
    const body = await this.get("/branches", { per_page: 50 });
    const data = unwrapData<{ data?: unknown[] } | unknown[]>(body);
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  }

  /** Soft GET — returns status without throwing (for access-control checks). */
  async getStatus(
    path: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<{ ok: boolean; status: number; body: unknown }> {
    const response = await this.api.get(path, {
      headers: this.headers(),
      params: this.withYearParams(params),
    });
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = await response.text().catch(() => null);
    }
    return { ok: response.ok(), status: response.status(), body };
  }

  async uploadPaymentProof(filePath: string, fileName = "payment-proof.png") {
    const fs = await import("node:fs");
    const buffer = fs.readFileSync(filePath);
    const response = await this.api.post("/uploads/payment-screenshot", {
      headers: {
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      multipart: {
        file: {
          name: fileName,
          mimeType: "image/png",
          buffer,
        },
      },
    });
    if (!response.ok()) {
      throw new Error(
        `uploadPaymentProof failed (${response.status()}): ${await response.text()}`,
      );
    }
    const body = await response.json();
    const payload = unwrapData<{ key?: string; fileUrl?: string }>(body);
    if (!payload?.key) {
      throw new Error(
        `uploadPaymentProof returned no key: ${JSON.stringify(body)}`,
      );
    }
    return payload;
  }
}
