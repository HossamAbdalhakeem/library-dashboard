import { formatMoney } from "~/utils/format/money";

export const emptyExpenseForm = () => ({
  categoryId: null,
  branchId: null,
  amount: null,
  expenseDate: new Date(),
  description: "",
});

const toDate = (value) => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return new Date(value);
};

export const toIsoDate = (value) => {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Map API expense → form (nested relations only). */
export const mapExpenseToForm = (expense) => ({
  categoryId: expense?.category?.id || null,
  branchId: expense?.branch?.id || null,
  amount: expense?.amount != null ? Number(expense.amount) : null,
  expenseDate: toDate(expense?.expenseDate),
  description: expense?.description || "",
});

export const buildExpensePayload = (
  form,
  { existingAcademicYearId, currentAcademicYearId } = {},
) => {
  const academicYearId =
    existingAcademicYearId || currentAcademicYearId || null;

  return {
    categoryId: form.categoryId,
    branchId: form.branchId || null,
    amount: form.amount,
    expenseDate: toIsoDate(form.expenseDate),
    description: form.description || undefined,
    academicYearId,
  };
};

export const validateExpenseForm = (
  form,
  { existingAcademicYearId, currentAcademicYearId } = {},
) => {
  if (!(existingAcademicYearId || currentAcademicYearId)) {
    return "اختر العام الدراسي أولاً.";
  }
  return null;
};

/** Map API expense → table/display fields. */
export const normalizeExpenseListItem = (expense) => ({
  ...expense,
  categoryName: expense.category?.name || "-",
  branchName: expense.branch?.name || "عام",
  amountLabel: formatMoney(expense.amount),
  expenseDate: expense.expenseDate,
  description: expense.description || "-",
});

export const buildExpenseListQuery = ({ page, perPage, filters = {} }) => {
  const params = {
    page,
    per_page: perPage,
  };
  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.branchId) params.branchId = filters.branchId;
  return params;
};

export const mapCategoryOption = (category) => ({
  label: category?.name || "-",
  value: category?.id || null,
});
