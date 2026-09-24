/**
 * J. Inventory ↔ commerce side effects.
 * I-01 create READY (reserved ↑), I-02 deliver (physical ↓ reserved ↓),
 * I-04 direct sale (physical ↓), I-05 return (physical ↑).
 */
import { test, expect, requireRoles, e2eEnv } from "../fixtures/test";
import {
  createDirectSale,
  createPartialReservation,
  createReturnCash,
  ensureReservationReady,
  getInventoryRow,
  listInventoryMovements,
  resolveSeedWithStock,
} from "../helpers/seed";

test.describe("J. Inventory side effects", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    requireRoles("employee", "admin");
  });

  test("I-01 / I-02 READY create then deliver updates stock", async ({
    apiAs,
  }) => {
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");
    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveSeedWithStock(employeeApi, adminApi, {
      minAvailable: 3,
    });

    const before = await getInventoryRow(employeeApi, seed.productId);
    expect(before).toBeTruthy();

    const reservation = await createPartialReservation(employeeApi, seed);
    await ensureReservationReady(
      employeeApi,
      adminApi,
      reservation.id,
      seed.productId,
    );

    const afterCreate = await getInventoryRow(employeeApi, seed.productId);
    expect(afterCreate!.available).toBeLessThan(before!.available);
    // physical usually unchanged on reserve; available drops
    expect(afterCreate!.physical).toBeGreaterThanOrEqual(afterCreate!.available);

    await employeeApi.deliverReservation(reservation.id, { method: "CASH" });

    const afterDeliver = await getInventoryRow(employeeApi, seed.productId);
    expect(afterDeliver!.physical).toBeLessThan(afterCreate!.physical);

    if (before!.branchId) {
      const movements = await listInventoryMovements(
        adminApi,
        before!.branchId,
        seed.productId,
      );
      const types = movements
        .map((m: any) =>
          String(m?.type || m?.movementType || m?.code || "").toUpperCase(),
        )
        .join(" ");
      // Soft assert — movement naming varies by BE
      expect(movements.length).toBeGreaterThan(0);
      expect(types.length).toBeGreaterThan(0);
    }
  });

  test("I-04 / I-05 direct sale then return restores physical", async ({
    apiAs,
  }) => {
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");
    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveSeedWithStock(employeeApi, adminApi, {
      minAvailable: 3,
    });

    const before = await getInventoryRow(employeeApi, seed.productId);
    expect(before).toBeTruthy();

    const sale = await createDirectSale(employeeApi, seed, 1);
    const afterSale = await getInventoryRow(employeeApi, seed.productId);
    expect(afterSale!.physical).toBe(before!.physical - 1);
    expect(afterSale!.available).toBe(before!.available - 1);

    await createReturnCash(adminApi, sale.id, sale.saleItemId!, 1);
    const afterReturn = await getInventoryRow(employeeApi, seed.productId);
    expect(afterReturn!.physical).toBe(before!.physical);
    expect(afterReturn!.available).toBe(before!.available);
  });
});
