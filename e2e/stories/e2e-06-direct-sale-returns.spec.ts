/**
 * E2E-06 Direct sale → partial return → full return
 * API create sale (qty 2) → Admin UI refunds on /sales/exchange.
 */
import { test, expect, requireRoles, e2eEnv } from "../fixtures/test";
import { choosePaymentMethod, expectToastOrDialog } from "../helpers/forms";
import { createDirectSale, resolveSeedWithStock } from "../helpers/seed";

async function completeRefundStep(page: import("@playwright/test").Page) {
  const dialog = page.locator(".p-dialog:visible").last();
  await expect(dialog).toBeVisible();

  const qty = dialog.locator(".p-inputnumber input");
  if (await qty.count()) {
    await qty.first().click();
    await qty.first().fill("1");
  }

  const cash = dialog.getByTestId("payment-method-input-CASH");
  if (await cash.count()) await choosePaymentMethod(page, "CASH");

  await page.getByTestId("refund-confirm").click();
  await page.getByTestId("refund-confirm-yes").click();
  await expectToastOrDialog(page, /استرداد|إرجاع|تم|نجاح|جزئي/i);
}

test.describe("E2E-06 Direct sale returns", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    requireRoles("employee", "admin");
  });

  test("S-01 sell cash → T-02 partial return → T-03 finish return", async ({
    page,
    openAs,
    apiAs,
  }) => {
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");

    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveSeedWithStock(employeeApi, adminApi, {
      minAvailable: 2,
    });
    const sale = await createDirectSale(employeeApi, seed, 2);
    expect(sale.id).toBeTruthy();

    await openAs("admin", "/sales/exchange");

    const search = page
      .locator("input.search-input-text, input[placeholder*='ابحث']")
      .first();
    await search.fill(seed.studentSearch);
    await page.waitForTimeout(900);

    const refund = page.getByTestId("sale-refund-action").first();
    await expect(refund).toBeVisible({ timeout: 25_000 });
    await refund.click();
    await completeRefundStep(page);

    // Finish remaining qty
    await page.waitForTimeout(1000);
    const refund2 = page.getByTestId("sale-refund-action").first();
    if (await refund2.count()) {
      await refund2.click();
      const dialog = page.locator(".p-dialog:visible").last();
      await expect(dialog).toBeVisible();
      const cash2 = dialog.getByTestId("payment-method-input-CASH");
      if (await cash2.count()) await choosePaymentMethod(page, "CASH");
      await page.getByTestId("refund-confirm").click();
      await page.getByTestId("refund-confirm-yes").click();
      await expectToastOrDialog(page, /استرداد|إرجاع|تم|نجاح/i);
    }
  });
});
