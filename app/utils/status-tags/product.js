/** @type {Record<string, { label: string, severity: string }>} */
export const PRODUCT_AVAILABILITY_TAGS = Object.freeze({
  AVAILABLE: { label: "متاح", severity: "success" },
  ACTIVE: { label: "متاح", severity: "success" },
  UPCOMING: { label: "قادم", severity: "warn" },
  INACTIVE: { label: "غير متاح", severity: "danger" },
  OUT_OF_STOCK: { label: "غير متوفر", severity: "danger" },
});

/** @type {Record<string, { label: string, severity: string }>} */
export const PRODUCT_TYPE_TAGS = Object.freeze({
  BOOK: { label: "كتاب", severity: "primary" },
  CARD: { label: "كارت", severity: "secondary" },
  BOOKLET: { label: "ملزمة", severity: "warn" },
});
