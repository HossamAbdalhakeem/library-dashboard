import { DEFAULT_METRIC_COLOR, getLabel } from "./shared";

export const STOCK_MOVEMENT_LABELS = {
  STOCK_IN: "استلام",
  STOCK_OUT: "سحب",
  SALE: "بيع",
  RESERVATION: "حجز",
  RESERVATION_RELEASE: "إلغاء حجز",
  RETURN: "مرتجع",
  DAMAGED: "تالف",
  ADJUSTMENT: "تسوية",
  EXCHANGE: "استبدال",
  REFUND: "استرداد",
};

/** Warehouse stock operation types (add / remove). */
export const STOCK_OPERATION_LABELS = {
  STOCK_IN: "إضافة للمخزن",
  STOCK_OUT: "سحب من المخزن",
};

/** Distinct accent colors for stock-movement type chips in tables. */
export const STOCK_MOVEMENT_COLORS = {
  STOCK_IN: "#10b981",
  STOCK_OUT: "#f97316",
  SALE: "#f5af52",
  RESERVATION: "#a78bfa",
  RESERVATION_RELEASE: "#fb7185",
  RETURN: "#e11d48",
  DAMAGED: "#b91c1c",
  ADJUSTMENT: "#94a3b8",
  EXCHANGE: "#6366f1",
  REFUND: "#f43f5e",
};

export const getStockMovementLabel = (type) =>
  getLabel(STOCK_MOVEMENT_LABELS, String(type || "").toUpperCase());

export const getStockOperationLabel = (type) =>
  getLabel(STOCK_OPERATION_LABELS, String(type || "").toUpperCase());

export const getStockMovementColor = (type) =>
  STOCK_MOVEMENT_COLORS[String(type || "").toUpperCase()] || DEFAULT_METRIC_COLOR;
