import { apiFetch, firstRow, asList } from "~/utils/apiFetch";
import type {
  AcademicYearQuery,
  AcademicYearPayload,
  AcademicYearUpdatePayload,
  AcademicYearResponse,
} from "../types/academic-year.types";

export const academicYearApi = {
  /** GET /academic-years → AcademicYearResponse[] */
  async getAcademicYears(
    params: AcademicYearQuery = {},
  ): Promise<AcademicYearResponse[]> {
    return asList<AcademicYearResponse>(
      await apiFetch("/academic-years", { method: "GET", params }),
    );
  },

  /** POST /academic-years → AcademicYearResponse | null */
  async createAcademicYear(
    payload: AcademicYearPayload,
  ): Promise<AcademicYearResponse | null> {
    return firstRow<AcademicYearResponse>(
      await apiFetch("/academic-years", {
        method: "POST",
        body: payload,
      }),
    );
  },

  /** PATCH /academic-years/:id → AcademicYearResponse | null */
  async updateAcademicYear(
    id: string,
    payload: AcademicYearUpdatePayload,
  ): Promise<AcademicYearResponse | null> {
    return firstRow<AcademicYearResponse>(
      await apiFetch(`/academic-years/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },

  /** POST /academic-years/:id/activate → AcademicYearResponse | null */
  async activateAcademicYear(id: string): Promise<AcademicYearResponse | null> {
    return firstRow<AcademicYearResponse>(
      await apiFetch(`/academic-years/${id}/activate`, {
        method: "POST",
      }),
    );
  },
};

/** @deprecated Prefer `academicYearApi` */
export const academicYearService = academicYearApi;
