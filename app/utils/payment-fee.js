import { paymentMethodNeedsProof } from "~/enums/paymentMethod";

export const FEE_LABEL = "رسوم التحويل";

const roundMoney = (value) => Math.round(Number(value) * 100) / 100;

export const hasAtMostTwoDecimalPlaces = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return false;
  return Math.abs(n * 100 - Math.round(n * 100)) < 1e-6;
};

/** Positive fee to display, or null when missing or zero. */
export const visibleFeeAmount = (value) => {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return roundMoney(n);
};

export const feeAmountError = (enabled, amount) => {
  if (!enabled) return "";
  if (amount == null || amount === "") return "أدخل قيمة رسوم التحويل.";
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return "يجب أن تكون رسوم التحويل أكبر من صفر.";
  if (!hasAtMostTwoDecimalPlaces(n)) {
    return "رسوم التحويل بحد أقصى منزلتين عشريتين.";
  }
  return "";
};

/**
 * Fee to send, or null when the field must be omitted.
 * Cash never sends a fee. Toggle off or an empty amount omits it too.
 */
export const feeAmountForRequest = ({ method, enabled, amount } = {}) => {
  if (!paymentMethodNeedsProof(method) || !enabled) return null;
  if (feeAmountError(true, amount)) return null;
  return roundMoney(amount);
};

/** Product money plus fee, for display only. The API product total stays unchanged. */
export const transferTotal = (productAmount, feeAmount) => {
  const product = Number(productAmount);
  const base = Number.isFinite(product) ? product : 0;
  const fee = visibleFeeAmount(feeAmount) ?? 0;
  return Math.round((base + fee) * 100) / 100;
};

/** Attach a resolved fee only for wallet or Instapay. */
export const assignFeeAmount = (payload, method, feeAmount) => {
  const fee = visibleFeeAmount(feeAmount);
  if (!payload || !paymentMethodNeedsProof(method) || fee == null) {
    return payload;
  }
  payload.feeAmount = fee;
  return payload;
};
