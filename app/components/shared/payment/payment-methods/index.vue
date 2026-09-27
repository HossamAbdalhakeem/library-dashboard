<template>
  <div class="flex w-full flex-col gap-3 text-start" dir="rtl">
    <div v-if="label || hint">
      <p
        v-if="label"
        class="text-sm font-semibold text-slate-900 dark:text-slate-100"
      >
        {{ label }}
      </p>
      <p
        v-if="hint"
        class="mt-0.5 text-xs text-slate-500 dark:text-slate-400"
      >
        {{ hint }}
      </p>
    </div>

    <div
      class="grid grid-cols-1 gap-3 sm:grid-cols-3"
      role="radiogroup"
      :aria-label="label || 'طريقة الدفع'"
      :aria-invalid="invalid || undefined"
    >
      <button
        v-for="option in resolvedOptions"
        :key="option.value"
        type="button"
        role="radio"
        class="relative flex min-h-12 w-full items-center gap-3 rounded-2xl border px-3 py-3 text-start transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:min-h-[9.5rem] sm:flex-col sm:justify-center sm:gap-2 sm:px-4 sm:py-5 sm:text-center"
        :class="
          isSelected(option.value)
            ? 'border-primary bg-primary/5 ring-1 ring-primary/20 dark:bg-primary/10'
            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500'
        "
        :aria-checked="isSelected(option.value)"
        :data-testid="`payment-method-${option.value}`"
        @click="onSelect(option.value)"
      >
        <span
          class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border sm:absolute sm:start-3 sm:top-3"
          :class="
            isSelected(option.value)
              ? 'order-last ms-auto border-primary bg-primary text-white sm:order-none sm:ms-0'
              : 'order-last ms-auto border-slate-300 bg-white text-transparent dark:border-slate-600 dark:bg-slate-900 sm:order-none sm:ms-0'
          "
          aria-hidden="true"
        >
          <i
            v-if="isSelected(option.value)"
            class="pi pi-check text-[10px] leading-none"
          />
        </span>

        <span
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11"
          :class="
            isSelected(option.value)
              ? 'bg-primary/15 text-primary-700 dark:text-primary-200'
              : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-100'
          "
        >
          <i :class="['pi text-base', option.icon]" />
        </span>

        <span class="min-w-0 flex-1 sm:flex-none">
          <span class="block text-sm font-semibold text-slate-900 dark:text-slate-100">
            {{ option.label }}
          </span>
          <span class="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
            {{ option.description }}
          </span>
        </span>
      </button>
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

const METHOD_UI = {
  [PaymentMethod.CASH]: {
    icon: "pi-money-bill",
    description: "الدفع نقداً",
  },
  [PaymentMethod.WALLET]: {
    icon: "pi-wallet",
    description: "الدفع عبر المحفظة",
  },
  [PaymentMethod.INSTAPAY]: {
    icon: "pi-send",
    description: "الدفع عبر إنستاباي",
  },
};

const props = defineProps({
  modelValue: { type: String, default: PaymentMethod.CASH },
  label: { type: String, default: "طريقة الدفع" },
  hint: { type: String, default: "" },
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
    .map((option) => {
      const value = normalizePaymentMethod(option.value);
      const ui = METHOD_UI[value] || METHOD_UI[PaymentMethod.CASH];
      return {
        label: option.label,
        value,
        description: option.description || ui.description,
        icon: ui.icon,
      };
    })
    .filter((option) => option.value && !excluded.has(option.value));
});

const isSelected = (value) =>
  normalizePaymentMethod(props.modelValue, "") === value;

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
