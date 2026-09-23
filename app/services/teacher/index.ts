export { teacherApi, teacherService } from "./api/teacher.api";

export type {
  NamedRef,
  AcademicYearRef,
  TeacherStatus,
  TeacherResponse,
  TeacherQuery,
  TeacherPayload,
  TeacherUpdatePayload,
  TeacherStatusPayload,
  TeacherListItem,
} from "./types/teacher.types";

export {
  emptyTeacherForm,
  mapTeacherToForm,
  buildTeacherCreatePayload,
  buildTeacherUpdatePayload,
  normalizeTeacherListItem,
  buildTeacherListQuery,
} from "./helpers/teacher-form.helper";
