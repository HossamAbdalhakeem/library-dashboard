<template>
  <div
    class="h-full w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <p class="mb-4 text-center font-bold text-[var(--app-text-strong)]">{{ title }}</p>

    <div
      v-if="!hasData"
      class="flex h-32 items-center justify-center text-sm text-slate-500"
    >
      {{ emptyMessage }}
    </div>

    <div v-else class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-center gap-4">
        <div
          class="h-28 w-28 shrink-0 rounded-full"
          role="img"
          :aria-label="chartSummary"
          :style="{ background: conicGradient }"
        />
        <ul class="flex min-w-0 flex-col gap-1.5">
          <li
            v-for="item in resolvedItems"
            :key="`legend-${item.method}`"
            class="flex items-center gap-2 text-sm"
          >
            <span
              class="size-2.5 shrink-0 rounded-full"
              :style="{ backgroundColor: item.color }"
            />
            <span class="truncate font-medium text-[var(--app-text-strong)]">
              {{ item.label }}
            </span>
            <span class="shrink-0 tabular-nums text-slate-400">
              {{ item.percent }}%
            </span>
          </li>
        </ul>
      </div>

      <ul class="space-y-2">
        <li
          v-for="item in resolvedItems"
          :key="item.method"
          class="rounded-lg border border-white/10 border-s-[3px] bg-white/[0.03] px-3 py-2.5"
          :style="{ borderInlineStartColor: item.color }"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="flex min-w-0 items-center gap-2">
              <span
                class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                :class="item.logo ? 'bg-white ring-1 ring-white/15' : ''"
                :style="
                  item.logo
                    ? undefined
                    : { backgroundColor: `${item.color}22`, color: item.color }
                "
              >
                <img
                  v-if="item.logo"
                  :src="item.logo"
                  alt=""
                  class="size-5 object-contain"
                />
                <PaymentIcon v-else :name="item.icon" class="size-4" />
              </span>
              <span class="truncate text-sm font-semibold text-[var(--app-text-strong)]">
                {{ item.label }}
              </span>
            </span>
            <span
              v-if="item.percent >= 0"
              class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
              :style="{
                color: item.color,
                backgroundColor: `${item.color}22`,
              }"
            >
              {{ item.percent }}%
            </span>
          </div>

          <div class="mt-2 flex items-baseline justify-between gap-3">
            <span class="text-xs text-slate-400">المبلغ</span>
            <span class="text-sm font-bold tabular-nums text-[var(--app-text-strong)]">
              {{ formatMoney(item.amount, "locale") }}
            </span>
          </div>
          <div
            v-if="item.feesAmount !== 0"
            class="mt-1 flex items-baseline justify-between gap-3"
          >
            <span class="text-xs text-slate-400">رسوم التحويل</span>
            <span class="text-sm font-semibold tabular-nums text-amber-200">
              {{ formatMoney(item.feesAmount, "locale") }}
            </span>
          </div>
        </li>
      </ul>

      <div
        class="grid gap-2 border-t border-white/10 pt-3"
        :class="feesTotal !== 0 ? 'sm:grid-cols-2' : ''"
      >
        <div class="min-w-0 rounded-lg bg-white/[0.04] px-3 py-2">
          <p class="text-xs text-slate-400">{{ totalLabel }}</p>
          <p class="mt-0.5 break-words text-sm font-bold tabular-nums text-[var(--app-text-strong)]">
            {{ formatMoney(totalAmount, "locale") }}
          </p>
        </div>
        <div
          v-if="feesTotal !== 0"
          class="min-w-0 rounded-lg bg-white/[0.04] px-3 py-2"
        >
          <p class="text-xs text-slate-400">إجمالي رسوم التحويل</p>
          <p class="mt-0.5 break-words text-sm font-bold tabular-nums text-amber-200">
            {{ formatMoney(feesTotal, "locale") }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import PaymentIcon from "~/components/shared/payment/payment-icon/index.vue";
import { formatMoney } from "~/utils/format/money";
import { isFiniteNumber } from "~/utils/format/number";
import {
  PAYMENT_METHOD_KEYS,
  PAYMENT_METHOD_META,
  normalizePaymentMethod,
} from "~/enums/paymentMethod";

defineOptions({ name: "PaymentMethodsReport" });

/** Integer shares that sum to 100, matching the pie slices. */
function sharePercents(shares) {
  const total = shares.reduce((sum, share) => sum + share, 0);
  if (total <= 0) return shares.map(() => 0);

  const floors = shares.map((share) => Math.floor(share));
  let remainder = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = shares
    .map((share, index) => ({ index, fraction: share - Math.floor(share) }))
    .sort((a, b) => b.fraction - a.fraction);

  for (const entry of order) {
    if (remainder <= 0) break;
    floors[entry.index] += 1;
    remainder -= 1;
  }

  return floors;
}

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
  const totals = Object.fromEntries(
    PAYMENT_METHOD_KEYS.map((method) => [method, { amount: 0, feesAmount: 0 }]),
  );

  for (const row of raw) {
    const method = normalizePaymentMethod(row.method || row.value);
    if (!PAYMENT_METHOD_KEYS.includes(method)) continue;
    const amount = Number(row.amount ?? 0);
    const feesAmount = Number(row.feesAmount ?? 0);
    if (isFiniteNumber(amount)) totals[method].amount += amount;
    if (isFiniteNumber(feesAmount)) totals[method].feesAmount += feesAmount;
  }

  const entries = PAYMENT_METHOD_KEYS.filter(
    (method) => totals[method].amount !== 0 || totals[method].feesAmount !== 0,
  )
    .map((method) => {
      const meta = PAYMENT_METHOD_META[method];
      return {
        method,
        label: meta.label,
        icon: meta.icon,
        logo: meta.logo || "",
        amount: Number(totals[method].amount.toFixed(2)),
        feesAmount: Number(totals[method].feesAmount.toFixed(2)),
        color: meta.color,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  const absTotal = entries.reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const shares = entries.map((item) =>
    absTotal > 0 ? (Math.abs(item.amount) / absTotal) * 100 : 0,
  );
  const percents = sharePercents(shares);

  return entries.map((item, index) => ({
    ...item,
    percent: percents[index],
    chartShare: shares[index],
  }));
});

const totalAmount = computed(() =>
  resolvedItems.value.reduce((sum, item) => sum + item.amount, 0),
);

const feesTotal = computed(() =>
  resolvedItems.value.reduce((sum, item) => sum + item.feesAmount, 0),
);

const hasData = computed(() => resolvedItems.value.length > 0);

const chartSummary = computed(() =>
  resolvedItems.value
    .map((item) => `${item.label} ${item.percent}%`)
    .join("، "),
);

const conicGradient = computed(() => {
  const items = resolvedItems.value;
  if (!items.length) return "#262626";

  let cursor = 0;
  const segments = items.map((item) => {
    const start = cursor;
    const end = cursor + item.chartShare;
    cursor = end;
    return `${item.color} ${start}% ${end}%`;
  });

  if (cursor < 100) {
    segments.push(`#262626 ${cursor}% 100%`);
  }

  return `conic-gradient(${segments.join(", ")})`;
});
</script>
