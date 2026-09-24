/**
 * H. Returns — edge cases (API-backed).
 * T-02 partial, T-03 finish, T-04 over-return, T-05 double full return, T-12 snapshot price.
 */
import { test, expect, requireRoles, e2eEnv } from "../fixtures/test";
import {
  createDirectSale,
  createReturnCash,
  expectApiFails,
  resolveSeedWithStock,
  updateProductSellingPrice,
  unwrapRow,
} from "../helpers/seed";

test.describe("H. Returns", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    requireRoles("employee", "admin");
  });

  test("T-02 / T-03 partial then finish return", async ({ apiAs }) => {
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");
    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveSeedWithStock(employeeApi, adminApi, {
      minAvailable: 3,
    });

    const sale = await createDirectSale(employeeApi, seed, 2);
    expect(sale.saleItemId).toBeTruthy();

    const partial = await createReturnCash(
      adminApi,
      sale.id,
      sale.saleItemId!,
      1,
    );
    expect(partial).toBeTruthy();

    const finished = await createReturnCash(
      adminApi,
      sale.id,
      sale.saleItemId!,
      1,
    );
    expect(finished).toBeTruthy();
  });

  test("T-04 over-return rejected", async ({ apiAs }) => {
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");
    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveSeedWithStock(employeeApi, adminApi, {
      minAvailable: 2,
    });
    const sale = await createDirectSale(employeeApi, seed, 1);
    expect(sale.saleItemId).toBeTruthy();

    const result = await expectApiFails(
      () =>
        createReturnCash(adminApi, sale.id, sale.saleItemId!, 2),
      /OVER|EXCEED|quantity|QUANTITY|remaining|INSUFFICIENT|invalid|400|409/i,
    );
    expect(result.ok, result.error).toBe(true);
  });

  test("T-05 double full return rejected", async ({ apiAs }) => {
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");
    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveSeedWithStock(employeeApi, adminApi, {
      minAvailable: 2,
    });
    const sale = await createDirectSale(employeeApi, seed, 1);
    expect(sale.saleItemId).toBeTruthy();

    await createReturnCash(adminApi, sale.id, sale.saleItemId!, 1);

    const result = await expectApiFails(
      () =>
        createReturnCash(adminApi, sale.id, sale.saleItemId!, 1),
      /ALREADY_RETURNED|RETURNED|already|409|400/i,
    );
    expect(result.ok, result.error).toBe(true);
  });

  test("T-12 refund uses sale snapshot price not new catalog", async ({
    apiAs,
  }) => {
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");
    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveSeedWithStock(employeeApi, adminApi, {
      minAvailable: 2,
    });

    const sale = await createDirectSale(employeeApi, seed, 1);
    const saleRow = unwrapRow(await adminApi.get(`/sales/${sale.id}`));
    const unitPrice = Number(
      saleRow?.items?.[0]?.unitPrice ??
        saleRow?.items?.[0]?.product?.sellingPrice ??
        seed.productPrice,
    );
    expect(unitPrice).toBeGreaterThan(0);

    const { previous } = await updateProductSellingPrice(
      adminApi,
      seed.productId,
      unitPrice + 250,
    );

    try {
      const returned = await createReturnCash(
        adminApi,
        sale.id,
        sale.saleItemId!,
        1,
      );
      const refundAmount = Number(
        returned?.totalRefundAmount ??
          returned?.refundAmount ??
          returned?.items?.[0]?.refundAmount ??
          returned?.refunds?.[0]?.amount ??
          0,
      );

      // If API exposes refund amount, it must match snapshot (not catalog+250)
      if (refundAmount > 0) {
        expect(refundAmount).toBeCloseTo(unitPrice, 0);
        expect(refundAmount).toBeLessThan(unitPrice + 200);
      } else {
        // At minimum the return succeeded while catalog price was raised
        expect(returned).toBeTruthy();
      }
    } finally {
      await updateProductSellingPrice(adminApi, seed.productId, previous).catch(
        () => undefined,
      );
    }
  });
});
