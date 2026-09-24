<template>
  <section
    class="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-slate-900 p-4"
    dir="rtl"
  >
    <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="min-w-0">
        <p class="font-bold text-white">{{ title }}</p>
        <p v-if="subtitle" class="mt-1 text-xs text-slate-400">{{ subtitle }}</p>
      </div>

      <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
        <AppOperationTypeFilter
          v-model="selectedType"
          :labels="typeFilterLabels"
          label="نوع العملية"
          :disabled="loading"
          @change="onTypeChange"
        />
      </div>
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
      :message="emptyMessage"
    />

    <OperationsTable
      v-else
      :rows="rows"
      :type-labels="typeLabels"
      :loading="loading"
      :page="page"
      :page-size="pageSize"
      :total-records="totalRecords"
      :empty-message="emptyMessage"
      @update:page="$emit('update:page', $event)"
    />
  </section>
</template>

<script setup>
import Skeleton from "primevue/skeleton";
import ReportsSectionError from "~/components/dashboard/pages/reports/admin/ReportsSectionError/ReportsSectionError.vue";
import ReportsSectionEmpty from "~/components/dashboard/pages/reports/admin/ReportsSectionEmpty/ReportsSectionEmpty.vue";
import AppOperationTypeFilter from "~/components/shared/reports/app-operation-type-filter/index.vue";
import OperationsTable from "./partials/OperationsTable.vue";

defineOptions({ name: "DailyReportOperationsSection" });

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  emptyMessage: {
    type: String,
    default: "لا توجد عمليات خلال الفترة المحددة.",
  },
  typeLabels: { type: Object, default: () => ({}) },
  filterLabels: { type: Object, default: null },
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 15 },
  totalRecords: { type: Number, default: 0 },
  movementType: { type: String, default: null },
});

const emit = defineEmits(["retry", "update:page", "update:movementType"]);

const selectedType = ref(props.movementType || null);

watch(
  () => props.movementType,
  (value) => {
    selectedType.value = value || null;
  },
);

const typeFilterLabels = computed(() => {
  if (props.filterLabels && Object.keys(props.filterLabels).length) {
    return props.filterLabels;
  }
  return props.typeLabels || {};
});

const onTypeChange = (value) => {
  emit("update:movementType", value || null);
};
</script>
