<template>
  <form class="grid gap-4" @submit.prevent="submitStock">
    <AddStockBranchField
      v-model:branch-id="form.branchId"
      :locked-branch-id="lockedBranchId"
      :branch-name="branchName"
      :error="errors.branchId"
    />

    <AddStockProductField
      v-model:product-id="form.productId"
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
  productId: "",
  quantity: "",
});

const form = reactive({
  branchId: props.lockedBranchId || null,
  productId: null,
  quantity: null,
});

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
      form.productId &&
      form.quantity != null &&
      Number(form.quantity) >= 1,
  );
});

const validate = () => {
  const branchId = props.lockedBranchId || form.branchId;
  errors.branchId = branchId ? "" : "الفرع مطلوب.";
  errors.productId = form.productId ? "" : "المنتج مطلوب.";
  errors.quantity =
    form.quantity != null && Number(form.quantity) >= 1
      ? ""
      : "الكمية يجب أن تكون 1 على الأقل.";
  return !errors.branchId && !errors.productId && !errors.quantity;
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
