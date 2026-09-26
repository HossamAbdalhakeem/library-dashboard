<template>
  <div class="space-y-6 text-right" dir="rtl">
    <Card>
      <template #title>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="text-lg font-bold text-slate-900">استبدال واسترداد المبيعات</span>
          <Button
            v-if="isAdmin"
            label="تصدير"
            icon="pi pi-download"
            severity="secondary"
            outlined
            data-testid="sales-export"
            @click="openExport"
          />
        </div>
      </template>
      <template #content>
        <div class="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <AppSearchInput
            placeholder="رقم العملية / طالب / منتج / موبايل"
            @search="onSearch"
          />
          <AppGlobalSelectBranch
            v-model="filters.branchId"
            label="الفرع"
            placeholder="كل الفروع"
            show-clear
            @change="onBranchChange"
          />
          <AppGlobalSelectTeacher
            v-model="filters.teacherId"
            label="المدرس"
            placeholder="كل المدرسين"
            show-clear
            @change="onTeacherChange"
          />
          <AppGlobalSelectStudyYear
            v-model="filters.studyYearId"
            label="السنة الدراسية"
            placeholder="كل السنوات"
            show-clear
            @change="onStudyYearChange"
          />
        </div>

        <SalesExchangeTable
          :sales="sales"
          :loading="loading"
          :rows="pagination.perPage"
          :first="pagination.first"
          :total-records="pagination.total"
          @exchange="openExchange"
          @refund="openRefund"
          @page="onPage"
        />
      </template>
    </Card>

    <SalesExchangeRefundFlow
      v-if="refundOpen"
      v-model:open="refundOpen"
      :sale="selectedSale"
      @done="onFlowDone"
      @close="onFlowClose"
    />

    <SalesExchangeExchangeFlow
      v-if="exchangeOpen"
      v-model:open="exchangeOpen"
      :sale="selectedSale"
      @done="onFlowDone"
      @close="onFlowClose"
    />

    <SalesExportDialog
      v-if="exportVisible"
      v-model:visible="exportVisible"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import AppSearchInput from "~/components/shared/inputs/app-search-input/index.vue";
import AppGlobalSelectBranch from "~/components/shared/selections/app-global-select-branch/index.vue";
import AppGlobalSelectTeacher from "~/components/shared/selections/app-global-select-teacher/index.vue";
import AppGlobalSelectStudyYear from "~/components/shared/selections/app-global-select-study-year/index.vue";
import SalesExchangeTable from "~/components/dashboard/pages/sales/exchange/components/table/SalesExchangeTable.vue";
import { useSalesExchangePage } from "~/components/dashboard/pages/sales/exchange/composables/useSalesExchangePage";
import { useAuth } from "~/composables/useAuth";

const SalesExchangeRefundFlow = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/components/manage/SalesExchangeRefundFlow.vue"),
);
const SalesExchangeExchangeFlow = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/components/manage/SalesExchangeExchangeFlow.vue"),
);
const SalesExportDialog = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/components/partials/SalesExportDialog.vue"),
);

defineOptions({ name: "SalesExchangePage" });

const { isAdmin } = useAuth();
const exportVisible = ref(false);

const {
  loading,
  sales,
  selectedSale,
  refundOpen,
  exchangeOpen,
  filters,
  pagination,
  onPage,
  onSearch,
  onBranchChange,
  onTeacherChange,
  onStudyYearChange,
  openRefund,
  openExchange,
  onFlowDone,
  onFlowClose,
} = useSalesExchangePage();

const openExport = () => {
  exportVisible.value = true;
};
</script>
