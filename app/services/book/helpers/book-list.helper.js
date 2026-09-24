import { formatMoney } from "~/utils/format/money";
import { getStatusTagMeta } from "~/utils/status-tags/catalog";

/**
 * Map CS book search row → table/display fields.
 * Relations stay nested (`teacher`, `studyYear`); display uses `*Name` fields.
 */
export const normalizeBookSearchItem = (item) => {
  const status = String(item.status || "").toUpperCase();
  const meta = getStatusTagMeta("product-availability", status);
  const name = item.name || "-";
  const teacherName = item.teacher?.name || null;
  const studyYearName = item.studyYear?.name || null;
  const sellingPriceLabel = formatMoney(item.sellingPrice);

  return {
    id: item.id,
    name,
    type: String(item.type || "").toUpperCase() || null,
    teacher: item.teacher || null,
    studyYear: item.studyYear || null,
    academicYear: item.academicYear || null,
    sellingPrice: item.sellingPrice,
    sellingPriceLabel,
    status,
    statusLabel: meta.label,
    reservationAllowed: Boolean(item.reservationAllowed),
    branches: Array.isArray(item.branches) ? item.branches : [],
    totalAvailable: Number(item.totalAvailable ?? 0),
    teacherName: teacherName || "-",
    studyYearName: studyYearName || "-",
    productCell: {
      name,
      price: sellingPriceLabel,
      teacherName,
      studyYearName,
    },
  };
};

/**
 * Selection payload for booking form hydration (flat FK ids for form fields).
 * Reads relation ids only from nested objects on the normalized/search row.
 */
export const buildBookSelection = (product, branch = null) => ({
  productId: product.id,
  productName: product.name,
  type: product.type,
  status: product.status,
  sellingPrice: Number(branch?.sellingPrice ?? product.sellingPrice ?? 0),
  reservationAllowed: product.reservationAllowed,
  teacherId: product.teacher?.id || null,
  teacherName: product.teacher?.name || null,
  studyYearId: product.studyYear?.id || null,
  studyYearName: product.studyYear?.name || null,
  branchId: branch?.id || null,
  branchName: branch?.name || null,
  availableQuantity: Number(branch?.availableQuantity ?? 0),
  totalAvailable: product.totalAvailable,
});

export const buildBookSearchQuery = (term = "", extras = {}) => {
  const product = String(term ?? "").trim();
  return {
    ...extras,
    ...(product ? { product } : {}),
  };
};
