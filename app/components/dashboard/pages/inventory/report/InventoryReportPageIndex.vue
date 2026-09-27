<template>
  <div class="w-full min-w-0 space-y-6 overflow-x-hidden text-right" dir="rtl">
    <div class="flex w-full min-w-0 flex-col gap-3">
      <div class="min-w-0">
        <h2 class="text-xl font-bold text-[var(--app-text-strong)]">تقرير المخزن</h2>
      </div>
      <ReportsFilters
        v-model:book="selectedBook"
        v-model:branch="selectedBranch"
        v-model:teacher="selectedTeacher"
        v-model:study-year="selectedStudyYear"
        v-model:from="dateFrom"
        v-model:to="dateTo"
        v-model:period="selectedPeriod"
        :academic-year-range="academicYearRange"
        :loading="loading"
        class="w-full min-w-0"
        @change="onFiltersChange"
        @refresh="refresh"
      />
    </div>

    <ReportsInventorySection
      :params="reportParams"
      :reload-key="reloadKey"
      @loading="loading = $event"
    />
  </div>
</template>

<script setup>
import ReportsFilters from "~/components/dashboard/pages/reports/admin/ReportsFilters/ReportsFilters.vue";
import { useAdminReportFilters } from "~/composables/useAdminReportFilters";

const ReportsInventorySection = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/admin/ReportsInventorySection/ReportsInventorySection.vue"
  ),
);

defineOptions({ name: "InventoryReportPageIndex" });

const loading = ref(false);
const {
  academicYearRange,
  dateFrom,
  dateTo,
  selectedPeriod,
  selectedBranch,
  selectedBook,
  selectedTeacher,
  selectedStudyYear,
  reloadKey,
  reportParams,
  refresh,
  onFiltersChange,
} = useAdminReportFilters();
</script>
