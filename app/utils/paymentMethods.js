/** Shared payment method enum, labels, colors, and helpers. */

export const PaymentMethod = Object.freeze({
  CASH: "CASH",
  INSTAPAY: "INSTAPAY",
  WALLET: "WALLET",
});

export const PAYMENT_METHOD_META = {
  [PaymentMethod.CASH]: { label: "كاش", color: "#4472C4" },
  [PaymentMethod.INSTAPAY]: { label: "انستا باي", color: "#ED7D31" },
  [PaymentMethod.WALLET]: { label: "محفظة إلكترونية", color: "#70AD47" },
};

export const PAYMENT_METHOD_LABELS = Object.fromEntries(
  Object.entries(PAYMENT_METHOD_META).map(([value, meta]) => [value, meta.label]),
);

export const PAYMENT_METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_META).map(
  ([value, meta]) => ({
    label: meta.label,
    value,
  }),
);

export const PAYMENT_METHOD_KEYS = Object.values(PaymentMethod);

/** Methods that require a payment proof image. */
export const PAYMENT_METHODS_REQUIRING_PROOF = Object.freeze([
  PaymentMethod.WALLET,
  PaymentMethod.INSTAPAY,
]);

export const normalizePaymentMethod = (value) => {
  const method = String(value || PaymentMethod.CASH).trim().toUpperCase();
  return PAYMENT_METHOD_KEYS.includes(method) ? method : PaymentMethod.CASH;
};

export const isValidPaymentMethod = (value) =>
  PAYMENT_METHOD_KEYS.includes(String(value || "").trim().toUpperCase());

export const paymentMethodNeedsProof = (value) =>
  PAYMENT_METHODS_REQUIRING_PROOF.includes(normalizePaymentMethod(value));

export const getPaymentMethodLabel = (method, fallback = method) => {
  const key = String(method || "").trim().toUpperCase();
  return PAYMENT_METHOD_LABELS[key] || fallback;
};
