import { apiFetch, firstRow } from "~/utils/apiFetch";

const teacherCreateBody = (payload: Record<string, any>) => {
  const body: Record<string, any> = {
    name: String(payload.name || "").trim(),
  };

  const academicYearId = payload.academicYearId ?? payload.academic_year_id;
  if (academicYearId) body.academicYearId = academicYearId;

  return body;
};

const teacherUpdateBody = (payload: Record<string, any>) => ({
  name: String(payload.name || "").trim(),
});

const statusBody = (payload: Record<string, any> | string | boolean) => {
  if (typeof payload === "string") {
    return { status: payload };
  }
  if (typeof payload === "boolean") {
    return { status: payload ? "ACTIVE" : "INACTIVE" };
  }
  if (payload?.status) return { status: payload.status };
  if (typeof payload?.is_active === "boolean") {
    return { status: payload.is_active ? "ACTIVE" : "INACTIVE" };
  }
  return payload;
};

export const teacherService = {
  async getTeachers(params: Record<string, any> = {}) {
    return await apiFetch("/teachers", { method: "GET", params });
  },

  async getTeacher(id: string) {
    return firstRow(await apiFetch(`/teachers/${id}`, { method: "GET" }));
  },

  async createTeacher(payload: Record<string, any>) {
    const body = teacherCreateBody(payload);
    if (!body.academicYearId) {
      throw new Error("academicYearId is required when creating a teacher.");
    }
    return firstRow(
      await apiFetch("/teachers", {
        method: "POST",
        body,
      }),
    );
  },

  async updateTeacher(id: string, payload: Record<string, any>) {
    return firstRow(
      await apiFetch(`/teachers/${id}`, {
        method: "PATCH",
        body: teacherUpdateBody(payload),
      }),
    );
  },

  async updateTeacherStatus(
    id: string,
    payload: Record<string, any> | string | boolean,
  ) {
    return firstRow(
      await apiFetch(`/teachers/${id}/status`, {
        method: "PATCH",
        body: statusBody(payload),
      }),
    );
  },
};
