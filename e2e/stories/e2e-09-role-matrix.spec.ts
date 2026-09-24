/**
 * E2E-09 — Role matrix
 * Confirms frontend route allowlists in `app/utils/routeAccess.js`.
 *
 * Serial + one session inject per role to avoid API login rate limits.
 */
import { test, expect, requireRoles } from "../fixtures/test";
import { injectSession } from "../helpers/auth";

const employeeAllowed = [
  "/sales/direct",
  "/sales/exchange",
  "/reservations",
  "/reservations/deliver",
  "/reports/branch",
  "/students",
] as const;

const employeeBlocked = [
  "/reservations/manage",
  "/reports",
  "/books/reserve",
  "/reports/customer-service",
  "/home",
  "/users",
  "/expenses",
  "/branches",
] as const;

const csAllowed = [
  "/books/reserve",
  "/reports/customer-service",
  "/students",
] as const;

const csBlocked = [
  "/sales/direct",
  "/reservations",
  "/reservations/deliver",
  "/reservations/manage",
  "/sales/exchange",
  "/reports",
  "/reports/branch",
  "/users",
  "/expenses",
  "/branches",
] as const;

const escapePath = (path: string) => path.replace(/\//g, "\\/");

test.describe("E2E-09 Role matrix", () => {
  // Independent tests — do not skip siblings on one failure
  test.describe.configure({ mode: "default" });

  test.beforeEach(() => {
    requireRoles("admin", "employee", "cs");
  });

  test("employee allowed + blocked routes", async ({ page }) => {
    await injectSession(page, "employee");

    for (const path of employeeAllowed) {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`${escapePath(path)}`));
    }

    for (const path of employeeBlocked) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/sales\/direct/);
    }

    await page.goto("/reservations/manage");
    await expect(page.getByTestId("reservation-cancel")).toHaveCount(0);
  });

  test("CS allowed + blocked routes (R-32, S-06)", async ({ page }) => {
    await injectSession(page, "cs");

    for (const path of csAllowed) {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`${escapePath(path)}$`));
    }

    for (const path of csBlocked) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/books\/reserve/);
    }

    await page.goto("/reservations/deliver");
    await expect(page).toHaveURL(/\/books\/reserve/);

    await page.goto("/sales/direct");
    await expect(page).toHaveURL(/\/books\/reserve/);
  });

  test("admin can open commerce screens", async ({ page }) => {
    await injectSession(page, "admin");

    for (const path of [
      "/home",
      "/reservations/manage",
      "/sales/exchange",
      "/students",
      "/reports",
      "/sales/direct",
      "/reservations",
      "/reservations/deliver",
      "/books/reserve",
    ]) {
      await page.goto(path);
      await expect(page).toHaveURL(new RegExp(`${escapePath(path)}$`));
    }
  });
});
