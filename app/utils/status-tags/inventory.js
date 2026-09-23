/** @type {Record<string, { label: string, severity: string }>} */
export const STOCK_MOVEMENT_TAGS = Object.freeze({
  STOCK_IN: { label: "استلام", severity: "success" },
  STOCK_OUT: { label: "سحب", severity: "warn" },
  SALE: { label: "بيع", severity: "primary" },
  RESERVATION: { label: "حجز", severity: "contrast" },
  RESERVATION_RELEASE: { label: "إلغاء حجز", severity: "danger" },
  RETURN: { label: "مرتجع", severity: "danger" },
  DAMAGED: { label: "تالف", severity: "danger" },
  ADJUSTMENT: { label: "تسوية", severity: "secondary" },
});
