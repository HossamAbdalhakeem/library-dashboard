import { useAcademicYear } from "~/composables/useAcademicYear";
import {
  buildReportDateRangeParams,
  todayInputValue,
} from "~/services/reports/shared";

const normalizePeriod = (value) => {
  const allowed = ["day", "week", "month", "year", "custom"];
  const raw = String(value || "").toLowerCase();
  if (raw === "today") return "day";
  return allowed.includes(raw) ? raw : "day";
};

/** Map UI period presets to backend sales-trend granularity hints. */
const apiPeriod = (value) => {
  const period = normalizePeriod(value);
  if (period === "day") return "today";
  return period;
};

/**
 * Shared admin report filters: teacher, study year, book, branch, and period.
 * Used by the admin reports page and the reservations report page.
 */
export function useAdminReportFilters() {
  const {
    academicYearId: currentAcademicYearId,
    academicYearStore,
    academicYearRange,
  } = useAcademicYear();

  const today = todayInputValue();
  const dateFrom = ref(today);
  const dateTo = ref(today);
  const selectedPeriod = ref("day");
  const selectedBranch = ref("all");
  const selectedBook = ref(null);
  const selectedTeacher = ref(null);
  const selectedStudyYear = ref(null);
  const reloadKey = ref(0);

  const reportParams = computed(() => {
    const extras = {
      period: apiPeriod(selectedPeriod.value),
    };
    if (selectedBranch.value && selectedBranch.value !== "all") {
      extras.branchId = selectedBranch.value;
    }
    if (selectedBook.value) {
      extras.productId = selectedBook.value;
    }
    if (selectedTeacher.value) {
      extras.teacherId = selectedTeacher.value;
    }
    if (selectedStudyYear.value) {
      extras.studyYearId = selectedStudyYear.value;
    }
    return buildReportDateRangeParams({
      from: dateFrom.value,
      to: dateTo.value,
      academicYearId: currentAcademicYearId.value,
      extras,
    });
  });

  const refresh = () => {
    reloadKey.value += 1;
  };

  const onFiltersChange = (payload) => {
    if (payload && typeof payload === "object") {
      if ("from" in payload) dateFrom.value = payload.from || null;
      if ("to" in payload) dateTo.value = payload.to || payload.from || null;
      if ("period" in payload) selectedPeriod.value = normalizePeriod(payload.period);
    }

    if (!dateFrom.value && !dateTo.value) {
      const fallback = todayInputValue();
      dateFrom.value = fallback;
      dateTo.value = fallback;
      selectedPeriod.value = "day";
    }
  };

  const ensureDateRange = () => {
    if (dateFrom.value && dateTo.value) return;
    const fallback = todayInputValue();
    dateFrom.value = dateFrom.value || fallback;
    dateTo.value = dateTo.value || dateFrom.value || fallback;
    selectedPeriod.value = "day";
  };

  watch(currentAcademicYearId, () => {
    if (academicYearRange.value && selectedPeriod.value === "year") {
      dateFrom.value = academicYearRange.value.from;
      dateTo.value = academicYearRange.value.to;
    }
  });

  onMounted(async () => {
    await academicYearStore.fetchYears().catch(() => {});
    ensureDateRange();
  });

  return {
    academicYearRange,
    dateFrom,
    dateTo,
    selectedPeriod,
    selectedBranch,
    selectedBook,
    selectedTeacher,
    selectedStudyYear,
    reloadKey,
    reportParams,
    refresh,
    onFiltersChange,
  };
}
