<template>
  <div class=" flex w-full flex-col gap-2 text-right md:w-[90%]" dir="rtl">
    <label
      v-if="label"
      class="text-sm font-medium text-slate-700 dark:text-slate-200"
    >
      {{ label }}
    </label>

    <div
      class="overflow-hidden rounded-2xl border p-2.5 transition"
      :class="
        invalid
          ? 'border-red-400/70 bg-red-500/5'
          : 'border-slate-200 bg-gradient-to-b from-slate-50 to-white dark:border-white/10 dark:from-slate-900/80 dark:to-slate-950/60'
      "
    >
      <div class="mb-2.5 text-center">
        <p class="text-sm font-semibold text-slate-800 dark:text-slate-100">
          اختر طريقة الدفع
        </p>
        <p class="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          {{ helperText }}
        </p>
      </div>

      <div
        class="grid gap-2"
        :class="resolvedOptions.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'"
        role="radiogroup"
        :aria-label="label || 'طريقة الدفع'"
      >
        <button
          v-for="option in resolvedOptions"
          :key="option.value"
          type="button"
          role="radio"
          class="group relative flex min-h-[6.75rem] flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60"
          :class="isSelected(option.value) ? option.selectedClass : option.idleClass"
          :aria-checked="isSelected(option.value)"
          :data-testid="`payment-method-${option.value}`"
          @click="onSelect(option.value)"
        >
          <span
            class="absolute end-1.5 top-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full border transition"
            :class="
              isSelected(option.value)
                ? 'border-transparent bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'border-slate-300 bg-transparent text-transparent dark:border-white/20'
            "
          >
            <i class="pi pi-check text-[9px]" />
          </span>

          <span
            class="flex h-9 w-9 items-center justify-center rounded-xl transition"
            :class="
              isSelected(option.value) ? option.iconSelectedClass : option.iconClass
            "
          >
            <i :class="['pi text-base', option.icon]" />
          </span>

          <span class="text-xs font-semibold leading-tight">
            {{ option.label }}
          </span>
          <span
            class="px-0.5 text-[10px] leading-snug"
            :class="
              isSelected(option.value)
                ? 'text-inherit opacity-80'
                : 'text-slate-400 dark:text-slate-500'
            "
          >
            {{ option.hint }}
          </span>
        </button>
      </div>
    </div>

    <p v-if="errorMessage" class="text-xs text-red-500">{{ errorMessage }}</p>
  </div>
</template>

<script setup>
import {
  PaymentMethod,
  PAYMENT_METHOD_OPTIONS,
  normalizePaymentMethod,
  paymentMethodNeedsProof,
} from "~/enums/paymentMethod";

defineOptions({ name: "PaymentMethods" });

const METHOD_UI = {
  [PaymentMethod.CASH]: {
    icon: "pi-wallet",
    hint: "بدون صورة إثبات",
    idleClass:
      "border-slate-200/90 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-sky-400/40",
    selectedClass:
      "border-sky-400 bg-sky-500/10 text-sky-800 shadow-md ring-1 ring-sky-400/40 dark:border-sky-400/60 dark:bg-sky-500/15 dark:text-sky-100",
    iconClass: "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    iconSelectedClass: "bg-sky-500 text-white",
  },
  [PaymentMethod.WALLET]: {
    icon: "pi-mobile",
    hint: "مع صورة إثبات",
    idleClass:
      "border-slate-200/90 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-emerald-400/40",
    selectedClass:
      "border-emerald-400 bg-emerald-500/10 text-emerald-800 shadow-md ring-1 ring-emerald-400/40 dark:border-emerald-400/60 dark:bg-emerald-500/15 dark:text-emerald-100",
    iconClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    iconSelectedClass: "bg-emerald-500 text-white",
  },
  [PaymentMethod.INSTAPAY]: {
    icon: "pi-send",
    hint: "مع صورة إثبات",
    idleClass:
      "border-slate-200/90 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-orange-400/40",
    selectedClass:
      "border-orange-400 bg-orange-500/10 text-orange-800 shadow-md ring-1 ring-orange-400/40 dark:border-orange-400/60 dark:bg-orange-500/15 dark:text-orange-100",
    iconClass: "bg-orange-500/10 text-orange-600 dark:text-orange-300",
    iconSelectedClass: "bg-orange-500 text-white",
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

const helperText = computed(() => {
  const selected = normalizePaymentMethod(props.modelValue, "");
  if (selected && paymentMethodNeedsProof(selected)) {
    return "هذه الطريقة تتطلب رفع صورة إثبات بعد الاختيار";
  }
  if (selected === PaymentMethod.CASH) {
    return "الكاش لا يحتاج صورة إثبات";
  }
  return "حدد الطريقة المناسبة لإتمام العملية";
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
