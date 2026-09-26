import { saleApi } from "~/services/sale";
import {
  toExportDateRangeIso,
  useEntityExport,
} from "~/composables/useEntityExport";
import { SALE_STATUS_LABELS } from "~/utils/domain-labels/sale";

export const SALE_EXPORT_STATUS_OPTIONS = [
  {
    label: SALE_STATUS_LABELS.COMPLETED,
    value: "COMPLETED",
  },
  {
    label: SALE_STATUS_LABELS.PARTIALLY_RETURNED,
    value: "PARTIALLY_RETURNED",
  },
  {
    label: SALE_STATUS_LABELS.RETURNED,
    value: "RETURNED",
  },
];

export function useSalesExport() {
  const exportState = useEntityExport({
    createFilters: () => ({
      studyYearId: null,
      teacherId: null,
      branchId: null,
      productId: null,
      student: null,
      status: "COMPLETED",
    }),
    buildQuery: (filters) => ({
      ...(filters.studyYearId ? { studyYearId: filters.studyYearId } : {}),
      ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
      ...(filters.branchId ? { branchId: filters.branchId } : {}),
      ...(filters.productId ? { productId: filters.productId } : {}),
      ...(filters.student?.id ? { studentId: filters.student.id } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...toExportDateRangeIso(filters),
    }),
    exportRequest: (query) => saleApi.exportSales(query),
    filename: "sales-export.xls",
    successMessage: "تم تصدير المبيعات بنجاح.",
    errorMessage: "تعذر تصدير المبيعات.",
  });

  return {
    exporting: exportState.exporting,
    filters: exportState.filters,
    academicYearRange: exportState.academicYearRange,
    ensureAcademicYears: exportState.ensureAcademicYears,
    resetFilters: exportState.resetFilters,
    onPeriodChange: exportState.onPeriodChange,
    exportSales: exportState.runExport,
  };
}
