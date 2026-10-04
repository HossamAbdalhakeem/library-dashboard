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
 * Default period is today. Sales and waiting-reservations reports pass `year`.
 * @param {{ defaultPeriod?: string }} [options]
 */
export function useAdminReportFilters(options = {}) {
  const defaultPeriod = normalizePeriod(options.defaultPeriod || "day");
  const {
    academicYearId: currentAcademicYearId,
    academicYearStore,
    academicYearRange,
  } = useAcademicYear();

  const yearDates = () => {
    const range = academicYearRange.value;
    if (!range?.from || !range?.to) return null;
    return {
      from: String(range.from).slice(0, 10),
      to: String(range.to).slice(0, 10),
    };
  };

  const initialYear = defaultPeriod === "year" ? yearDates() : null;
  const today = todayInputValue();
  const dateFrom = ref(initialYear?.from ?? (defaultPeriod === "year" ? null : today));
  const dateTo = ref(initialYear?.to ?? (defaultPeriod === "year" ? null : today));
  const selectedPeriod = ref(defaultPeriod);
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
    let from = dateFrom.value;
    let to = dateTo.value;
    if (selectedPeriod.value === "year") {
      const range = yearDates();
      if (range) {
        from = range.from;
        to = range.to;
      } else if (!from || !to) {
        return {
          ...extras,
          ...(currentAcademicYearId.value
            ? { academicYearId: String(currentAcademicYearId.value) }
            : {}),
        };
      }
    }
    return buildReportDateRangeParams({
      from,
      to,
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
      const range = selectedPeriod.value === "year" ? yearDates() : null;
      if (range) {
        dateFrom.value = range.from;
        dateTo.value = range.to;
        return;
      }
      if (selectedPeriod.value === "year") return;
      const fallback = todayInputValue();
      dateFrom.value = fallback;
      dateTo.value = fallback;
      selectedPeriod.value = "day";
    }
  };

  const ensureDateRange = () => {
    if (dateFrom.value && dateTo.value) return;
    const range = selectedPeriod.value === "year" ? yearDates() : null;
    if (range) {
      dateFrom.value = range.from;
      dateTo.value = range.to;
      return;
    }
    if (selectedPeriod.value === "year") return;
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
