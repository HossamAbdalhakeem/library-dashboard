<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <p class="mb-3 font-bold text-white">حركة المنتجات</p>

    <div v-if="loading" class="space-y-2">
      <Skeleton v-for="i in 5" :key="`prod-${i}`" width="100%" height="2.2rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      message="تعذر تحميل حركة المنتجات."
      @retry="reload"
    />

    <AppDataTable
      v-else
      :value="rows"
      :columns="columns"
      empty-message="لا توجد بيانات منتجات خلال الفترة المحددة."
    />
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import { formatMoney } from "~/utils/format";
import { reportService } from "~/services/reportService";
import { useAdminReportSection } from "~/composables/useAdminReportSection";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/index.vue";

defineOptions({ name: "ReportsProductsSection" });

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/app-data-table/index.vue"),
);

const props = defineProps({
  params: { type: Object, default: () => ({}) },
  reloadKey: { type: Number, default: 0 },
});

const emit = defineEmits(["loading"]);

const { loading, data, error, reload } = useAdminReportSection(
  (params) => reportService.getAdminProducts(params),
  {
    params: toRef(props, "params"),
    reloadKey: toRef(props, "reloadKey"),
    emit,
    errorMessage: "تعذر تحميل حركة المنتجات.",
  },
);

const columns = [
  { field: "productName", header: "المنتج" },
  { field: "quantitySold", header: "الكمية المباعة" },
  { field: "salesAmountLabel", header: "المبيعات" },
  { field: "profitLabel", header: "الربح" },
  { field: "remainingQuantity", header: "المتبقي" },
];

const rows = computed(() =>
  (Array.isArray(data.value?.products) ? data.value.products : []).map(
    (row) => ({
      ...row,
      salesAmountLabel: formatMoney(row.salesAmount, "locale"),
      profitLabel: formatMoney(row.profit, "locale"),
    }),
  ),
);
</script>
