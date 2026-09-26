import { apiFetch, asData } from "~/utils/apiFetch";
import { assertPaymentScreenshot } from "../helpers/payment-upload.helper";
import type { PaymentScreenshotUploadResult } from "../types/payment.types";

export const paymentApi = {
  /**
   * Upload a payment proof image through the Nest API.
   * Returns a temporary signed `fileUrl` for preview and a permanent `key` to store.
   * POST /uploads/payment-screenshot → PaymentScreenshotUploadResult
   */
  async uploadPaymentProof(file: File): Promise<PaymentScreenshotUploadResult> {
    const body = new FormData();
    body.append("file", file);

    const result = asData(
      await apiFetch<PaymentScreenshotUploadResult>(
        "/uploads/payment-screenshot",
        {
          method: "POST",
          body,
        },
      ),
    );

    return assertPaymentScreenshot(result);
  },

  /** GET /uploads/payment-screenshot/:paymentId → PaymentScreenshotUploadResult */
  async getPaymentScreenshot(
    paymentId: string,
  ): Promise<PaymentScreenshotUploadResult> {
    return asData(
      await apiFetch<PaymentScreenshotUploadResult>(
        `/uploads/payment-screenshot/${paymentId}`,
        { method: "GET" },
      ),
    );
  },

  /** GET /uploads/refund-screenshot/:refundId → PaymentScreenshotUploadResult */
  async getRefundScreenshot(
    refundId: string,
  ): Promise<PaymentScreenshotUploadResult> {
    return asData(
      await apiFetch<PaymentScreenshotUploadResult>(
        `/uploads/refund-screenshot/${refundId}`,
        { method: "GET" },
      ),
    );
  },
};

/** @deprecated Prefer `paymentApi` */
export const paymentService = paymentApi;
