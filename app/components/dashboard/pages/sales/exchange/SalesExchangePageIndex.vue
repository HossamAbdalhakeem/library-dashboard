<template>
  <div class="space-y-6 text-right" dir="rtl">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">استبدال واسترداد المبيعات</span>
      </template>
      <template #content>
        <div class="mb-5">
          <AppSearchInput
            placeholder="رقم العملية / طالب / منتج / موبايل"
            @search="onSearch"
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
  </div>
</template>

<script setup>
import Card from "primevue/card";
import AppSearchInput from "~/components/shared/inputs/app-search-input/index.vue";
import SalesExchangeTable from "~/components/dashboard/pages/sales/exchange/components/table/SalesExchangeTable.vue";
import { useSalesExchangePage } from "~/components/dashboard/pages/sales/exchange/composables/useSalesExchangePage";

const SalesExchangeRefundFlow = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/components/manage/SalesExchangeRefundFlow.vue"),
);
const SalesExchangeExchangeFlow = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/components/manage/SalesExchangeExchangeFlow.vue"),
);

defineOptions({ name: "SalesExchangePage" });

const {
  loading,
  sales,
  selectedSale,
  refundOpen,
  exchangeOpen,
  pagination,
  onPage,
  onSearch,
  openRefund,
  openExchange,
  onFlowDone,
  onFlowClose,
} = useSalesExchangePage();
</script>
