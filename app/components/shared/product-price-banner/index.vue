<template>
  <div
    class="md:col-span-2 rounded-2xl border border-amber-400/40 bg-gradient-to-l from-amber-500/20 via-orange-500/10 to-slate-900 px-4 py-5 text-center sm:px-6 sm:py-8"
  >
    <p class="mb-2 text-sm font-medium text-amber-100/80">
      {{ label }}
    </p>
    <p
      class="text-3xl font-extrabold tracking-tight text-amber-300 sm:text-4xl md:text-5xl"
    >
      {{ formatMoney(amount) }}
    </p>
  </div>
</template>

<script setup>
import { formatMoney } from "~/utils/format/money";

defineOptions({ name: "ProductPriceBanner" });

defineProps({
  amount: { type: [Number, String], default: 0 },
  label: { type: String, default: "مبلغ المنتج" },
});
</script>
