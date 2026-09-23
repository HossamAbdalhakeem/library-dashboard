<template>
  <div class="space-y-3 text-right text-slate-200">
    <p class="text-sm">
      هل أنت متأكد من تسليم الحجز
      <span class="font-bold text-white">
        {{ reservation?.reservationNumber }}
      </span>
      ؟
    </p>

    <div
      v-if="needsRemainingPayment"
      class="rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-center"
    >
      <p class="text-sm font-medium text-orange-200">
        تأكد من تحصيل المبلغ المتبقي من الطالب قبل التسليم
      </p>
      <p class="mt-2 text-3xl font-extrabold text-orange-300">
        {{ formatMoney(reservation?.remainingAmount) }}
      </p>
      <p class="mt-2 text-xs text-slate-300">
        طريقة الدفع: {{ methodLabel }}
      </p>
    </div>

    <p v-else class="text-sm text-emerald-300">
      لا يوجد مبلغ متبقي. سيتم التسليم مباشرة.
    </p>
  </div>
</template>

<script setup>
import { formatMoney } from "~/utils/format/money";

defineProps({
  reservation: { type: Object, default: null },
  needsRemainingPayment: { type: Boolean, default: false },
  methodLabel: { type: String, default: "-" },
});
</script>
