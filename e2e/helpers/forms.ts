import type { Locator, Page } from "@playwright/test";

/** Open a PrimeVue Select inside a testid wrapper and pick an option by visible text (or first). */
export async function selectPrimeOption(
  page: Page,
  wrapperTestId: string,
  optionText?: string | RegExp,
) {
  const wrapper = page.getByTestId(wrapperTestId);
  await wrapper.locator(".p-select, [role='combobox']").first().click();

  const overlay = page.locator(".p-select-overlay:visible, .p-select-list:visible").last();
  await overlay.waitFor({ state: "visible", timeout: 10_000 });

  const options = overlay.locator(".p-select-option, [role='option']");
  if (optionText) {
    await options.filter({ hasText: optionText }).first().click();
  } else {
    await options.first().click();
  }
}

/** Search + pick student from AppGlobalSelectStudent autocomplete. */
export async function selectStudent(page: Page, search: string) {
  const input = page.getByTestId("select-student-input");
  await input.click();
  await input.fill(search);
  const list = page.locator(".p-autocomplete-overlay:visible, .p-autocomplete-list:visible").last();
  await list.waitFor({ state: "visible", timeout: 15_000 });
  await list.locator(".p-autocomplete-option, li").first().click();
}

export async function choosePaymentMethod(
  page: Page,
  method: "CASH" | "WALLET" | "INSTAPAY",
) {
  await page.getByTestId(`payment-method-input-${method}`).check({ force: true });
}

export async function fillDepositAmount(page: Page, amount: number) {
  const input = page.getByTestId("booking-deposit-amount");
  await input.click();
  await input.fill(String(amount));
}

export async function fillSaleQuantity(page: Page, qty: number) {
  const input = page.getByTestId("sale-quantity");
  await input.click();
  await input.fill(String(qty));
}

/**
 * Cascaded product pickers used by booking + direct sale forms.
 * Picks first available study year → teacher → product type → product.
 */
export async function fillProductCascade(page: Page, productFilter?: string) {
  await selectPrimeOption(page, "select-study-year");
  await page.waitForTimeout(400);
  await selectPrimeOption(page, "select-teacher");
  await page.waitForTimeout(400);
  await selectPrimeOption(page, "select-product-type");
  await page.waitForTimeout(600);

  const productTrigger = page.getByTestId("select-product-trigger");
  await productTrigger.click();
  const overlay = page.locator(".p-select-overlay:visible").last();
  await overlay.waitFor({ state: "visible" });

  if (productFilter) {
    const filterInput = overlay.locator("input").first();
    if (await filterInput.count()) {
      await filterInput.fill(productFilter);
      await page.waitForTimeout(500);
    }
  }

  await overlay.locator(".p-select-option, [role='option']").first().click();
}

export async function expectToastOrDialog(
  page: Page,
  text: string | RegExp,
) {
  const toast = page.locator(".p-toast-message, .p-toast-detail, [role='alert']");
  const dialog = page.locator(".p-dialog:visible");
  await Promise.race([
    toast.filter({ hasText: text }).first().waitFor({ timeout: 20_000 }),
    dialog.filter({ hasText: text }).first().waitFor({ timeout: 20_000 }),
    page.getByText(text).first().waitFor({ timeout: 20_000 }),
  ]);
}

export async function clickRowActionByText(
  page: Page,
  rowMatch: string | RegExp,
  actionTestId: string,
) {
  const row = page.locator("tr").filter({ hasText: rowMatch }).first();
  await row.getByTestId(actionTestId).click();
}

export async function visibleDialog(page: Page): Promise<Locator> {
  return page.locator(".p-dialog:visible").last();
}
