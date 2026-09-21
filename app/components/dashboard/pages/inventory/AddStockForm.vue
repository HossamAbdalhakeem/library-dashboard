<template>
  <form class="grid gap-4" @submit.prevent="submitStock">
    <div v-if="!lockedBranchId" class="flex flex-col gap-2 text-right">
      <AppGlobalSelectBranch
        v-model="form.branchId"
        label="الفرع"
        placeholder="اختار الفرع ▾"
        :invalid="!!errors.branchId"
      />
      <small v-if="errors.branchId" class="text-xs text-red-500">{{ errors.branchId }}</small>
    </div>

    <div v-else class="rounded-xl bg-slate-50 px-3 py-2 text-right text-sm text-slate-600">
      الفرع: <strong class="text-slate-900">{{ branchName || "—" }}</strong>
    </div>

    <div class="flex flex-col gap-2 text-right">
      <ProductSelect
        v-model="form.productId"
        source="catalog"
        variant="simple"
        placeholder="اختار المنتج ▾"
        :invalid="!!errors.productId"
        @select="onProductSelect"
        @loaded="onProductsLoaded"
      />
      <small v-if="errors.productId" class="text-xs text-red-500">{{ errors.productId }}</small>
    </div>

    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">الكمية</label>
      <AppInputNumber
        v-model="form.quantity"
        :min="1"
        :max-fraction-digits="0"
        :invalid="!!errors.quantity"
      />
      <small v-if="errors.quantity" class="text-xs text-red-500">{{ errors.quantity }}</small>
    </div>

    <div class="overflow-hidden rounded-2xl border border-slate-200">
      <table class="w-full text-right text-sm">
        <thead class="bg-slate-100 text-slate-700">
          <tr>
            <th class="px-3 py-2">المنتج</th>
            <th class="px-3 py-2">الكمية المُسلّمة</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!form.productId || !form.quantity" class="text-slate-400">
            <td colspan="2" class="px-3 py-4 text-center">سيظهر الملخص هنا بعد اختيار المنتج والكمية</td>
          </tr>
          <tr v-else>
            <td class="px-3 py-3">{{ currentProductName }}</td>
            <td class="px-3 py-3">{{ form.quantity }}</td>
          </tr>
        </tbody>
      </table>
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
        label="تسليم المنتجات للفرع"
        :loading="saving"
        :valid="isFormValid"
      />
    </div>
  </form>
</template>

<script setup>
import Button from "primevue/button";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";
import ProductSelect from "~/components/shared/product-select/index.vue";
import AppGlobalSelectBranch from "~/components/shared/app-global-select-branch/index.vue";
import AppInputNumber from "~/components/dashboard/AppInputNumber.vue";
import { inventoryService } from "~/services/inventoryService";
import { useAppToast } from "~/composables/useAppToast";

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
  const selected = productOptions.value.find((item) => item.value === form.productId);
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
    await inventoryService.addStock({
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
