import { ApiClient } from "./api";
import { e2eEnv } from "./env";

const unwrapList = (body: unknown): any[] => {
  if (Array.isArray(body)) return body;
  if (body && typeof body === "object") {
    const data = (body as { data?: unknown }).data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && Array.isArray((data as any).data)) {
      return (data as any).data;
    }
  }
  return [];
};

const unwrapRow = (body: unknown): any => {
  const list = unwrapList(body);
  if (list.length) return list[0];
  if (body && typeof body === "object" && "data" in (body as object)) {
    const data = (body as { data: unknown }).data;
    if (data && !Array.isArray(data)) return data;
  }
  return body;
};

export type CommerceSeed = {
  studentId: string;
  studentSearch: string;
  studentName: string;
  productId: string;
  productName: string;
  productPrice: number;
};

/** Resolve student + in-stock product for commerce stories. */
export async function resolveCommerceSeed(
  client: ApiClient,
  opts: { minAvailable?: number } = {},
): Promise<CommerceSeed> {
  const minAvailable = opts.minAvailable ?? 2;
  const studentSearch = e2eEnv.studentSearch() || "01020000009";
  const productSearch = e2eEnv.productSearch() || "كتاب الدراسات";

  const students = await client.searchStudents(studentSearch);
  const student = students[0] as
    | { id?: string; name?: string; phone?: string }
    | undefined;
  if (!student?.id) {
    throw new Error(`No student found for search "${studentSearch}"`);
  }

  let productId = "";
  let productName = productSearch;
  let productPrice = 0;

  try {
    const invBody = await client.get("/inventory", { per_page: 100 });
    const rows = unwrapList(invBody);
    const needle = productSearch.toLowerCase();
    const matched = rows.filter((r) => {
      const name = String(r?.product?.name || r?.name || "").toLowerCase();
      return name.includes(needle);
    });
    const pool = matched.length ? matched : rows;
    const withStock = pool.filter(
      (r) => Number(r?.availableQuantity ?? r?.available ?? 0) >= minAvailable,
    );
    const hit =
      withStock.find((r) =>
        String(r?.product?.name || "")
          .toLowerCase()
          .includes(needle),
      ) ||
      withStock[0] ||
      pool.find((r) => Number(r?.availableQuantity ?? r?.available ?? 0) > 0) ||
      pool[0];
    const product = hit?.product || hit;
    productId = String(product?.id || "");
    productName = String(product?.name || productSearch);
    productPrice = Number(product?.sellingPrice || 0);
  } catch {
    // fall through to catalog
  }

  if (!productId) {
    const products = (await client.listProducts({
      search: productSearch,
    })) as Array<{ id?: string; name?: string; sellingPrice?: number }>;
    const product = products[0];
    if (!product?.id) {
      throw new Error(`No product found for search "${productSearch}"`);
    }
    productId = String(product.id);
    productName = String(product.name || productSearch);
    productPrice = Number(product.sellingPrice || 0);
  }

  return {
    studentId: String(student.id),
    studentSearch,
    studentName: String(student.name || studentSearch),
    productId,
    productName,
    productPrice,
  };
}

export async function createPartialReservation(
  client: ApiClient,
  seed: CommerceSeed,
  opts: { branchId?: string; method?: string; proofReference?: string } = {},
) {
  const deposit = Math.max(
    1,
    Math.min(50, Math.floor((seed.productPrice || 100) / 2) || 50),
  );
  const body = await client.createReservation({
    studentId: seed.studentId,
    productId: seed.productId,
    quantity: 1,
    deposit,
    method: opts.method || "CASH",
    ...(opts.branchId ? { branchId: opts.branchId } : {}),
    ...(opts.proofReference ? { proofReference: opts.proofReference } : {}),
  });
  const row = unwrapRow(body);
  if (!row?.id) {
    throw new Error(`createReservation failed: ${JSON.stringify(body)}`);
  }
  return {
    id: String(row.id),
    reservationNumber: String(row.reservationNumber || row.id),
    status: String(row.status || ""),
    deposit,
    remaining: Number(row.remainingAmount ?? row.payment?.remainingAmount ?? 0),
  };
}

/** Resolve a branch id for CS reservations (any branch). */
export async function resolveBranchId(client: ApiClient): Promise<string> {
  const branches = (await client.listBranches()) as Array<{ id?: string }>;
  const id = branches[0]?.id;
  if (!id) throw new Error("No branches found for CS reservation");
  return String(id);
}

/** Ensure reservation is READY (stock-in if WAITING). */
export async function ensureReservationReady(
  employeeClient: ApiClient,
  adminClient: ApiClient,
  reservationId: string,
  productId: string,
) {
  let row = await getReservation(employeeClient, reservationId);
  if (String(row?.status || "").match(/READY/i)) return row;

  const inventory = await listInventory(employeeClient);
  const inv =
    inventory.find((r) => r.productId === productId) || inventory[0];
  if (!inv?.branchId) {
    throw new Error(`No inventory row for product ${productId}`);
  }

  // Add enough units to clear possible waitlist ahead of this reservation
  await addStock(adminClient, inv, 10);

  for (let i = 0; i < 8; i++) {
    await new Promise((r) => setTimeout(r, 400));
    row = await getReservation(employeeClient, reservationId);
    if (String(row?.status || "").match(/READY/i)) return row;
  }

  return row;
}

/** Top up product stock so later stories don't starve. */
export async function topUpProductStock(
  employeeClient: ApiClient,
  adminClient: ApiClient,
  productId: string,
  targetAvailable = 5,
) {
  const inventory = await listInventory(employeeClient);
  const inv = inventory.find((r) => r.productId === productId);
  if (!inv?.branchId) return;
  const need = Math.max(0, targetAvailable - inv.available);
  if (need > 0) await addStock(adminClient, inv, need);
}

export async function createDirectSale(
  client: ApiClient,
  seed: CommerceSeed,
  quantity = 2,
) {
  const body = await client.createSale({
    studentId: seed.studentId,
    productId: seed.productId,
    quantity,
    method: "CASH",
  });
  const row = unwrapRow(body);
  if (!row?.id) {
    throw new Error(`createSale failed: ${JSON.stringify(body)}`);
  }
  const item = Array.isArray(row.items) ? row.items[0] : null;
  return {
    id: String(row.id),
    saleItemId: item?.id ? String(item.id) : null,
    quantity,
  };
}

export type InventoryRow = {
  branchId: string;
  productId: string;
  productName: string;
  productPrice: number;
  available: number;
  physical: number;
  reservable: boolean;
};

export async function listInventory(client: ApiClient): Promise<InventoryRow[]> {
  const body = await client.get("/inventory", { per_page: 100 });
  return unwrapList(body).map((r) => {
    const product = r?.product || {};
    return {
      branchId: String(r?.branch?.id || r?.branchId || ""),
      productId: String(product?.id || r?.productId || ""),
      productName: String(product?.name || ""),
      productPrice: Number(product?.sellingPrice || 0),
      available: Number(r?.availableQuantity ?? r?.available ?? 0),
      physical: Number(r?.physicalQuantity ?? r?.quantity ?? 0),
      reservable: Boolean(product?.reservationAllowed),
    };
  });
}

/** Drain available stock so next reservation becomes WAITING. */
export async function drainAvailableStock(
  adminClient: ApiClient,
  row: InventoryRow,
) {
  if (row.available <= 0) return;
  await adminClient.post(
    `/inventory/${encodeURIComponent(row.branchId)}/${encodeURIComponent(row.productId)}/remove`,
    { quantity: row.available, note: "e2e drain for waitlist" },
  );
}

export async function addStock(
  adminClient: ApiClient,
  row: Pick<InventoryRow, "branchId" | "productId">,
  quantity: number,
) {
  await adminClient.post(
    `/inventory/${encodeURIComponent(row.branchId)}/${encodeURIComponent(row.productId)}/add`,
    { quantity, note: "e2e stock-in" },
  );
}

export async function getReservation(client: ApiClient, id: string) {
  const body = await client.get(`/reservations/${id}`);
  return unwrapRow(body);
}

export async function changeReservationProduct(
  adminClient: ApiClient,
  reservationId: string,
  newProductId: string,
  refundMethod = "CASH",
) {
  return unwrapRow(
    await adminClient.post(`/reservations/${reservationId}/change-product`, {
      newProductId,
      refundMethod,
    }),
  );
}

export async function findCheaperReservablePair(
  client: ApiClient,
  seed: CommerceSeed,
): Promise<{ expensive: InventoryRow; cheaper: InventoryRow }> {
  const rows = (await listInventory(client)).filter(
    (r) => r.reservable && r.available > 0 && r.productPrice > 0,
  );
  const expensive =
    rows.find((r) => r.productId === seed.productId) ||
    [...rows].sort((a, b) => b.productPrice - a.productPrice)[0];
  if (!expensive) throw new Error("No reservable in-stock product found");

  const cheaper = rows
    .filter(
      (r) =>
        r.productId !== expensive.productId &&
        r.productPrice < expensive.productPrice,
    )
    .sort((a, b) => a.productPrice - b.productPrice)[0];

  if (!cheaper) {
    throw new Error("No cheaper reservable product found for E2E-04");
  }

  return { expensive, cheaper };
}

export async function findPricierProduct(
  client: ApiClient,
  seed: CommerceSeed,
): Promise<InventoryRow> {
  const rows = (await listInventory(client)).filter(
    (r) =>
      r.available > 0 &&
      r.productId !== seed.productId &&
      r.productPrice > seed.productPrice,
  );
  const hit = rows.sort((a, b) => a.productPrice - b.productPrice)[0];
  if (!hit) throw new Error("No pricier in-stock product for E2E-07");
  return hit;
}

export async function createSaleExchange(
  client: ApiClient,
  payload: {
    saleId: string;
    saleItemId: string;
    newProductId: string;
    quantity?: number;
    paymentMethod?: string;
    refundMethod?: string;
  },
) {
  return unwrapRow(
    await client.post("/exchanges", {
      quantity: 1,
      paymentMethod: "CASH",
      ...payload,
    }),
  );
}

export async function getProduct(client: ApiClient, id: string) {
  return unwrapRow(await client.get(`/products/${id}`));
}

/** Raise/lower selling price; returns previous price for restore. */
export async function updateProductSellingPrice(
  adminClient: ApiClient,
  productId: string,
  sellingPrice: number,
) {
  const current = await getProduct(adminClient, productId);
  const previous = Number(current?.sellingPrice || 0);
  const patched = unwrapRow(
    await adminClient.patch(`/products/${productId}`, { sellingPrice }),
  );
  return { previous, patched, current };
}

/**
 * Create READY reservation that holds available units (default: all).
 * Prefers a product with available === 1 to limit collateral stock impact.
 */
export async function createHoldingReservation(
  client: ApiClient,
  seed: CommerceSeed,
  holdQty?: number,
) {
  const rows = await listInventory(client);
  const row =
    rows.find((r) => r.reservable && r.available === 1) ||
    rows.find((r) => r.productId === seed.productId && r.available > 0) ||
    rows.find((r) => r.reservable && r.available > 0);
  if (!row) throw new Error("No in-stock product to hold");

  const quantity = Math.max(1, Math.min(holdQty ?? row.available, row.available));
  const deposit = Math.max(
    1,
    Math.min(50, Math.floor((row.productPrice || seed.productPrice || 100) / 2)),
  );

  const body = await client.createReservation({
    studentId: seed.studentId,
    productId: row.productId,
    quantity,
    deposit,
    method: "CASH",
  });
  const reservation = unwrapRow(body);
  if (!reservation?.id) {
    throw new Error(`holding reservation failed: ${JSON.stringify(body)}`);
  }

  return {
    id: String(reservation.id),
    reservationNumber: String(
      reservation.reservationNumber || reservation.id,
    ),
    status: String(reservation.status || ""),
    productId: row.productId,
    quantity,
    branchId: row.branchId,
    seedForProduct: {
      ...seed,
      productId: row.productId,
      productName: row.productName,
      productPrice: row.productPrice,
    },
  };
}

export async function resolveSeedWithStock(
  employeeClient: ApiClient,
  adminClient: ApiClient,
  opts: { minAvailable?: number } = {},
) {
  const seed = await resolveCommerceSeed(employeeClient, opts);
  await topUpProductStock(
    employeeClient,
    adminClient,
    seed.productId,
    Math.max(5, opts.minAvailable ?? 2),
  );
  return seed;
}

export async function expectSaleFailsInsufficient(
  client: ApiClient,
  seed: CommerceSeed,
  quantity = 1,
) {
  try {
    await client.createSale({
      studentId: seed.studentId,
      productId: seed.productId,
      quantity,
      method: "CASH",
    });
    return { ok: false as const, error: "expected sale to fail" };
  } catch (error) {
    const message = String((error as Error)?.message || error);
    return {
      ok: /INSUFFICIENT|insufficient|available/i.test(message),
      error: message,
    };
  }
}

export async function removeStock(
  adminClient: ApiClient,
  row: Pick<InventoryRow, "branchId" | "productId">,
  quantity: number,
) {
  await adminClient.post(
    `/inventory/${encodeURIComponent(row.branchId)}/${encodeURIComponent(row.productId)}/remove`,
    { quantity, note: "e2e stock-out" },
  );
}

/** Set physical qty by add/remove delta (no dedicated adjust endpoint in FE API). */
export async function adjustStockTo(
  adminClient: ApiClient,
  row: InventoryRow,
  targetPhysical: number,
) {
  const delta = targetPhysical - row.physical;
  if (delta > 0) await addStock(adminClient, row, delta);
  else if (delta < 0) await removeStock(adminClient, row, Math.abs(delta));
}

export async function listInventoryMovements(
  client: ApiClient,
  branchId: string,
  productId: string,
) {
  return unwrapList(
    await client.get(
      `/inventory/${encodeURIComponent(branchId)}/${encodeURIComponent(productId)}/movements`,
    ),
  );
}

export async function getReservationTimeline(
  client: ApiClient,
  reservationId: string,
) {
  const body = await client.get(`/reservations/${reservationId}/timeline`);
  if (body && typeof body === "object" && Array.isArray((body as any).timeline)) {
    return (body as any).timeline as unknown[];
  }
  const data = (body as any)?.data;
  if (data && typeof data === "object" && Array.isArray(data.timeline)) {
    return data.timeline as unknown[];
  }
  return unwrapList(body);
}

export async function getSaleTimeline(client: ApiClient, saleId: string) {
  const body = await client.get(`/sales/${saleId}/timeline`);
  if (body && typeof body === "object" && Array.isArray((body as any).timeline)) {
    return (body as any).timeline as unknown[];
  }
  const data = (body as any)?.data;
  if (data && typeof data === "object" && Array.isArray(data.timeline)) {
    return data.timeline as unknown[];
  }
  return unwrapList(body);
}

export async function createExpenseCategory(
  adminClient: ApiClient,
  name: string,
) {
  return unwrapRow(
    await adminClient.post("/expense-categories", { name }),
  );
}

export async function createExpense(
  adminClient: ApiClient,
  payload: {
    categoryId: string;
    amount: number;
    expenseDate?: string;
    branchId?: string | null;
    academicYearId?: string | null;
    description?: string;
  },
) {
  const today = new Date().toISOString().slice(0, 10);
  return unwrapRow(
    await adminClient.post("/expenses", {
      expenseDate: today,
      description: payload.description || "e2e expense",
      ...payload,
    }),
  );
}

export async function createBranchEmployeeUser(
  adminClient: ApiClient,
  opts: { branchId: string; email?: string; fullName?: string } = {
    branchId: "",
  },
) {
  const stamp = Date.now().toString(36);
  const email = opts.email || `e2e.emp.${stamp}@library.local`;
  const fullName = opts.fullName || `E2E Employee ${stamp}`;
  const password = "Password123!";
  const row = unwrapRow(
    await adminClient.post("/users", {
      email,
      fullName,
      password,
      role: "BRANCH_EMPLOYEE",
      branchId: opts.branchId,
      phone: `010${String(Date.now()).slice(-8)}`,
    }),
  );
  return { ...row, email, password, fullName };
}

export async function createCustomerServiceUser(
  adminClient: ApiClient,
  opts: { email?: string; fullName?: string } = {},
) {
  const stamp = Date.now().toString(36);
  const email = opts.email || `e2e.cs.${stamp}@library.local`;
  const fullName = opts.fullName || `E2E CS ${stamp}`;
  const password = "Password123!";
  const row = unwrapRow(
    await adminClient.post("/users", {
      email,
      fullName,
      password,
      role: "CUSTOMER_SERVICE",
      phone: `011${String(Date.now()).slice(-8)}`,
    }),
  );
  return { ...row, email, password, fullName };
}

/** Expect an API mutation to fail (role / validation walls). */
export async function expectApiFails(
  fn: () => Promise<unknown>,
  pattern?: RegExp,
) {
  try {
    await fn();
    return { ok: false as const, error: "expected API call to fail" };
  } catch (error) {
    const message = String((error as Error)?.message || error);
    if (pattern && !pattern.test(message)) {
      return { ok: false as const, error: `failed but unexpected: ${message}` };
    }
    return { ok: true as const, error: message };
  }
}

export function timelineTypes(events: unknown[]): string[] {
  return events
    .map((e: any) =>
      String(e?.type || e?.eventType || e?.code || e?.action || "").toUpperCase(),
    )
    .filter(Boolean);
}

export async function getInventoryRow(
  client: ApiClient,
  productId: string,
): Promise<InventoryRow | null> {
  const rows = await listInventory(client);
  return rows.find((r) => r.productId === productId) || null;
}

export async function createReturnCash(
  client: ApiClient,
  saleId: string,
  saleItemId: string,
  quantity: number,
) {
  return unwrapRow(
    await client.createReturn({
      saleId,
      items: [{ saleItemId, quantity }],
      method: "CASH",
    }),
  );
}

export async function getEligibleSales(client: ApiClient, search = "") {
  const body = await client.get("/exchanges/eligible-sales", {
    per_page: 30,
    ...(search ? { search } : {}),
  });
  return unwrapList(body);
}

export { unwrapRow, unwrapList };
