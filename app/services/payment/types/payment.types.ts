/**
 * Payment API contracts — aligned with BE `PaymentProofHelper` /
 * `UploadedPaymentScreenshot`.
 * Nested image on reads; flat `proofReference` lives under `image.reference`.
 */

import type { PaymentMethod } from "~/enums/paymentMethod";

export type { PaymentMethod, PaymentMethodValue } from "~/enums/paymentMethod";

/** Nested proof image on READ payment summaries. */
export type PaymentImage = {
  reference: string | null;
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
 */
export type PaymentScreenshotUploadResult = {
  fileUrl: string;
  mimeType: string;
  /** Permanent object key — store this on Payment.proofReference */
  key: string;
};

/** Display row after `normalizePaymentSummary` (same nesting as API). */
export type PaymentSummaryListItem = PaymentSummary;
