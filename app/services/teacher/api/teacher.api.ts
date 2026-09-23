import { apiFetch, firstRow, asList } from "~/utils/apiFetch";
import type {
  TeacherQuery,
  TeacherPayload,
  TeacherUpdatePayload,
  TeacherStatusPayload,
  TeacherResponse,
} from "../types/teacher.types";

export const teacherApi = {
  /** GET /teachers → TeacherResponse[] */
  async getTeachers(params: TeacherQuery = {}): Promise<TeacherResponse[]> {
    return asList<TeacherResponse>(
      await apiFetch("/teachers", { method: "GET", params }),
    );
  },

  /** GET /teachers/:id → TeacherResponse | null */
  async getTeacher(id: string): Promise<TeacherResponse | null> {
    return firstRow<TeacherResponse>(
      await apiFetch(`/teachers/${id}`, { method: "GET" }),
    );
  },

  /** POST /teachers → TeacherResponse | null */
  async createTeacher(payload: TeacherPayload): Promise<TeacherResponse | null> {
    return firstRow<TeacherResponse>(
      await apiFetch("/teachers", {
        method: "POST",
        body: payload,
      }),
    );
  },

  /** PATCH /teachers/:id → TeacherResponse | null */
  async updateTeacher(
    id: string,
    payload: TeacherUpdatePayload,
  ): Promise<TeacherResponse | null> {
    return firstRow<TeacherResponse>(
      await apiFetch(`/teachers/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },

  /** PATCH /teachers/:id/status → TeacherResponse | null */
  async updateTeacherStatus(
    id: string,
    payload: TeacherStatusPayload,
  ): Promise<TeacherResponse | null> {
    return firstRow<TeacherResponse>(
      await apiFetch(`/teachers/${id}/status`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },
};

/** @deprecated Prefer `teacherApi` */
export const teacherService = teacherApi;
