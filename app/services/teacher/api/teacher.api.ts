import { apiFetch, firstRow, asList } from "~/utils/apiFetch";
import type {
  TeacherQuery,
  TeacherPayload,
  TeacherUpdatePayload,
  TeacherStatusPayload,
  TeacherResponse,
} from "../types/teacher.types";

export const teacherApi = {
  /** GET /admin-api/teachers → TeacherResponse[] */
  async getTeachers(params: TeacherQuery = {}): Promise<TeacherResponse[]> {
    return asList<TeacherResponse>(
      await apiFetch("/admin-api/teachers", { method: "GET", params }),
    );
  },

  /** POST /admin-api/teachers → TeacherResponse | null */
  async createTeacher(payload: TeacherPayload): Promise<TeacherResponse | null> {
    return firstRow<TeacherResponse>(
      await apiFetch("/admin-api/teachers", {
        method: "POST",
        body: payload,
      }),
    );
  },

  /** PATCH /admin-api/teachers/:id → TeacherResponse | null */
  async updateTeacher(
    id: string,
    payload: TeacherUpdatePayload,
  ): Promise<TeacherResponse | null> {
    return firstRow<TeacherResponse>(
      await apiFetch(`/admin-api/teachers/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },

  /** PATCH /admin-api/teachers/:id/status → TeacherResponse | null */
  async updateTeacherStatus(
    id: string,
    payload: TeacherStatusPayload,
  ): Promise<TeacherResponse | null> {
    return firstRow<TeacherResponse>(
      await apiFetch(`/admin-api/teachers/${id}/status`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },

  /** POST /admin-api/teachers/:id/activate → TeacherResponse | null */
  async activateTeacher(id: string): Promise<TeacherResponse | null> {
    return firstRow<TeacherResponse>(
      await apiFetch(`/admin-api/teachers/${id}/activate`, {
        method: "POST",
      }),
    );
  },
};

/** @deprecated Prefer `teacherApi` */
export const teacherService = teacherApi;
