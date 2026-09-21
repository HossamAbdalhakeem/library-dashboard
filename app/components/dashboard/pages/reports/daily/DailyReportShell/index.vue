<template>
  <div class="space-y-6 text-right" dir="rtl">
    <div
      class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between"
    >
      <div class="min-w-0">
        <h2 class="text-xl font-bold text-white">{{ title }}</h2>
        <p class="mt-1 text-sm text-slate-400">{{ subtitle }}</p>
      </div>

      <slot name="filters" />
    </div>

    <DailyReportSkeleton v-if="loading" />

    <template v-else>
      <div class="grid gap-4 xl:grid-cols-3 xl:items-start">
        <div class="flex flex-col gap-4 xl:col-span-1">
          <DailyReportHero
            :title="heroTitle"
            :payments-total="paymentsTotal"
            :refunds-total="refundsTotal"
            :chips="heroChips"
          />
        </div>
        <PaymentMethodsReport
          class="xl:col-span-2"
          :items="paymentMethodItems"
          :total-label="paymentTotalLabel"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
defineOptions({ name: "DailyReportShell" });

const DailyReportSkeleton = defineAsyncComponent(() =>
  import("./partials/DailyReportSkeleton.vue"),
);
const DailyReportHero = defineAsyncComponent(() =>
  import("./partials/DailyReportHero.vue"),
);
const PaymentMethodsReport = defineAsyncComponent(() =>
  import("~/components/shared/payment-methods-report/index.vue"),
);

defineProps({
  title: { type: String, default: "التقرير" },
  subtitle: { type: String, default: "" },
  heroTitle: { type: String, default: "صافي المدفوعات" },
  paymentTotalLabel: { type: String, default: "إجمالي المحصل" },
  loading: { type: Boolean, default: false },
  paymentsTotal: { type: [Number, String], default: 0 },
  refundsTotal: { type: [Number, String], default: 0 },
  heroChips: { type: Array, default: () => [] },
  paymentMethodItems: { type: Array, default: () => [] },
});
</script>
