import { apiFetch, firstRow, asList } from "~/utils/apiFetch";
import type {
  AcademicYearQuery,
  AcademicYearPayload,
  AcademicYearUpdatePayload,
  AcademicYearResponse,
} from "../types/academic-year.types";

export const academicYearApi = {
  /** GET /admin-api/academic-years → AcademicYearResponse[] */
  async getAcademicYears(
    params: AcademicYearQuery = {},
  ): Promise<AcademicYearResponse[]> {
    return asList<AcademicYearResponse>(
      await apiFetch("/admin-api/academic-years", {
        method: "GET",
        params,
        // Login awaits this, then redirects to /. Keep it alive across that navigation.
        abortOnNavigate: false,
      }),
    );
  },

  /** POST /admin-api/academic-years → AcademicYearResponse | null */
  async createAcademicYear(
    payload: AcademicYearPayload,
  ): Promise<AcademicYearResponse | null> {
    return firstRow<AcademicYearResponse>(
      await apiFetch("/admin-api/academic-years", {
        method: "POST",
        body: payload,
      }),
    );
  },

  /** PATCH /admin-api/academic-years/:id → AcademicYearResponse | null */
  async updateAcademicYear(
    id: string,
    payload: AcademicYearUpdatePayload,
  ): Promise<AcademicYearResponse | null> {
    return firstRow<AcademicYearResponse>(
      await apiFetch(`/admin-api/academic-years/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },

  /** POST /admin-api/academic-years/:id/activate → AcademicYearResponse | null */
  async activateAcademicYear(id: string): Promise<AcademicYearResponse | null> {
    return firstRow<AcademicYearResponse>(
      await apiFetch(`/admin-api/academic-years/${id}/activate`, {
        method: "POST",
      }),
    );
  },
};

/** @deprecated Prefer `academicYearApi` */
export const academicYearService = academicYearApi;
