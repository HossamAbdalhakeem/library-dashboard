/**
 * Backend PaymentMethod enum — single source of truth (matches Prisma PaymentMethod).
 */
export const PaymentMethod = {
  CASH: "CASH",
  WALLET: "WALLET",
  INSTAPAY: "INSTAPAY",
} as const;

/** Union of valid PaymentMethod values: `"CASH" | "WALLET" | "INSTAPAY"`. */
export type PaymentMethod =
  (typeof PaymentMethod)[keyof typeof PaymentMethod];

/** @deprecated Prefer `PaymentMethod` type. Alias kept for older imports. */
export type PaymentMethodValue = PaymentMethod;

export const PAYMENT_METHOD_META: Readonly<
  Record<PaymentMethod, { label: string; color: string }>
> = {
  [PaymentMethod.CASH]: { label: "كاش", color: "#4472C4" },
  [PaymentMethod.INSTAPAY]: { label: "انستا باي", color: "#ED7D31" },
  [PaymentMethod.WALLET]: { label: "محفظة إلكترونية", color: "#70AD47" },
};

export const PAYMENT_METHOD_LABELS: Readonly<Record<PaymentMethod, string>> =
  Object.fromEntries(
    Object.entries(PAYMENT_METHOD_META).map(([value, meta]) => [
      value,
      meta.label,
    ]),
  ) as Record<PaymentMethod, string>;

export const PAYMENT_METHOD_OPTIONS: ReadonlyArray<{
  label: string;
  value: PaymentMethod;
}> = Object.values(PaymentMethod).map((value) => ({
  label: PAYMENT_METHOD_LABELS[value],
  value,
}));

export const PAYMENT_METHOD_KEYS: ReadonlyArray<PaymentMethod> =
  Object.values(PaymentMethod);

/** Methods that require a payment proof image. */
export const PAYMENT_METHODS_REQUIRING_PROOF: ReadonlyArray<PaymentMethod> = [
  PaymentMethod.WALLET,
  PaymentMethod.INSTAPAY,
];

export const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  PAYMENT_METHOD_KEYS.includes(
    String(value || "").trim().toUpperCase() as PaymentMethod,
  );

export const normalizePaymentMethod = (
  value?: unknown,
  fallback: PaymentMethod | "" = PaymentMethod.CASH,
): PaymentMethod | "" => {
  const next = String(value || "")
    .trim()
    .toUpperCase();
  return isPaymentMethod(next) ? next : fallback;
};

export const getPaymentMethodLabel = (
  value?: unknown,
  fallback = "—",
): string => {
  const method = normalizePaymentMethod(value, "");
  return (method && PAYMENT_METHOD_LABELS[method]) || fallback;
};

export const getPaymentMethodMeta = (value?: unknown) => {
  const method = normalizePaymentMethod(value);
  return method ? PAYMENT_METHOD_META[method] : null;
};

export const paymentMethodNeedsProof = (value?: unknown): boolean => {
  const method = normalizePaymentMethod(value, "");
  return Boolean(
    method && PAYMENT_METHODS_REQUIRING_PROOF.includes(method),
  );
};

export const isCashPaymentMethod = (value?: unknown): boolean =>
  normalizePaymentMethod(value, "") === PaymentMethod.CASH;
