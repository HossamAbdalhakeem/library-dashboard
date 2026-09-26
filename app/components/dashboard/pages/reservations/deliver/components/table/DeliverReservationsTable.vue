<template>
  <AppDataTable
    :value="rows"
    :columns="columns"
    :loading="loading"
    :empty-message="emptyMessage"
    :skeleton-rows="4"
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

    <template #createdBy="{ data }">
      <div class="flex flex-col items-center gap-0.5">
        <span class="text-sm font-medium text-slate-100">
          {{ data.createdBy?.fullName }}
        </span>
        <span
          class="rounded-md bg-slate-700/80 px-2 py-0.5 text-[11px] text-slate-300"
        >
          {{ data.createdBy?.roleLabel }}
        </span>
      </div>
    </template>

    <template #paymentSummary="{ data }">
      <AppPaymentSummaryTableCell :payment="data.payment" />
    </template>

    <template #status="{ data }">
      <AppStatusTableCell
        kind="reservation"
        :code="data.status"
        :label="data.statusLabel"
        class="max-w-[5rem] min-w-0 whitespace-normal text-center leading-snug [&_.p-tag-label]:block [&_.p-tag-label]:whitespace-normal [&_.p-tag-label]:text-center"
      />
    </template>

    <template #actions="{ data }">
      <Button
        label="تسليم"
        size="small"
        data-testid="deliver-reservation-action"
        class="rounded-lg bg-[#f5af52] px-4 py-2 text-sm font-bold text-white"
        :disabled="!isDeliverable(data)"
        @click="$emit('deliver', data)"
      />
    </template>
  </AppDataTable>
</template>

<script setup>
import Button from "primevue/button";
import AppDatetimeTableCell from "~/components/shared/tables/app-datetime-table-cell/index.vue";
import AppPaymentSummaryTableCell from "~/components/shared/tables/app-payment-summary-table-cell/index.vue";
import AppStatusTableCell from "~/components/shared/tables/app-status-table-cell/index.vue";
import AppProductTableCell from "~/components/shared/tables/app-product-table-cell/index.vue";
import AppStudentTableCell from "~/components/shared/tables/app-student-table-cell/index.vue";

const AppDataTable = defineAsyncComponent(() =>
  import("~/components/shared/tables/app-data-table/index.vue"),
);

defineOptions({ name: "DeliverReservationsTable" });

defineProps({
  rows: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyMessage: { type: String, default: "لا توجد حجوزات قابلة للعرض" },
});

defineEmits(["deliver"]);

const columns = [
  { field: "reservationNumber", header: "رقم الحجز" },
  {
    field: "statusLabel",
    header: "الحالة",
    slot: "status",
    style: "width: 6.5rem",
  },
  { field: "createdAt", header: "التاريخ والوقت", slot: "createdAt" },
  { field: "studentName", header: "الطالب", slot: "student" },
  { field: "productCell", header: "المنتج", slot: "product" },
  { field: "createdByLabel", header: "أنشئ بواسطة", slot: "createdBy" },
  {
    field: "paymentSummary",
    header: "الدفع",
    slot: "paymentSummary",
    style: "min-width: 11rem",
  },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 7rem" },
];

const isDeliverable = (item) => item?.status === "READY";
</script>
