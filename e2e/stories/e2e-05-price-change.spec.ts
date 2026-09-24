/**
 * E2E-05 Price change before deliver:
 * Create READY (partial deposit) → admin raises selling price → deliver pays higher remaining.
 */
import { test, expect, requireRoles, e2eEnv } from "../fixtures/test";
import { choosePaymentMethod, expectToastOrDialog } from "../helpers/forms";
import {
  createPartialReservation,
  ensureReservationReady,
  getReservation,
  resolveSeedWithStock,
  updateProductSellingPrice,
} from "../helpers/seed";

test.describe("E2E-05 Price change before deliver", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    requireRoles("employee", "admin");
  });

  test("raise price → remaining increases → deliver with cash", async ({
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
    expect(
      String((await getReservation(employeeApi, reservation.id))?.status || ""),
    ).toMatch(/READY/i);

    const before = await getReservation(employeeApi, reservation.id);
    const remainingBefore = Number(
      before?.remainingAmount ??
        before?.payment?.remainingAmount ??
        reservation.remaining ??
        0,
    );
    const paid = Number(
      before?.paidAmount ?? before?.payment?.paidAmount ?? reservation.deposit,
    );

    const bump = 100;
    const { previous } = await updateProductSellingPrice(
      adminApi,
      seed.productId,
      Math.max(seed.productPrice, paid + remainingBefore) + bump,
    );

    try {
      const after = await getReservation(employeeApi, reservation.id);
      const remainingAfter = Number(
        after?.remainingAmount ?? after?.payment?.remainingAmount ?? 0,
      );
      const totalAfter = Number(
        after?.totalAmount ?? after?.payment?.totalAmount ?? 0,
      );

      // Live price on open reservation (R-19 / R-33)
      expect(remainingAfter).toBeGreaterThan(remainingBefore);

      await openAs("employee", "/reservations/deliver");
      const search = page
        .locator("input.search-input-text, input[placeholder*='ابحث']")
        .first();
      await search.fill(reservation.reservationNumber);
      await page.waitForTimeout(800);

      await page.getByTestId("deliver-reservation-action").first().click();

      // Remaining payment UI should appear
      await expect(
        page.getByText(/متبقي|المبلغ المتبقي/i).first(),
      ).toBeVisible({ timeout: 15_000 });

      const cash = page.getByTestId("payment-method-input-CASH").first();
      if (await cash.count()) await choosePaymentMethod(page, "CASH");

      await page.getByTestId("deliver-confirm").click();
      await page.getByTestId("deliver-confirm-yes").click();
      await expectToastOrDialog(page, /تسليم|نجاح|تم/i);
    } finally {
      // Restore catalog price
      await updateProductSellingPrice(adminApi, seed.productId, previous).catch(
        () => undefined,
      );
    }
  });
});
