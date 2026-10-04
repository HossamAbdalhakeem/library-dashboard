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

    <AppDataTable
      :value="reservations"
      :columns="columns"
      :loading="loading"
      :empty-message="emptyMessage"
      :skeleton-rows="4"
    >
      <template #student="{ data }">
        <AppStudentTableCell
          :student="{ name: data.studentName, phone: data.phone }"
        />
      </template>
      <template #product="{ data }">
        <AppProductTableCell :product="data.productCell" />
      </template>
      <template #deposit="{ data }">
        <span class="font-semibold">{{ data.depositAmountLabel }}</span>
      </template>
      <template #actions="{ data }">
        <Button
          label="تأكيد الدفع"
          size="small"
          :disabled="data.status !== 'PENDING'"
          @click="openConfirm(data)"
        />
      </template>
    </AppDataTable>

    <ConfirmPendingReservationDialog
      v-model:visible="confirmVisible"
      :reservation="selectedReservation"
      @confirmed="onConfirmed"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import AppSearchInput from "~/components/shared/inputs/app-search-input/index.vue";
import AppDataTable from "~/components/shared/tables/app-data-table/index.vue";
import AppProductTableCell from "~/components/shared/tables/app-product-table-cell/index.vue";
import AppStudentTableCell from "~/components/shared/tables/app-student-table-cell/index.vue";
import {
  reservationApi,
  normalizeReservation,
  buildReservationListQuery,
} from "~/services/reservation";
import { useAppToast } from "~/composables/useAppToast";
import ConfirmPendingReservationDialog from "./components/ConfirmPendingReservationDialog.vue";

defineOptions({ name: "SubmitPendingReservationsPageIndex" });

const { showError } = useAppToast();
const loading = ref(false);
const search = ref("");
const reservations = ref([]);
const confirmVisible = ref(false);
const selectedReservation = ref(null);

const columns = [
  { field: "reservationNumber", header: "رقم الحجز" },
  { field: "studentName", header: "الطالب", slot: "student" },
  { field: "productCell", header: "المنتج", slot: "product" },
  { field: "depositAmountLabel", header: "العربون", slot: "deposit" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 8rem" },
];

const emptyMessage = computed(() =>
  search.value.trim()
    ? "لا توجد حجوزات مطابقة"
    : "لا توجد حجوزات بانتظار تأكيد الدفع",
);

const loadReservations = async () => {
  loading.value = true;
  try {
    const result = await reservationApi.getReservations(
      buildReservationListQuery({
        page: 1,
        perPage: 50,
        filters: { status: "PENDING", search: search.value },
      }),
    );
    reservations.value = (result.data || [])
      .map(normalizeReservation)
      .filter((row) => row.status === "PENDING");
  } catch (error) {
    reservations.value = [];
    showError(error?.message || "تعذر تحميل الحجوزات.");
  } finally {
    loading.value = false;
  }
};

const onSearch = (value) => {
  search.value = value;
  loadReservations();
};

const openConfirm = (item) => {
  selectedReservation.value = item;
  confirmVisible.value = true;
};

const onConfirmed = (id) => {
  reservations.value = reservations.value.filter((item) => item.id !== id);
  selectedReservation.value = null;
};

onMounted(loadReservations);
</script>
