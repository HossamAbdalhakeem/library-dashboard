import { buildReportQuery } from "~/services/reports/shared";

/**
 * General sales-trend query — omit empty branchId like legacy home card.
 */
export const buildGeneralSalesTrendQuery = (params = {}) => {
  const query = { ...params };
  if (!query.branchId) delete query.branchId;
  return buildReportQuery(query);
};

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
