/**
 * Inventory list / option helpers.
 * Reads nested API only (`item.product.*`, `item.branch.*`) — no flat FK fallbacks.
 */

import { toFiniteNumber } from "~/utils/format/number";

const toMoneyNumber = (value) => {
  if (value == null || value === "") return 0;
  return toFiniteNumber(value, 0);
};

/**
 * Inventory row → select option.
 * Expects nested `product` with teacher / studyYear from the API.
 */
export const mapInventoryProductOption = (item) => {
  const product = item?.product;
  if (!product?.id) return null;

  const teacherName = product.teacher?.name || "";
  const damagedQuantity = Number(item?.damagedQuantity || 0);
  const availableQuantity = Number(
    item?.availableQuantity ??
      Math.max(
        0,
        Number(item?.physicalQuantity || 0) -
          Number(item?.reservedQuantity || 0) -
          damagedQuantity,
      ),
  );
  const isAvailable = availableQuantity > 0;
  const reservationAllowed = Boolean(product.reservationAllowed);
  const sellingPrice = toMoneyNumber(product.sellingPrice);
  const hasSellingPrice = sellingPrice > 0;
  const priceKindLabel = "سعر البيع";
  const displayPrice = sellingPrice;
  const priceLabel = displayPrice > 0 ? `${displayPrice.toFixed(2)}ج.م` : "";
  const name = product.name || "-";
  const availabilityLabel = isAvailable
    ? `متاح ${availableQuantity}`
    : reservationAllowed
      ? "متاح للحجز"
      : "غير متاح";
  const studyYearName = product.studyYear?.name || "";

  return {
    name,
    teacherName,
    studyYearName,
    priceLabel,
    priceKindLabel,
    isSellingPrice: hasSellingPrice,
    displayPrice,
    availableQuantity,
    damagedQuantity,
    isAvailable,
    reservationAllowed,
    canSelect: isAvailable || reservationAllowed,
    availabilityLabel,
    teacherId: product.teacher?.id || "",
    type: String(product.type || "").toUpperCase(),
    label: priceLabel
      ? `${name} · ${availabilityLabel} · ${priceKindLabel} ${priceLabel}`
      : `${name} · ${availabilityLabel}`,
    value: product.id,
    studyYearId: product.studyYear?.id || null,
    sellingPrice: displayPrice,
    unitPrice: displayPrice,
  };
};

export const mapInventoryProductOptions = (items = [], filters = {}) => {
  const list = Array.isArray(items) ? items : items?.data || [];
  const excludeId = filters.excludeProductId ?? null;
  const minQty = Number(filters.minAvailableQuantity || 0);
  const minDamaged = Number(filters.minDamagedQuantity || 0);

  return list
    .map(mapInventoryProductOption)
    .filter(Boolean)
    .filter((option) => !excludeId || option.value !== excludeId)
    .filter(
      (option) =>
        !minQty ||
        option.availableQuantity >= minQty ||
        option.reservationAllowed,
    )
    .filter(
      (option) => !minDamaged || option.damagedQuantity >= minDamaged,
    );
};
