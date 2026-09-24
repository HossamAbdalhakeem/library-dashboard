import { test as base, expect } from "@playwright/test";
import { ApiClient } from "../helpers/api";
import { e2eEnv, type RoleKey } from "../helpers/env";
import { apiClientFor, gotoAs, injectSession, loginViaUi, clearSessionCache } from "../helpers/auth";

type Fixtures = {
  apiAs: (role: RoleKey) => Promise<ApiClient>;
  loginAs: (role: RoleKey) => Promise<void>;
  openAs: (role: RoleKey, path: string) => Promise<void>;
};

export const test = base.extend<Fixtures>({
  apiAs: async ({}, use) => {
    const clients: ApiClient[] = [];
    await use(async (role) => {
      const client = await apiClientFor(role);
      clients.push(client);
      return client;
    });
    await Promise.all(clients.map((c) => c.dispose()));
  },

  loginAs: async ({ page }, use) => {
    await use(async (role) => {
      clearSessionCache();
      await loginViaUi(page, role);
    });
  },

  openAs: async ({ page }, use) => {
    await use(async (role, path) => {
      await gotoAs(page, role, path);
    });
  },
});

export { expect, e2eEnv, injectSession };

/** Skip when role passwords are not configured. */
export function requireRole(role: RoleKey) {
  test.skip(
    !e2eEnv.hasCredentials(role),
    `Missing credentials for ${role} (E2E_*_EMAIL / E2E_*_PASSWORD)`,
  );
}

export function requireRoles(...roles: RoleKey[]) {
  for (const role of roles) requireRole(role);
}
