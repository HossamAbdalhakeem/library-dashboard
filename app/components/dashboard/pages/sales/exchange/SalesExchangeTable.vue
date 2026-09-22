<template>
  <AppDataTable
    v-model:expandedRows="expandedRows"
    data-key="id"
    :value="sales"
    :columns="columns"
    :loading="loading"
    paginator
    lazy
    :rows="rows"
    :first="first"
    :total-records="totalRecords"
    empty-message="لا توجد مبيعات قابلة للعرض."
    @page="$emit('page', $event)"
    @row-expand="onRowExpand"
  >
    <template #createdAt="{ data }">
      <AppDateTimeCell :value="data.createdAt" />
    </template>

    <template #product="{ data }">
      <ProductCell :product="data.productCell" />
    </template>

    <template #amountLabel="{ data }">
      <span
        class="rounded-md bg-primary-500/20 px-2 py-1 text-xs font-bold text-primary-300"
      >
        {{ data.product?.amountLabel || data.amountLabel }}
      </span>
    </template>

    <template #quantity="{ data }">
      <div class="flex flex-col items-center gap-0.5">
        <span class="font-medium">
          {{ data.quantity?.remaining ?? data.remainingQuantity }}
        </span>
        <span
          v-if="data.status === 'PARTIALLY_RETURNED'"
          class="text-[11px] text-amber-600"
        >
          مرتجع {{ data.quantity?.returned ?? data.returnedQuantity ?? 0 }}
        </span>
      </div>
    </template>

    <template #paymentMethod="{ data }">
      <PaymentProofThumb
        :method="data.payment?.method || data.paymentMethod"
        :method-label="data.payment?.methodLabel || data.paymentMethodLabel"
        :payment-id="data.payment?.id || data.paymentId"
        :proof-url="data.payment?.image?.url || data.proofUrl"
        :has-proof="data.payment?.image?.hasProof ?? data.hasProof"
      />
    </template>

    <template #status="{ data }">
      <AppStatusTag
        kind="sale"
        :code="data.status"
        :label="data.statusLabel"
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
          @click="$emit('exchange', data)"
        />
        <Button
          v-if="canModify(data)"
          label="استرداد"
          icon="pi pi-replay"
          text
          size="small"
          severity="danger"
          @click="$emit('refund', data)"
        />
        <span v-if="!canModify(data)" class="text-xs text-slate-400">—</span>
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
import { saleService } from "~/services/saleService";
import { useOperationTimeline } from "~/composables/useOperationTimeline";

const props = defineProps({
  sales: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  rows: { type: Number, default: 20 },
  first: { type: Number, default: 0 },
  totalRecords: { type: Number, default: 0 },
});

defineEmits(["exchange", "refund", "page"]);

const expandedRows = ref({});
const { timelineState, getTimelineEvents, loadTimeline } = useOperationTimeline(
  (id) => saleService.getTimeline(id),
);

const timelineKeyFor = (row) => row?.saleId || "";

const onRowExpand = (event) => {
  const id = timelineKeyFor(event?.data);
  if (id) loadTimeline(id);
};

watch(
  () => [props.first, props.sales],
  () => {
    expandedRows.value = {};
  },
);

const columns = [
  { key: "expander", expander: true, style: "width: 3rem" },
  { field: "createdAt", header: "تاريخ البيع", slot: "createdAt" },
  { field: "studentName", header: "الطالب" },
  { field: "phone", header: "الموبايل", fallback: "—" },
  { field: "productCell", header: "المنتج", slot: "product" },
  { field: "remainingQuantity", header: "الكمية", slot: "quantity" },
  { field: "amountLabel", header: "المبلغ", slot: "amountLabel" },
  { field: "paymentMethodLabel", header: "طريقة الدفع", slot: "paymentMethod" },
  { field: "branchName", header: "الفرع" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 14rem" },
];

const canModify = (row) => Boolean(row.canModify);
</script>
