import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { selectPrimeOption, expectToastOrDialog } from "./forms";
import type { ApiClient } from "./api";
import { unwrapRow } from "./seed";

export type CreatedStudent = {
  name: string;
  phone?: string;
  id?: string;
};

/** Create a student via `/students` UI. Returns the unique name used. */
export async function createStudentViaUi(
  page: Page,
  opts: { name?: string; phone?: string } = {},
): Promise<CreatedStudent> {
  const stamp = Date.now().toString(36);
  const name = opts.name || `E2E طالب ${stamp}`;
  const phone = opts.phone || `010${String(Date.now()).slice(-8)}`;

  await page.goto("/students");
  await expect(page.getByTestId("students-create")).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByTestId("students-create")).toBeEnabled();
  await page.getByTestId("students-create").click();

  const drawer = page.locator(".p-drawer:visible, .p-sidebar:visible").last();
  await expect(drawer).toBeVisible();
  await expect(page.getByTestId("student-name")).toBeVisible();
  await page.getByTestId("student-name").fill(name);

  const tel = drawer.locator(".vti__input, input[type='tel']").first();
  if (await tel.count()) {
    await tel.fill(phone.replace(/^0/, ""));
  }

  // Wait for study-year options to load, then pick first real option
  const studyYear = page.getByTestId("select-study-year");
  await studyYear.locator(".p-select, [role='combobox']").first().click();
  const overlay = page
    .locator(".p-select-overlay:visible, .p-select-list:visible")
    .last();
  await overlay.waitFor({ state: "visible", timeout: 15_000 });
  const option = overlay.locator(".p-select-option, [role='option']").first();
  await expect(option).toBeVisible();
  await option.click();
  await page.waitForTimeout(300);

  const createRespPromise = page.waitForResponse(
    (res) =>
      /\/students\/?$/.test(new URL(res.url()).pathname) &&
      res.request().method() === "POST",
    { timeout: 30_000 },
  );

  await page.getByTestId("student-submit").click({ force: true });

  const response = await createRespPromise.catch(() => null);
  if (!response) {
    // vee-validate may have blocked submit — surface remaining errors
    const err = drawer.locator(".text-red-500, .p-invalid").first();
    const errText = (await err.textContent().catch(() => "")) || "";
    throw new Error(
      `Student create did not hit POST /students. Validation? ${errText}`,
    );
  }
  if (!response.ok()) {
    throw new Error(
      `createStudent API ${response.status()}: ${await response.text()}`,
    );
  }

  await expectToastOrDialog(page, /تم إضافة الطالب|تم حفظ الطالب|نجاح/i);
  await expect(drawer).toBeHidden({ timeout: 15_000 });

  const search = page
    .locator("input.search-input-text, input[placeholder*='ابحث']")
    .first();
  if (await search.count()) {
    await search.fill(name);
    await page.waitForTimeout(900);
  }

  await expect(page.getByText(name).first()).toBeVisible({ timeout: 20_000 });
  return { name, phone };
}

/** API create — used when UI create is out of scope for a story setup. */
export async function createStudentViaApi(
  client: ApiClient,
  opts: { name?: string; phone?: string; studyYearId?: string } = {},
) {
  const stamp = Date.now().toString(36);
  const name = opts.name || `E2E API ${stamp}`;
  const phone = opts.phone || `010${String(Date.now()).slice(-8)}`;

  let studyYearId = opts.studyYearId;
  if (!studyYearId) {
    const yearsBody = await client.get("/study-years", { per_page: 20 });
    const years = Array.isArray((yearsBody as any)?.data)
      ? (yearsBody as any).data
      : Array.isArray(yearsBody)
        ? yearsBody
        : [];
    studyYearId = years[0]?.id ? String(years[0].id) : undefined;
  }
  if (!studyYearId) throw new Error("No study year for createStudentViaApi");

  const body = await client.post("/students", {
    name,
    phone,
    studyYearId,
  });
  const row = unwrapRow(body);
  return { id: row?.id ? String(row.id) : undefined, name, phone };
}

export async function openStudentTransactions(page: Page, studentName: string) {
  const row = page.locator("tr").filter({ hasText: studentName }).first();
  await expect(row).toBeVisible();
  await row.getByLabel("المعاملات").click();
  await expect(page.locator(".p-dialog:visible").last()).toBeVisible();
}
