<template>
  <div
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <p class="mb-4 text-center font-bold text-white">{{ title }}</p>

    <div
      v-if="!hasData"
      class="flex h-32 items-center justify-center text-sm text-slate-500"
    >
      {{ emptyMessage }}
    </div>

    <div
      v-else
      class="flex flex-col items-center justify-center gap-6 sm:flex-row sm:flex-wrap sm:gap-8"
    >
      <div
        class="h-32 w-32 shrink-0 rounded-full"
        :style="{ background: conicGradient }"
      />
      <div class="min-w-0 space-y-2 text-sm">
        <p
          v-for="item in resolvedItems"
          :key="item.method"
          class="break-words"
          :style="{ color: item.color }"
        >
          ● {{ item.label }}: {{ formatMoney(item.amount, "locale") }} — {{ item.percent }}%
        </p>
        <p class="break-words pt-1 font-bold text-white">
          {{ totalLabel }}: {{ formatMoney(totalAmount, "locale") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatMoney } from "~/utils/format/money";
import { isFiniteNumber } from "~/utils/format/number";
import {
  PAYMENT_METHOD_KEYS,
  PAYMENT_METHOD_META,
  normalizePaymentMethod,
} from "~/enums/paymentMethod";

defineOptions({ name: "PaymentMethodsReport" });

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: "طرق الدفع",
  },
  totalLabel: {
    type: String,
    default: "إجمالي المدفوعات",
  },
  emptyMessage: {
    type: String,
    default: "لا توجد مدفوعات في هذه الفترة",
  },
});

const resolvedItems = computed(() => {
  const raw = Array.isArray(props.items) ? props.items : [];
  const totals = Object.fromEntries(PAYMENT_METHOD_KEYS.map((m) => [m, 0]));

  for (const row of raw) {
    const method = normalizePaymentMethod(row.method || row.value);
    if (!PAYMENT_METHOD_KEYS.includes(method)) continue;
    const amount = Number(row.amount ?? 0);
    if (!isFiniteNumber(amount) || amount <= 0) continue;
    totals[method] += amount;
  }

  const total = PAYMENT_METHOD_KEYS.reduce((sum, method) => sum + totals[method], 0);
  if (total <= 0) return [];

  return PAYMENT_METHOD_KEYS.filter((method) => totals[method] > 0)
    .map((method) => {
      const amount = totals[method];
      const meta = PAYMENT_METHOD_META[method];
      return {
        method,
        label: meta.label,
        amount: Number(amount.toFixed(2)),
        percent: Math.round((amount / total) * 100),
        color: meta.color,
      };
    })
    .sort((a, b) => b.amount - a.amount);
});

const totalAmount = computed(() =>
  resolvedItems.value.reduce((sum, item) => sum + item.amount, 0),
);

const hasData = computed(() => resolvedItems.value.length > 0);

const conicGradient = computed(() => {
  const items = resolvedItems.value;
  if (!items.length) return "#262626";

  let cursor = 0;
  const segments = items.map((item) => {
    const start = cursor;
    const end = cursor + item.percent;
    cursor = end;
    return `${item.color} ${start}% ${end}%`;
  });

  if (cursor < 100) {
    segments.push(`#262626 ${cursor}% 100%`);
  }

  return `conic-gradient(${segments.join(", ")})`;
});
</script>
