import { apiFetch, firstRow, asList } from "~/utils/apiFetch";
import type {
  StudyYearQuery,
  StudyYearPayload,
  StudyYearUpdatePayload,
  StudyYearResponse,
} from "../types/study-year.types";

export const studyYearApi = {
  /** GET /study-years → StudyYearResponse[] */
  async getStudyYears(
    params: StudyYearQuery = {},
  ): Promise<StudyYearResponse[]> {
    return asList<StudyYearResponse>(
      await apiFetch("/study-years", { method: "GET", params }),
    );
  },

  /** POST /study-years → StudyYearResponse | null */
  async createStudyYear(
    payload: StudyYearPayload,
  ): Promise<StudyYearResponse | null> {
    return firstRow<StudyYearResponse>(
      await apiFetch("/study-years", {
        method: "POST",
        body: { name: payload.name },
      }),
    );
  },

  /** PATCH /study-years/:id → StudyYearResponse | null */
  async updateStudyYear(
    id: string,
    payload: StudyYearUpdatePayload,
  ): Promise<StudyYearResponse | null> {
    return firstRow<StudyYearResponse>(
      await apiFetch(`/study-years/${id}`, {
        method: "PATCH",
        body: { name: payload.name },
      }),
    );
  },
};

/** @deprecated Prefer `studyYearApi` */
export const studyYearService = studyYearApi;
