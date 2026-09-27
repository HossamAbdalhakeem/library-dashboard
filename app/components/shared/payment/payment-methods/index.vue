<template>
  <div class="flex w-full flex-col gap-2 text-right" dir="rtl">
    <label
      v-if="label"
      class="text-sm font-medium text-slate-700 dark:text-slate-200"
    >
      {{ label }}
    </label>

    <div
      class="grid gap-1 rounded-xl p-1 md:w-max md:self-start lg:w-full"
      :class="[
        resolvedOptions.length <= 2 ? 'grid-cols-2 lg:grid-cols-1' : 'grid-cols-3 lg:grid-cols-1',
        invalid
          ? 'bg-red-500/10 ring-1 ring-red-400/70'
          : 'bg-slate-100 dark:bg-white/[0.06]',
      ]"
      role="radiogroup"
      :aria-label="label || 'طريقة الدفع'"
    >
      <button
        v-for="option in resolvedOptions"
        :key="option.value"
        type="button"
        role="radio"
        class="flex min-h-[4.6rem] flex-col items-center justify-center gap-1.5 rounded-xl px-1.5 py-2.5 text-center text-xs font-semibold leading-snug transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 md:min-h-11 md:flex-row md:justify-center md:gap-2 md:px-4 md:py-2 md:text-sm lg:justify-start lg:px-3"
        :class="isSelected(option.value) ? option.selectedClass : option.idleClass"
        :aria-checked="isSelected(option.value)"
        :data-testid="`payment-method-${option.value}`"
        @click="onSelect(option.value)"
      >
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-300"
          :class="
            isSelected(option.value) ? option.iconSelectedClass : option.iconClass
          "
        >
          <i :class="['pi text-sm', option.icon]" />
        </span>
        <span>{{ option.label }}</span>
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
    icon: "pi-wallet",
    idleClass:
      "text-slate-600 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-white/10",
    selectedClass: "bg-sky-500 text-white shadow-md shadow-sky-500/25",
    iconClass: "bg-slate-200/80 text-slate-600 dark:bg-white/10 dark:text-slate-200",
    iconSelectedClass: "bg-white/20 text-white",
  },
  [PaymentMethod.WALLET]: {
    icon: "pi-mobile",
    idleClass:
      "text-slate-600 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-white/10",
    selectedClass: "bg-emerald-500 text-white shadow-md shadow-emerald-500/25",
    iconClass:
      "bg-slate-200/80 text-slate-600 dark:bg-white/10 dark:text-slate-200",
    iconSelectedClass: "bg-white/20 text-white",
  },
  [PaymentMethod.INSTAPAY]: {
    icon: "pi-send",
    idleClass:
      "text-slate-600 hover:bg-white/80 dark:text-slate-300 dark:hover:bg-white/10",
    selectedClass: "bg-orange-500 text-white shadow-md shadow-orange-500/25",
    iconClass:
      "bg-slate-200/80 text-slate-600 dark:bg-white/10 dark:text-slate-200",
    iconSelectedClass: "bg-white/20 text-white",
  },
};

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
    .map((option) => {
      const value = normalizePaymentMethod(option.value);
      const ui = METHOD_UI[value] || METHOD_UI[PaymentMethod.CASH];
      return {
        label: option.label,
        value,
        ...ui,
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
