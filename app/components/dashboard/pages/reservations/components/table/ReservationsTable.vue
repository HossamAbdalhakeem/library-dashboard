<template>
  <AppDataTable
    v-model:expandedRows="expandedRows"
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
    @row-expand="onRowExpand"
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

    <template #paidAmountLabel="{ data }">
      <span
        class="rounded-md px-2 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-300"
      >
        {{ data.payment?.paidAmountLabel }}
      </span>
    </template>

    <template #paymentMethod="{ data }">
      <PaymentProofThumb
        :method="data.payment?.method"
        :method-label="data.payment?.methodLabel"
        :payment-id="data.payment?.id"
        :proof-url="data.payment?.image?.url"
        :has-proof="data.payment?.image?.hasProof"
      />
    </template>

    <template #remainingAmountLabel="{ data }">
      <span
        class="rounded-md px-2 py-1 text-xs font-bold"
        :class="
          data.payment?.hasRemaining
            ? 'bg-orange-500/20 text-orange-300'
            : 'bg-emerald-500/20 text-emerald-300'
        "
      >
        {{ data.payment?.remainingAmountLabel }}
      </span>
    </template>

    <template #status="{ data }">
      <AppStatusTableCell
        kind="reservation"
        :code="data.status"
        :label="data.statusLabel"
      />
    </template>

    <template #createdBy="{ data }">
      <div class="flex flex-col items-center gap-0.5">
        <span class="text-sm font-medium">{{ data.createdBy?.fullName }}</span>
        <AppStatusTableCell
          v-if="data.createdBy?.roleLabel && data.createdBy.roleLabel !== '-'"
          :label="data.createdBy.roleLabel"
          severity="secondary"
        />
      </div>
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

    <template #expansion="{ data }">
      <div
        class="!w-[70%]  rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-right"
      >
        <OperationTimelinePanel
          :timeline="getTimelineEvents(timelineKeyFor(data))"
          :loading="!!timelineState[timelineKeyFor(data)]?.loading"
          :error="timelineState[timelineKeyFor(data)]?.error || ''"
          @retry="loadTimeline(timelineKeyFor(data))"
        />
      </div>
    </template>
  </AppDataTable>
</template>

<script setup>
import Button from "primevue/button";
import AppDataTable from "~/components/shared/tables/app-data-table/index.vue";
import AppDatetimeTableCell from "~/components/shared/tables/app-datetime-table-cell/index.vue";
import AppStatusTableCell from "~/components/shared/tables/app-status-table-cell/index.vue";
import PaymentProofThumb from "~/components/shared/payment/payment-proof-thumb/index.vue";
import AppProductTableCell from "~/components/shared/tables/app-product-table-cell/index.vue";
import AppStudentTableCell from "~/components/shared/tables/app-student-table-cell/index.vue";
import OperationTimelinePanel from "~/components/dashboard/pages/reports/daily/DailyReportStudentOperationsSection/partials/OperationTimelinePanel.vue";
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

const expandedRows = ref({});
const { timelineState, getTimelineEvents, loadTimeline } = useOperationTimeline(
  (id) => reservationApi.getTimeline(id),
);

const timelineKeyFor = (row) => row?.id || "";

const onRowExpand = (event) => {
  const id = timelineKeyFor(event?.data);
  if (id) loadTimeline(id);
};

watch(
  () => [props.first, props.reservations],
  () => {
    expandedRows.value = {};
  },
);

const columns = [
  { key: "expander", expander: true, style: "width: 3rem" },
  { field: "reservationNumber", header: "رقم الحجز" },
  { field: "createdAt", header: "تاريخ الحجز", slot: "createdAt" },
  { field: "studentName", header: "الطالب", slot: "student" },
  { field: "productCell", header: "المنتج", slot: "product" },
  { field: "createdByName", header: "أنشئ بواسطة", slot: "createdBy" },
  { field: "branchName", header: "الفرع" },
  { field: "quantity", header: "الكمية" },
  { field: "paidAmountLabel", header: "المقدم", slot: "paidAmountLabel" },
  { field: "paymentMethodLabel", header: "طريقة الدفع", slot: "paymentMethod" },
  { field: "remainingAmountLabel", header: "المتبقي", slot: "remainingAmountLabel" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 14rem" },
];

const canModify = (row) =>
  row.status !== "DELIVERED" && row.status !== "CANCELLED";
</script>
