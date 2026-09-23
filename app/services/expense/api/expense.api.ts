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
  ExpenseCategoryUpdatePayload,
  ExpenseResponse,
  ExpenseCategoryResponse,
} from "../types/expense.types";

export const expenseApi = {
  /** GET /expense-categories → ExpenseCategoryResponse[] */
  async getCategories(
    params: ExpenseCategoryQuery = {},
  ): Promise<ExpenseCategoryResponse[]> {
    return asList<ExpenseCategoryResponse>(
      await apiFetch("/expense-categories", { method: "GET", params }),
    );
  },

  /** POST /expense-categories → ExpenseCategoryResponse | null */
  async createCategory(
    payload: ExpenseCategoryPayload,
  ): Promise<ExpenseCategoryResponse | null> {
    return firstRow<ExpenseCategoryResponse>(
      await apiFetch("/expense-categories", {
        method: "POST",
        body: { name: payload.name },
      }),
    );
  },

  /** PATCH /expense-categories/:id → ExpenseCategoryResponse | null */
  async updateCategory(
    id: string,
    payload: ExpenseCategoryUpdatePayload,
  ): Promise<ExpenseCategoryResponse | null> {
    return firstRow<ExpenseCategoryResponse>(
      await apiFetch(`/expense-categories/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },

  /** GET /expenses → PaginatedResponse<ExpenseResponse> */
  async getExpenses(
    params: ExpenseQuery = {},
  ): Promise<PaginatedResponse<ExpenseResponse>> {
    return asPaginated<ExpenseResponse>(
      await apiFetch("/expenses", { method: "GET", params }),
    );
  },

  /** GET /expenses/:id → ExpenseResponse | null */
  async getExpense(id: string): Promise<ExpenseResponse | null> {
    return firstRow<ExpenseResponse>(
      await apiFetch(`/expenses/${id}`, { method: "GET" }),
    );
  },

  /** POST /expenses → ExpenseResponse | null */
  async createExpense(
    payload: ExpensePayload,
  ): Promise<ExpenseResponse | null> {
    return firstRow<ExpenseResponse>(
      await apiFetch("/expenses", {
        method: "POST",
        body: payload,
      }),
    );
  },

  /** PATCH /expenses/:id → ExpenseResponse | null */
  async updateExpense(
    id: string,
    payload: ExpenseUpdatePayload,
  ): Promise<ExpenseResponse | null> {
    return firstRow<ExpenseResponse>(
      await apiFetch(`/expenses/${id}`, {
        method: "PATCH",
        body: payload,
      }),
    );
  },
};

/** @deprecated Prefer `expenseApi` */
export const expenseService = expenseApi;
