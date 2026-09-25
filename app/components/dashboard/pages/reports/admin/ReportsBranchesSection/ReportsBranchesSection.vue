<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <p class="mb-3 font-bold text-white">أداء الفروع</p>
    <!-- <p class="mb-3 text-xs text-slate-400">
      المبيعات بإجمالي البيع · المرتجعات بتاريخ الإرجاع · صافي المبيعات = المبيعات − المرتجعات
    </p> -->

    <div v-if="loading" class="space-y-2">
      <Skeleton v-for="i in 4" :key="`br-${i}`" width="100%" height="2.2rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل أداء الفروع."
      @retry="reload"
    />

    <BranchesTable v-else :rows="rows" />
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format/money";
import { adminReportsApi } from "~/services/reports/admin";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";
import BranchesTable from "./partials/BranchesTable.vue";

defineOptions({ name: "ReportsBranchesSection" });

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => adminReportsApi.getBranches(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل أداء الفروع.",
  },
);

const rows = computed(() =>
  (Array.isArray(data.value?.branches) ? data.value.branches : []).map(
    (row) => ({
      ...row,
      salesLabel: formatMoney(row.sales, "locale"),
      returnsLabel: formatMoney(row.returns, "locale"),
      expensesLabel: formatMoney(row.expenses, "locale"),
      netSalesLabel: formatMoney(row.netSales, "locale"),
    }),
  ),
);
</script>
