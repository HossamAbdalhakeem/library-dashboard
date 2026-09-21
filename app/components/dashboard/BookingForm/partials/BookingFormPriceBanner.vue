<template>
  <div
    class="md:col-span-2 rounded-2xl px-4 py-5 text-center sm:px-6 sm:py-8"
    :class="
      isCustomerService
        ? 'border border-primary-400/25 bg-black'
        : 'border border-slate-700 bg-black'
    "
  >
    <p
      class="mb-2 text-sm font-medium"
      :class="isCustomerService ? 'text-primary-200/80' : 'text-slate-300'"
    >
      {{ option?.priceKindLabel || "مبلغ المنتج" }}
    </p>
    <p
      class="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl"
      :class="isCustomerService ? 'text-primary-300' : 'text-white'"
    >
      {{ formatMoney(price, "rtl") }}
    </p>
  </div>
</template>

<script setup>
import { formatMoney } from "~/utils/format";

defineOptions({ name: "BookingFormPriceBanner" });

defineProps({
  option: { type: Object, default: null },
  price: { type: Number, default: 0 },
  isCustomerService: { type: Boolean, default: false },
});
</script>
