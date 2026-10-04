<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    header="رسوم التحويل"
    :closable="!busy"
    :dismissable-mask="!busy"
    :close-on-escape="!busy"
    :style="{ width: '420px', maxWidth: '95vw' }"
    :pt="{
      header: { class: 'text-right' },
      content: { class: 'text-right' },
    }"
    @update:visible="onVisible"
  >
    <div class="space-y-4 text-right">
      <p class="text-sm text-slate-600">
        يحول الطالب مبلغ المنتج بالإضافة إلى رسوم التحويل. لا تُسترد رسوم التحويل.
      </p>

      <div class="flex items-center justify-between gap-3">
        <span class="text-sm font-semibold text-slate-800">رسوم التحويل</span>
        <ToggleSwitch v-model="enabled" :disabled="busy" />
      </div>

      <div v-if="enabled" class="space-y-1">
        <AppInputNumber
          v-model="amount"
          :min="0"
          :min-fraction-digits="0"
          :max-fraction-digits="2"
          :invalid="Boolean(error)"
          placeholder="قيمة رسوم التحويل"
          @update:model-value="error = ''"
        />
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full justify-start gap-2">
        <Button label="متابعة" :disabled="busy" @click="confirm" />
        <Button
          label="رجوع"
          text
          severity="secondary"
          :disabled="busy"
          @click="onVisible(false)"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import ToggleSwitch from "primevue/toggleswitch";
import AppInputNumber from "~/components/shared/inputs/app-input-number/index.vue";
import { feeAmountError, feeAmountForRequest } from "~/utils/payment-fee";

defineOptions({ name: "PaymentFeeDialog" });

const props = defineProps({
  visible: { type: Boolean, default: false },
  method: { type: String, default: "" },
  busy: { type: Boolean, default: false },
});

const emit = defineEmits(["update:visible", "confirm"]);

const enabled = ref(false);
const amount = ref(null);
const error = ref("");

watch(
  () => props.visible,
  (open) => {
    if (!open) return;
    enabled.value = false;
    amount.value = null;
    error.value = "";
  },
);

const onVisible = (value) => {
  if (props.busy) return;
  emit("update:visible", value);
};

const confirm = () => {
  error.value = feeAmountError(enabled.value, amount.value);
  if (error.value) return;
  emit(
    "confirm",
    feeAmountForRequest({
      method: props.method,
      enabled: enabled.value,
      amount: amount.value,
    }),
  );
};
</script>
