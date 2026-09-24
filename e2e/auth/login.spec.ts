import { test, expect, requireRole, e2eEnv } from "../fixtures/test";
import { expectedHome, loginViaUi } from "../helpers/auth";

test.describe("Auth — login", () => {
  test("login page renders email + password + submit", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("login-email")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();
    await expect(page.getByTestId("login-submit")).toBeVisible();
  });

  test("P-01 / login — employee lands on direct sales home", async ({
    page,
  }) => {
    requireRole("employee");
    await loginViaUi(page, "employee");
    await expect(page).toHaveURL(new RegExp(`${expectedHome("employee")}$`));
  });

  test("login — admin lands on /home", async ({ page }) => {
    requireRole("admin");
    await loginViaUi(page, "admin");
    await expect(page).toHaveURL(/\/home$/);
  });

  test("login — CS lands on /books/reserve", async ({ page }) => {
    requireRole("cs");
    await loginViaUi(page, "cs");
    await expect(page).toHaveURL(/\/books\/reserve$/);
  });

  test("invalid password shows error (does not leave login)", async ({
    page,
  }) => {
    requireRole("employee");
    const { email } = e2eEnv.credentials("employee");
    await page.goto("/login");
    await page.getByTestId("login-email").fill(email);
    await page.getByTestId("login-password").fill("definitely-wrong-password");
    await page.getByTestId("login-submit").click();
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByText(/تعذر|خطأ|invalid|credentials|فشل/i).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
