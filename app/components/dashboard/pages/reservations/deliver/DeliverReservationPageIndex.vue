<template>
  <div class="space-y-4 bg-[#111111] p-4 text-right text-slate-100" dir="rtl">
    <div class="relative w-full max-w-xl">
      <AppSearchInput
        label=""
        variant="dark"
        placeholder="ابحث باسم الطالب أو رقم الموبايل أو رقم الحجز"
        @search="onSearch"
      />
    </div>

    <DeliverReservationsTable
      :rows="reservations"
      :loading="loading"
      :empty-message="emptyMessage"
      @deliver="openDeliverDialog"
    />

    <DeliverReservationDialogs
      v-if="deliverDialogsMounted"
      ref="deliverDialogsRef"
      @delivered="onDelivered"
    />
  </div>
</template>

<script setup>
import AppSearchInput from "~/components/shared/inputs/app-search-input/index.vue";
import {
  reservationApi,
  normalizeReservation,
  buildReservationListQuery,
} from "~/services/reservation";
import { useAppToast } from "~/composables/useAppToast";
import DeliverReservationsTable from "./components/table/DeliverReservationsTable.vue";

defineOptions({ name: "DeliverReservationPageIndex" });

const DeliverReservationDialogs = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reservations/deliver/components/manage/DeliverReservationDialogs.vue"
  ),
);

const { showError } = useAppToast();
const loading = ref(false);
const search = ref("");
const reservations = ref([]);
const deliverDialogsRef = ref(null);
const deliverDialogsMounted = ref(false);
const pendingDeliverReservation = ref(null);

const emptyMessage = computed(() =>
  search.value.trim()
    ? "لا توجد حجوزات مطابقة"
    : "لا توجد حجوزات قابلة للعرض",
);

const isDeliverable = (item) => item?.status === "READY";

const buildQuery = () =>
  buildReservationListQuery({
    page: 1,
    perPage: 20,
    filters: {
      status: "READY",
      search: search.value,
    },
  });

const onSearch = (value) => {
  search.value = value;
  loadReservations();
};

const openDeliverDialog = (item) => {
  if (!isDeliverable(item)) return;
  pendingDeliverReservation.value = item;
  deliverDialogsMounted.value = true;
  nextTick(() => {
    if (deliverDialogsRef.value && pendingDeliverReservation.value) {
      deliverDialogsRef.value.open(pendingDeliverReservation.value);
      pendingDeliverReservation.value = null;
    }
  });
};

watch(deliverDialogsRef, (instance) => {
  if (!instance || !pendingDeliverReservation.value) return;
  instance.open(pendingDeliverReservation.value);
  pendingDeliverReservation.value = null;
});

const onDelivered = (deliveredId) => {
  reservations.value = reservations.value.filter(
    (item) => item.id !== deliveredId,
  );
};

const loadReservations = async () => {
  loading.value = true;
  try {
    const result = await reservationApi.getReservations(buildQuery());
    reservations.value = (result.data || [])
      .map(normalizeReservation)
      .filter((row) => row.id && row.reservationNumber);
  } catch (error) {
    reservations.value = [];
    showError(error?.message || "تعذر تحميل الحجوزات.");
  } finally {
    loading.value = false;
  }
};

onMounted(loadReservations);
</script>
