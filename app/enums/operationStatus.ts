/**
 * Report-only lifecycle status on student-ops / timeline —
 * matches BE `OPERATION_STATUS`.
 */
export const OperationStatus = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  EXCHANGED: "EXCHANGED",
  PARTIALLY_REFUNDED: "PARTIALLY_REFUNDED",
  FULLY_REFUNDED: "FULLY_REFUNDED",
} as const;

/** Union of valid OperationStatus values. */
export type OperationStatus =
  (typeof OperationStatus)[keyof typeof OperationStatus];

export const OPERATION_STATUS_KEYS: ReadonlyArray<OperationStatus> =
  Object.values(OperationStatus);

export const isOperationStatus = (
  value: unknown,
): value is OperationStatus =>
  OPERATION_STATUS_KEYS.includes(
    String(value || "")
      .trim()
      .toUpperCase() as OperationStatus,
  );

export const normalizeOperationStatus = (
  value?: unknown,
  fallback: OperationStatus | "" = "",
): OperationStatus | "" => {
  const next = String(value || "")
    .trim()
    .toUpperCase();
  return isOperationStatus(next) ? next : fallback;
};
