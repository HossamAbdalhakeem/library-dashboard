import { expect, type Page } from "@playwright/test";
import { expectedHome } from "./auth";
import type { RoleKey } from "./env";

const escapePath = (path: string) => path.replace(/\//g, "\\/");

/** Assert the role can stay on `path` (middleware allows it). */
export async function expectRouteAllowed(page: Page, path: string) {
  await page.goto(path);
  await expect(page).toHaveURL(new RegExp(`${escapePath(path)}$`));
}

/**
 * Assert middleware redirects away from a forbidden path
 * (to the role home, or optionally another pattern).
 */
export async function expectRouteBlocked(
  page: Page,
  role: RoleKey,
  path: string,
  redirectPattern?: RegExp,
) {
  const homeRole = role === "employee2" ? "employee" : role;
  const home = expectedHome(homeRole);
  await page.goto(path);
  await expect(page).toHaveURL(
    redirectPattern || new RegExp(`${escapePath(home)}$`),
  );
}

export async function expectNavVisible(
  page: Page,
  labels: Array<string | RegExp>,
) {
  for (const label of labels) {
    await expect(page.getByRole("link", { name: label }).first()).toBeVisible();
  }
}

export async function expectNavHidden(
  page: Page,
  labels: Array<string | RegExp>,
) {
  for (const label of labels) {
    await expect(page.getByRole("link", { name: label })).toHaveCount(0);
  }
}
