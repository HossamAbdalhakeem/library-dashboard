import { studentApi } from "~/services/student";
import {
  toExportDateRangeIso,
  useEntityExport,
} from "~/composables/useEntityExport";

export function useStudentExport() {
  const exportState = useEntityExport({
    createFilters: () => ({
      studyYearId: null,
      teacherId: null,
      student: null,
    }),
    buildQuery: (filters, { academicYearId }) => ({
      ...(academicYearId ? { academicYearId } : {}),
      ...(filters.studyYearId ? { studyYearId: filters.studyYearId } : {}),
      ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
      ...(filters.student?.id ? { studentId: filters.student.id } : {}),
      ...toExportDateRangeIso(filters),
    }),
    exportRequest: (query) => studentApi.exportStudents(query),
    filename: "students-export.xls",
    successMessage: "تم تصدير الطلاب بنجاح.",
    errorMessage: "تعذر تصدير الطلاب.",
    requireAcademicYear: true,
  });

  return {
    exporting: exportState.exporting,
    filters: exportState.filters,
    academicYearRange: exportState.academicYearRange,
    ensureAcademicYears: exportState.ensureAcademicYears,
    resetFilters: exportState.resetFilters,
    onPeriodChange: exportState.onPeriodChange,
    exportStudents: exportState.runExport,
  };
}
