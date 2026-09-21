<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <p class="mb-3 font-bold text-white">أداء الفروع</p>

    <div v-if="loading" class="space-y-2">
      <Skeleton v-for="i in 4" :key="`br-${i}`" width="100%" height="2.2rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل أداء الفروع."
      @retry="reload"
    />

    <AppDataTable
      v-else
      :value="rows"
      :columns="columns"
      empty-message="لا توجد بيانات فروع خلال الفترة المحددة."
    />
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format";
import { reportService } from "~/services/reportService";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";

defineOptions({ name: "ReportsBranchesSection" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => reportService.getAdminBranches(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل أداء الفروع.",
  },
);

const columns = [
  { field: "branchName", header: "الفرع" },
  { field: "salesLabel", header: "المبيعات" },
  { field: "salesCount", header: "عدد العمليات" },
  { field: "reservations", header: "الحجوزات" },
  { field: "returnsLabel", header: "المرتجعات" },
  { field: "expensesLabel", header: "المصروفات" },
  { field: "netSalesLabel", header: "صافي المبيعات" },
];

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
