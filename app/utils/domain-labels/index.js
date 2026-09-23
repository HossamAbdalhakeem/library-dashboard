/** Domain labels barrel — prefer category imports when possible. */

export {
  DEFAULT_METRIC_COLOR,
  UNSPECIFIED_LABEL,
  getLabel,
} from "./shared";

export {
  RESERVATION_STATUS_LABELS,
  getReservationStatusLabel,
} from "./reservation";

export {
  SALE_STATUS_LABELS,
  getSaleStatusLabel,
  getSaleStatusSeverity,
} from "./sale";

export {
  STOCK_MOVEMENT_LABELS,
  STOCK_OPERATION_LABELS,
  STOCK_MOVEMENT_COLORS,
  getStockMovementLabel,
  getStockOperationLabel,
  getStockMovementColor,
} from "./inventory";

export {
  STUDENT_SALE_LABELS,
  OPERATION_ACTIVITY_LABELS,
  OPERATION_ACTIVITY_COLORS,
  OPERATION_STATUS_LABELS,
  OPERATION_STATUS_COLORS,
  TIMELINE_EVENT_LABELS,
  getOperationStatusLabel,
  getOperationStatusColor,
  getOperationActivityLabel,
  getOperationActivityColor,
  getStudentSaleLabel,
  getTimelineEventLabel,
} from "./student-operations";

export {
  TRANSACTION_TYPE_LABELS,
  getTransactionTypeLabel,
} from "./transaction";

export { EXCHANGE_DIFF_META, buildExchangeDiffLabels } from "./exchange";

export { AVAILABILITY_LABELS, getAvailabilityLabel } from "./product";

export {
  REPORT_ACTIVITY_KEY_LABELS,
  REPORT_METRIC_COLORS,
  getReportMetricColor,
} from "./report";

export { formatLowStockNotification } from "./notification";
