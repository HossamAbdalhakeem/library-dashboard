<template>
  <div
    class="relative h-full overflow-hidden rounded-2xl border border-emerald-600/20 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/80 p-5 dark:border-emerald-500/20 dark:from-emerald-950/80 dark:via-slate-900 dark:to-slate-900"
  >
    <div
      class="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/15 blur-2xl dark:bg-emerald-400/10"
    />
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-medium text-emerald-700 dark:text-emerald-200/80">
          {{ title }}
        </p>
        <p class="mt-2 text-3xl font-extrabold tracking-tight text-[var(--app-text-strong)] dark:text-white">
          {{ formatMoney(paymentsTotal) }}
        </p>
        <p v-if="Number(refundsTotal) > 0" class="mt-2 text-xs text-rose-700 dark:text-rose-300">
          بعد خصم الاسترداد {{ formatMoney(refundsTotal) }}
        </p>
      </div>
      <span
        class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
      >
        <i class="pi pi-wallet text-lg" />
      </span>
    </div>
    <div
      v-if="chips.length"
      class="mt-5 grid grid-cols-2 gap-3 text-sm"
    >
      <div
        v-for="chip in chips"
        :key="chip.key || chip.label"
        class="min-w-0 rounded-xl border border-emerald-900/10 bg-white/80 px-4 py-3 dark:border-white/5 dark:bg-black/20"
      >
        <p class="text-xs text-[var(--app-muted)]">{{ chip.label }}</p>
        <p class="mt-1 font-bold" :class="chip.valueClass || 'text-[var(--app-text-strong)] dark:text-white'">
          {{ formatChipValue(chip) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatMoney } from "~/utils/format/money";

defineOptions({ name: "DailyReportHero" });

defineProps({
  title: { type: String, default: "صافي المدفوعات" },
  paymentsTotal: { type: [Number, String], default: 0 },
  refundsTotal: { type: [Number, String], default: 0 },
  /** @type {{ key?: string, label: string, value: number|string, format?: 'money'|'number', valueClass?: string }[]} */
  chips: { type: Array, default: () => [] },
});

const formatChipValue = (chip) => {
  if (chip.format === "money") return formatMoney(chip.value);
  return Number(chip.value || 0);
};
</script>
