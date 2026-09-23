/**
 * @deprecated Prefer `~/services/reports/shared` (or role package helpers).
 * Thin re-export so existing table/composable imports keep working.
 */
export {
  STUDENT_OPS_METRIC_COLORS,
  STUDENT_OPS_COLUMNS,
  metricTagStyle,
  mapStudentOperationRows,
  buildTimelineEventDetails,
  mapTimelineEvents,
} from "~/services/reports/shared/student-operations.helper";
