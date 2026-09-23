/** @type {Record<string, { label: string, severity: string }>} */
export const SALE_STATUS_TAGS = Object.freeze({
  COMPLETED: { label: "مكتمل", severity: "success" },
  PARTIALLY_RETURNED: { label: "مسترد جزئيًا", severity: "warn" },
  RETURNED: { label: "تم الاسترداد", severity: "danger" },
  EXCHANGED: { label: "مستبدل", severity: "secondary" },
  PARTIALLY_EXCHANGED: { label: "مستبدل جزئيًا", severity: "warn" },
});
