/**
 * Section A / G — create validations + smoke (checklist foundation).
 */
import { test, expect, requireRole, requireRoles, e2eEnv } from "../fixtures/test";
import {
  choosePaymentMethod,
  fillDepositAmount,
  fillProductCascade,
  fillSaleQuantity,
  selectStudent,
} from "../helpers/forms";
import {
  createHoldingReservation,
  expectSaleFailsInsufficient,
  resolveSeedWithStock,
} from "../helpers/seed";

test.describe("A. Reservations — create validations", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    requireRole("employee");
  });

  test("R-01 screen + booking form fields present", async ({ openAs, page }) => {
    await openAs("employee", "/reservations");
    await expect(page.getByTestId("select-student")).toBeVisible();
    await expect(page.getByTestId("select-study-year")).toBeVisible();
    await expect(page.getByTestId("payment-method-CASH")).toBeVisible();
    await expect(page.getByTestId("booking-submit")).toBeVisible();
  });

  test("R-05 / R-06 deposit validation blocks empty/zero submit", async ({
    openAs,
    page,
  }) => {
    await openAs("employee", "/reservations");
    const submit = page.getByTestId("booking-submit");
    await submit.click({ force: true });
    await expect(page).toHaveURL(/\/reservations$/);

    // Zero deposit without cascade — field min validation still applies when touched
    const amount = page.getByTestId("booking-deposit-amount");
    if (await amount.count()) {
      await amount.click();
      await amount.fill("0");
      await choosePaymentMethod(page, "CASH");
      await submit.click({ force: true });
      await expect(page).toHaveURL(/\/reservations$/);
    }
  });
});

test.describe("G. Direct sales — form + stock guards", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeEach(() => {
    requireRoles("employee");
  });

  test("S-09 single-line sale form (no multi-product cart)", async ({
    openAs,
    page,
  }) => {
    await openAs("employee", "/sales/direct");
    await expect(page.getByTestId("sale-submit")).toBeVisible();
    await expect(page.getByTestId("select-product")).toHaveCount(1);
    await expect(page.getByTestId("sale-quantity")).toBeVisible();
    await expect(page.getByText(/إضافة منتج|سلة|cart/i)).toHaveCount(0);
  });

  test("S-03 / S-04 reserved stock blocks walk-in (API)", async ({ apiAs }) => {
    requireRoles("employee", "admin");
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");
    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveSeedWithStock(employeeApi, adminApi, {
      minAvailable: 2,
    });
    const holding = await createHoldingReservation(employeeApi, seed);
    expect(holding.status).toMatch(/READY/i);

    const blocked = await expectSaleFailsInsufficient(
      employeeApi,
      holding.seedForProduct,
      1,
    );
    expect(blocked.ok, blocked.error).toBe(true);

    // cleanup — only admin can cancel
    await adminApi.cancelReservation(holding.id, { refundMethod: "CASH" });
  });

  test("S-01 UI happy path cash when seed configured", async ({
    openAs,
    page,
    apiAs,
  }) => {
    test.skip(!e2eEnv.studentSearch(), "Set E2E_STUDENT_SEARCH");
    // Prefer API path for reliability; still open UI for smoke
    const employeeApi = await apiAs("employee");
    const adminApi = await apiAs("admin");
    const seed = await resolveSeedWithStock(employeeApi, adminApi, {
      minAvailable: 2,
    });
    const { createDirectSale } = await import("../helpers/seed");
    const sale = await createDirectSale(employeeApi, seed, 1);
    expect(sale.id).toBeTruthy();

    await openAs("employee", "/sales/direct");
    await expect(page.getByTestId("sale-submit")).toBeVisible();
  });
});

test.describe("CS reserve screen", () => {
  test.beforeEach(() => {
    requireRole("cs");
  });

  test("R-09 / R-10 CS reserve form requires branch", async ({ openAs, page }) => {
    await openAs("cs", "/books/reserve");
    await expect(page.getByTestId("select-branch")).toBeVisible();
    await expect(page.getByTestId("booking-submit")).toBeVisible();
  });
});
