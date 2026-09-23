/**
 * Student-operations day activity — matches BE OperationActivity
 * on reports student-operations rows.
 */
export const OperationActivity = {
  SALE: "SALE",
  RESERVATION: "RESERVATION",
  DELIVERED: "DELIVERED",
} as const;

/** Union of valid OperationActivity values. */
export type OperationActivity =
  (typeof OperationActivity)[keyof typeof OperationActivity];

export const OPERATION_ACTIVITY_KEYS: ReadonlyArray<OperationActivity> =
  Object.values(OperationActivity);

export const isOperationActivity = (
  value: unknown,
): value is OperationActivity =>
  OPERATION_ACTIVITY_KEYS.includes(
    String(value || "")
      .trim()
      .toUpperCase() as OperationActivity,
  );

export const normalizeOperationActivity = (
  value?: unknown,
  fallback: OperationActivity | "" = "",
): OperationActivity | "" => {
  const next = String(value || "")
    .trim()
    .toUpperCase();
  return isOperationActivity(next) ? next : fallback;
};
