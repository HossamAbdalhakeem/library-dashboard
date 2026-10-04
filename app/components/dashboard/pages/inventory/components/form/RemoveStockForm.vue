<template>
  <form class="grid gap-4" @submit.prevent="submitRemove">
    <div v-if="!lockedBranchId" class="flex flex-col gap-2 text-right">
      <AppGlobalSelectBranch
        v-model="form.branchId"
        label="الفرع"
        placeholder="اختار الفرع ▾"
        :invalid="!!errors.branchId"
        @change="onBranchChange"
      />
      <small v-if="errors.branchId" class="text-xs text-red-500">{{ errors.branchId }}</small>
    </div>

    <div v-else class="rounded-xl bg-slate-50 px-3 py-2 text-right text-sm text-slate-600">
      الفرع: <strong class="text-slate-900">{{ branchName || "—" }}</strong>
    </div>

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

    <div class="flex flex-col gap-2 text-right">
      <AppGlobalSelectProduct
        v-model="form.productId"
        source="inventory"
        variant="simple"
        name-only
        :branch-id="selectedBranchId"
        :inventory-query="inventoryQuery"
        :min-available-quantity="isDamagedMode ? 0 : 1"
        :min-damaged-quantity="isDamagedMode ? 1 : 0"
        :auto-load="canSelectProduct"
        :label="isDamagedMode ? 'المنتج التالف' : 'سحبت ايه'"
        :placeholder="
          isDamagedMode
            ? 'اختار منتجاً تالفاً ▾'
            : 'اختار منتجاً من مخزن الفرع ▾'
        "
        :disabled="!canSelectProduct"
        :invalid="!!errors.productId"
        :hint="productSelectHint"
        @select="onProductSelect"
        @loaded="onProductsLoaded"
      />
      <small v-if="errors.productId" class="text-xs text-red-500">{{ errors.productId }}</small>
    </div>

    <div class="flex flex-col gap-2 text-right">
      <div class="flex items-center justify-between gap-2">
        <label class="text-sm font-medium text-slate-700">الكمية</label>
        <span
          v-if="selectedProduct"
          class="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700"
        >
          {{ isDamagedMode ? "التالف بالمخزن" : "المتاح بالمخزن" }}: {{ stockQty }}
        </span>
      </div>
      <AppInputNumber
        v-model="form.quantity"
        :min="1"
        :max="maxQuantity"
        :max-fraction-digits="0"
        :disabled="!selectedProduct || stockQty < 1"
        :invalid="!!errors.quantity"
        @update:model-value="onQuantityChange"
      />
      <small v-if="errors.quantity" class="text-xs text-red-500">{{ errors.quantity }}</small>
    </div>

    <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-right text-sm text-slate-600">
      {{ isDamagedMode ? "التالف بالمخزن حالياً" : "المتاح بالمخزن حالياً" }}:
      <strong class="text-slate-900">{{ stockQty }}</strong>
    </div>

    <div class="flex flex-wrap justify-end gap-2">
      <Button
        v-if="showCancel"
        type="button"
        label="إلغاء"
        severity="secondary"
        text
        @click="$emit('cancel')"
      />
      <FormSubmitButton
        label="تأكيد السحب"
        :loading="saving"
        :valid="isFormValid"
        severity="warning"
      />
    </div>
  </form>
</template>

<script setup>
import Button from "primevue/button";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import AppGlobalSelectProduct from "~/components/shared/selections/app-global-select-product/index.vue";
import AppGlobalSelectBranch from "~/components/shared/selections/app-global-select-branch/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/selections/app-global-select-study-year/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/selections/app-global-select-teacher/index.vue";
import AppInputNumber from "~/components/shared/inputs/app-input-number/index.vue";
import { inventoryApi } from "~/services/inventory";
import { useAppToast } from "~/composables/useAppToast";
import { isFiniteNumber } from "~/utils/format/number";

const props = defineProps({
  lockedBranchId: { type: String, default: "" },
  branchName: { type: String, default: "" },
  showCancel: { type: Boolean, default: true },
  mode: { type: String, default: "sellable" },
});

const emit = defineEmits(["saved", "cancel"]);
const { showError } = useAppToast();

const saving = ref(false);
const productOptions = ref([]);
const selectedProductOption = ref(null);
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

const isDamagedMode = computed(() => props.mode === "damaged");

const selectedBranchId = computed(() => props.lockedBranchId || form.branchId || null);

const canSelectProduct = computed(() =>
  Boolean(selectedBranchId.value && form.studyYearId && form.teacherId),
);

const inventoryQuery = computed(() => {
  const scope = isDamagedMode.value
    ? { damagedOnly: true }
    : { availableOnly: true };
  if (!canSelectProduct.value) return scope;
  return {
    ...scope,
    studyYearId: form.studyYearId,
    teacherId: form.teacherId,
  };
});

const productSelectHint = computed(() => {
  if (!selectedBranchId.value) return "اختر الفرع أولاً لعرض منتجات المخزن.";
  if (!form.teacherId) return "اختر المدرس أولاً.";
  if (!form.studyYearId) return "اختر السنة الدراسية أولاً.";
  return "";
});

const selectedProduct = computed(() => {
  if (selectedProductOption.value?.value === form.productId) {
    return selectedProductOption.value;
  }
  return (
    productOptions.value.find(
      (option) => String(option.value) === String(form.productId),
    ) || null
  );
});

const availableQty = computed(() =>
  Math.max(0, Number(selectedProduct.value?.availableQuantity || 0)),
);

const damagedQty = computed(() =>
  Math.max(0, Number(selectedProduct.value?.damagedQuantity || 0)),
);

const stockQty = computed(() =>
  isDamagedMode.value ? damagedQty.value : availableQty.value,
);

const maxQuantity = computed(() =>
  stockQty.value > 0 ? stockQty.value : 1,
);

const isFormValid = computed(() => {
  const branchId = selectedBranchId.value;
  const qty = Number(form.quantity);
  return Boolean(
    branchId &&
      form.studyYearId &&
      form.teacherId &&
      form.productId &&
      form.quantity != null &&
      isFiniteNumber(qty) &&
      qty >= 1 &&
      stockQty.value > 0 &&
      qty <= stockQty.value,
  );
});

const toId = (value) => {
  if (value == null || value === "") return null;
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object") {
    const id = value.value ?? value.id ?? value.productId;
    return id != null && id !== "" ? String(id) : null;
  }
  return null;
};

const clearProduct = () => {
  form.productId = null;
  form.quantity = null;
  selectedProductOption.value = null;
  productOptions.value = [];
  errors.productId = "";
  errors.quantity = "";
};

const validateQuantity = () => {
  const available = stockQty.value;
  const qty = Number(form.quantity);
  const stockLabel = isDamagedMode.value ? "التالف" : "المتاح بالمخزن";

  if (!form.productId) {
    errors.quantity = "";
    return false;
  }

  if (available < 1) {
    errors.quantity = isDamagedMode.value
      ? "لا توجد كمية تالفة لهذا المنتج في الفرع."
      : "لا توجد كمية متاحة لهذا المنتج في الفرع.";
    return false;
  }

  if (form.quantity == null || !isFiniteNumber(qty) || qty < 1) {
    errors.quantity = "الكمية يجب أن تكون 1 على الأقل.";
    return false;
  }

  if (qty > available) {
    errors.quantity = `الكمية أكبر من ${stockLabel} (${available}).`;
    return false;
  }

  errors.quantity = "";
  return true;
};

const clampQuantityToAvailable = () => {
  const available = stockQty.value;
  if (form.quantity == null) return;
  const qty = Number(form.quantity);
  if (!isFiniteNumber(qty)) {
    form.quantity = null;
    return;
  }
  if (available < 1) {
    form.quantity = null;
    return;
  }
  if (qty > available) {
    form.quantity = available;
  }
};

const onBranchChange = (value) => {
  form.branchId = toId(value);
  clearProduct();
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

const onProductsLoaded = (options) => {
  productOptions.value = options || [];
  if (!form.productId) return;
  const match =
    productOptions.value.find(
      (option) => String(option.value) === String(form.productId),
    ) || null;
  if (match) selectedProductOption.value = match;
  clampQuantityToAvailable();
  validateQuantity();
};

const onProductSelect = (option) => {
  selectedProductOption.value = option || null;
  errors.productId = "";
  clampQuantityToAvailable();
  validateQuantity();
};

const onQuantityChange = () => {
  clampQuantityToAvailable();
  validateQuantity();
};

const validate = () => {
  const branchId = selectedBranchId.value;
  errors.branchId = branchId ? "" : "الفرع مطلوب.";
  errors.studyYearId = form.studyYearId ? "" : "السنة الدراسية مطلوبة.";
  errors.teacherId = form.teacherId ? "" : "المدرس مطلوب.";
  errors.productId = form.productId ? "" : "المنتج مطلوب.";
  const quantityOk = validateQuantity();
  return (
    !errors.branchId &&
    !errors.studyYearId &&
    !errors.teacherId &&
    !errors.productId &&
    quantityOk
  );
};

const submitRemove = async () => {
  if (!validate()) return;

  saving.value = true;
  try {
    const payload = {
      branchId: selectedBranchId.value,
      productId: form.productId,
      quantity: Number(form.quantity),
    };
    if (isDamagedMode.value) {
      await inventoryApi.removeDamagedStock(payload);
    } else {
      await inventoryApi.removeStock(payload);
    }

    form.productId = null;
    form.quantity = null;
    form.studyYearId = null;
    form.teacherId = null;
    if (!props.lockedBranchId) form.branchId = null;
    productOptions.value = [];
    selectedProductOption.value = null;
    errors.quantity = "";
    emit("saved");
  } catch (error) {
    showError(
      error?.message ||
        (isDamagedMode.value
          ? "تعذر إخراج الكمية التالفة من المخزن."
          : "تعذر سحب المنتج من الفرع."),
    );
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.lockedBranchId,
  (value) => {
    form.branchId = value || null;
    form.studyYearId = null;
    form.teacherId = null;
    clearProduct();
  },
  { immediate: true },
);

watch(stockQty, () => {
  clampQuantityToAvailable();
  if (form.productId) validateQuantity();
});
</script>
