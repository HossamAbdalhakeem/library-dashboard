/**
 * Inventory list / option helpers.
 * Reads nested API only (`item.product.*`, `item.branch.*`) — no flat FK fallbacks.
 */

import { toFiniteNumber } from "~/utils/format/number";

const toMoneyNumber = (value) => {
  if (value == null || value === "") return 0;
  return toFiniteNumber(value, 0);
};

/** Map inventory row → table/display fields (nested product / branch only). */
export const normalizeInventoryListItem = (item) => {
  const product = item?.product || null;
  const branch = item?.branch || null;
  const physicalQuantity = Number(item?.physicalQuantity ?? 0);
  const reservedQuantity = Number(item?.reservedQuantity ?? 0);
  const availableQuantity = Number(
    item?.availableQuantity ?? Math.max(0, physicalQuantity - reservedQuantity),
  );

  return {
    productId: product?.id || null,
    physicalQuantity,
    reservedQuantity,
    availableQuantity,
    lowStockThreshold:
      item?.lowStockThreshold == null ? null : Number(item.lowStockThreshold),
    product: product
      ? {
          id: product.id,
          name: product.name || "-",
          type: product.type || null,
          status: product.status || null,
          sellingPrice: product.sellingPrice,
          reservationAllowed: Boolean(product.reservationAllowed),
          teacher: product.teacher || null,
          studyYear: product.studyYear || null,
          academicYear: product.academicYear || null,
        }
      : null,
    branch: branch ? { id: branch.id, name: branch.name || "-" } : null,
    productName: product?.name || "-",
    teacherName: product?.teacher?.name || "-",
    studyYearName: product?.studyYear?.name || "-",
    branchName: branch?.name || "-",
  };
};

/** Map inventory_summary preview / branch summary row. */
export const normalizeInventorySummaryPreview = (item) => {
  const product = item?.product || null;
  const physicalQuantity = Number(item?.physicalQuantity ?? 0);
  const reservedQuantity = Number(item?.reservedQuantity ?? 0);
  const availableQuantity = Number(
    item?.availableQuantity ?? Math.max(0, physicalQuantity - reservedQuantity),
  );

  return {
    productId: product?.id || null,
    productName: product?.name || "-",
    physicalQuantity,
    reservedQuantity,
    availableQuantity,
    product,
  };
};

export const normalizeInventorySummary = (summary) => {
  const branch = summary?.branch || null;
  return {
    branchId: branch?.id || null,
    branchName: branch?.name || "-",
    branch,
    productsCount: Number(summary?.productsCount ?? 0),
    preview: (summary?.preview || []).map(normalizeInventorySummaryPreview),
  };
};

/**
 * Inventory row → select option.
 * Expects nested `product` with teacher / studyYear from the API.
 */
export const mapInventoryProductOption = (item) => {
  const product = item?.product;
  if (!product?.id) return null;

  const teacherName = product.teacher?.name || "";
  const availableQuantity = Number(
    item?.availableQuantity ??
      Math.max(
        0,
        Number(item?.physicalQuantity || 0) - Number(item?.reservedQuantity || 0),
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

  return list
    .map(mapInventoryProductOption)
    .filter(Boolean)
    .filter((option) => !excludeId || option.value !== excludeId)
    .filter(
      (option) =>
        !minQty ||
        option.availableQuantity >= minQty ||
        option.reservationAllowed,
    );
};

export const normalizeStockMovement = (movement) => ({
  id: movement?.id || null,
  movementType: movement?.movementType || null,
  physicalQuantityChange: Number(movement?.physicalQuantityChange ?? 0),
  reservedQuantityChange: Number(movement?.reservedQuantityChange ?? 0),
  note: movement?.note || null,
  referenceId: movement?.referenceId || null,
  createdAt: movement?.createdAt || null,
  product: movement?.product || null,
  branch: movement?.branch || null,
  createdBy: movement?.createdBy || null,
  productName: movement?.product?.name || "-",
  branchName: movement?.branch?.name || "-",
  createdByName: movement?.createdBy?.fullName || "-",
});

/** Query for paginated branch inventory expand (same shape as expenses/reservations). */
export const buildBranchInventoryPageQuery = ({
  page = 1,
  perPage = 10,
} = {}) => ({
  include_sold: true,
  page,
  per_page: perPage,
});
