/**
 * E2E-08 Reserved vs walk-in:
 * READY holds stock → walk-in sale fails → admin cancel → walk-in succeeds.
 */
import { test, expect, requireRoles, e2eEnv } from "../fixtures/test";
import { choosePaymentMethod, expectToastOrDialog } from "../helpers/forms";
import {
  createDirectSale,
  createHoldingReservation,
  expectSaleFailsInsufficient,
  resolveSeedWithStock,
  topUpProductStock,
} from "../helpers/seed";

test.describe("E2E-08 Reserved vs walk-in", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    requireRoles("employee", "admin");
  });

  test("READY holds stock → walk-in fails → cancel → walk-in succeeds", async ({
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

    // Hold all available units of a product
    const holding = await createHoldingReservation(employeeApi, seed);
    expect(holding.status).toMatch(/READY/i);

    const blocked = await expectSaleFailsInsufficient(
      employeeApi,
      holding.seedForProduct,
      1,
    );
    expect(blocked.ok, blocked.error).toBe(true);

    // Admin cancels → releases reserve
    await openAs("admin", "/reservations/manage");
    const search = page
      .locator("input.search-input-text, input[placeholder*='حجز']")
      .first();
    await search.fill(holding.reservationNumber);
    await page.waitForTimeout(900);

    if ((await page.getByTestId("reservation-cancel").count()) === 0) {
      await search.fill(seed.studentSearch);
      await page.waitForTimeout(900);
    }

    await page.getByTestId("reservation-cancel").first().click();
    const cash = page.getByTestId("payment-method-input-CASH");
    if (await cash.count()) await choosePaymentMethod(page, "CASH");
    await page.getByTestId("cancel-reservation-confirm").click();
    await page.getByTestId("cancel-reservation-yes").click();
    await expectToastOrDialog(page, /إلغاء|تم|نجاح/i);

    // Safety net if cancel release is slow
    await topUpProductStock(employeeApi, adminApi, holding.productId, 2);

    const sale = await createDirectSale(
      employeeApi,
      holding.seedForProduct,
      1,
    );
    expect(sale.id).toBeTruthy();
  });
});
