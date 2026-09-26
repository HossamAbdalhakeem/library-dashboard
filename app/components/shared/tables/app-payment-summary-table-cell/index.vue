<template>
  <div
    class="inline-flex min-w-[9.5rem] flex-col gap-1.5 rounded-xl border border-white/10 bg-slate-900/40 px-2.5 py-2 text-right"
    dir="rtl"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="text-[11px] text-slate-400">المقدم</span>
      <span
        class="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-xs font-bold text-emerald-300"
      >
        {{ payment?.paidAmountLabel || "—" }}
      </span>
    </div>

    <div class="flex items-center justify-between gap-2">
      <span class="text-[11px] text-slate-400">الدفع</span>
      <PaymentProofThumb
        :method="payment?.method"
        :method-label="payment?.methodLabel"
        :payment-id="payment?.id"
        :has-proof="payment?.image?.hasProof"
      />
    </div>

    <div class="flex items-center justify-between gap-2">
      <span class="text-[11px] text-slate-400">المتبقي</span>
      <span
        class="rounded-md px-1.5 py-0.5 text-xs font-bold"
        :class="
          payment?.hasRemaining
            ? 'bg-orange-500/20 text-orange-300'
            : 'bg-emerald-500/20 text-emerald-300'
        "
      >
        {{ payment?.remainingAmountLabel || "—" }}
      </span>
    </div>
  </div>
</template>

<script setup>
import PaymentProofThumb from "~/components/shared/payment/payment-proof-thumb/index.vue";

defineOptions({ name: "AppPaymentSummaryTableCell" });

defineProps({
  payment: { type: Object, default: null },
});
</script>
