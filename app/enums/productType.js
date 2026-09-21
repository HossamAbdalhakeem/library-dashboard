export const ProductType = Object.freeze({
  BOOK: "BOOK",
  CARD: "CARD",
  BOOKLET: "BOOKLET",
});

export const PRODUCT_TYPE_LABELS = Object.freeze({
  [ProductType.BOOK]: "كتاب",
  [ProductType.CARD]: "كارت",
  [ProductType.BOOKLET]: "ملزمة",
});

export const PRODUCT_TYPE_OPTIONS = Object.freeze(
  Object.values(ProductType).map((value) => ({
    label: PRODUCT_TYPE_LABELS[value],
    value,
  })),
);

export const isProductType = (value) =>
  Object.values(ProductType).includes(String(value || "").toUpperCase());

export const normalizeProductType = (value, fallback = ProductType.BOOK) => {
  const next = String(value || "").toUpperCase();
  return isProductType(next) ? next : fallback;
};

export const getProductTypeLabel = (value) => {
  const type = normalizeProductType(value, "");
  return PRODUCT_TYPE_LABELS[type] || value || "-";
};

export const isBookProduct = (value) =>
  normalizeProductType(value, "") === ProductType.BOOK;

export const isCardProduct = (value) =>
  normalizeProductType(value, "") === ProductType.CARD;

export const isBookletProduct = (value) =>
  normalizeProductType(value, "") === ProductType.BOOKLET;

export const productTypeRequiresStudyYear = (value) =>
  isBookProduct(value) || isCardProduct(value) || isBookletProduct(value);
