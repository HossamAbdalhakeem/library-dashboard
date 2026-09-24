import type { Page } from "@playwright/test";
import { ApiClient, type LoginResult } from "./api";
import { e2eEnv, type RoleKey } from "./env";

const homeByRole: Record<RoleKey, string> = {
  admin: "/home",
  employee: "/sales/direct",
  employee2: "/sales/direct",
  cs: "/books/reserve",
};

/** One login per role for the whole worker — avoids API login rate-limit / 500 storms. */
const sessionCache = new Map<RoleKey, LoginResult>();

function normalizeUser(sessionUser: Record<string, unknown>) {
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    fullName: sessionUser.fullName || sessionUser.email,
    name: sessionUser.fullName || sessionUser.email,
    phone: sessionUser.phone || "",
    status: sessionUser.status,
    role: sessionUser.role,
    roles: [sessionUser.role],
    branch: sessionUser.branch || null,
  };
}

async function loginViaApiWithRetry(role: RoleKey): Promise<LoginResult> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const client = await ApiClient.create();
    try {
      return await client.loginAs(role);
    } catch (error) {
      lastError = error;
      const retryAfterMs =
        (error as { retryAfterMs?: number })?.retryAfterMs || 1000 * attempt;
      await new Promise((r) => setTimeout(r, Math.max(retryAfterMs, 2000)));
    } finally {
      await client.dispose();
    }
  }
  throw lastError;
}

async function captureSessionFromPage(page: Page): Promise<LoginResult> {
  const raw = await page.evaluate(() => {
    const token = window.localStorage.getItem("token");
    const userJson = window.localStorage.getItem("dashboard_user");
    const academicYearId = window.localStorage.getItem("academicYearId");
    return { token, userJson, academicYearId };
  });

  if (!raw.token || !raw.userJson) {
    throw new Error("UI login did not persist token / dashboard_user");
  }

  return {
    token: raw.token,
    user: JSON.parse(raw.userJson) as Record<string, unknown>,
    academicYearId: raw.academicYearId,
  };
}

export async function resolveSession(
  role: RoleKey,
  page?: Page,
): Promise<LoginResult> {
  const cached = sessionCache.get(role);
  if (cached) return cached;

  try {
    const session = await loginViaApiWithRetry(role);
    sessionCache.set(role, session);
    return session;
  } catch (apiError) {
    if (!page) throw apiError;
    await loginViaUi(page, role);
    const session = await captureSessionFromPage(page);
    sessionCache.set(role, session);
    return session;
  }
}

/** API client reuse — no extra login when session already cached. */
export async function apiClientFor(role: RoleKey): Promise<ApiClient> {
  const session = await resolveSession(role);
  return ApiClient.create(session.token, session.academicYearId);
}

/**
 * Inject cached API/UI session into localStorage (fast path for most specs).
 * Always clears prior storage first so a previous role cannot stick (e.g. admin → employee).
 */
export async function injectSession(page: Page, role: RoleKey) {
  const session = await resolveSession(role, page);
  const user = normalizeUser(session.user);

  await page.goto("/login");
  await page.evaluate(() => {
    window.localStorage.clear();
  });
  // Reload so middleware sees a logged-out state before writing the new session
  await page.goto("/login");
  await page.evaluate(
    ({ token, userJson, academicYearId }) => {
      window.localStorage.setItem("token", token);
      window.localStorage.setItem("dashboard_user", userJson);
      if (academicYearId) {
        window.localStorage.setItem("academicYearId", academicYearId);
      }
    },
    {
      token: session.token,
      userJson: JSON.stringify(user),
      academicYearId: session.academicYearId || null,
    },
  );

  return session;
}

/** Full UI login on `/login` — covers login form + toast errors. */
export async function loginViaUi(page: Page, role: RoleKey) {
  const { email, password } = e2eEnv.credentials(role);
  await page.goto("/login");
  await page.getByTestId("login-email").fill(email);
  await page.getByTestId("login-password").fill(password);
  await page.getByTestId("login-submit").click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), {
    timeout: 30_000,
  });
}

/** Clear local session + confirm logout when sidebar is available. */
export async function logoutViaUi(page: Page) {
  const logoutBtn = page.getByTestId("logout-button");
  if (await logoutBtn.count()) {
    await logoutBtn.click();
    const confirm = page.getByTestId("logout-confirm");
    if (await confirm.count()) {
      await confirm.click();
    }
    await page.waitForURL(/\/login/, { timeout: 20_000 }).catch(() => undefined);
  }

  await page.evaluate(() => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("dashboard_user");
    window.localStorage.removeItem("academicYearId");
  });
  clearSessionCache();
}

export async function gotoAs(page: Page, role: RoleKey, path: string) {
  await injectSession(page, role);
  await page.goto(path);
}

export function expectedHome(role: RoleKey) {
  return homeByRole[role];
}

export function clearSessionCache() {
  sessionCache.clear();
}
