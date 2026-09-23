/**
 * Catalog / exchange option helpers.
 * Inventory option mappers live in `~/services/inventory`.
 */

import { toFiniteNumber } from "~/utils/format/number";

const toMoneyNumber = (value) => {
  if (value == null || value === "") return 0;
  return toFiniteNumber(value, 0);
};

export {
  mapInventoryProductOption,
  mapInventoryProductOptions,
} from "~/services/inventory";

export const mapCatalogProductOption = (product, { reservationOnly = false } = {}) => {
  if (!product?.id) return null;
  if (reservationOnly && product.reservationAllowed === false) return null;

  const sellingPrice = toMoneyNumber(product.sellingPrice);
  const name = product.name || "-";
  const priceLabel = sellingPrice > 0 ? `${sellingPrice.toFixed(2)}ج.م` : "";
  const teacherName = product.teacher?.name || "";

  return {
    name,
    teacherName,
    priceLabel,
    priceKindLabel: "سعر البيع",
    isSellingPrice: sellingPrice > 0,
    displayPrice: sellingPrice,
    availableQuantity: null,
    isAvailable: true,
    availabilityLabel: "",
    label: priceLabel ? `${name} · سعر البيع ${priceLabel}` : name,
    value: product.id,
    studyYearId: product.studyYear?.id || null,
    sellingPrice,
  };
};

export const canSelectExchangeProduct = (product) =>
  Boolean(product?.isAvailable || product?.reservationAllowed);
