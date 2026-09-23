<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    :header="dialogTitle"
    :style="{ width: 'min(1320px, 98vw)' }"
    :pt="{ header: { class: 'text-right' }, content: { class: 'text-right overflow-x-auto' } }"
    @update:visible="$emit('update:visible', $event)"
    @hide="$emit('hide')"
  >
    <div class="flex flex-col gap-4">
      <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        <AppDateRangePicker
          v-model:from="filters.from"
          v-model:to="filters.to"
          label="من / إلى"
          placeholder="اختر الفترة"
          @change="onFiltersChange"
        />

        <AppGlobalSelectTeacher
          v-model="filters.teacherId"
          label="المدرس"
          placeholder="كل المدرسين"
          show-clear
          :exclude-inactive="false"
          @update:model-value="onFiltersChange"
        />

        <AppGlobalSelectProduct
          v-model="filters.productId"
          source="catalog"
          variant="simple"
          name-only
          label="المنتج"
          placeholder="كل المنتجات"
          show-clear
          @update:model-value="onFiltersChange"
        />
      </div>

      <AppDataTable
        :value="rows"
        :columns="columns"
        :loading="loading"
        paginator
        lazy
        :rows="pagination.perPage"
        :first="pagination.first"
        :total-records="pagination.total"
        empty-message="لا توجد معاملات لهذا الطالب."
        @page="onPage"
      >
        <template #product="{ data }">
          <AppProductTableCell :product="data.productCell" />
        </template>
        <template #date="{ data }">
          <AppDatetimeTableCell :value="data.date" />
        </template>
        <template #typeLabel="{ data }">
          <AppStatusTableCell
            kind="transaction"
            :code="data.type"
            :label="data.typeLabel"
          />
        </template>
        <template #amountLabel="{ data }">
          <span
            class="font-semibold"
            :class="data.type === 'RETURN' ? 'text-rose-600' : 'text-emerald-700'"
          >
            {{ data.amountLabel }}
          </span>
        </template>
        <template #paymentMethod="{ data }">
          <PaymentProofThumb
            :method="data.payment.method"
            :method-label="data.paymentMethodLabel"
            :payment-id="data.payment.id"
            :proof-url="data.payment.image.url"
            :has-proof="data.payment.image.hasProof"
          />
        </template>
        <template #statusLabel="{ data }">
          <AppStatusTableCell
            :kind="transactionStatusKind(data.type)"
            :code="data.status"
            :label="data.statusLabel"
            :severity="data.statusSeverity"
          />
        </template>
      </AppDataTable>
    </div>
  </Dialog>
</template>

<script setup>
import Dialog from "primevue/dialog";
import AppDataTable from "~/components/shared/tables/app-data-table/index.vue";
import AppDatetimeTableCell from "~/components/shared/tables/app-datetime-table-cell/index.vue";
import AppStatusTableCell from "~/components/shared/tables/app-status-table-cell/index.vue";
import AppDateRangePicker from "~/components/shared/reports/app-date-range-picker/index.vue";
import PaymentProofThumb from "~/components/shared/payment/payment-proof-thumb/index.vue";
import AppGlobalSelectProduct from "~/components/shared/selections/app-global-select-product/index.vue";
import AppProductTableCell from "~/components/shared/tables/app-product-table-cell/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/selections/app-global-select-teacher/index.vue";
import { useStudentTransactions } from "../../composables/useStudentTransactions";

const props = defineProps({
  visible: { type: Boolean, default: false },
  student: { type: Object, default: null },
});

defineEmits(["update:visible", "hide"]);

const {
  loading,
  rows,
  pagination,
  filters,
  dialogTitle,
  columns,
  transactionStatusKind,
  onFiltersChange,
  onPage,
} = useStudentTransactions(props);
</script>
