<template>
  <form class="grid gap-4" @submit.prevent="submitStock">
    <AddStockBranchField
      v-model:branch-id="form.branchId"
      :locked-branch-id="lockedBranchId"
      :branch-name="branchName"
      :error="errors.branchId"
    />

    <div class="flex flex-col gap-2 text-right">
      <AppGlobalSelectTeacher
        v-model="form.teacherId"
        label="المدرس"
        placeholder="اختر المدرس"
        :invalid="!!errors.teacherId"
        @change="onTeacherChange"
      />
      <small v-if="errors.teacherId" class="text-xs text-red-500">
        {{ errors.teacherId }}
      </small>
    </div>

    <div class="flex flex-col gap-2 text-right">
      <AppGlobalSelectStudyYear
        v-model="form.studyYearId"
        label="السنة الدراسية"
        placeholder="اختر السنة الدراسية"
        :disabled="!form.teacherId"
        :invalid="!!errors.studyYearId"
        @change="onStudyYearChange"
      />
      <small v-if="errors.studyYearId" class="text-xs text-red-500">
        {{ errors.studyYearId }}
      </small>
    </div>

    <AddStockProductField
      v-model:product-id="form.productId"
      :study-year-id="form.studyYearId"
      :teacher-id="form.teacherId"
      :disabled="!canSelectProduct"
      :hint="productSelectHint"
      :error="errors.productId"
      @select="onProductSelect"
      @loaded="onProductsLoaded"
    />

    <AddStockQuantityField
      v-model:quantity="form.quantity"
      :error="errors.quantity"
    />

    <AddStockSummary
      :product-id="form.productId"
      :product-name="currentProductName"
      :quantity="form.quantity"
    />

    <AddStockActions
      :show-cancel="showCancel"
      :loading="saving"
      :valid="isFormValid"
      @cancel="$emit('cancel')"
    />
  </form>
</template>

<script setup>
import AddStockBranchField from "./partials/AddStockBranchField.vue";
import AddStockProductField from "./partials/AddStockProductField.vue";
import AddStockQuantityField from "./partials/AddStockQuantityField.vue";
import AddStockSummary from "./partials/AddStockSummary.vue";
import AddStockActions from "./partials/AddStockActions.vue";
import AppGlobalSelectStudyYear from "~/components/shared/selections/app-global-select-study-year/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/selections/app-global-select-teacher/index.vue";
import { inventoryApi } from "~/services/inventory";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "AddStockForm" });

const props = defineProps({
  lockedBranchId: { type: String, default: "" },
  branchName: { type: String, default: "" },
  showCancel: { type: Boolean, default: true },
});

const emit = defineEmits(["saved", "cancel"]);
const { showError } = useAppToast();

const saving = ref(false);
const productOptions = ref([]);
const errors = reactive({
  branchId: "",
  studyYearId: "",
  teacherId: "",
  productId: "",
  quantity: "",
});

const form = reactive({
  branchId: props.lockedBranchId || null,
  studyYearId: null,
  teacherId: null,
  productId: null,
  quantity: null,
});

const canSelectProduct = computed(() =>
  Boolean(form.studyYearId && form.teacherId),
);

const productSelectHint = computed(() => {
  if (!form.teacherId) return "اختر المدرس أولاً.";
  if (!form.studyYearId) return "اختر السنة الدراسية أولاً.";
  return "";
});

const clearProduct = () => {
  form.productId = null;
  productOptions.value = [];
  errors.productId = "";
};

const onTeacherChange = (value) => {
  form.teacherId = value || null;
  form.studyYearId = null;
  clearProduct();
  errors.teacherId = "";
  errors.studyYearId = "";
};

const onStudyYearChange = (value) => {
  form.studyYearId = value || null;
  clearProduct();
  errors.studyYearId = "";
};

const onProductSelect = (option) => {
  errors.productId = "";
  if (!option) return;
};

const onProductsLoaded = (options) => {
  productOptions.value = options || [];
};

const currentProductName = computed(() => {
  const selected = productOptions.value.find(
    (item) => item.value === form.productId,
  );
  return selected?.name || selected?.label || "-";
});

const isFormValid = computed(() => {
  const branchId = props.lockedBranchId || form.branchId;
  return Boolean(
    branchId &&
      form.studyYearId &&
      form.teacherId &&
      form.productId &&
      form.quantity != null &&
      Number(form.quantity) >= 1,
  );
});

const validate = () => {
  const branchId = props.lockedBranchId || form.branchId;
  errors.branchId = branchId ? "" : "الفرع مطلوب.";
  errors.studyYearId = form.studyYearId ? "" : "السنة الدراسية مطلوبة.";
  errors.teacherId = form.teacherId ? "" : "المدرس مطلوب.";
  errors.productId = form.productId ? "" : "المنتج مطلوب.";
  errors.quantity =
    form.quantity != null && Number(form.quantity) >= 1
      ? ""
      : "الكمية يجب أن تكون 1 على الأقل.";
  return (
    !errors.branchId &&
    !errors.studyYearId &&
    !errors.teacherId &&
    !errors.productId &&
    !errors.quantity
  );
};

const submitStock = async () => {
  if (!validate()) return;

  saving.value = true;
  try {
    await inventoryApi.addStock({
      branchId: props.lockedBranchId || form.branchId,
      productId: form.productId,
      quantity: Number(form.quantity),
    });

    form.productId = null;
    form.quantity = null;
    form.studyYearId = null;
    form.teacherId = null;
    if (!props.lockedBranchId) form.branchId = null;
    emit("saved");
  } catch (error) {
    showError(error?.message || "تعذر إضافة المنتج للفرع.");
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.lockedBranchId,
  (value) => {
    form.branchId = value || null;
  },
  { immediate: true },
);
</script>
