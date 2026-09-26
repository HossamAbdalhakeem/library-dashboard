<template>
  <div>
    <AppDataTable
      data-key="id"
      :value="reservations"
      :columns="columns"
      :loading="loading"
      paginator
      lazy
      :rows="rows"
      :first="first"
      :total-records="totalRecords"
      empty-message="لا توجد حجوزات."
      @page="$emit('page', $event)"
    >
      <template #createdAt="{ data }">
        <AppDatetimeTableCell :value="data.createdAt" />
      </template>

      <template #product="{ data }">
        <AppProductTableCell :product="data.productCell" />
      </template>

      <template #student="{ data }">
        <AppStudentTableCell
          :student="{ name: data.studentName, phone: data.phone }"
        />
      </template>

      <template #paymentSummary="{ data }">
        <AppPaymentSummaryTableCell :payment="data.payment" />
      </template>

      <template #status="{ data }">
        <AppStatusTableCell
          kind="reservation"
          :code="data.status"
          :label="data.statusLabel"
        />
      </template>

      <template #createdBy="{ data }">
        <div class="flex flex-col items-center gap-1 text-center">
          <span class="text-sm font-medium">{{ data.createdBy?.fullName }}</span>
          <AppStatusTableCell
            v-if="data.createdBy?.roleLabel && data.createdBy.roleLabel !== '-'"
            :label="data.createdBy.roleLabel"
            severity="secondary"
          />
          <span
            v-if="data.branchName && data.branchName !== '-'"
            class="text-xs text-slate-500"
          >
            {{ data.branchName }}
          </span>
          <span class="text-xs text-slate-500">
            الكمية: {{ data.quantity ?? 1 }}
          </span>
        </div>
      </template>

      <template #timeline="{ data }">
        <Button
          icon="pi pi-history"
          text
          rounded
          size="small"
          severity="secondary"
          title="السجل"
          data-testid="reservation-timeline-open"
          aria-label="السجل"
          @click="openTimeline(data)"
        />
      </template>

      <template #actions="{ data }">
        <div class="flex flex-wrap justify-center gap-1">
          <Button
            v-if="canModify(data)"
            label="استبدال منتج"
            icon="pi pi-sync"
            text
            size="small"
            severity="primary"
            data-testid="reservation-change-product"
            @click="$emit('change-product', data)"
          />
          <Button
            v-if="canModify(data)"
            label="إلغاء الحجز"
            icon="pi pi-times"
            text
            size="small"
            severity="danger"
            data-testid="reservation-cancel"
            @click="$emit('cancel', data)"
          />
        </div>
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
import AppDataTable from "~/components/shared/tables/app-data-table/index.vue";
import AppDatetimeTableCell from "~/components/shared/tables/app-datetime-table-cell/index.vue";
import AppStatusTableCell from "~/components/shared/tables/app-status-table-cell/index.vue";
import AppPaymentSummaryTableCell from "~/components/shared/tables/app-payment-summary-table-cell/index.vue";
import AppProductTableCell from "~/components/shared/tables/app-product-table-cell/index.vue";
import AppStudentTableCell from "~/components/shared/tables/app-student-table-cell/index.vue";
import OperationTimelineDialog from "~/components/shared/dialog/operation-timeline-dialog/index.vue";
import { reservationApi } from "~/services/reservation";
import { useOperationTimeline } from "~/composables/useOperationTimeline";

const props = defineProps({
  reservations: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rows: { type: Number, default: 20 },
  first: { type: Number, default: 0 },
  totalRecords: { type: Number, default: 0 },
});

defineEmits(["change-product", "cancel", "page"]);

const timelineVisible = ref(false);
const selectedTimelineId = ref(null);
const selectedTimelineLabel = ref("");

const { timelineState, getTimelineEvents, loadTimeline } = useOperationTimeline(
  (id) => reservationApi.getTimeline(id),
);

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
    ? `سجل الحجز · ${selectedTimelineLabel.value}`
    : "سجل الحجز",
);

const openTimeline = (row) => {
  const id = row?.id || null;
  if (!id) return;
  selectedTimelineId.value = id;
  selectedTimelineLabel.value = row.reservationNumber || "";
  timelineVisible.value = true;
  loadTimeline(id);
};

const retryTimeline = () => {
  if (selectedTimelineId.value) loadTimeline(selectedTimelineId.value);
};

const columns = [
  { field: "timeline", header: "", slot: "timeline", style: "width: 3.5rem" },
  { field: "reservationNumber", header: "رقم الحجز" },
  { field: "createdAt", header: "تاريخ الحجز", slot: "createdAt" },
  { field: "studentName", header: "الطالب", slot: "student" },
  { field: "productCell", header: "المنتج", slot: "product" },
  {
    field: "createdByName",
    header: "أنشئ بواسطة",
    slot: "createdBy",
    style: "min-width: 9rem",
  },
  {
    field: "paymentSummary",
    header: "الدفع",
    slot: "paymentSummary",
    style: "min-width: 11rem",
  },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 14rem" },
];

const canModify = (row) =>
  row.status !== "DELIVERED" && row.status !== "CANCELLED";
</script>
