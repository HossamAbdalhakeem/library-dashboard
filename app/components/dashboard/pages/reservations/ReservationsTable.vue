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
      <AppDateTimeCell :value="data.createdAt" />
    </template>

    <template #product="{ data }">
      <ProductCell :product="data.productCell" />
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
      <AppStatusTag
        kind="reservation"
        :code="data.status"
        :label="data.statusLabel"
      />
    </template>

    <template #createdBy="{ data }">
      <div class="flex flex-col items-center gap-0.5">
        <span class="text-sm font-medium">{{ data.createdBy?.fullName }}</span>
        <AppStatusTag
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
          @click="$emit('change-product', data)"
        />
        <Button
          v-if="canModify(data)"
          label="إلغاء الحجز"
          icon="pi pi-times"
          text
          size="small"
          severity="danger"
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
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import AppDateTimeCell from "~/components/shared/app-datetime-cell/index.vue";
import AppStatusTag from "~/components/shared/app-status-tag/index.vue";
import PaymentProofThumb from "~/components/shared/payment-proof-thumb/index.vue";
import ProductCell from "~/components/shared/product-cell/index.vue";
import OperationTimelinePanel from "~/components/dashboard/pages/reports/daily/DailyReportStudentOperationsSection/partials/OperationTimelinePanel.vue";
import { reservationService } from "~/services/reservationService";
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
  (id) => reservationService.getTimeline(id),
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
  { field: "studentName", header: "الطالب" },
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
