import { studentApi } from "~/services/student";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYear } from "~/composables/useAcademicYear";
import { todayInputValue } from "~/services/reports/shared";

/** Export period presets: today, academic year, custom range. */
export const STUDENT_EXPORT_PERIODS = ["day", "year", "custom"];

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
  const {
    academicYearId,
    academicYearRange,
    academicYearStore,
  } = useAcademicYear();

  const exporting = ref(false);
  const today = todayInputValue();
  const filters = reactive({
    studyYearId: null,
    teacherId: null,
    student: null,
    period: "day",
    from: today,
    to: today,
  });

  const ensureAcademicYears = async () => {
    await academicYearStore.fetchYears().catch(() => {});
  };

  const resetFilters = () => {
    const fallback = todayInputValue();
    filters.studyYearId = null;
    filters.teacherId = null;
    filters.student = null;
    filters.period = "day";
    filters.from = fallback;
    filters.to = fallback;
  };

  const onPeriodChange = ({ from, to, period } = {}) => {
    if (period) filters.period = period;
    if (from) filters.from = from;
    if (to) filters.to = to || from;
  };

  const buildQuery = () => ({
    ...(academicYearId.value ? { academicYearId: academicYearId.value } : {}),
    ...(filters.studyYearId ? { studyYearId: filters.studyYearId } : {}),
    ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
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

    if (!filters.from || !filters.to) {
      showError("اختر الفترة الزمنية أولاً.");
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
    academicYearRange,
    ensureAcademicYears,
    resetFilters,
    onPeriodChange,
    exportStudents,
  };
}
