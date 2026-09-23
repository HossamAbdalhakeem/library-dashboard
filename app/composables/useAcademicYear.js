import { storeToRefs } from "pinia";
import { useAcademicYearStore } from "~/store/academicYear";
import { resolveAcademicYearRange } from "~/services/reports/shared/report-date-range.helper";

const STORAGE_KEY = "academicYearId";

/**
 * Academic year selection + derived date range for reports/filters.
 */
export const useAcademicYear = () => {
  const academicYearStore = useAcademicYearStore();
  const { years: academicYears } = storeToRefs(academicYearStore);

  const academicYearId = computed(() =>
    academicYearStore.selectedId
      ? String(academicYearStore.selectedId)
      : null,
  );

  const academicYearRange = computed(() =>
    resolveAcademicYearRange(academicYears.value, academicYearId.value),
  );

  const setAcademicYearId = (id) => {
    academicYearStore.setSelectedId(id);
  };

  return {
    academicYearId,
    academicYearRange,
    academicYears,
    academicYearStore,
    setAcademicYearId,
    STORAGE_KEY,
  };
};
