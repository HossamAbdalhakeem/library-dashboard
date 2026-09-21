<template>
  <div
    class="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 p-5"
  >
    <div
      class="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-emerald-400/10 blur-2xl"
    />
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm text-emerald-200/80">{{ title }}</p>
        <p class="mt-2 text-3xl font-extrabold tracking-tight text-white">
          {{ formatMoney(paymentsTotal, "rtl") }}
        </p>
        <p v-if="Number(refundsTotal) > 0" class="mt-2 text-xs text-rose-300">
          بعد خصم الاسترداد {{ formatMoney(refundsTotal, "rtl") }}
        </p>
      </div>
      <span
        class="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300"
      >
        <i class="pi pi-wallet text-lg" />
      </span>
    </div>
    <div
      v-if="chips.length"
      class="mt-5 grid gap-3 text-sm"
      :class="chipGridClass"
    >
      <div
        v-for="chip in chips"
        :key="chip.key || chip.label"
        class="rounded-xl border border-white/5 bg-black/20 px-3 py-2"
      >
        <p class="text-xs text-slate-400">{{ chip.label }}</p>
        <p class="mt-1 font-bold" :class="chip.valueClass || 'text-white'">
          {{ formatChipValue(chip) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatMoney } from "~/utils/format";

defineOptions({ name: "DailyReportHero" });

const props = defineProps({
  title: { type: String, default: "صافي المدفوعات" },
  paymentsTotal: { type: [Number, String], default: 0 },
  refundsTotal: { type: [Number, String], default: 0 },
  /** @type {{ key?: string, label: string, value: number|string, format?: 'money'|'number', valueClass?: string }[]} */
  chips: { type: Array, default: () => [] },
});

const chipGridClass = computed(() => {
  const count = props.chips.length;
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  return "grid-cols-3";
});

const formatChipValue = (chip) => {
  if (chip.format === "money") return formatMoney(chip.value, "rtl");
  return Number(chip.value || 0);
};
</script>
