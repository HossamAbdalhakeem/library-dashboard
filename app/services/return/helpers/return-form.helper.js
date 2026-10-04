import { normalizePaymentMethod } from "~/enums/paymentMethod";

/**
 * Build create body matching CreateReturnDto.
 * Request body uses flat FK ids (DTO contract).
 * Accepts either multi-item `items` or a single saleItemId + quantity.
 */
export const buildReturnPayload = (form) => {
  const toItem = (item, damaged) => ({
    saleItemId: item.saleItemId,
    quantity: Number(item.quantity || 1),
    ...(damaged ? { damaged: true } : {}),
  });

  const items = Array.isArray(form?.items) && form.items.length
    ? form.items.map((item) => toItem(item, item.damaged))
    : [toItem(form, form.damaged)];

  const payload = {
    saleId: form.saleId,
    items,
    method: normalizePaymentMethod(form.method),
  };

  if (form.proofReference) {
    payload.proofReference = String(form.proofReference).trim();
  }

  return payload;
};
