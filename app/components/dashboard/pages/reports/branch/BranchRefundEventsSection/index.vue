<template>
  <DailyReportRefundEventsSection
    :rows="rows"
    :loading="loading"
    :error="error"
    :page="page"
    :page-size="pageSize"
    :total-records="total"
    :total-amount="totalAmount"
    @retry="reload"
    @update:page="setPage"
  />
</template>

<script setup>
import { branchReportsApi } from "~/services/reports/branch";
import { usePaginatedReportSection } from "~/composables/usePaginatedReportSection";

defineOptions({ name: "BranchRefundEventsSection" });

const DailyReportRefundEventsSection = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/daily/DailyReportRefundEventsSection/index.vue"
  ),
);

const props = defineProps({
  params: { type: Object, default: null },
  reloadKey: { type: Number, default: 0 },
  pageSize: { type: Number, default: 15 },
});

const emit = defineEmits(["loading"]);

const totalAmount = ref(0);

const { loading, rows, error, total, page, setPage, reload } =
  usePaginatedReportSection(
    async (query) => {
      const payload = await branchReportsApi.getSection("refunds", query);
      totalAmount.value = Number(payload?.totals?.amount || 0);
      return payload;
    },
    {
      params: toRef(props, "params"),
      reloadKey: toRef(props, "reloadKey"),
      pageSize: toRef(props, "pageSize"),
      emit,
      errorMessage: "تعذر تحميل المرتجعات والإلغاءات.",
      toastOnError: true,
    },
  );
</script>
