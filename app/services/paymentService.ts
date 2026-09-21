import { apiFetch } from "~/utils/apiFetch";

export type PaymentScreenshotUploadResult = {
  file_url: string;
  mime_type: string;
  /** Permanent object key — store this on Payment.proofReference */
  key: string;
};

export const paymentService = {
  async getPayments(params: Record<string, any> = {}) {
    return await apiFetch("/payments", {
      method: "GET",
      params,
    });
  },

  /**
   * Upload a payment proof image through the Nest API.
   * Returns a temporary signed `file_url` for preview and a permanent `key` to store.
   */
  async uploadPaymentProof(file: File): Promise<PaymentScreenshotUploadResult> {
    const body = new FormData();
    body.append("file", file);

    const result = await apiFetch<PaymentScreenshotUploadResult>(
      "/uploads/payment-screenshot",
      {
        method: "POST",
        body,
      },
    );

    if (!result?.key || !result?.file_url) {
      throw new Error("تعذر رفع صورة الإثبات.");
    }

    return result;
  },

  /** Fresh signed URL for an existing payment screenshot */
  async getPaymentScreenshot(paymentId: string) {
    return await apiFetch<PaymentScreenshotUploadResult>(
      `/uploads/payment-screenshot/${paymentId}`,
      { method: "GET" },
    );
  },
};
