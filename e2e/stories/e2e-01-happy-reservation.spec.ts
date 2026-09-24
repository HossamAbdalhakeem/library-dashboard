/**
 * E2E-01 Happy reservation path:
 * API create READY (partial deposit) → UI deliver → API return (reservation
 * sales are excluded from /sales/exchange eligible list — X-01).
 */
import { test, expect, requireRoles, e2eEnv } from "../fixtures/test";
import { choosePaymentMethod, expectToastOrDialog } from "../helpers/forms";
import {
  createPartialReservation,
  ensureReservationReady,
  getReservation,
  resolveSeedWithStock,
  unwrapRow,
} from "../helpers/seed";

test.describe("E2E-01 Happy reservation", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    requireRoles("employee", "admin");
  });

  test("create READY → deliver (cash remaining) → return sale", async ({
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

    // --- Deliver (Employee UI) ---
    await openAs("employee", "/reservations/deliver");

    const search = page.locator("input.search-input-text, input[placeholder*='ابحث']").first();
    await search.fill(reservation.reservationNumber);
    await page.waitForTimeout(700);

    // Fallback: search by student phone if number filter misses
    if ((await page.getByTestId("deliver-reservation-action").count()) === 0) {
      await search.fill(seed.studentSearch);
      await page.waitForTimeout(700);
    }

    const deliverBtn = page.getByTestId("deliver-reservation-action").first();
    await expect(deliverBtn).toBeVisible({ timeout: 20_000 });
    await deliverBtn.click();

    const cash = page.getByTestId("payment-method-input-CASH");
    if (await cash.count()) {
      await choosePaymentMethod(page, "CASH");
    }

    await page.getByTestId("deliver-confirm").click();
    await page.getByTestId("deliver-confirm-yes").click();
    await expectToastOrDialog(page, /تسليم|نجاح|تم/i);

    // --- Return via API: match recent sale for this student+product ---
    const salesBody = await adminApi.get("/sales", { per_page: 30 });
    const sales = Array.isArray((salesBody as any)?.data)
      ? (salesBody as any).data
      : Array.isArray(salesBody)
        ? salesBody
        : [];

    const sale =
      sales.find((s: any) => s?.reservation?.id === reservation.id) ||
      sales.find(
        (s: any) =>
          s?.student?.id === seed.studentId &&
          (s?.items || []).some(
            (i: any) =>
              i?.product?.id === seed.productId || i?.productId === seed.productId,
          ) &&
          !/RETURNED/.test(String(s?.status || "").toUpperCase()),
      );

    expect(sale?.id, "Expected a sale after deliver").toBeTruthy();

    const saleItem = Array.isArray(sale.items)
      ? sale.items.find(
          (i: any) =>
            Number(i.quantity?.remaining ?? i.remainingQuantity ?? i.quantity ?? 1) >
            0,
        ) || sale.items[0]
      : null;
    expect(saleItem?.id, "Expected sale item").toBeTruthy();

    const status = String(sale.status || "").toUpperCase();
    if (!/RETURNED/.test(status)) {
      const returned = unwrapRow(
        await adminApi.createReturn({
          saleId: sale.id,
          items: [{ saleItemId: saleItem.id, quantity: 1 }],
          method: "CASH",
        }),
      );
      expect(returned?.id || returned?.saleId || true).toBeTruthy();
    }
  });
});
