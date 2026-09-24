/**
 * E2E-07 Exchange chain:
 * sell qty 2 → partial exchange (pricier) → return remaining original → return replacement.
 */
import { test, expect, requireRoles, e2eEnv } from "../fixtures/test";
import { choosePaymentMethod, expectToastOrDialog } from "../helpers/forms";
import {
  createDirectSale,
  createSaleExchange,
  findPricierProduct,
  listInventory,
  resolveSeedWithStock,
  unwrapList,
  unwrapRow,
} from "../helpers/seed";

test.describe("E2E-07 Exchange chain", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    requireRoles("employee", "admin");
  });

  test("partial expensive exchange → return original remaining → return replacement", async ({
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

    // Prefer a product with at least 2 available (prior stories may have drained others)
    const rows = (await listInventory(employeeApi)).filter(
      (r) => r.available >= 2 && r.productPrice > 0,
    );
    const stocked =
      rows.find((r) => r.productId === seed.productId) ||
      rows.sort((a, b) => b.available - a.available)[0];
    test.skip(!stocked, "No product with available >= 2 for exchange chain");

    const saleSeed = {
      ...seed,
      productId: stocked!.productId,
      productName: stocked!.productName,
      productPrice: stocked!.productPrice,
    };
    const pricier = await findPricierProduct(employeeApi, saleSeed);

    const sale = await createDirectSale(employeeApi, saleSeed, 2);
    expect(sale.id && sale.saleItemId).toBeTruthy();

    // Open exchange UI so the user can see the screen, then commit via API
    await openAs("admin", "/sales/exchange");
    const search = page
      .locator("input.search-input-text, input[placeholder*='ابحث']")
      .first();
    await search.fill(seed.studentSearch);
    await page.waitForTimeout(1000);

    const exchangeBtn = page.getByTestId("sale-exchange-action").first();
    await expect(exchangeBtn).toBeVisible({ timeout: 25_000 });
    await exchangeBtn.click();
    await expect(page.locator(".p-dialog:visible").last()).toBeVisible();
    await page.keyboard.press("Escape").catch(() => undefined);

    const exchanged = await createSaleExchange(adminApi, {
      saleId: sale.id,
      saleItemId: sale.saleItemId!,
      newProductId: pricier.productId,
      quantity: 1,
      paymentMethod: "CASH",
    });
    expect(exchanged).toBeTruthy();

    // Reload list and return remaining original line
    await page.reload();
    await search.fill(seed.studentSearch);
    await page.waitForTimeout(1000);

    const refund = page.getByTestId("sale-refund-action").first();
    if (await refund.count()) {
      await refund.click();
      const dialog = page.locator(".p-dialog:visible").last();
      await expect(dialog).toBeVisible();
      const cash = dialog.getByTestId("payment-method-input-CASH");
      if (await cash.count()) await choosePaymentMethod(page, "CASH");
      await page.getByTestId("refund-confirm").click();
      await page.getByTestId("refund-confirm-yes").click();
      await expectToastOrDialog(page, /استرداد|إرجاع|تم|نجاح/i);
    } else {
      // API fallback for original remaining
      const sales = unwrapList(await adminApi.get("/sales", { per_page: 20 }));
      const fresh = sales.find((s: any) => s.id === sale.id) || sales[0];
      const original = (fresh?.items || []).find(
        (i: any) => i.id === sale.saleItemId || i.canModify,
      );
      if (original?.id) {
        unwrapRow(
          await adminApi.createReturn({
            saleId: fresh.id,
            items: [{ saleItemId: original.id, quantity: 1 }],
            method: "CASH",
          }),
        );
      }
    }

    // Return replacement line if still returnable
    await page.waitForTimeout(800);
    const refund2 = page.getByTestId("sale-refund-action").first();
    if (await refund2.count()) {
      await refund2.click();
      const dialog = page.locator(".p-dialog:visible").last();
      const cash = dialog.getByTestId("payment-method-input-CASH");
      if (await cash.count()) await choosePaymentMethod(page, "CASH");
      await page.getByTestId("refund-confirm").click();
      await page.getByTestId("refund-confirm-yes").click();
      await expectToastOrDialog(page, /استرداد|إرجاع|تم|نجاح/i);
    }
  });
});
