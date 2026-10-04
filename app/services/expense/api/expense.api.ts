import {
  apiFetch,
  firstRow,
  asList,
  asPaginated,
  type PaginatedResponse,
} from "~/utils/apiFetch";
import type {
  ExpenseQuery,
  ExpensePayload,
  ExpenseUpdatePayload,
  ExpenseCategoryQuery,
  ExpenseCategoryPayload,
  ExpenseResponse,
  ExpenseCategoryResponse,
} from "../types/expense.types";

export const expenseApi = {
  /** GET /admin-api/expense-categories → ExpenseCategoryResponse[] */
  async getCategories(
    params: ExpenseCategoryQuery = {},
  ): Promise<ExpenseCategoryResponse[]> {
    return asList<ExpenseCategoryResponse>(
      await apiFetch("/admin-api/expense-categories", { method: "GET", params }),
    );
  },

  /** POST /admin-api/expense-categories → ExpenseCategoryResponse | null */
  async createCategory(
    payload: ExpenseCategoryPayload,
  ): Promise<ExpenseCategoryResponse | null> {
    return firstRow<ExpenseCategoryResponse>(
      await apiFetch("/admin-api/expense-categories", {
        method: "POST",
        body: { name: payload.name },
      }),
    );
  },

  /** GET /admin-api/expenses → PaginatedResponse<ExpenseResponse> */
  async getExpenses(
    params: ExpenseQuery = {},
  ): Promise<PaginatedResponse<ExpenseResponse>> {
    return asPaginated<ExpenseResponse>(
      await apiFetch("/admin-api/expenses", { method: "GET", params }),
    );
  },

  /** POST /admin-api/expenses → ExpenseResponse | null */
  async createExpense(
    payload: ExpensePayload,
  ): Promise<ExpenseResponse | null> {
    return firstRow<ExpenseResponse>(
      await apiFetch("/admin-api/expenses", {
        method: "POST",
        body: payload,
      }),
    );
  },

  /** PATCH /admin-api/expenses/:id → ExpenseResponse | null */
  async updateExpense(
    id: string,
    payload: ExpenseUpdatePayload,
  ): Promise<ExpenseResponse | null> {
    return firstRow<ExpenseResponse>(
      await apiFetch(`/admin-api/expenses/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },
};

/** @deprecated Prefer `expenseApi` */
export const expenseService = expenseApi;
