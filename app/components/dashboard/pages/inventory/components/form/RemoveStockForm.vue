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
      <AppGlobalSelectProduct
        v-model="form.productId"
        source="inventory"
        :branch-id="selectedBranchId"
        :inventory-query="{ availableOnly: true }"
        :min-available-quantity="1"
        label="سحبت ايه"
        placeholder="اختار منتجاً من مخزن الفرع ▾"
        :disabled="!selectedBranchId"
        :invalid="!!errors.productId"
        :hint="
          !selectedBranchId
            ? 'اختر الفرع أولاً لعرض منتجات المخزن.'
            : ''
        "
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
          المتاح بالمخزن: {{ availableQty }}
        </span>
      </div>
      <AppInputNumber
        v-model="form.quantity"
        :min="1"
        :max="maxQuantity"
        :max-fraction-digits="0"
        :disabled="!selectedProduct || availableQty < 1"
        :invalid="!!errors.quantity"
        @update:model-value="onQuantityChange"
      />
      <small v-if="errors.quantity" class="text-xs text-red-500">{{ errors.quantity }}</small>
    </div>

    <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-right text-sm text-slate-600">
      المتاح بالمخزن حالياً:
      <strong class="text-slate-900">{{ availableQty }}</strong>
    </div>

    <div class="flex justify-end gap-2">
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
import AppInputNumber from "~/components/shared/inputs/app-input-number/index.vue";
import { inventoryApi } from "~/services/inventory";
import { useAppToast } from "~/composables/useAppToast";
import { isFiniteNumber } from "~/utils/format/number";

const props = defineProps({
  lockedBranchId: { type: String, default: "" },
  branchName: { type: String, default: "" },
  showCancel: { type: Boolean, default: true },
});

const emit = defineEmits(["saved", "cancel"]);
const { showError } = useAppToast();

const saving = ref(false);
const productOptions = ref([]);
const selectedProductOption = ref(null);
const errors = reactive({
  branchId: "",
  productId: "",
  quantity: "",
});

const form = reactive({
  branchId: props.lockedBranchId || null,
  productId: null,
  quantity: null,
});

const selectedBranchId = computed(() => props.lockedBranchId || form.branchId || null);

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

const maxQuantity = computed(() =>
  availableQty.value > 0 ? availableQty.value : 1,
);

const isFormValid = computed(() => {
  const branchId = selectedBranchId.value;
  const qty = Number(form.quantity);
  return Boolean(
    branchId &&
      form.productId &&
      form.quantity != null &&
      isFiniteNumber(qty) &&
      qty >= 1 &&
      availableQty.value > 0 &&
      qty <= availableQty.value,
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

const validateQuantity = () => {
  const available = availableQty.value;
  const qty = Number(form.quantity);

  if (!form.productId) {
    errors.quantity = "";
    return false;
  }

  if (available < 1) {
    errors.quantity = "لا توجد كمية متاحة لهذا المنتج في الفرع.";
    return false;
  }

  if (form.quantity == null || !isFiniteNumber(qty) || qty < 1) {
    errors.quantity = "الكمية يجب أن تكون 1 على الأقل.";
    return false;
  }

  if (qty > available) {
    errors.quantity = `الكمية أكبر من المتاح بالمخزن (${available}).`;
    return false;
  }

  errors.quantity = "";
  return true;
};

const clampQuantityToAvailable = () => {
  const available = availableQty.value;
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
  form.productId = null;
  form.quantity = null;
  selectedProductOption.value = null;
  errors.productId = "";
  errors.quantity = "";
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
  errors.productId = form.productId ? "" : "المنتج مطلوب.";
  const quantityOk = validateQuantity();
  return !errors.branchId && !errors.productId && quantityOk;
};

const submitRemove = async () => {
  if (!validate()) return;

  saving.value = true;
  try {
    await inventoryApi.removeStock({
      branchId: selectedBranchId.value,
      productId: form.productId,
      quantity: Number(form.quantity),
    });

    form.productId = null;
    form.quantity = null;
    if (!props.lockedBranchId) form.branchId = null;
    productOptions.value = [];
    selectedProductOption.value = null;
    errors.quantity = "";
    emit("saved");
  } catch (error) {
    showError(error?.message || "تعذر سحب المنتج من الفرع.");
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.lockedBranchId,
  (value) => {
    form.branchId = value || null;
    form.productId = null;
    form.quantity = null;
    selectedProductOption.value = null;
    errors.quantity = "";
  },
  { immediate: true },
);

watch(availableQty, () => {
  clampQuantityToAvailable();
  if (form.productId) validateQuantity();
});
</script>
