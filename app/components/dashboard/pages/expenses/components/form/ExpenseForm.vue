<template>
  <Form
    v-slot="{ errors: fieldErrors, meta }"
    :key="formKey"
    :initial-values="initialValues"
    class="grid gap-4"
    @submit="submit"
  >
    <ExpenseCategoryField
      v-model:category-id="form.categoryId"
      :category-options="categoryOptions"
      :field-errors="fieldErrors"
      @add-category="showCategoryDialog = true"
    />

    <ExpenseBranchField v-model:branch-id="form.branchId" />

    <ExpenseAcademicYearToggle
      v-model:link-to-academic-year="form.linkToAcademicYear"
    />

    <ExpenseAmountField
      v-model:amount="form.amount"
      :field-errors="fieldErrors"
    />

    <ExpenseDateField
      v-model:expense-date="form.expenseDate"
      :field-errors="fieldErrors"
    />

    <ExpenseDescriptionField v-model:description="form.description" />

    <ExpenseFormActions
      :is-edit="isEdit"
      :loading="saving"
      :valid="meta.valid"
      @cancel="$emit('cancel')"
    />
  </Form>

  <ExpenseCategoryDialog
    v-model:visible="showCategoryDialog"
    v-model:name="newCategoryName"
    :error="categoryError"
    :loading="savingCategory"
    @save="createCategory"
  />
</template>

<script setup>
import { Form } from "vee-validate";
import ExpenseCategoryField from "./partials/ExpenseCategoryField.vue";
import ExpenseBranchField from "./partials/ExpenseBranchField.vue";
import ExpenseAcademicYearToggle from "./partials/ExpenseAcademicYearToggle.vue";
import ExpenseAmountField from "./partials/ExpenseAmountField.vue";
import ExpenseDateField from "./partials/ExpenseDateField.vue";
import ExpenseDescriptionField from "./partials/ExpenseDescriptionField.vue";
import ExpenseFormActions from "./partials/ExpenseFormActions.vue";
import ExpenseCategoryDialog from "./partials/ExpenseCategoryDialog.vue";
import {
  expenseApi,
  emptyExpenseForm,
  mapExpenseToForm,
  buildExpensePayload,
  validateExpenseForm,
  mapCategoryOption,
} from "~/services/expense";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYear } from "~/composables/useAcademicYear";

defineOptions({ name: "ExpenseForm" });

const { showError } = useAppToast();
const { academicYearId: currentAcademicYearId } = useAcademicYear();

const props = defineProps({
  expense: { type: Object, default: null },
});

const emit = defineEmits(["saved", "cancel"]);

const saving = ref(false);
const savingCategory = ref(false);
const formKey = ref(0);
const showCategoryDialog = ref(false);
const newCategoryName = ref("");
const categoryError = ref("");
const categoryOptions = ref([]);
const isEdit = computed(() => Boolean(props.expense?.id));

const form = reactive(emptyExpenseForm());
const initialValues = reactive(emptyExpenseForm());

const loadLookups = async () => {
  try {
    const categories = await expenseApi.getCategories();

    categoryOptions.value = (categories || [])
      .filter((item) => item.status !== "INACTIVE")
      .map(mapCategoryOption);
  } catch (error) {
    console.error("Failed to load expense lookups", error);
  }
};

const createCategory = async () => {
  categoryError.value = "";
  if (!newCategoryName.value.trim()) {
    categoryError.value = "اسم التصنيف مطلوب.";
    return;
  }
  savingCategory.value = true;
  try {
    const created = await expenseApi.createCategory({
      name: newCategoryName.value.trim(),
    });
    await loadLookups();
    form.categoryId = created?.id || form.categoryId;
    newCategoryName.value = "";
    showCategoryDialog.value = false;
  } catch (error) {
    categoryError.value = error?.message || "تعذر إنشاء التصنيف.";
  } finally {
    savingCategory.value = false;
  }
};

watch(
  () => props.expense,
  (value) => {
    const next = mapExpenseToForm(value);
    Object.assign(form, next);
    Object.assign(initialValues, next);
    formKey.value += 1;
  },
  { immediate: true },
);

const submit = async () => {
  const existingAcademicYearId = props.expense?.academicYear?.id || null;
  const validationError = validateExpenseForm(form, {
    existingAcademicYearId,
    currentAcademicYearId: currentAcademicYearId.value,
  });
  if (validationError) {
    showError(validationError);
    return;
  }

  saving.value = true;
  try {
    const payload = buildExpensePayload(form, {
      existingAcademicYearId,
      currentAcademicYearId: currentAcademicYearId.value,
    });
    const result = isEdit.value
      ? await expenseApi.updateExpense(props.expense.id, payload)
      : await expenseApi.createExpense(payload);
    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر حفظ المصروف.");
  } finally {
    saving.value = false;
  }
};

onMounted(loadLookups);
</script>
