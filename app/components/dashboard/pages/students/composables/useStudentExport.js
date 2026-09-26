import { studentApi } from "~/services/student";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYear } from "~/composables/useAcademicYear";

const triggerBlobDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export function useStudentExport() {
  const { showError, showSuccess } = useAppToast();
  const { academicYearId } = useAcademicYear();

  const exporting = ref(false);
  const filters = reactive({
    studyYearId: null,
    student: null,
    from: null,
    to: null,
  });

  const resetFilters = () => {
    filters.studyYearId = null;
    filters.student = null;
    filters.from = null;
    filters.to = null;
  };

  const buildQuery = () => ({
    ...(academicYearId.value ? { academicYearId: academicYearId.value } : {}),
    ...(filters.studyYearId ? { studyYearId: filters.studyYearId } : {}),
    ...(filters.student?.id ? { studentId: filters.student.id } : {}),
    ...(filters.from
      ? { from: new Date(`${filters.from}T00:00:00`).toISOString() }
      : {}),
    ...(filters.to
      ? { to: new Date(`${filters.to}T23:59:59.999`).toISOString() }
      : {}),
  });

  const exportStudents = async () => {
    if (exporting.value) return false;

    if (!academicYearId.value) {
      showError("اختر العام الدراسي أولاً.");
      return false;
    }

    exporting.value = true;
    try {
      const blob = await studentApi.exportStudents(buildQuery());
      triggerBlobDownload(blob, "students-export.xls");
      showSuccess("تم تصدير الطلاب بنجاح.");
      return true;
    } catch (error) {
      showError(error?.message || "تعذر تصدير الطلاب.");
      return false;
    } finally {
      exporting.value = false;
    }
  };

  return {
    exporting,
    filters,
    resetFilters,
    exportStudents,
  };
}
