import { getStatusTagSeverity } from "~/utils/status-tags/catalog";
import { getLabel } from "./shared";

export const SALE_STATUS_LABELS = {
  COMPLETED: "مكتمل",
  PARTIALLY_RETURNED: "مسترد جزئيًا",
  RETURNED: "تم الاسترداد",
  EXCHANGED: "مستبدل",
  PARTIALLY_EXCHANGED: "مستبدل جزئيًا",
};

export const getSaleStatusLabel = (status) =>
  getLabel(SALE_STATUS_LABELS, status);

export const getSaleStatusSeverity = (status) =>
  getStatusTagSeverity("sale", status);
