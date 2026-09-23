<template>
  <div class="space-y-6 text-right" dir="rtl">
    <div
      class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between"
    >
      <div class="min-w-0">
        <h2 class="text-xl font-bold text-white">تقرير خدمة العملاء</h2>
        <p class="mt-1 text-sm text-slate-400">
          نشاطك عبر كل الفروع — المدفوعات وسجل عمليات البيع والحجز
        </p>
      </div>

      <DailyReportFilters
        :loading="filtersLoading"
        @change="onFiltersChange"
        @refresh="onRefresh"
      />
    </div>

    <template v-if="filterParams">
      <CustomerServiceReportOverview
        :params="filterParams"
        :reload-key="reloadKey"
        @loading="overviewLoading = $event"
      />

      <div class="mt-2 space-y-4">
        <CustomerServiceStudentOperationsSection
          :params="filterParams"
          :reload-key="reloadKey"
          @loading="studentLoading = $event"
        />
      </div>
    </template>
  </div>
</template>

<script setup>
import DailyReportFilters from "~/components/dashboard/pages/reports/daily/DailyReportFilters/index.vue";

defineOptions({ name: "CustomerServiceReportsPageIndex" });

const CustomerServiceReportOverview = defineAsyncComponent(() =>
  import("./CustomerServiceReportOverview/index.vue"),
);
const CustomerServiceStudentOperationsSection = defineAsyncComponent(() =>
  import("./CustomerServiceStudentOperationsSection/index.vue"),
);

const filterParams = ref(null);
const reloadKey = ref(0);
const overviewLoading = ref(false);
const studentLoading = ref(false);

const filtersLoading = computed(
  () => overviewLoading.value || studentLoading.value,
);

const onFiltersChange = (params) => {
  filterParams.value = params;
};

const onRefresh = () => {
  reloadKey.value += 1;
};
</script>
