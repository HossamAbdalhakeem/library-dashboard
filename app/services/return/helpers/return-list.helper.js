import { formatMoney } from "~/utils/format/money";
import { getPaymentMethodLabel } from "~/enums/paymentMethod";

/** Map API return → table/display fields (nested relations only). */
export const normalizeReturnListItem = (row) => {
  const products = Array.isArray(row?.items)
    ? row.items
        .map(
          (item) =>
            `${item?.saleItem?.product?.name || "-"} × ${item?.quantity ?? 0}`,
        )
        .join(", ")
    : "-";

  const quantity = Array.isArray(row?.items)
    ? row.items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0)
    : 0;

  const refundMethod = row?.refunds?.[0]?.method || null;

  return {
    ...row,
    studentName: row?.sale?.student?.name || "-",
    branchName: row?.sale?.branch?.name || "-",
    academicYearName: row?.sale?.academicYear?.name || "-",
    products: products || "-",
    quantity,
    totalRefundAmountLabel: formatMoney(row?.totalRefundAmount),
    createdByName: row?.createdBy?.fullName || "-",
    refundMethod,
    refundMethodLabel: getPaymentMethodLabel(refundMethod),
  };
};

export const buildReturnListQuery = ({ filters = {} } = {}) => {
  const params = {};
  if (filters.academicYearId) params.academicYearId = filters.academicYearId;
  return params;
};
