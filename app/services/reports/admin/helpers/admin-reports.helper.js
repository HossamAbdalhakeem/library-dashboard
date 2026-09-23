import { buildReportQuery } from "~/services/reports/shared";

/** Clean admin report query (omit empty/nullish keys). */
export const buildAdminReportQuery = (params = {}) =>
  buildReportQuery(params);

/**
 * General sales-trend query — omit empty branchId like legacy home card.
 */
export const buildGeneralSalesTrendQuery = (params = {}) => {
  const query = { ...params };
  if (!query.branchId) delete query.branchId;
  return buildReportQuery(query);
};

const emptyGeneralSummary = () => ({
  branchesCount: 0,
  studentsCount: 0,
  productsCount: 0,
  teachersCount: 0,
});

/** Home KPI summary with safe numeric defaults. */
export const normalizeGeneralSummary = (payload = {}) => ({
  ...emptyGeneralSummary(),
  ...payload,
  branchesCount: Number(payload.branchesCount) || 0,
  studentsCount: Number(payload.studentsCount) || 0,
  productsCount: Number(payload.productsCount) || 0,
  teachersCount: Number(payload.teachersCount) || 0,
});

/** Payment-methods list from admin or general payloads. */
export const extractPaymentMethodItems = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.payments) && payload.payments.length) {
    return payload.payments;
  }
  if (Array.isArray(payload?.paymentsByMethod)) {
    return payload.paymentsByMethod;
  }
  return [];
};

/** Sales-trend points from admin or general trend payloads. */
export const extractSalesTrendPoints = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.points)) return payload.points;
  return [];
};

/** Product movement rows from admin products payload. */
export const extractAdminProducts = (payload) =>
  Array.isArray(payload?.products) ? payload.products : [];

/** Branch performance rows from admin branches payload. */
export const extractAdminBranches = (payload) =>
  Array.isArray(payload?.branches) ? payload.branches : [];

/** Top products from general home — nested `product` only. */
export const extractGeneralTopProducts = (payload) => {
  const list = Array.isArray(payload) ? payload : [];
  return list
    .map((row) => {
      const product = row.product;
      if (!product?.id) return null;
      return {
        id: product.id,
        name: product.name || "—",
        salesCount: Number(row.salesCount) || 0,
        salesAmount: Number(row.salesAmount) || 0,
        product: { id: product.id, name: product.name || "—" },
      };
    })
    .filter(Boolean);
};
/** Recent operations list from general home payload. */
export const extractGeneralRecentOperations = (payload) =>
  Array.isArray(payload) ? payload : [];
