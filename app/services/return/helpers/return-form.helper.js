import { normalizePaymentMethod } from "~/enums/paymentMethod";

/**
 * Build create body matching CreateReturnDto.
 * Request body uses flat FK ids (DTO contract).
 * Accepts either multi-item `items` or a single saleItemId + quantity.
 */
export const buildReturnPayload = (form) => {
  const items = Array.isArray(form?.items) && form.items.length
    ? form.items.map((item) => ({
        saleItemId: item.saleItemId,
        quantity: Number(item.quantity || 1),
      }))
    : [
        {
          saleItemId: form.saleItemId,
          quantity: Number(form.quantity || 1),
        },
      ];

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
