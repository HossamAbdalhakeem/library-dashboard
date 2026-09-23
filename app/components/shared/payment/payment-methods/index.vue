<template>
  <div class="flex h-full flex-col gap-2 text-right" dir="rtl">
    <label v-if="label" class="text-sm font-medium text-slate-300">{{ label }}</label>
    <div
      class="space-y-2 rounded-xl border border-white/10 bg-slate-950/60 p-3"
      :class="{ 'ring-1 ring-red-400': invalid }"
    >
      <label
        v-for="option in resolvedOptions"
        :key="option.value"
        class="flex cursor-pointer items-center justify-end gap-2 text-sm text-slate-200"
      >
        <span>{{ option.label }}</span>
        <input
          type="radio"
          class="accent-primary-400"
          :value="option.value"
          :checked="modelValue === option.value"
          @change="onSelect(option.value)"
        />
      </label>
    </div>
    <p v-if="errorMessage" class="text-xs text-red-500">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import {
  PaymentMethod,
  PAYMENT_METHOD_OPTIONS,
  normalizePaymentMethod,
} from "~/enums/paymentMethod";

defineOptions({ name: "PaymentMethods" });

const props = defineProps({
  modelValue: { type: String, default: PaymentMethod.CASH },
  label: { type: String, default: "طريقة الدفع" },
  options: { type: Array, default: null },
  exclude: { type: Array, default: () => [] },
  invalid: { type: Boolean, default: false },
  errorMessage: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "change"]);

const resolvedOptions = computed(() => {
  const base =
    Array.isArray(props.options) && props.options.length
      ? props.options
      : PAYMENT_METHOD_OPTIONS;

  const excluded = new Set(
    (props.exclude || []).map((value) => normalizePaymentMethod(value, "")),
  );

  return base
    .map((option) => ({
      label: option.label,
      value: normalizePaymentMethod(option.value),
    }))
    .filter((option) => !excluded.has(option.value));
});

const onSelect = (value) => {
  const next = normalizePaymentMethod(value);
  emit("update:modelValue", next);
  emit("change", next);
};

watch(
  resolvedOptions,
  (options) => {
    if (!options.length) return;
    const current = normalizePaymentMethod(props.modelValue, "");
    const exists = options.some((option) => option.value === current);
    if (!exists) {
      onSelect(options[0].value);
    }
  },
  { immediate: true },
);
</script>
