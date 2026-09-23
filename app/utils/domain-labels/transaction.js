import { getLabel } from "./shared";

export const TRANSACTION_TYPE_LABELS = {
  SALE: "بيع",
  RESERVATION: "حجز",
  RETURN: "مرتجع",
  EXCHANGE: "استبدال",
};

export const getTransactionTypeLabel = (type) =>
  getLabel(TRANSACTION_TYPE_LABELS, String(type || "").toUpperCase());
