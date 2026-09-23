<template>
  <div class="space-y-6 text-right" dir="rtl">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">الحجوزات</span>
      </template>
      <template #content>
        <div class="mb-5">
          <AppSearchInput placeholder="رقم الحجز / طالب / منتج" @search="onSearch" />
        </div>

        <ReservationsTable
          :reservations="reservations"
          :loading="loading"
          :rows="pagination.perPage"
          :first="pagination.first"
          :total-records="pagination.total"
          @change-product="openExchangeDialog"
          @cancel="openCancelDialog"
          @page="onPage"
        />
      </template>
    </Card>

    <ReservationsCancelFlow
      v-if="cancelOpen"
      v-model:open="cancelOpen"
      :reservation="selectedReservation"
      @done="onFlowDone"
      @close="onFlowClose"
    />

    <ReservationsExchangeFlow
      v-if="exchangeOpen"
      v-model:open="exchangeOpen"
      :reservation="selectedReservation"
      @done="onFlowDone"
      @close="onFlowClose"
    />
  </div>
</template>

<script setup>
import Card from "primevue/card";
import ReservationsTable from "~/components/dashboard/pages/reservations/components/table/ReservationsTable.vue";
import AppSearchInput from "~/components/shared/inputs/app-search-input/index.vue";
import {
  reservationApi,
  normalizeReservation,
  buildReservationListQuery,
} from "~/services/reservation";
import { useAppToast } from "~/composables/useAppToast";

defineOptions({ name: "ReservationsManagePageIndex" });

const ReservationsCancelFlow = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reservations/manage/components/manage/ReservationsCancelFlow.vue"),
);
const ReservationsExchangeFlow = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reservations/manage/components/manage/ReservationsExchangeFlow.vue"),
);

const { showError } = useAppToast();

const loading = ref(true);
const selectedReservation = ref(null);
const reservations = ref([]);
const cancelOpen = ref(false);
const exchangeOpen = ref(false);
const filters = reactive({
  search: "",
});
const pagination = reactive({
  page: 1,
  perPage: 20,
  total: 0,
  first: 0,
});

const buildQuery = () =>
  buildReservationListQuery({
    page: pagination.page,
    perPage: pagination.perPage,
    filters,
  });

const resetPagination = () => {
  pagination.page = 1;
  pagination.first = 0;
};

const loadData = async () => {
  loading.value = true;
  try {
    const result = await reservationApi.getReservations(buildQuery());
    reservations.value = (result.data || []).map(normalizeReservation);
    pagination.total = result.pagination?.total || 0;
  } catch (error) {
    showError(error?.message || "تعذر تحميل الحجوزات.");
    reservations.value = [];
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

const openCancelDialog = (item) => {
  selectedReservation.value = item;
  exchangeOpen.value = false;
  cancelOpen.value = true;
};

const openExchangeDialog = (item) => {
  selectedReservation.value = item;
  cancelOpen.value = false;
  exchangeOpen.value = true;
};

const onFlowDone = async () => {
  selectedReservation.value = null;
  await loadData();
};

const onFlowClose = () => {
  if (!cancelOpen.value && !exchangeOpen.value) {
    selectedReservation.value = null;
  }
};

onMounted(loadData);
</script>
