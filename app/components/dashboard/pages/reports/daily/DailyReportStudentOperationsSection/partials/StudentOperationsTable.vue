<template>
  <div>
    <AppDataTable
      data-key="id"
      :value="displayRows"
      :columns="columns"
      :loading="loading"
      lazy
      paginator
      :rows="pageSize"
      :first="first"
      :total-records="totalRecords"
      :empty-message="emptyMessage"
      @page="onPage"
    >
      <template #time="{ data }">
        <AppDatetimeTableCell :value="data.createdAt" />
      </template>

      <template #type="{ data }">
        <span class="ops-tag" :style="metricTagStyle(data.typeColor)">
          {{ data.typeLabel }}
        </span>
      </template>

      <template #status="{ data }">
        <span class="ops-tag" :style="metricTagStyle(data.statusColor)">
          {{ data.statusLabel }}
        </span>
      </template>

      <template #product="{ data }">
        <AppProductTableCell :product="data.productObj" />
      </template>

      <template #student="{ data }">
        <AppStudentTableCell
          :student="{ name: data.studentName, phone: data.phone }"
        />
      </template>

      <template #totalAmount="{ data }">
        <span
          class="ops-tag tabular-nums"
          :style="metricTagStyle(STUDENT_OPS_METRIC_COLORS.price)"
        >
          {{ data.totalAmount }}
        </span>
      </template>

      <template #paidAmount="{ data }">
        <div class="flex flex-col items-center gap-0.5">
          <span
            class="ops-tag tabular-nums"
            :style="metricTagStyle(STUDENT_OPS_METRIC_COLORS.paid)"
          >
            {{ data.paidAmount }}
          </span>
          <span
            v-if="data.deliveryPaidNote"
            class="mt-1 max-w-full whitespace-nowrap text-center text-[0.65rem] font-semibold leading-4 text-white/70 tabular-nums"
          >
            عند التسليم: {{ data.deliveryPaidNote }}
          </span>
        </div>
      </template>

      <template #remainingAmount="{ data }">
        <span
          class="ops-tag tabular-nums"
          :style="
            metricTagStyle(
              data.remainingRaw > 0
                ? STUDENT_OPS_METRIC_COLORS.remaining
                : STUDENT_OPS_METRIC_COLORS.remainingZero,
            )
          "
        >
          {{ data.remainingAmount }}
        </span>
      </template>

      <template #timeline="{ data }">
        <Button
          icon="pi pi-history"
          text
          rounded
          size="small"
          severity="secondary"
          title="السجل"
          data-testid="operation-timeline-open"
          aria-label="السجل"
          @click="openTimeline(data)"
        />
      </template>
    </AppDataTable>

    <OperationTimelineDialog
      v-model:visible="timelineVisible"
      :header="timelineHeader"
      :timeline="activeTimelineEvents"
      :loading="activeTimelineLoading"
      :error="activeTimelineError"
      @retry="retryTimeline"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import AppProductTableCell from "~/components/shared/tables/app-product-table-cell/index.vue";
import AppStudentTableCell from "~/components/shared/tables/app-student-table-cell/index.vue";
import AppDatetimeTableCell from "~/components/shared/tables/app-datetime-table-cell/index.vue";
import OperationTimelineDialog from "~/components/shared/dialog/operation-timeline-dialog/index.vue";
import { useOperationTimeline } from "~/composables/useOperationTimeline";
import {
  STUDENT_OPS_COLUMNS,
  STUDENT_OPS_METRIC_COLORS,
  mapStudentOperationRows,
  metricTagStyle,
} from "~/utils/studentOperationsReport";

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/tables/app-data-table/index.vue"),
);

defineOptions({ name: "StudentOperationsTable" });

const props = defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  page: { type: Number, default: 1 },
  pageSize: { type: Number, default: 15 },
  totalRecords: { type: Number, default: 0 },
  timelineFetcher: { type: Function, default: null },
  showBranch: { type: Boolean, default: false },
  emptyMessage: {
    type: String,
    default: "لا توجد عمليات بيع أو حجز أو تسليم خلال الفترة المحددة.",
  },
});

const emit = defineEmits(["update:page"]);

const timelineVisible = ref(false);
const selectedTimelineId = ref(null);
const selectedTimelineLabel = ref("");

const { timelineState, getTimelineEvents, loadTimeline } = useOperationTimeline(
  (operationId) => props.timelineFetcher?.(operationId),
);

const columns = computed(() => {
  if (!props.showBranch) return STUDENT_OPS_COLUMNS;
  const cols = [...STUDENT_OPS_COLUMNS];
  const studentIdx = cols.findIndex((c) => c.field === "studentName");
  const branchCol = { field: "branchName", header: "الفرع" };
  if (studentIdx >= 0) cols.splice(studentIdx, 0, branchCol);
  else cols.splice(4, 0, branchCol);
  return cols;
});

const first = computed(() =>
  Math.max(0, (Number(props.page) - 1) * props.pageSize),
);

const displayRows = computed(() => mapStudentOperationRows(props.rows));

const activeTimelineEvents = computed(() =>
  getTimelineEvents(selectedTimelineId.value),
);
const activeTimelineLoading = computed(
  () => !!timelineState[selectedTimelineId.value]?.loading,
);
const activeTimelineError = computed(
  () => timelineState[selectedTimelineId.value]?.error || "",
);
const timelineHeader = computed(() =>
  selectedTimelineLabel.value
    ? `سجل العملية · ${selectedTimelineLabel.value}`
    : "سجل العملية",
);

const openTimeline = (row) => {
  const id = row?.id || null;
  if (!id) return;
  selectedTimelineId.value = id;
  selectedTimelineLabel.value =
    row.operationNumber || row.typeLabel || row.studentName || "";
  timelineVisible.value = true;
  loadTimeline(id);
};

const retryTimeline = () => {
  if (selectedTimelineId.value) loadTimeline(selectedTimelineId.value);
};

const onPage = (event) => {
  const nextPage = Math.floor(Number(event?.first || 0) / props.pageSize) + 1;
  emit("update:page", nextPage);
};
</script>

<style scoped>
.ops-tag {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 9999px;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.25rem;
}
</style>
