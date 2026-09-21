import {
  apiFetch,
  firstRow,
  asPaginated,
  type PaginatedResponse,
} from "~/utils/apiFetch";

const studentBody = (payload: Record<string, any>) => {
  const body: Record<string, any> = {
    name: payload.name,
  };

  if (payload.phone != null && payload.phone !== "") {
    body.phone = payload.phone;
  }

  if (payload.studyYearId ?? payload.study_year_id) {
    body.studyYearId = payload.studyYearId ?? payload.study_year_id;
  }

  const academicYearId = payload.academicYearId ?? payload.academic_year_id;
  if (academicYearId) {
    body.academicYearId = academicYearId;
  }

  return body;
};

export const studentService = {
  async getStudents(
    params: Record<string, any> = {},
  ): Promise<PaginatedResponse> {
    return asPaginated(await apiFetch("/students", { method: "GET", params }));
  },

  async searchStudents(search = "", params: Record<string, any> = {}) {
    const term = String(search || "").trim();
    const result = await this.getStudents({
      per_page: term ? 20 : 20,
      ...params,
      ...(term ? { search: term } : {}),
    });
    return result.data;
  },

  async getStudent(id: string) {
    return firstRow(await apiFetch(`/students/${id}`, { method: "GET" }));
  },

  async getStudentTransactions(
    id: string,
    params: Record<string, any> = {},
  ): Promise<PaginatedResponse> {
    return asPaginated(
      await apiFetch(`/students/${id}/transactions`, {
        method: "GET",
        params,
      }),
    );
  },

  async createStudent(payload: Record<string, any>) {
    const body = studentBody(payload);
    if (!body.academicYearId) {
      throw new Error("academicYearId is required when creating a student.");
    }
    return firstRow(
      await apiFetch("/students", {
        method: "POST",
        body,
      }),
    );
  },

  async updateStudent(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/students/${id}`, {
        method: "PATCH",
        body: studentBody(payload),
      }),
    );
  },

  async deleteStudent(id: string) {
    return firstRow(await apiFetch(`/students/${id}`, { method: "DELETE" }));
  },
};
