<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-sm"
    dir="rtl"
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
      <p class="font-bold text-white">المبيعات والإيرادات</p>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Skeleton v-for="i in 3" :key="`rev-${i}`" height="4.5rem" />
    </div>

    <ReportsSectionError v-else-if="error" :message="error" @retry="reload" />

    <template v-else>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <ReportsFinancialMetricCard
          label="إجمالي المبيعات"
          :value="formatMoney(revenue.grossSales, 'locale')"
          accent="slate"
          icon="pi-shopping-cart"
        />
        <ReportsFinancialMetricCard
          label="المرتجعات"
          :value="formatMoney(revenue.returns, 'locale')"
          accent="rose"
          icon="pi-replay"
        />
        <ReportsFinancialMetricCard
          label="صافي المبيعات"
          :value="formatMoney(revenue.netSales, 'locale')"
          accent="emerald"
          icon="pi-chart-line"
          emphasized
        />
      </div>
    </template>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import ReportsFinancialMetricCard from "~/components/shared/admin-page/ReportsFinancialsSection/partials/ReportsFinancialMetricCard.vue";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";
import { adminReportsApi } from "~/services/reports/admin";
import { formatMoney } from "~/utils/format/money";
import { useAdminReportSection } from "~/composables/useAdminReportSection";

defineOptions({ name: "ReportsRevenueSection" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => adminReportsApi.getRevenue(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل بيانات المبيعات والإيرادات.",
  },
);

const revenue = computed(() => data.value || {});
</script>
