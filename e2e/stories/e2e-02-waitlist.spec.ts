/**
 * E2E-02 Waitlist: create WAITING → admin stock-in → READY → UI deliver.
 */
import { test, expect, requireRoles, e2eEnv } from "../fixtures/test";
import { choosePaymentMethod, expectToastOrDialog } from "../helpers/forms";
import {
  addStock,
  createPartialReservation,
  drainAvailableStock,
  getReservation,
  listInventory,
  resolveCommerceSeed,
} from "../helpers/seed";

test.describe("E2E-02 Waitlist", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    requireRoles("employee", "admin");
  });

  test("WAITING → stock-in → READY → deliver", async ({
    page,
    openAs,
    apiAs,
  }) => {
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");

    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveCommerceSeed(employeeApi);

    const inventory = await listInventory(employeeApi);
    const target =
      inventory.find(
        (r) => r.productId === seed.productId && r.reservable && r.available > 0,
      ) ||
      inventory.find((r) => r.reservable && r.available > 0);

    test.skip(!target, "No reservable inventory row to drain");

    const drainedQty = target!.available;

    try {
      // Drain stock so create becomes WAITING
      await drainAvailableStock(adminApi, target!);

      const reservation = await createPartialReservation(employeeApi, {
        ...seed,
        productId: target!.productId,
        productName: target!.productName,
        productPrice: target!.productPrice || seed.productPrice,
      });
      expect(reservation.status).toMatch(/WAITING/i);

      // Stock-in promotes waitlist
      await addStock(adminApi, target!, Math.max(1, drainedQty));
      await page.waitForTimeout(800);

      const refreshed = await getReservation(employeeApi, reservation.id);
      expect(String(refreshed?.status || "")).toMatch(/READY/i);

      // Deliver (Employee UI)
      await openAs("employee", "/reservations/deliver");
      const search = page
        .locator("input.search-input-text, input[placeholder*='ابحث']")
        .first();
      await search.fill(reservation.reservationNumber);
      await page.waitForTimeout(800);

      if ((await page.getByTestId("deliver-reservation-action").count()) === 0) {
        await search.fill(seed.studentSearch);
        await page.waitForTimeout(800);
      }

      await page.getByTestId("deliver-reservation-action").first().click();
      const cash = page.getByTestId("payment-method-input-CASH");
      if (await cash.count()) await choosePaymentMethod(page, "CASH");
      await page.getByTestId("deliver-confirm").click();
      await page.getByTestId("deliver-confirm-yes").click();
      await expectToastOrDialog(page, /تسليم|نجاح|تم/i);
    } finally {
      // Best-effort restore so later stories keep stock
      await addStock(adminApi, target!, Math.max(1, drainedQty)).catch(
        () => undefined,
      );
    }
  });
});
