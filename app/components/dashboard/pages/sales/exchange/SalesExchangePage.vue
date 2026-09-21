<template>
  <div class="space-y-6 text-right" dir="rtl">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">استبدال واسترداد المبيعات</span>
      </template>
      <template #content>
        <div class="mb-5">
          <SearchInput
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
import SalesExchangeTable from "~/components/dashboard/pages/sales/exchange/SalesExchangeTable.vue";
import SearchInput from "~/components/shared/search-input/index.vue";
import { exchangeService } from "~/services/exchangeService";
import { useAppToast } from "~/composables/useAppToast";
import { normalizeEligibleSale } from "~/utils/normalizeEligibleSale";

const SalesExchangeRefundFlow = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/SalesExchangeRefundFlow.vue"),
);
const SalesExchangeExchangeFlow = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/sales/exchange/SalesExchangeExchangeFlow.vue"),
);
defineOptions({ name: "SalesExchangePage" });

const { showError } = useAppToast();

const loading = ref(true);
const sales = ref([]);
const selectedSale = ref(null);
const refundOpen = ref(false);
const exchangeOpen = ref(false);
const filters = reactive({ search: "" });
const pagination = reactive({
  page: 1,
  perPage: 20,
  total: 0,
  first: 0,
});

const buildQuery = () => {
  const params = {
    page: pagination.page,
    per_page: pagination.perPage,
  };
  if (filters.search?.trim()) params.search = filters.search.trim();
  return params;
};

const resetPagination = () => {
  pagination.page = 1;
  pagination.first = 0;
};

const loadData = async () => {
  loading.value = true;
  try {
    const result = await exchangeService.getEligibleSales(buildQuery());
    sales.value = (result.data || []).map(normalizeEligibleSale);
    pagination.total = result.pagination?.total || 0;
  } catch (error) {
    showError(error?.message || "تعذر تحميل المبيعات.");
    sales.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const onPage = (event) => {
  pagination.page = event.page + 1;
  pagination.perPage = event.rows;
  pagination.first = event.first;
  loadData();
};

const onSearch = (value) => {
  filters.search = value;
  resetPagination();
  loadData();
};

const openRefund = (item) => {
  selectedSale.value = item;
  exchangeOpen.value = false;
  refundOpen.value = true;
};

const openExchange = (item) => {
  selectedSale.value = item;
  refundOpen.value = false;
  exchangeOpen.value = true;
};

const onFlowDone = async () => {
  selectedSale.value = null;
  await loadData();
};

const onFlowClose = () => {
  if (!refundOpen.value && !exchangeOpen.value) {
    selectedSale.value = null;
  }
};

onMounted(loadData);
</script>
