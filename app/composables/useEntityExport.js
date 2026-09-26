import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYear } from "~/composables/useAcademicYear";
import { todayInputValue } from "~/services/reports/shared";

/** Shared export period presets: today, academic year, custom range. */
export const EXPORT_PERIODS = ["day", "year", "custom"];

export const triggerBlobDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const toExportDateRangeIso = ({ from, to } = {}) => ({
  ...(from ? { from: new Date(`${from}T00:00:00`).toISOString() } : {}),
  ...(to ? { to: new Date(`${to}T23:59:59.999`).toISOString() } : {}),
});

/**
 * Shared export-dialog state: filters, period range, blob download.
 *
 * @param {object} options
 * @param {() => Record<string, unknown>} options.createFilters
 * @param {(filters: Record<string, unknown>, ctx: { academicYearId: string | null }) => Record<string, unknown>} options.buildQuery
 * @param {(query: Record<string, unknown>) => Promise<Blob>} options.exportRequest
 * @param {string} options.filename
 * @param {string} options.successMessage
 * @param {string} options.errorMessage
 * @param {boolean} [options.requireAcademicYear]
 * @param {"day" | "year" | "custom"} [options.defaultPeriod]
 */
export function useEntityExport({
  createFilters,
  buildQuery,
  exportRequest,
  filename,
  successMessage,
  errorMessage,
  requireAcademicYear = false,
  defaultPeriod = "day",
}) {
  const { showError, showSuccess } = useAppToast();
  const {
    academicYearId,
    academicYearRange,
    academicYearStore,
  } = useAcademicYear();

  const exporting = ref(false);

  const withPeriodDefaults = (extra = {}) => {
    const today = todayInputValue();
    if (defaultPeriod === "year") {
      const from = academicYearRange.value?.from
        ? String(academicYearRange.value.from).slice(0, 10)
        : today;
      const to = academicYearRange.value?.to
        ? String(academicYearRange.value.to).slice(0, 10)
        : today;
      return {
        ...extra,
        period: "year",
        from,
        to,
      };
    }
    return {
      ...extra,
      period: "day",
      from: today,
      to: today,
    };
  };

  const filters = reactive(withPeriodDefaults(createFilters()));

  const ensureAcademicYears = async () => {
    await academicYearStore.fetchYears().catch(() => {});
  };

  const resetFilters = () => {
    Object.assign(filters, withPeriodDefaults(createFilters()));
  };

  const onPeriodChange = ({ from, to, period } = {}) => {
    if (period) filters.period = period;
    if (from) filters.from = from;
    if (to) filters.to = to || from;
  };

  const runExport = async () => {
    if (exporting.value) return false;

    if (requireAcademicYear && !academicYearId.value) {
      showError("اختر العام الدراسي أولاً.");
      return false;
    }

    if (!filters.from || !filters.to) {
      showError("اختر الفترة الزمنية أولاً.");
      return false;
    }

    exporting.value = true;
    try {
      const query = buildQuery(filters, {
        academicYearId: academicYearId.value,
      });
      const blob = await exportRequest(query);
      triggerBlobDownload(blob, filename);
      showSuccess(successMessage);
      return true;
    } catch (error) {
      showError(error?.message || errorMessage);
      return false;
    } finally {
      exporting.value = false;
    }
  };

  return {
    exporting,
    filters,
    academicYearId,
    academicYearRange,
    ensureAcademicYears,
    resetFilters,
    onPeriodChange,
    runExport,
  };
}
