/**
 * Expense API contracts — aligned with BE `toExpenseResponse` /
 * `toExpenseCategoryResponse`.
 * Reads nest category / branch / academicYear / createdBy;
 * flat FK columns are omitted on responses.
 */

export type NamedRef = {
  id: string;
  name: string;
};

export type CategoryRef = NamedRef & {
  status?: string;
};

export type AcademicYearRef = NamedRef & {
  status?: string;
};

export type CreatedByRef = {
  id: string;
  fullName: string | null;
  email: string | null;
};

/** Expense category status as returned by the API. */
export type ExpenseCategoryStatus = "ACTIVE" | "INACTIVE";

/**
 * Stable response from:
 * GET /expense-categories,
 * POST /expense-categories, PATCH /expense-categories/:id
 */
export type ExpenseCategoryResponse = {
  id: string;
  name: string;
  status: ExpenseCategoryStatus | string;
  createdAt?: string;
  updatedAt?: string;
};

/** GET /expense-categories query params. */
export type ExpenseCategoryQuery = {
  status?: ExpenseCategoryStatus | string;
};

/** POST /expense-categories body. */
export type ExpenseCategoryPayload = {
  name: string;
  status?: ExpenseCategoryStatus;
};

/**
 * Stable response from:
 * GET /expenses, POST /expenses, PATCH /expenses/:id
 */
export type ExpenseResponse = {
  id: string;
  amount: number;
  description: string | null;
  expenseDate: string;
  category: CategoryRef | null;
  branch: NamedRef | null;
  academicYear: AcademicYearRef | null;
  createdBy: CreatedByRef | null;
  createdAt?: string;
  updatedAt?: string;
};

/** GET /expenses query params. */
export type ExpenseQuery = {
  page?: number;
  per_page?: number;
  search?: string;
  branchId?: string | null;
  scope?: "all" | "branch" | "general" | string;
  academicYearId?: string | null;
  academicYearScope?: "all" | "academic" | "general" | string;
};

/** POST /expenses body. */
export type ExpensePayload = {
  categoryId: string;
  branchId?: string | null;
  academicYearId?: string | null;
  amount: number;
  expenseDate: string;
  description?: string;
};

/** PATCH /expenses/:id body. */
export type ExpenseUpdatePayload = {
  categoryId?: string;
  branchId?: string | null;
  academicYearId?: string | null;
  amount?: number;
  expenseDate?: string;
  description?: string;
};

/** List/table row after `normalizeExpenseListItem`. */
export type ExpenseListItem = ExpenseResponse & {
  categoryName: string;
  branchName: string;
  amountLabel: string;
};
