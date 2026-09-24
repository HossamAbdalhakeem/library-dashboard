/**
 * E2E-03 Cancel path (happy cancel → walk-in).
 * E2E-08 covers the stricter "walk-in fails while reserved" matrix.
 */
import { test, expect, requireRoles, e2eEnv } from "../fixtures/test";
import { choosePaymentMethod, expectToastOrDialog } from "../helpers/forms";
import {
  createDirectSale,
  createPartialReservation,
  ensureReservationReady,
  getReservation,
  resolveSeedWithStock,
} from "../helpers/seed";

test.describe("E2E-03 Cancel path", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    requireRoles("employee", "admin");
  });

  test("create READY → admin cancel + refund → walk-in can sell freed stock", async ({
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
    const reservation = await createPartialReservation(employeeApi, seed);
    await ensureReservationReady(
      employeeApi,
      adminApi,
      reservation.id,
      seed.productId,
    );
    const ready = await getReservation(employeeApi, reservation.id);
    expect(String(ready?.status || "")).toMatch(/READY/i);

    await openAs("admin", "/reservations/manage");
    const search = page
      .locator("input.search-input-text, input[placeholder*='حجز']")
      .first();
    await search.fill(reservation.reservationNumber);
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

    const sale = await createDirectSale(employeeApi, seed, 1);
    expect(sale.id).toBeTruthy();
  });
});
