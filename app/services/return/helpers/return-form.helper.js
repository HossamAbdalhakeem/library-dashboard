import { normalizePaymentMethod } from "~/enums/paymentMethod";

export const emptyReturnForm = () => ({
  saleId: null,
  saleItemId: null,
  quantity: 1,
  method: null,
  proofReference: "",
  items: [],
});

/** Map API return → form (nested relations only). */
export const mapReturnToForm = (row) => {
  const firstItem = Array.isArray(row?.items) ? row.items[0] : null;
  const firstRefund = Array.isArray(row?.refunds) ? row.refunds[0] : null;

  return {
    saleId: row?.sale?.id || null,
    saleItemId: firstItem?.saleItem?.id || null,
    quantity: firstItem?.quantity ?? 1,
    method: firstRefund?.method || null,
    proofReference: firstRefund?.proofReference || "",
    items: Array.isArray(row?.items)
      ? row.items.map((item) => ({
          saleItemId: item?.saleItem?.id || null,
          quantity: Number(item?.quantity || 1),
        }))
      : [],
  };
};

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

export const validateReturnForm = (form, { maxQuantity } = {}) => {
  if (!form?.saleId) return "المبيعة مطلوبة.";
  const hasItems = Array.isArray(form.items) && form.items.length > 0;
  if (!hasItems && !form?.saleItemId) return "عنصر المبيعة مطلوب.";
  const qty = hasItems
    ? Number(form.items[0]?.quantity || 0)
    : Number(form.quantity || 0);
  if (qty < 1) return "كمية الاسترداد يجب أن تكون 1 على الأقل.";
  if (maxQuantity != null && qty > Number(maxQuantity)) {
    return `كمية الاسترداد لا يمكن أن تتجاوز ${maxQuantity}.`;
  }
  if (!form?.method) return "اختر طريقة الاسترداد.";
  return null;
};
