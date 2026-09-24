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

    <template #paidAmount="{ data }">
      <span
        class="rounded-md bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-300"
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

    <template #remainingAmount="{ data }">
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
import PaymentProofThumb from "~/components/shared/payment/payment-proof-thumb/index.vue";
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
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "createdAt", header: "التاريخ والوقت", slot: "createdAt" },
  { field: "studentName", header: "الطالب", slot: "student" },
  { field: "productCell", header: "المنتج", slot: "product" },
  { field: "createdByLabel", header: "أنشئ بواسطة", slot: "createdBy" },
  { field: "paidAmountLabel", header: "المقدم", slot: "paidAmount" },
  { field: "paymentMethodLabel", header: "طريقة الدفع", slot: "paymentMethod" },
  { field: "remainingAmountLabel", header: "المتبقي", slot: "remainingAmount" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 7rem" },
];

const isDeliverable = (item) => item?.status === "READY";
</script>
