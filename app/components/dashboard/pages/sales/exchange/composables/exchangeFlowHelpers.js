import { isFiniteNumber } from "~/utils/format/number";
import {
  PaymentMethod,
  paymentMethodNeedsProof,
} from "~/enums/paymentMethod";
import { buildExchangeDiffLabels } from "~/utils/domain-labels/exchange";
import { getAvailabilityLabel } from "~/utils/domain-labels/product";
import { canSelectExchangeProduct } from "~/utils/productOptions";

export const COMPARISON_UI = {
  more: {
    titleClass: "text-amber-300",
    boxClass: "border-white/10 bg-slate-900",
    diffClass: "text-amber-300",
  },
  less: {
    titleClass: "text-emerald-300",
    boxClass: "border-white/10 bg-slate-900",
    diffClass: "text-emerald-300",
  },
  same: {
    titleClass: "text-primary-300",
    boxClass: "border-white/10 bg-slate-900",
    diffClass: "text-primary-300",
  },
};

export function buildSelectedNewProduct(preview) {
  const product = preview?.newProduct;
  if (!product) return null;
  const isAvailable = Boolean(product.availability ?? product.isAvailable);
  const reservationAllowed = Boolean(product.reservationAllowed);
  return {
    ...product,
    isAvailable,
    reservationAllowed,
    availabilityLabel: isAvailable
      ? getAvailabilityLabel(product.availability ?? product.isAvailable)
      : reservationAllowed
        ? "متاح للحجز"
        : "غير متاح",
  };
}

export function buildPriceComparisonUi(preview) {
  if (!preview?.kind) return null;
  const ui = COMPARISON_UI[preview.kind] || COMPARISON_UI.same;
  const labels = buildExchangeDiffLabels(preview);
  return {
    ...preview,
    ...ui,
    ...labels,
  };
}

export function clampExchangeQuantity(value, maxQuantity) {
  const n = Number(value);
  if (!isFiniteNumber(n) || n < 1) return 1;
  return Math.min(Math.floor(n), maxQuantity);
}

export function getQuantityError(quantity, maxQuantity) {
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) {
    return "أدخل كمية صحيحة لا تقل عن 1.";
  }
  if (qty > maxQuantity) {
    return `الحد الأقصى للاستبدال هو ${maxQuantity}.`;
  }
  return "";
}

export function isExchangeQuantityValid(quantity, maxQuantity) {
  const qty = Number(quantity);
  return Number.isInteger(qty) && qty >= 1 && qty <= maxQuantity;
}

export function canConfirmExchangeState({
  sale,
  busy,
  previewLoading,
  newProductId,
  preview,
  exchangeQuantity,
  maxQuantity,
  selectedNewProduct,
  exchangePaymentMethod,
  exchangeRefundMethod,
  exchangeProofKey,
}) {
  if (!sale || busy || previewLoading) return false;
  if (!newProductId || !preview) return false;
  if (String(newProductId) === String(sale?.product?.id || "")) return false;
  if (!isExchangeQuantityValid(exchangeQuantity, maxQuantity)) return false;
  if (!canSelectExchangeProduct(selectedNewProduct)) return false;

  if (preview.kind === "more") {
    if (!exchangePaymentMethod) return false;
    if (
      paymentMethodNeedsProof(exchangePaymentMethod) &&
      !String(exchangeProofKey || "").trim()
    ) {
      return false;
    }
  }

  if (preview.kind === "less") {
    if (!exchangeRefundMethod) return false;
    if (
      paymentMethodNeedsProof(exchangeRefundMethod) &&
      !String(exchangeProofKey || "").trim()
    ) {
      return false;
    }
  }

  return true;
}

/**
 * @returns {{ ok: true } | { ok: false, exchangeError?: string, exchangePaymentError?: string, quantityError?: string }}
 */
export function validateExchangeRequest({
  sale,
  newProductId,
  preview,
  exchangeQuantity,
  maxQuantity,
  exchangePaymentMethod,
  exchangeRefundMethod,
  exchangeProofKey,
}) {
  const quantityError = getQuantityError(exchangeQuantity, maxQuantity);
  if (quantityError) {
    return { ok: false, quantityError };
  }

  if (!newProductId) {
    return { ok: false, exchangeError: "اختر المنتج الجديد قبل التأكيد." };
  }
  if (newProductId === sale?.product?.id) {
    return {
      ok: false,
      exchangeError: "اختر منتجًا مختلفًا عن المنتج الحالي.",
    };
  }
  if (!preview) {
    return {
      ok: false,
      exchangeError: "انتظر حساب فرق السعر أو أعد اختيار المنتج.",
    };
  }
  if (!canSelectExchangeProduct(preview?.newProduct)) {
    return {
      ok: false,
      exchangeError:
        "المنتج المختار غير متاح في مخزون الفرع لهذه الكمية وغير مسموح بالحجز.",
    };
  }

  if (preview.kind === "more") {
    if (!exchangePaymentMethod) {
      return {
        ok: false,
        exchangePaymentError: "اختر طريقة تحصيل فرق السعر.",
      };
    }
    if (
      paymentMethodNeedsProof(exchangePaymentMethod) &&
      !String(exchangeProofKey || "").trim()
    ) {
      return {
        ok: false,
        exchangePaymentError:
          "صورة إثبات الدفع مطلوبة لطريقة الدفع المحددة.",
      };
    }
  }

  if (preview.kind === "less") {
    if (!exchangeRefundMethod) {
      return {
        ok: false,
        exchangePaymentError: "اختر طريقة رد فرق السعر.",
      };
    }
    if (
      paymentMethodNeedsProof(exchangeRefundMethod) &&
      !String(exchangeProofKey || "").trim()
    ) {
      return {
        ok: false,
        exchangePaymentError:
          "صورة إثبات الرد مطلوبة لطريقة الرد المحددة.",
      };
    }
  }

  return { ok: true };
}

export function buildExchangePayload({
  sale,
  newProductId,
  exchangeQuantity,
  maxQuantity,
  preview,
  exchangePaymentMethod,
  exchangeRefundMethod,
  exchangeProofKey,
}) {
  const payload = {
    saleId: sale.saleId,
    saleItemId: sale.saleItemId,
    newProductId,
    quantity: clampExchangeQuantity(exchangeQuantity, maxQuantity),
  };

  if (preview?.kind === "more") {
    payload.paymentMethod = exchangePaymentMethod;
    if (exchangeProofKey) {
      payload.proofReference = exchangeProofKey;
    }
  } else if (preview?.kind === "less") {
    payload.refundMethod = exchangeRefundMethod;
    if (exchangeProofKey) {
      payload.proofReference = exchangeProofKey;
    }
  }

  return payload;
}

export function createExchangeFieldDefaults(maxQuantity) {
  return {
    newProductId: null,
    exchangeQuantity: maxQuantity,
    quantityError: "",
    preview: null,
    exchangeError: "",
    exchangePaymentError: "",
    exchangePaymentMethod: PaymentMethod.CASH,
    exchangeRefundMethod: PaymentMethod.CASH,
    exchangeImage: null,
    exchangeProofKey: "",
    confirmVisible: false,
    previewLoading: false,
  };
}
