<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <div class="mb-4 min-w-0">
      <p class="font-bold text-white">سجل العمليات</p>
    </div>

    <div v-if="loading && !rows.length" class="space-y-2">
      <Skeleton v-for="i in 5" :key="`ops-skel-${i}`" height="2.4rem" />
    </div>

    <ReportsSectionError
      v-else-if="error"
      :message="error"
      @retry="$emit('retry')"
    />

    <ReportsSectionEmpty
      v-else-if="!loading && !rows.length"
      message="لا توجد عمليات بيع أو حجز خلال الفترة المحددة."
    />

    <StudentOperationsTable
      v-else
      :rows="rows"
      :loading="loading"
      :page="page"
      :page-size="pageSize"
      :total-records="totalRecords"
      :timeline-fetcher="timelineFetcher"
      :show-branch="showBranch"
      @update:page="$emit('update:page', $event)"
    />
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";
import ReportsSectionEmpty from "~/components/dashboard/pages/reports/admin/ReportsSectionEmpty/ReportsSectionEmpty.vue";
import StudentOperationsTable from "./partials/StudentOperationsTable.vue";

defineOptions({ name: "DailyReportStudentOperationsSection" });

defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 15 },
  totalRecords: { type: Number, default: 0 },
  timelineFetcher: { type: Function, default: null },
  showBranch: { type: Boolean, default: false },
});

defineEmits(["retry", "update:page"]);
</script>
