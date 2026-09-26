/**
 * Payment API contracts — aligned with BE `PaymentProofHelper` /
 * `UploadedPaymentScreenshot`.
 * Nested image on reads; flat `proofReference` lives under `image.reference`.
 * `image.url` is always null on list/detail reads — fetch a signed URL on demand
 * via GET /uploads/payment-screenshot/:paymentId (or refund-screenshot).
 */

import type { PaymentMethod } from "~/enums/paymentMethod";

export type { PaymentMethod, PaymentMethodValue } from "~/enums/paymentMethod";

/** Nested proof image on READ payment summaries. */
export type PaymentImage = {
  reference: string | null;
  /** Always null on API reads — use on-demand screenshot endpoints */
  url: string | null;
  hasProof: boolean;
};

/**
 * Nested payment shape used on READ responses
 * (`{ id, method, methodLabel, image }`).
 */
export type PaymentSummary = {
  id: string | null;
  method: PaymentMethod;
  methodLabel: string;
  image: PaymentImage;
};

/**
 * Upload / signed-URL response from:
 * POST /uploads/payment-screenshot
 * GET /uploads/payment-screenshot/:paymentId
 * GET /uploads/refund-screenshot/:refundId
 */
export type PaymentScreenshotUploadResult = {
  fileUrl: string;
  mimeType: string;
  /** Permanent object key — store this on Payment.proofReference */
  key: string;
};

/** Display row after `normalizePaymentSummary` (same nesting as API). */
export type PaymentSummaryListItem = PaymentSummary;
