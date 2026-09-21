<template>
  <DailyReportOperationsSection
    title="عمليات المخزن"
    subtitle="إضافة وسحب المخزون"
    empty-message="لا توجد عمليات مخزن خلال الفترة المحددة."
    :type-labels="stockTypeLabels"
    :rows="rows"
    :loading="loading"
    :error="error"
    :page="page"
    :page-size="pageSize"
    :total-records="total"
    :movement-type="movementType"
    @retry="reload"
    @update:page="setPage"
    @update:movement-type="onMovementType"
  />
</template>

<script setup>
import { STOCK_OPERATION_LABELS } from "~/utils/domainLabels";
import { reportService } from "~/services/reportService";
import { usePaginatedReportSection } from "~/composables/usePaginatedReportSection";

defineOptions({ name: "BranchStockOperationsSection" });

const DailyReportOperationsSection = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/daily/DailyReportOperationsSection/index.vue"
  ),
);

const props = defineProps({
  params: { type: Object, default: null },
  reloadKey: { type: Number, default: 0 },
  pageSize: { type: Number, default: 15 },
});

const emit = defineEmits(["loading"]);

const movementType = ref(null);
const stockTypeLabels = STOCK_OPERATION_LABELS;

const { loading, rows, error, total, page, setPage, reload } =
  usePaginatedReportSection(
    (query) =>
      reportService.getBranchSection("stockOperations", {
        ...query,
        ...(movementType.value ? { movementType: movementType.value } : {}),
      }),
    {
      params: toRef(props, "params"),
      reloadKey: toRef(props, "reloadKey"),
      pageSize: toRef(props, "pageSize"),
      emit,
      errorMessage: "تعذر تحميل عمليات المخزن.",
    },
  );

watch(
  () =>
    JSON.stringify({
      from: props.params?.from || null,
      to: props.params?.to || null,
      reloadKey: props.reloadKey,
    }),
  () => {
    movementType.value = null;
  },
  { flush: "sync" },
);

const onMovementType = (type) => {
  movementType.value = type || null;
  if (page.value !== 1) {
    setPage(1);
  } else {
    reload();
  }
};
</script>
