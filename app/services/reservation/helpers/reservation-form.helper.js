import {
  PaymentMethod,
  normalizePaymentMethod,
} from "~/enums/paymentMethod";

/** Flat write payload for POST /reservations (matches CreateReservationDto). */
export const buildCreateReservationPayload = ({
  studentId,
  productId,
  quantity = 1,
  deposit,
  method,
  branchId,
  proofReference,
}) => {
  const payload = {
    studentId,
    productId,
    quantity: Number(quantity || 1),
    deposit: Number(deposit),
    method: normalizePaymentMethod(method || PaymentMethod.CASH),
  };

  if (branchId) payload.branchId = branchId;
  if (proofReference) payload.proofReference = proofReference;

  return payload;
};

/** Flat write payload for POST /reservations/:id/deliver. */
export const buildDeliverReservationPayload = ({
  method,
  proofReference,
} = {}) => {
  const payload = {};

  if (method != null && String(method).trim() !== "") {
    payload.method = normalizePaymentMethod(method);
  }
  if (proofReference) payload.proofReference = proofReference;

  return payload;
};

/** Flat write payload for POST /reservations/:id/cancel. */
export const buildCancelReservationPayload = ({
  refundMethod,
  proofReference,
} = {}) => {
  const payload = {};

  if (refundMethod != null && String(refundMethod).trim() !== "") {
    payload.refundMethod = normalizePaymentMethod(refundMethod);
  }
  if (proofReference) payload.proofReference = proofReference;

  return payload;
};

/** Flat write payload for POST /reservations/:id/change-product. */
export const buildChangeProductPayload = ({
  newProductId,
  refundMethod,
  proofReference,
}) => {
  const payload = { newProductId };

  if (refundMethod != null && String(refundMethod).trim() !== "") {
    payload.refundMethod = normalizePaymentMethod(refundMethod);
  }
  if (proofReference) payload.proofReference = proofReference;

  return payload;
};
