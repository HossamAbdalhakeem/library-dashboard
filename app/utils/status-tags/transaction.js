/** @type {Record<string, { label: string, severity: string }>} */
export const TRANSACTION_TYPE_TAGS = Object.freeze({
  SALE: { label: "بيع", severity: "primary" },
  RESERVATION: { label: "حجز", severity: "warn" },
  RETURN: { label: "مرتجع", severity: "danger" },
  EXCHANGE: { label: "استبدال", severity: "secondary" },
});
