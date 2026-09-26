import { reservationApi } from "~/services/reservation";
import {
  toExportDateRangeIso,
  useEntityExport,
} from "~/composables/useEntityExport";
import { RESERVATION_STATUS_LABELS } from "~/utils/domain-labels/reservation";

export const RESERVATION_EXPORT_STATUS_OPTIONS = [
  {
    label: RESERVATION_STATUS_LABELS.PENDING,
    value: "PENDING",
  },
  {
    label: RESERVATION_STATUS_LABELS.WAITING_FOR_STOCK,
    value: "WAITING_FOR_STOCK",
  },
  {
    label: RESERVATION_STATUS_LABELS.READY,
    value: "READY",
  },
  {
    label: RESERVATION_STATUS_LABELS.DELIVERED,
    value: "DELIVERED",
  },
  {
    label: RESERVATION_STATUS_LABELS.CANCELLED,
    value: "CANCELLED",
  },
];

export function useReservationsExport() {
  const exportState = useEntityExport({
    createFilters: () => ({
      studyYearId: null,
      teacherId: null,
      branchId: null,
      productId: null,
      student: null,
      status: "WAITING_FOR_STOCK",
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
    exportRequest: (query) => reservationApi.exportReservations(query),
    filename: "reservations-export.xls",
    successMessage: "تم تصدير الحجوزات بنجاح.",
    errorMessage: "تعذر تصدير الحجوزات.",
    defaultPeriod: "year",
  });

  return {
    exporting: exportState.exporting,
    filters: exportState.filters,
    academicYearRange: exportState.academicYearRange,
    ensureAcademicYears: exportState.ensureAcademicYears,
    resetFilters: exportState.resetFilters,
    onPeriodChange: exportState.onPeriodChange,
    exportReservations: exportState.runExport,
  };
}
