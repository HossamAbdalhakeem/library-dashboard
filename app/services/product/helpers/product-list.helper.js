import { formatMoney } from "~/utils/format/money";
import { getProductTypeLabel } from "~/enums/productType";

/** Map API product row → table/display fields (backend camelCase only). */
export const normalizeProductListItem = (product) => ({
  ...product,
  name: product.name || "-",
  teacherName: product.teacher?.name || "-",
  studyYearName: product.studyYear?.name || "-",
  sellingPriceLabel: formatMoney(product.sellingPrice),
  typeLabel: getProductTypeLabel(product.type),
  reservationLabel: product.reservationAllowed ? "مفعل" : "غير مفعل",
});

export const buildProductListQuery = ({ page, perPage, filters = {} }) => {
  const params = {
    page,
    per_page: perPage,
  };
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.teacherId) params.teacherId = filters.teacherId;
  if (filters.studyYearId) params.studyYearId = filters.studyYearId;
  return params;
};
