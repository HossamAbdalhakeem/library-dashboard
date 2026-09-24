/**
 * I. Sale exchanges — eligibility + create guards.
 * X-01 / X-02 / X-06 / X-10 / X-11
 */
import { test, expect, requireRoles, e2eEnv } from "../fixtures/test";
import {
  addStock,
  createDirectSale,
  createPartialReservation,
  createSaleExchange,
  drainAvailableStock,
  ensureReservationReady,
  expectApiFails,
  findPricierProduct,
  getEligibleSales,
  listInventory,
  resolveSeedWithStock,
} from "../helpers/seed";

test.describe("I. Exchanges", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    requireRoles("employee", "admin");
  });

  test("X-01 eligible excludes reservation-origin sales", async ({ apiAs }) => {
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
    await employeeApi.deliverReservation(reservation.id, { method: "CASH" });

    const eligible = await getEligibleSales(adminApi, seed.studentSearch);
    const hit = eligible.find(
      (s: any) =>
        s?.reservation?.id === reservation.id ||
        s?.sale?.reservation?.id === reservation.id,
    );
    expect(
      hit,
      "Reservation-origin sale must not be exchange-eligible",
    ).toBeFalsy();
  });

  test("X-02 eligible includes direct sales + UI action", async ({
    apiAs,
    openAs,
    page,
  }) => {
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");
    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveSeedWithStock(employeeApi, adminApi, {
      minAvailable: 2,
    });
    const sale = await createDirectSale(employeeApi, seed, 1);

    const eligible = await getEligibleSales(adminApi, seed.studentSearch);
    const hit = eligible.find(
      (s: any) =>
        s?.id === sale.id || s?.saleId === sale.id || s?.sale?.id === sale.id,
    );
    expect(hit, "Direct sale should appear in eligible list").toBeTruthy();

    await openAs("admin", "/sales/exchange");
    const search = page
      .locator("input.search-input-text, input[placeholder*='ابحث']")
      .first();
    await search.fill(seed.studentSearch);
    await page.waitForTimeout(800);
    await expect(page.getByTestId("sale-exchange-action").first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test("X-06 exchange to more expensive product", async ({ apiAs }) => {
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");
    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveSeedWithStock(employeeApi, adminApi, {
      minAvailable: 2,
    });
    const pricier = await findPricierProduct(employeeApi, seed);
    await addStock(adminApi, pricier, 2).catch(() => undefined);

    const sale = await createDirectSale(employeeApi, seed, 1);
    expect(sale.saleItemId).toBeTruthy();

    const exchanged = await createSaleExchange(adminApi, {
      saleId: sale.id,
      saleItemId: sale.saleItemId!,
      newProductId: pricier.productId,
      quantity: 1,
      paymentMethod: "CASH",
    });
    expect(exchanged).toBeTruthy();
  });

  test("X-11 same product exchange rejected", async ({ apiAs }) => {
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");
    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveSeedWithStock(employeeApi, adminApi, {
      minAvailable: 2,
    });
    const sale = await createDirectSale(employeeApi, seed, 1);

    const result = await expectApiFails(
      () =>
        createSaleExchange(adminApi, {
          saleId: sale.id,
          saleItemId: sale.saleItemId!,
          newProductId: seed.productId,
          quantity: 1,
          paymentMethod: "CASH",
        }),
      /SAME|same product|identical|INVALID|400|409/i,
    );
    expect(result.ok, result.error).toBe(true);
  });

  test("X-10 insufficient new stock rejected", async ({ apiAs }) => {
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");
    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveSeedWithStock(employeeApi, adminApi, {
      minAvailable: 2,
    });

    const rows = (await listInventory(employeeApi)).filter(
      (r) => r.productId !== seed.productId,
    );
    const target = rows.sort((a, b) => a.available - b.available)[0];
    test.skip(!target, "No alternate product to drain for X-10");

    const drained = target!.available;
    if (drained > 0) await drainAvailableStock(adminApi, target!);

    try {
      const sale = await createDirectSale(employeeApi, seed, 1);
      const result = await expectApiFails(
        () =>
          createSaleExchange(adminApi, {
            saleId: sale.id,
            saleItemId: sale.saleItemId!,
            newProductId: target!.productId,
            quantity: 1,
            paymentMethod: "CASH",
          }),
        /INSUFFICIENT|insufficient|stock|available|400|409/i,
      );
      expect(result.ok, result.error).toBe(true);
    } finally {
      await addStock(adminApi, target!, Math.max(1, drained)).catch(
        () => undefined,
      );
    }
  });
});
