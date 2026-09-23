import { formatMoney } from "~/utils/format/money";

/**
 * Flat dialog payload for exchange/refund flows.
 * Derived from nested eligible-sale row + line item only.
 */
export const toExchangeFlowSale = (saleRow, item) => {
  if (!saleRow || !item?.saleItemId || !item.product) return null;

  const product = item.product;
  const quantity = item.quantity || {};
  const lineStatus = String(
    item.lineStatus || saleRow.status || "COMPLETED",
  ).toUpperCase();

  return {
    id: `${saleRow.id}:${item.saleItemId}`,
    saleId: saleRow.id,
    saleItemId: item.saleItemId,
    branchId: saleRow.branch?.id || null,
    saleNumber: saleRow.saleNumber || saleRow.id,
    createdAt: saleRow.createdAt,
    status: lineStatus,
    saleStatus: saleRow.status,
    lineStatus,
    canModify: item.canModify,
    quantity,
    remainingQuantity: Number(quantity.remaining) || 0,
    student: saleRow.student,
    branch: saleRow.branch,
    product,
    productId: product.id,
    payment: saleRow.payment,
  };
};

/** Map API preview → display fields (nested newProduct.teacher only). */
export const normalizeExchangePreview = (preview = {}) => {
  if (!preview || typeof preview !== "object") return null;

  const newProduct = preview.newProduct || null;
  return {
    ...preview,
    oldUnitPriceLabel: formatMoney(preview.oldUnitPrice),
    newUnitPriceLabel: formatMoney(preview.newUnitPrice),
    oldTotalLabel: formatMoney(preview.oldTotal),
    newTotalLabel: formatMoney(preview.newTotal),
    differenceLabel: formatMoney(preview.absoluteDifference ?? preview.difference),
    newProduct: newProduct
      ? {
          ...newProduct,
          teacher: newProduct.teacher?.name
            ? {
                ...(newProduct.teacher.id != null
                  ? { id: newProduct.teacher.id }
                  : {}),
                name: newProduct.teacher.name,
              }
            : null,
          unitPriceLabel: formatMoney(newProduct.unitPrice),
        }
      : null,
  };
};

/** Map API exchange entity → detail/display (nested relations only). */
export const normalizeExchangeDetail = (exchange = {}) => {
  if (!exchange?.id) return null;

  return {
    id: exchange.id,
    quantity: exchange.quantity,
    differenceAmount: exchange.differenceAmount,
    differenceAmountLabel: formatMoney(exchange.differenceAmount),
    createdAt: exchange.createdAt,
    sale: exchange.sale
      ? {
          id: exchange.sale.id,
          status: exchange.sale.status,
          totalAmount: exchange.sale.totalAmount,
          student: exchange.sale.student || null,
          branch: exchange.sale.branch || null,
        }
      : null,
    saleItem: exchange.saleItem
      ? {
          id: exchange.saleItem.id,
          quantity: exchange.saleItem.quantity,
          product: exchange.saleItem.product || null,
        }
      : null,
    newProduct: exchange.newProduct || null,
    createdBy: exchange.createdBy || null,
    refunds: exchange.refunds || [],
  };
};

export const buildExchangeCreatePayload = ({
  saleId,
  saleItemId,
  newProductId,
  quantity,
  paymentMethod,
  refundMethod,
  proofReference,
}) => {
  const payload = {
    saleId,
    saleItemId,
    newProductId,
    quantity: Number(quantity || 1),
  };

  if (paymentMethod) payload.paymentMethod = paymentMethod;
  if (refundMethod) payload.refundMethod = refundMethod;
  if (proofReference) payload.proofReference = proofReference;

  return payload;
};
