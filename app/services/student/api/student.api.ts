import {
  apiFetch,
  firstRow,
  asPaginated,
  type PaginatedResponse,
} from "~/utils/apiFetch";
import type {
  StudentQuery,
  StudentTransactionsQuery,
  StudentPayload,
  StudentUpdatePayload,
  StudentResponse,
  StudentTransactionResponse,
  StudentDeleteResponse,
} from "../types/student.types";

export const studentApi = {
  /** GET /students → PaginatedResponse<StudentResponse> */
  async getStudents(
    params: StudentQuery = {},
  ): Promise<PaginatedResponse<StudentResponse>> {
    return asPaginated<StudentResponse>(
      await apiFetch("/students", { method: "GET", params }),
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

  /** GET /students/:id/transactions → PaginatedResponse<StudentTransactionResponse> */
  async getStudentTransactions(
    id: string,
    params: StudentTransactionsQuery = {},
  ): Promise<PaginatedResponse<StudentTransactionResponse>> {
    return asPaginated<StudentTransactionResponse>(
      await apiFetch(`/students/${id}/transactions`, {
        method: "GET",
        params,
      }),
    );
  },

  /** POST /students → StudentResponse | null */
  async createStudent(
    payload: StudentPayload,
  ): Promise<StudentResponse | null> {
    return firstRow<StudentResponse>(
      await apiFetch("/students", {
        method: "POST",
        body: payload,
      }),
    );
  },

  /** PATCH /students/:id → StudentResponse | null */
  async updateStudent(
    id: string,
    payload: StudentUpdatePayload,
  ): Promise<StudentResponse | null> {
    return firstRow<StudentResponse>(
      await apiFetch(`/students/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },

  /** DELETE /students/:id → StudentDeleteResponse | null */
  async deleteStudent(id: string): Promise<StudentDeleteResponse | null> {
    return firstRow<StudentDeleteResponse>(
      await apiFetch(`/students/${id}`, { method: "DELETE" }),
    );
  },
};

/** @deprecated Prefer `studentApi` */
export const studentService = studentApi;
