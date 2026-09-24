<template>
  <DailyReportStudentOperationsSection
    :rows="rows"
    :loading="loading"
    :error="error"
    :page="page"
    :page-size="pageSize"
    :total-records="total"
    :timeline-fetcher="timelineFetcher"
    @retry="reload"
    @update:page="setPage"
  />
</template>

<script setup>
import { branchReportsApi } from "~/services/reports/branch";
import { usePaginatedReportSection } from "~/composables/usePaginatedReportSection";

defineOptions({ name: "BranchStudentOperationsSection" });

const DailyReportStudentOperationsSection = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/daily/DailyReportStudentOperationsSection/DailyReportStudentOperationsSection.vue"
  ),
);

const props = defineProps({
  params: { type: Object, default: null },
  reloadKey: { type: Number, default: 0 },
  pageSize: { type: Number, default: 15 },
});

const emit = defineEmits(["loading"]);

const timelineFetcher = (operationId) =>
  branchReportsApi.getOperationTimeline(operationId);

const { loading, rows, error, total, page, setPage, reload } =
  usePaginatedReportSection(
    (query) => branchReportsApi.getSection("studentOperations", query),
    {
      params: toRef(props, "params"),
      reloadKey: toRef(props, "reloadKey"),
      pageSize: toRef(props, "pageSize"),
      emit,
      errorMessage: "تعذر تحميل سجل العمليات.",
    },
  );
</script>
