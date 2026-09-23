import { getStatusTagLabel } from "~/utils/status-tags/catalog";

export const emptyTeacherForm = () => ({
  name: "",
  isActive: true,
});

/** Map API teacher → form (nested academicYear only). */
export const mapTeacherToForm = (teacher) => ({
  name: teacher?.name || "",
  isActive: teacher ? teacher.status !== "INACTIVE" : true,
});

export const buildTeacherCreatePayload = (form, academicYearId) => ({
  name: String(form.name || "").trim(),
  academicYearId,
});

export const buildTeacherUpdatePayload = (form) => ({
  name: String(form.name || "").trim(),
});

export const normalizeTeacherListItem = (teacher) => ({
  ...teacher,
  name: teacher.name || "-",
  statusLabel: getStatusTagLabel("entity", teacher.status),
});

export const buildTeacherListQuery = ({ academicYearId, filters = {} }) => {
  const params = {};
  if (academicYearId) params.academicYearId = academicYearId;
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.status) params.status = filters.status;
  return params;
};
