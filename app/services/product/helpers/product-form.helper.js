import {
  isCardProduct,
  isBookletProduct,
  normalizeProductType,
  productTypeRequiresStudyYear,
  ProductType,
} from "~/enums/productType";

export const emptyProductForm = () => ({
  type: ProductType.BOOK,
  teacherId: "",
  studyYearId: "",
  academicYearId: "",
  name: "",
  purchasePrice: null,
  sellingPrice: null,
  minStockQuantity: null,
  reservationAllowed: false,
});

const toNumber = (value) => {
  if (value == null || value === "") return null;
  return Number(value);
};

export const calcProfitPercentage = (purchasePrice, sellingPrice) => {
  const purchase = Number(purchasePrice || 0);
  const selling = Number(sellingPrice || 0);
  if (!purchase || purchase <= 0) return "0.00";
  return (((selling - purchase) / purchase) * 100).toFixed(2);
};

/**
 * Map API product → form fields.
 * Relations come only as nested objects from the backend.
 */
export const mapProductToForm = (product, fallbackAcademicYearId = "") => ({
  type: normalizeProductType(product?.type),
  teacherId: product?.teacher?.id || "",
  studyYearId: product?.studyYear?.id || "",
  academicYearId: product?.academicYear?.id || fallbackAcademicYearId || "",
  name: product?.name || "",
  purchasePrice: toNumber(product?.purchasePrice),
  sellingPrice: toNumber(product?.sellingPrice),
  minStockQuantity: toNumber(product?.minStockQuantity),
  reservationAllowed: Boolean(product?.reservationAllowed),
});

/**
 * Build create/update body matching CreateProductDto / UpdateProductDto.
 * Request body still uses flat FK ids (DTO contract).
 */
export const buildProductPayload = (form, { isEdit, currentAcademicYearId } = {}) => {
  const payload = {
    type: form.type,
    teacherId: form.teacherId,
    studyYearId: form.studyYearId,
    name: String(form.name || "").trim(),
    purchasePrice: form.purchasePrice,
    sellingPrice: form.sellingPrice,
    profitPercentage: Number(
      calcProfitPercentage(form.purchasePrice, form.sellingPrice),
    ),
    reservationAllowed: Boolean(form.reservationAllowed),
    minStockQuantity:
      form.minStockQuantity == null ? null : Number(form.minStockQuantity),
  };

  if (!isEdit) {
    const academicYearId = form.academicYearId || currentAcademicYearId || null;
    if (academicYearId) payload.academicYearId = academicYearId;
  }

  return payload;
};

export const validateProductForm = (form, { isEdit, currentAcademicYearId } = {}) => {
  if (productTypeRequiresStudyYear(form.type) && !form.studyYearId) {
    if (isCardProduct(form.type)) {
      return "السنة الدراسية مطلوبة عند إنشاء كارت.";
    }
    if (isBookletProduct(form.type)) {
      return "السنة الدراسية مطلوبة للملزمة.";
    }
    return "السنة الدراسية مطلوبة للكتب.";
  }

  if (!isEdit && !form.academicYearId && !currentAcademicYearId) {
    return "اختر العام الدراسي أولاً.";
  }

  return null;
};
