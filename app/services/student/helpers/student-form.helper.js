import { getStatusTagLabel } from "~/utils/status-tags/catalog";

export const emptyStudentForm = () => ({
  name: "",
  phone: "",
  studyYearId: null,
});

/** Map API student → form (nested relations only). */
export const mapStudentToForm = (student) => ({
  name: student?.name || "",
  phone: student?.phone || "",
  studyYearId: student?.studyYear?.id || null,
});

export const buildStudentPayload = (
  form,
  { isEdit, currentAcademicYearId } = {},
) => {
  const payload = {
    name: String(form.name || "").trim(),
    phone: form.phone || undefined,
    studyYearId: form.studyYearId,
  };

  if (!isEdit && currentAcademicYearId) {
    payload.academicYearId = currentAcademicYearId;
  }

  return payload;
};

export const validateStudentForm = (form, { isEdit, currentAcademicYearId } = {}) => {
  if (!form.studyYearId) return "السنة الدراسية مطلوبة.";
  if (!isEdit && !currentAcademicYearId) return "اختر العام الدراسي أولاً.";
  return null;
};

/** Map API student → table/display fields. */
export const normalizeStudentListItem = (student) => ({
  ...student,
  name: student.name || "-",
  phone: student.phone || "-",
  studyYearName: student.studyYear?.name || "-",
  statusLabel: getStatusTagLabel("entity", student.status),
});

export const buildStudentListQuery = ({
  page,
  perPage,
  filters = {},
  includeInactive = false,
}) => {
  const params = {
    page,
    per_page: perPage,
  };
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (includeInactive) params.includeInactive = true;
  return params;
};

/** Picker/option shape — keep nested relations for consumers. */
export const mapStudentOption = (student) => {
  const name = String(student?.name || "").trim();
  const phone = String(student?.phone || "").trim();

  return {
    id: student?.id || null,
    name,
    phone,
    label: phone ? `${name} · ${phone}` : name,
    studyYear: student?.studyYear || null,
    academicYear: student?.academicYear || null,
  };
};
