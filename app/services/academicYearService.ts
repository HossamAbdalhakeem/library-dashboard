import { apiFetch, firstRow, asList } from "~/utils/apiFetch";

const academicYearBody = (payload: Record<string, any>) => {
  const body: Record<string, any> = {};

  if (payload.name != null) body.name = String(payload.name).trim();
  if (payload.startDate || payload.start_date) {
    body.startDate = payload.startDate ?? payload.start_date;
  }
  if (payload.endDate || payload.end_date) {
    body.endDate = payload.endDate ?? payload.end_date;
  }

  return body;
};

export const academicYearService = {
  async getAcademicYears(params: Record<string, any> = {}) {
    return asList(await apiFetch("/academic-years", { method: "GET", params }));
  },

  async getAcademicYear(id: string) {
    return firstRow(await apiFetch(`/academic-years/${id}`, { method: "GET" }));
  },

  async createAcademicYear(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/academic-years", {
        method: "POST",
        body: academicYearBody(payload),
      }),
    );
  },

  async updateAcademicYear(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/academic-years/${id}`, {
        method: "PATCH",
        body: academicYearBody(payload),
      }),
    );
  },

  async activateAcademicYear(id: string) {
    return firstRow(
      await apiFetch(`/academic-years/${id}/activate`, {
        method: "POST",
      }),
    );
  },
};
