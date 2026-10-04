import { apiFetch, firstRow, asList } from "~/utils/apiFetch";
import type {
  StudyYearQuery,
  StudyYearPayload,
  StudyYearUpdatePayload,
  StudyYearStatusPayload,
  StudyYearResponse,
} from "../types/study-year.types";

export const studyYearApi = {
  /** GET /admin-api/study-years → StudyYearResponse[] */
  async getStudyYears(
    params: StudyYearQuery = {},
  ): Promise<StudyYearResponse[]> {
    return asList<StudyYearResponse>(
      await apiFetch("/admin-api/study-years", { method: "GET", params }),
    );
  },

  /** POST /admin-api/study-years → StudyYearResponse | null */
  async createStudyYear(
    payload: StudyYearPayload,
  ): Promise<StudyYearResponse | null> {
    return firstRow<StudyYearResponse>(
      await apiFetch("/admin-api/study-years", {
        method: "POST",
        body: { name: payload.name },
      }),
    );
  },

  /** PATCH /admin-api/study-years/:id → StudyYearResponse | null */
  async updateStudyYear(
    id: string,
    payload: StudyYearUpdatePayload,
  ): Promise<StudyYearResponse | null> {
    return firstRow<StudyYearResponse>(
      await apiFetch(`/admin-api/study-years/${id}`, {
        method: "PATCH",
        body: { name: payload.name },
      }),
    );
  },

  /** PATCH /admin-api/study-years/:id/status → StudyYearResponse | null */
  async updateStudyYearStatus(
    id: string,
    payload: StudyYearStatusPayload,
  ): Promise<StudyYearResponse | null> {
    return firstRow<StudyYearResponse>(
      await apiFetch(`/admin-api/study-years/${id}/status`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },
};

/** @deprecated Prefer `studyYearApi` */
export const studyYearService = studyYearApi;
