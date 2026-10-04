<template>
  <div class="flex flex-col gap-3 border-t border-primary/20 px-4 pb-4 pt-3">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          رسوم التحويل
        </p>
        <p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          يحول الطالب مبلغ المنتج بالإضافة إلى رسوم التحويل. لا تُسترد رسوم التحويل.
        </p>
      </div>
      <ToggleSwitch
        :model-value="enabled"
        @update:model-value="onToggle"
      />
    </div>

    <div v-if="enabled" class="space-y-1">
      <AppInputNumber
        :model-value="amount"
        :min="0"
        :min-fraction-digits="0"
        :max-fraction-digits="2"
        :invalid="Boolean(error)"
        placeholder="قيمة رسوم التحويل"
        @update:model-value="onAmount"
      />
      <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import ToggleSwitch from "primevue/toggleswitch";
import AppInputNumber from "~/components/shared/inputs/app-input-number/index.vue";

defineOptions({ name: "PaymentFeeFields" });

defineProps({
  enabled: { type: Boolean, default: false },
  amount: { type: Number, default: null },
  error: { type: String, default: "" },
});

const emit = defineEmits(["update:enabled", "update:amount"]);

const onToggle = (value) => {
  emit("update:enabled", Boolean(value));
  if (!value) emit("update:amount", null);
};

const onAmount = (value) => {
  emit("update:amount", value ?? null);
};
</script>
