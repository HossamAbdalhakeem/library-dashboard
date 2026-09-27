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
        :show-period="false"
        search-mode
        :loading="loading"
        class="w-full min-w-0"
        @search="onSearch"
      />
    </div>

    <ReportsInventorySection
      :params="appliedParams"
      :search-key="searchKey"
      @loading="loading = $event"
    />
  </div>
</template>

<script setup>
import ReportsFilters from "~/components/dashboard/pages/reports/admin/ReportsFilters/ReportsFilters.vue";
import { useAcademicYear } from "~/composables/useAcademicYear";

const ReportsInventorySection = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reports/admin/ReportsInventorySection/ReportsInventorySection.vue"
  ),
);

defineOptions({ name: "InventoryReportPageIndex" });

const { academicYearId } = useAcademicYear();
const loading = ref(false);
const selectedBranch = ref("all");
const selectedBook = ref(null);
const selectedTeacher = ref(null);
const selectedStudyYear = ref(null);
const appliedParams = ref(null);
const searchKey = ref(0);

const onSearch = () => {
  const params = {};
  if (academicYearId.value) params.academicYearId = academicYearId.value;
  if (selectedBranch.value && selectedBranch.value !== "all") {
    params.branchId = selectedBranch.value;
  }
  if (selectedBook.value) params.productId = selectedBook.value;
  if (selectedTeacher.value) params.teacherId = selectedTeacher.value;
  if (selectedStudyYear.value) params.studyYearId = selectedStudyYear.value;
  appliedParams.value = params;
  searchKey.value += 1;
};
</script>
