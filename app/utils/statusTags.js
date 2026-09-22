/**
 * Central status/type tag catalog for tables.
 * Used by AppStatusTag (PrimeVue Tag).
 *
 * @typedef {"reservation"|"entity"|"stock-movement"|"transaction"|"sale"|"product-availability"|"product-type"} StatusTagKind
 */

/** @type {Record<string, { label: string, severity: string }>} */
export const RESERVATION_STATUS_TAGS = Object.freeze({
  PENDING: { label: "قيد الانتظار", severity: "warn" },
  WAITING_FOR_STOCK: { label: "بانتظار المخزون", severity: "warn" },
  READY: { label: "جاهز", severity: "primary" },
  DELIVERED: { label: "تم التسليم", severity: "success" },
  CANCELLED: { label: "ملغي", severity: "danger" },
});

/** @type {Record<string, { label: string, severity: string }>} */
export const ENTITY_STATUS_TAGS = Object.freeze({
  ACTIVE: { label: "نشط", severity: "success" },
  INACTIVE: { label: "غير نشط", severity: "danger" },
});

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



/** @type {Record<string, { label: string, severity: string }>} */
export const TRANSACTION_TYPE_TAGS = Object.freeze({
  SALE: { label: "بيع", severity: "primary" },
  RESERVATION: { label: "حجز", severity: "warn" },
  RETURN: { label: "مرتجع", severity: "danger" },
  EXCHANGE: { label: "استبدال", severity: "secondary" },
});

/** @type {Record<string, { label: string, severity: string }>} */
export const SALE_STATUS_TAGS = Object.freeze({
  COMPLETED: { label: "مكتمل", severity: "success" },
  PARTIALLY_RETURNED: { label: "مسترد جزئيًا", severity: "warn" },
  RETURNED: { label: "تم الاسترداد", severity: "danger" },
  EXCHANGED: { label: "مستبدل", severity: "secondary" },
  PARTIALLY_EXCHANGED: { label: "مستبدل جزئيًا", severity: "warn" },
});

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

/** @type {Record<StatusTagKind, Record<string, { label: string, severity: string }>>} */
export const STATUS_TAG_CATALOGS = Object.freeze({
  reservation: RESERVATION_STATUS_TAGS,
  entity: ENTITY_STATUS_TAGS,
  "stock-movement": STOCK_MOVEMENT_TAGS,
  transaction: TRANSACTION_TYPE_TAGS,
  sale: SALE_STATUS_TAGS,
  "product-availability": PRODUCT_AVAILABILITY_TAGS,
  "product-type": PRODUCT_TYPE_TAGS,
});

/**
 * @param {StatusTagKind | string} kind
 * @param {string | null | undefined} code
 * @param {{ label?: string, severity?: string }} [fallback]
 */
export const getStatusTagMeta = (kind, code, fallback = {}) => {
  const key = String(code || "").toUpperCase();
  const catalog = STATUS_TAG_CATALOGS[kind] || {};
  const meta = catalog[key];

  return {
    code: key || "",
    label: meta?.label || fallback.label || key || "—",
    severity: meta?.severity || fallback.severity || "secondary",
  };
};

/**
 * @param {StatusTagKind | string} kind
 * @param {string | null | undefined} code
 */
export const getStatusTagSeverity = (kind, code) =>
  getStatusTagMeta(kind, code).severity;

/**
 * @param {StatusTagKind | string} kind
 * @param {string | null | undefined} code
 */
export const getStatusTagLabel = (kind, code) =>
  getStatusTagMeta(kind, code).label;
