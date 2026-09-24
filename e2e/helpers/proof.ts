import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
export const PAYMENT_PROOF_FIXTURE = path.join(
  rootDir,
  "../fixtures/payment-proof.png",
);

/**
 * Upload WALLET/INSTAPAY payment screenshot through ImageUpload + cropper.
 */
export async function uploadPaymentProof(page: Page) {
  const fileInput = page.getByTestId("payment-proof-file").first();
  await expect(fileInput).toBeAttached({ timeout: 10_000 });
  await fileInput.setInputFiles(PAYMENT_PROOF_FIXTURE);

  const confirmCrop = page.getByRole("button", { name: /تأكيد القص/i });
  await expect(confirmCrop).toBeVisible({ timeout: 15_000 });
  await confirmCrop.click();

  await expect(page.getByText(/تم رفع الصورة بنجاح/i).first()).toBeVisible({
    timeout: 30_000,
  });
}
