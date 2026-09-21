<template>
  <Form
    v-slot="{ errors: fieldErrors, meta }"
    :key="formKey"
    :initial-values="initialValues"
    class="grid gap-4"
    @submit="submit"
  >
    <Field
      v-slot="{ errorMessage }"
      v-model="form.categoryId"
      name="categoryId"
      label="التصنيف"
      rules="required"
    >
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">التصنيف</label>
        <div class="flex gap-2">
          <Select
            v-model="form.categoryId"
            :options="categoryOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="اختر التصنيف"
            filter
            class="flex-1"
            :class="{ 'p-invalid': errorMessage || fieldErrors.categoryId }"
          />
          <Button
            type="button"
            icon="pi pi-plus"
            severity="primary"
            outlined
            aria-label="إضافة تصنيف"
            @click="showCategoryDialog = true"
          />
        </div>
        <ErrorMessage name="categoryId" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field v-slot="{}" v-model="form.branchId" name="branchId">
      <AppGlobalSelectBranch
        v-model="form.branchId"
        label="الفرع (اختياري)"
        placeholder="كل الفروع / عام"
        show-clear
      />
    </Field>

    <div
      class="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-3"
    >
      <div class="text-right">
        <p class="text-sm font-medium text-slate-800">مصروف مرتبط بالفترة الحالية</p>
        <p class="text-xs text-slate-500">
          {{
            form.linkToAcademicYear
              ? "يُحسب ضمن تقرير الأرباح"
              : "مصروف عام — لا يُخصم من صافي الربح تلقائياً"
          }}
        </p>
      </div>
      <ToggleSwitch v-model="form.linkToAcademicYear" />
    </div>

    <Field
      v-slot="{ errorMessage }"
      v-model="form.amount"
      name="amount"
      label="المبلغ"
      rules="required|min_value:0.01"
    >
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">المبلغ</label>
        <AppInputNumber
          v-model="form.amount"
          mode="currency"
          currency="EGP"
          :min="0"
          :min-fraction-digits="2"
          :invalid="!!(errorMessage || fieldErrors.amount)"
        />
        <ErrorMessage name="amount" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field
      v-slot="{ errorMessage }"
      v-model="form.expenseDate"
      name="expenseDate"
      label="تاريخ المصروف"
      rules="required"
    >
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">تاريخ المصروف</label>
        <DatePicker
          v-model="form.expenseDate"
          dateFormat="yy-mm-dd"
          showIcon
          class="w-full"
          :class="{ 'p-invalid': errorMessage || fieldErrors.expenseDate }"
        />
        <ErrorMessage name="expenseDate" class="text-xs text-red-500" />
      </div>
    </Field>

    <Field v-slot="{}" v-model="form.description" name="description" label="الوصف">
      <div class="flex flex-col gap-2 text-right">
        <label class="text-sm font-medium text-slate-700">الوصف</label>
        <Textarea v-model="form.description" rows="3" class="w-full" />
      </div>
    </Field>

    <div class="flex justify-end gap-2">
      <Button type="button" label="إلغاء" severity="secondary" text @click="$emit('cancel')" />
      <FormSubmitButton
        :label="isEdit ? 'حفظ التعديل' : 'إضافة'"
        :loading="saving"
        :valid="meta.valid"
      />
    </div>
  </Form>

  <Dialog
    v-model:visible="showCategoryDialog"
    header="إضافة تصنيف مصروف"
    modal
    :style="{ width: '360px' }"
    dir="rtl"
  >
    <div class="flex flex-col gap-3 text-right">
      <label class="text-sm font-medium text-slate-700">اسم التصنيف</label>
      <InputText v-model="newCategoryName" class="w-full" />
      <p v-if="categoryError" class="text-xs text-red-500">{{ categoryError }}</p>
    </div>
    <template #footer>
      <Button label="إلغاء" text severity="secondary" @click="showCategoryDialog = false" />
      <Button label="حفظ" severity="primary" :loading="savingCategory" @click="createCategory" />
    </template>
  </Dialog>
</template>

<script setup>
import Button from "primevue/button";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import DatePicker from "primevue/datepicker";
import Dialog from "primevue/dialog";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import AppGlobalSelectBranch from "~/components/shared/app-global-select-branch/index.vue";
import ToggleSwitch from "primevue/toggleswitch";
import { Form, Field, ErrorMessage } from "vee-validate";
import { expenseService } from "~/services/expenseService";
import { useAppToast } from "~/composables/useAppToast";
import { useAcademicYearId } from "~/composables/useAcademicYearId";

const { showError } = useAppToast();
const { academicYearId: currentAcademicYearId } = useAcademicYearId();

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

const toDate = (value) => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  return new Date(value);
};

const toIsoDate = (value) => {
  const date = toDate(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const form = reactive({
  categoryId: null,
  branchId: null,
  amount: null,
  expenseDate: new Date(),
  description: "",
  linkToAcademicYear: true,
});

const initialValues = computed(() => ({
  categoryId: props.expense?.categoryId || null,
  branchId: props.expense?.branchId || null,
  amount: props.expense?.amount != null ? Number(props.expense.amount) : null,
  expenseDate: toDate(props.expense?.expenseDate),
  description: props.expense?.description || "",
  linkToAcademicYear: props.expense
    ? Boolean(props.expense.academicYearId || props.expense.academicYear?.id)
    : true,
}));

const loadLookups = async () => {
  try {
    const categories = await expenseService.getCategories();

    categoryOptions.value = (categories || [])
      .filter((item) => item.status !== "INACTIVE")
      .map((item) => ({ label: item.name, value: item.id }));
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
    const created = await expenseService.createCategory({ name: newCategoryName.value.trim() });
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
    form.categoryId = value?.categoryId || null;
    form.branchId = value?.branchId || null;
    form.amount = value?.amount != null ? Number(value.amount) : null;
    form.expenseDate = toDate(value?.expenseDate);
    form.description = value?.description || "";
    form.linkToAcademicYear = value
      ? Boolean(value.academicYearId || value.academicYear?.id)
      : true;
    formKey.value += 1;
  },
  { immediate: true },
);

const submit = async () => {
  saving.value = true;
  try {
    if (
      form.linkToAcademicYear &&
      !(
        props.expense?.academicYearId ||
        props.expense?.academicYear?.id ||
        currentAcademicYearId.value
      )
    ) {
      throw new Error(
        "اختر العام الدراسي أولاً أو ألغِ الربط للمصروف العام.",
      );
    }

    const payload = {
      categoryId: form.categoryId,
      branchId: form.branchId || null,
      amount: form.amount,
      expenseDate: toIsoDate(form.expenseDate),
      description: form.description || undefined,
      academicYearId: form.linkToAcademicYear
        ? props.expense?.academicYearId ||
          props.expense?.academicYear?.id ||
          currentAcademicYearId.value
        : null,
    };
    const result = isEdit.value
      ? await expenseService.updateExpense(props.expense.id, payload)
      : await expenseService.createExpense(payload);
    emit("saved", result);
  } catch (error) {
    showError(error?.message || "تعذر حفظ المصروف.");
  } finally {
    saving.value = false;
  }
};

onMounted(loadLookups);
</script>
