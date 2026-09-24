<template>
  <div class="space-y-6 text-right" dir="rtl">
    <div
      class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between"
    >
      <div class="min-w-0">
        <h2 class="text-xl font-bold text-white">التقرير</h2>
        <p class="mt-1 text-sm text-slate-400">
          نظرة سريعة على نشاط الفرع والمدفوعات وعمليات الطلاب والمخزن
        </p>
      </div>

      <DailyReportFilters
        :loading="filtersLoading"
        @change="onFiltersChange"
        @refresh="onRefresh"
      />
    </div>

    <template v-if="filterParams">
      <BranchReportOverview
        :params="filterParams"
        :reload-key="reloadKey"
        @loading="overviewLoading = $event"
      />

      <div class="mt-2 space-y-4">
        <BranchStudentOperationsSection
          :params="filterParams"
          :reload-key="reloadKey"
          @loading="studentLoading = $event"
        />

        <BranchRefundEventsSection
          :params="filterParams"
          :reload-key="reloadKey"
          @loading="refundsLoading = $event"
        />

        <BranchStockOperationsSection
          :params="filterParams"
          :reload-key="reloadKey"
          @loading="stockLoading = $event"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import DailyReportFilters from "~/components/dashboard/pages/reports/daily/DailyReportFilters/DailyReportFilters.vue";

defineOptions({ name: "BranchEmployeeReportsPageIndex" });

const BranchReportOverview = defineAsyncComponent(() =>
  import("./BranchReportOverview/BranchReportOverview.vue"),
);
const BranchStudentOperationsSection = defineAsyncComponent(() =>
  import("./BranchStudentOperationsSection/BranchStudentOperationsSection.vue"),
);
const BranchRefundEventsSection = defineAsyncComponent(() =>
  import("./BranchRefundEventsSection/BranchRefundEventsSection.vue"),
);
const BranchStockOperationsSection = defineAsyncComponent(() =>
  import("./BranchStockOperationsSection/BranchStockOperationsSection.vue"),
);

const filterParams = ref(null);
const reloadKey = ref(0);
const overviewLoading = ref(false);
const studentLoading = ref(false);
const refundsLoading = ref(false);
const stockLoading = ref(false);

const filtersLoading = computed(
  () =>
    overviewLoading.value ||
    studentLoading.value ||
    refundsLoading.value ||
    stockLoading.value,
);

const onFiltersChange = (params) => {
  filterParams.value = params;
};

const onRefresh = () => {
  reloadKey.value += 1;
};
</script>
