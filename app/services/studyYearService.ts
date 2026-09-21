import { apiFetch, firstRow, asList } from "~/utils/apiFetch";

export const studyYearService = {
  async getStudyYears(params: Record<string, any> = {}) {
    return asList(await apiFetch("/study-years", { method: "GET", params }));
  },

  async getStudyYear(id: string) {
    return firstRow(await apiFetch(`/study-years/${id}`, { method: "GET" }));
  },

  async createStudyYear(payload: Record<string, any>) {
    return firstRow(
      await apiFetch("/study-years", {
        method: "POST",
        body: { name: payload.name },
      }),
    );
  },

  async updateStudyYear(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/study-years/${id}`, {
        method: "PATCH",
        body: { name: payload.name },
      }),
    );
  },
};
