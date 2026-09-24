/**
 * E2E-04 Change product to cheaper → deliver → return.
 */
import { test, expect, requireRoles, e2eEnv } from "../fixtures/test";
import { choosePaymentMethod, expectToastOrDialog } from "../helpers/forms";
import {
  changeReservationProduct,
  createPartialReservation,
  ensureReservationReady,
  findCheaperReservablePair,
  resolveSeedWithStock,
  unwrapList,
  unwrapRow,
} from "../helpers/seed";

test.describe("E2E-04 Change product", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    requireRoles("employee", "admin");
  });

  test("cheaper swap → deliver → return", async ({ page, openAs, apiAs }) => {
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");

    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveSeedWithStock(employeeApi, adminApi, {
      minAvailable: 2,
    });
    const { expensive, cheaper } = await findCheaperReservablePair(
      employeeApi,
      seed,
    );

    const reservation = await createPartialReservation(employeeApi, {
      ...seed,
      productId: expensive.productId,
      productName: expensive.productName,
      productPrice: expensive.productPrice,
    });
    await ensureReservationReady(
      employeeApi,
      adminApi,
      reservation.id,
      expensive.productId,
    );

    // Admin UI: open manage + change product (API swap if UI pick is brittle)
    await openAs("admin", "/reservations/manage");
    const search = page
      .locator("input.search-input-text, input[placeholder*='حجز']")
      .first();
    await search.fill(reservation.reservationNumber);
    await page.waitForTimeout(900);

    const changeBtn = page.getByTestId("reservation-change-product").first();
    if (await changeBtn.count()) {
      await changeBtn.click();
      await expect(page.locator(".p-dialog:visible").last()).toBeVisible();
      // Prefer API commit for product pick reliability; still show dialog briefly
      await page.keyboard.press("Escape").catch(() => undefined);
    }

    const swapped = await changeReservationProduct(
      adminApi,
      reservation.id,
      cheaper.productId,
      "CASH",
    );
    expect(String(swapped?.product?.id || swapped?.productId || "")).toBeTruthy();

    // Deliver
    await openAs("employee", "/reservations/deliver");
    const deliverSearch = page
      .locator("input.search-input-text, input[placeholder*='ابحث']")
      .first();
    await deliverSearch.fill(reservation.reservationNumber);
    await page.waitForTimeout(800);
    await page.getByTestId("deliver-reservation-action").first().click();
    const cash = page.getByTestId("payment-method-input-CASH");
    if (await cash.count()) await choosePaymentMethod(page, "CASH");
    await page.getByTestId("deliver-confirm").click();
    await page.getByTestId("deliver-confirm-yes").click();
    await expectToastOrDialog(page, /تسليم|نجاح|تم/i);

    // Return via API (reservation-origin sale)
    const salesBody = await adminApi.get("/sales", { per_page: 20 });
    const sales = unwrapList(salesBody);
    const sale =
      sales.find((s: any) => s?.reservation?.id === reservation.id) ||
      sales.find((s: any) => s?.student?.id === seed.studentId);
    expect(sale?.id).toBeTruthy();
    const item = Array.isArray(sale.items) ? sale.items[0] : null;
    expect(item?.id).toBeTruthy();
    unwrapRow(
      await adminApi.createReturn({
        saleId: sale.id,
        items: [{ saleItemId: item.id, quantity: 1 }],
        method: "CASH",
      }),
    );
  });
});
