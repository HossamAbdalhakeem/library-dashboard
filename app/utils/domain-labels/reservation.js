import { getLabel } from "./shared";

export const RESERVATION_STATUS_LABELS = {
  PENDING: "قيد الانتظار",
  WAITING_FOR_STOCK: "بانتظار المخزون",
  READY: "جاهز",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

export const getReservationStatusLabel = (status) =>
  getLabel(RESERVATION_STATUS_LABELS, status);
