<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-sm"
    dir="rtl"
  >
    <p class="mb-3 font-bold text-white">الاستبدال والاسترداد</p>

    <div v-if="loading" class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Skeleton v-for="i in 3" :key="`ret-${i}`" height="4.5rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل بيانات الاستبدال والاسترداد."
      @retry="reload"
    />

    <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <ReportsFinancialMetricCard
        label="عدد المرتجعات"
        :value="stats.returnsCount ?? 0"
        accent="slate"
        icon="pi-box"
      />
      <ReportsFinancialMetricCard
        label="عدد الاستبدالات"
        :value="stats.exchangesCount ?? 0"
        accent="sky"
        icon="pi-sync"
      />
      <ReportsFinancialMetricCard
        label="المبلغ المسترد"
        :value="formatMoney(stats.refundedAmount, 'locale')"
        accent="rose"
        icon="pi-wallet"
      />
    </div>
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format";
import { reportService } from "~/services/reportService";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsFinancialMetricCard from "~/components/dashboard/pages/reports/admin/ReportsFinancialsSection/partials/ReportsFinancialMetricCard.vue";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";

defineOptions({ name: "ReportsReturnsExchangesSection" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => reportService.getAdminReturnsExchanges(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل بيانات الاستبدال والاسترداد.",
  },
);

const stats = computed(() => data.value || {});
</script>
