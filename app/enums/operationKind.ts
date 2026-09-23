/**
 * Student-operations entity kind — matches BE type on list rows
 * (SALE | RESERVATION). Distinct from OperationActivity, which
 * labels why the row appears for the selected day.
 */
export const OperationKind = {
  SALE: "SALE",
  RESERVATION: "RESERVATION",
} as const;

/** Union of valid OperationKind values. */
export type OperationKind =
  (typeof OperationKind)[keyof typeof OperationKind];

export const OPERATION_KIND_KEYS: ReadonlyArray<OperationKind> =
  Object.values(OperationKind);

export const isOperationKind = (value: unknown): value is OperationKind =>
  OPERATION_KIND_KEYS.includes(
    String(value || "")
      .trim()
      .toUpperCase() as OperationKind,
  );

export const normalizeOperationKind = (
  value?: unknown,
  fallback: OperationKind | "" = "",
): OperationKind | "" => {
  const next = String(value || "")
    .trim()
    .toUpperCase();
  return isOperationKind(next) ? next : fallback;
};
