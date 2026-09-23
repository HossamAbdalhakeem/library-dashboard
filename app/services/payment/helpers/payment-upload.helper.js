/**
 * Nest upload / signed-URL response for payment screenshots.
 * camelCase only — matches backend UploadedPaymentScreenshot.
 */

import {
  getPaymentMethodLabel,
  normalizePaymentMethod,
} from "~/enums/paymentMethod";

export const assertPaymentScreenshot = (result) => {
  if (!result?.key || !result?.fileUrl) {
    throw new Error("تعذر رفع صورة الإثبات.");
  }
  return {
    fileUrl: result.fileUrl,
    mimeType: result.mimeType || "",
    key: result.key,
  };
};

/** Map nested API payment → display fields (no flat FK guessing). */
export const normalizePaymentSummary = (payment = {}) => {
  const method = normalizePaymentMethod(payment.method);
  const image = payment.image || {};

  return {
    id: payment.id ?? null,
    method,
    methodLabel:
      payment.methodLabel || getPaymentMethodLabel(method),
    image: {
      reference: image.reference ?? null,
      url: image.url ?? null,
      hasProof: Boolean(image.hasProof),
    },
  };
};
