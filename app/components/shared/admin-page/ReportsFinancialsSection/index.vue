<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-sm"
    dir="rtl"
  >
    <div class="mb-4">
      <p class="font-bold text-white">الأرباح</p>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Skeleton v-for="i in 4" :key="`fin-${i}`" height="4.5rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل بيانات الأرباح."
      @retry="reload"
    />

    <template v-else>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ReportsFinancialMetricCard
          v-for="metric in metrics"
          :key="metric.key"
          :label="metric.label"
          :value="metric.value"
          :accent="metric.accent"
          :icon="metric.icon"
          :emphasized="metric.emphasized"
        />
      </div>
    </template>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format/money";
import { adminReportsApi } from "~/services/reports/admin";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";

defineOptions({ name: "ReportsFinancialsSection" });

const ReportsFinancialMetricCard = defineAsyncComponent(
  () => import("./partials/ReportsFinancialMetricCard.vue"),
);

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => adminReportsApi.getProfitLoss(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل بيانات الأرباح.",
  },
);

const financials = computed(() => data.value || {});

const metrics = computed(() => [
  {
    key: "revenue",
    label: "الإيرادات (صافي المبيعات)",
    value: formatMoney(financials.value.revenue, "locale"),
    accent: "emerald",
    icon: "pi-chart-line",
  },
  {
    key: "cogs",
    label: "تكلفة البضاعة",
    value: formatMoney(financials.value.cogs, "locale"),
    accent: "rose",
    icon: "pi-box",
  },
  {
    key: "grossProfit",
    label: "إجمالي الربح",
    value: formatMoney(financials.value.grossProfit, "locale"),
    accent: "sky",
    icon: "pi-chart-bar",
  },
  {
    key: "netProfit",
    label: "صافي الربح",
    value: formatMoney(financials.value.netProfit, "locale"),
    accent: "emerald",
    icon: "pi-verified",
    emphasized: true,
  },
]);
</script>
