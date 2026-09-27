<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-3 text-start" dir="rtl">
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
      class="flex flex-col gap-3"
      role="radiogroup"
      :aria-label="label || 'طريقة الدفع'"
      :aria-invalid="invalid || undefined"
      :aria-describedby="errorMessage ? errorId : undefined"
    >
      <div
        v-for="option in resolvedOptions"
        :key="option.value"
        class="overflow-hidden rounded-2xl border shadow-sm transition-colors duration-200"
        :class="
          isSelected(option.value)
            ? 'border-primary bg-primary/5 ring-1 ring-primary/20 dark:bg-primary/10'
            : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
        "
      >
        <button
          :id="headerId(option.value)"
          type="button"
          role="radio"
          class="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-start transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/50"
          :class="
            isSelected(option.value)
              ? ''
              : 'hover:bg-slate-50 dark:hover:bg-slate-800'
          "
          :aria-checked="isSelected(option.value)"
          :aria-expanded="isSelected(option.value)"
          :aria-controls="panelId(option.value)"
          :data-testid="`payment-method-${option.value}`"
          @click="onSelect(option.value)"
        >
          <span
            class="flex h-11 shrink-0 items-center justify-center rounded-xl"
            :class="
              option.logo
                ? [
                    'w-auto bg-white px-1.5 ring-1',
                    isSelected(option.value)
                      ? 'ring-primary/40'
                      : 'ring-slate-200 dark:ring-white/15',
                  ]
                : isSelected(option.value)
                  ? 'size-11 bg-primary/10 text-primary-700 dark:bg-primary/15 dark:text-primary-200'
                  : 'size-11 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100'
            "
          >
            <img
              v-if="option.logo"
              :src="option.logo"
              alt=""
              class="h-7 w-auto object-contain"
            />
            <PaymentIcon v-else :name="option.icon" class="size-5" />
          </span>

          <span class="min-w-0 flex-1">
            <span class="block text-sm font-semibold text-slate-900 dark:text-slate-100">
              {{ option.label }}
            </span>
            <span class="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              {{ option.description }}
            </span>
          </span>

          <span
            class="flex size-5 shrink-0 items-center justify-center rounded-full"
            :class="
              isSelected(option.value)
                ? 'bg-primary text-primary-950'
                : 'border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900'
            "
            aria-hidden="true"
          >
            <PaymentIcon
              v-if="isSelected(option.value)"
              name="check"
              class="size-3"
            />
          </span>

          <PaymentIcon
            name="chevron-down"
            class="size-4 shrink-0 text-slate-400 transition-transform duration-200 motion-reduce:transition-none"
            :class="isSelected(option.value) ? 'rotate-180' : ''"
          />
        </button>

        <div
          v-if="hasPanel"
          :id="panelId(option.value)"
          role="region"
          :aria-labelledby="headerId(option.value)"
          class="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
          :class="isSelected(option.value) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        >
          <div class="min-h-0 overflow-hidden">
            <div
              class="transition-opacity duration-200 motion-reduce:transition-none"
              :class="isSelected(option.value) ? 'opacity-100' : 'opacity-0'"
              :inert="!isSelected(option.value)"
            >
              <slot
                name="panel"
                :method="option.value"
                :open="isSelected(option.value)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" :id="errorId" class="text-xs text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup>
import PaymentIcon from "~/components/shared/payment/payment-icon/index.vue";
import {
  PaymentMethod,
  PAYMENT_METHOD_OPTIONS,
  normalizePaymentMethod,
} from "~/enums/paymentMethod";

defineOptions({ name: "PaymentMethods" });

const METHOD_UI = {
  [PaymentMethod.CASH]: {
    icon: "banknote",
    description: "الدفع نقداً",
  },
  [PaymentMethod.WALLET]: {
    icon: "wallet",
    description: "الدفع بالمحفظة الإلكترونية",
  },
  [PaymentMethod.INSTAPAY]: {
    icon: "instapay",
    logo: "/images/instapay.svg",
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

const slots = useSlots();
const uid = useId();
const hasPanel = computed(() => Boolean(slots.panel));

const headerId = (value) => `payment-method-${uid}-${value}`;
const panelId = (value) => `payment-panel-${uid}-${value}`;
const errorId = `payment-method-error-${uid}`;

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
        logo: ui.logo || "",
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
