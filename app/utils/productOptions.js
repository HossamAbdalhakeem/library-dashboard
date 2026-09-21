const toMoneyNumber = (value) => {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export const mapInventoryProductOption = (item) => {
  const product = item?.product || item || {};
  const teacherName =
    product.teacher?.name || product.teacherName || product.teacher_name || "";
  const availableQuantity = Number(
    item?.availableQuantity ??
      Math.max(
        0,
        Number(item?.physicalQuantity || 0) - Number(item?.reservedQuantity || 0),
      ),
  );
  const isAvailable = availableQuantity > 0;
  const reservationAllowed = Boolean(
    product.reservationAllowed ??
      product.reservation_allowed ??
      item?.reservationAllowed ??
      item?.reservation_allowed,
  );
  const sellingPrice = toMoneyNumber(
    product.sellingPrice ?? product.selling_price,
  );
  const reservationPrice = toMoneyNumber(
    product.reservationPrice ?? product.reservation_price,
  );
  const hasSellingPrice = sellingPrice > 0;
  const priceKindLabel = hasSellingPrice ? "سعر البيع" : "سعر أولي";
  const displayPrice = hasSellingPrice ? sellingPrice : reservationPrice;
  const priceLabel = displayPrice > 0 ? `${displayPrice.toFixed(2)}ج.م` : "";
  const name = product.name || product.title || "-";
  const availabilityLabel = isAvailable
    ? `متاح ${availableQuantity}`
    : reservationAllowed
      ? "متاح للحجز"
      : "غير متاح";
  const studyYearName =
    product.studyYear?.name ||
    product.study_year?.name ||
    product.studyYearName ||
    product.study_year_name ||
    "";

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
    /** Stock on hand, or reservation-allowed even with zero stock */
    canSelect: isAvailable || reservationAllowed,
    availabilityLabel,
    teacherId: product.teacherId || product.teacher_id || product.teacher?.id || "",
    type: String(product.type || product.productType || product.product_type || "").toUpperCase(),
    label: priceLabel
      ? `${name} · ${availabilityLabel} · ${priceKindLabel} ${priceLabel}`
      : `${name} · ${availabilityLabel}`,
    value: product.id || item?.productId || null,
    studyYearId:
      product.studyYearId ||
      product.study_year_id ||
      product.studyYear?.id ||
      null,
    sellingPrice: displayPrice,
    unitPrice: displayPrice,
  };
};

export const mapCatalogProductOption = (product, { reservationOnly = false } = {}) => {
  if (!product?.id) return null;
  if (reservationOnly && product.reservationAllowed === false) return null;

  const sellingPrice = toMoneyNumber(
    product.sellingPrice ?? product.selling_price,
  );
  const name = product.name || product.title || "-";
  const priceLabel = sellingPrice > 0 ? `${sellingPrice.toFixed(2)}ج.م` : "";
  const teacherName =
    product.teacher?.name || product.teacherName || product.teacher_name || "";

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
    studyYearId:
      product.studyYearId ||
      product.study_year_id ||
      product.studyYear?.id ||
      null,
    sellingPrice,
  };
};

export const mapInventoryProductOptions = (items = [], filters = {}) => {
  const list = Array.isArray(items) ? items : items?.data || [];
  const excludeId = filters.excludeProductId ?? null;
  const minQty = Number(filters.minAvailableQuantity || 0);

  return list
    .map(mapInventoryProductOption)
    .filter((option) => option.value)
    .filter((option) => !excludeId || option.value !== excludeId)
    .filter(
      (option) =>
        !minQty ||
        option.availableQuantity >= minQty ||
        option.reservationAllowed,
    );
};

/** True when product has stock, or is allowed for reservation without stock. */
export const canSelectExchangeProduct = (product) =>
  Boolean(product?.isAvailable || product?.reservationAllowed);
