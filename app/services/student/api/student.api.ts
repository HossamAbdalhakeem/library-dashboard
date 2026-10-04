import {
  apiFetch,
  apiFetchBlob,
  firstRow,
  asPaginated,
  type PaginatedResponse,
} from "~/utils/apiFetch";
import type {
  StudentQuery,
  StudentTransactionsQuery,
  StudentExportQuery,
  StudentPayload,
  StudentUpdatePayload,
  StudentResponse,
  StudentTransactionResponse,
  StudentDeleteResponse,
} from "../types/student.types";

export const studentApi = {
  /** GET /admin-api/students → PaginatedResponse<StudentResponse> */
  async getStudents(
    params: StudentQuery = {},
  ): Promise<PaginatedResponse<StudentResponse>> {
    return asPaginated<StudentResponse>(
      await apiFetch("/admin-api/students", { method: "GET", params }),
    );
  },

  /** Convenience search → StudentResponse[] */
  async searchStudents(
    search = "",
    params: StudentQuery = {},
  ): Promise<StudentResponse[]> {
    const term = String(search || "").trim();
    const result = await this.getStudents({
      per_page: 20,
      ...params,
      ...(term ? { search: term } : {}),
    });
    return result.data;
  },

  /** GET /admin-api/students/:id/transactions → PaginatedResponse<StudentTransactionResponse> */
  async getStudentTransactions(
    id: string,
    params: StudentTransactionsQuery = {},
  ): Promise<PaginatedResponse<StudentTransactionResponse>> {
    return asPaginated<StudentTransactionResponse>(
      await apiFetch(`/admin-api/students/${id}/transactions`, {
        method: "GET",
        params,
      }),
    );
  },

  /** GET /admin-api/students/export → CSV blob */
  async exportStudents(params: StudentExportQuery = {}): Promise<Blob> {
    return apiFetchBlob("/admin-api/students/export", {
      method: "GET",
      params,
    });
  },

  /** POST /admin-api/students → StudentResponse | null */
  async createStudent(
    payload: StudentPayload,
  ): Promise<StudentResponse | null> {
    return firstRow<StudentResponse>(
      await apiFetch("/admin-api/students", {
        method: "POST",
        body: payload,
      }),
    );
  },

  /** PATCH /admin-api/students/:id → StudentResponse | null */
  async updateStudent(
    id: string,
    payload: StudentUpdatePayload,
  ): Promise<StudentResponse | null> {
    return firstRow<StudentResponse>(
      await apiFetch(`/admin-api/students/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },

  /** DELETE /admin-api/students/:id → StudentDeleteResponse | null */
  async deleteStudent(id: string): Promise<StudentDeleteResponse | null> {
    return firstRow<StudentDeleteResponse>(
      await apiFetch(`/admin-api/students/${id}`, { method: "DELETE" }),
    );
  },
};

/** @deprecated Prefer `studentApi` */
export const studentService = studentApi;
