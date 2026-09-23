/** @type {Record<string, { label: string, severity: string }>} */
export const RESERVATION_STATUS_TAGS = Object.freeze({
  PENDING: { label: "قيد الانتظار", severity: "warn" },
  WAITING_FOR_STOCK: { label: "بانتظار المخزون", severity: "warn" },
  READY: { label: "جاهز", severity: "primary" },
  DELIVERED: { label: "تم التسليم", severity: "success" },
  CANCELLED: { label: "ملغي", severity: "danger" },
});
