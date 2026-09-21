<template>
  <div class="space-y-4 bg-[#111111] p-4 text-right text-slate-100" dir="rtl">
    <div class="relative w-full max-w-xl">
      <SearchInput
        label=""
        variant="dark"
        placeholder="ابحث باسم الطالب أو رقم الموبايل أو رقم الحجز"
        @search="onSearch"
      />
    </div>

    <AppDataTable
      :value="reservations"
      :columns="tableColumns"
      :loading="loading"
      :empty-message="emptyMessage"
      :skeleton-rows="4"
    >
      <template #createdAt="{ data }">
        <AppDateTimeCell :value="data.createdAt" />
      </template>

      <template #product="{ data }">
        <ProductCell :product="data.productCell" />
      </template>

      <template #createdBy="{ data }">
        <div class="flex flex-col items-center gap-0.5">
          <span class="text-sm font-medium text-slate-100">
            {{ data.createdBy?.fullName }}
          </span>
          <span class="rounded-md bg-slate-700/80 px-2 py-0.5 text-[11px] text-slate-300">
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
        <AppStatusTag
          kind="reservation"
          :code="data.status"
          :label="data.statusLabel"
        />
      </template>

      <template #actions="{ data }">
        <Button
          label="تسليم"
          size="small"
          class="rounded-lg bg-[#f5af52] px-4 py-2 text-sm font-bold text-white"
          :disabled="!isDeliverable(data)"
          @click="openDeliverDialog(data)"
        />
      </template>
    </AppDataTable>

    <DeliverReservationDialogs
      v-if="deliverDialogsMounted"
      ref="deliverDialogsRef"
      @delivered="onDelivered"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import AppDataTable from "~/components/shared/app-data-table/index.vue";
import AppDateTimeCell from "~/components/shared/app-datetime-cell/index.vue";
import SearchInput from "~/components/shared/search-input/index.vue";
import { reservationService } from "~/services/reservationService";
import { useAppToast } from "~/composables/useAppToast";
import PaymentProofThumb from "~/components/shared/payment-proof-thumb/index.vue";
import AppStatusTag from "~/components/shared/app-status-tag/index.vue";
import ProductCell from "~/components/shared/product-cell/index.vue";
import { normalizeReservation } from "~/utils/normalizeReservation";

defineOptions({ name: "DeliverReservationPage" });

const DeliverReservationDialogs = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/reservations/deliver/manage/DeliverReservationDialogs.vue"
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

const tableColumns = [
  { field: "reservationNumber", header: "رقم الحجز" },
  { field: "createdAt", header: "التاريخ والوقت", slot: "createdAt" },
  { field: "studentName", header: "اسم الطالب" },
  { field: "phone", header: "الموبايل", fallback: "-" },
  { field: "productCell", header: "المنتج", slot: "product" },
  { field: "createdByLabel", header: "أنشئ بواسطة", slot: "createdBy" },
  { field: "paidAmountLabel", header: "المقدم", slot: "paidAmount" },
  { field: "paymentMethodLabel", header: "طريقة الدفع", slot: "paymentMethod" },
  { field: "remainingAmountLabel", header: "المتبقي", slot: "remainingAmount" },
  { field: "statusLabel", header: "الحالة", slot: "status" },
  { field: "actions", header: "إجراء", slot: "actions", style: "width: 7rem" },
];

const isDeliverable = (item) => item?.status === "READY";

const buildQuery = () => {
  const params = {
    per_page: 20,
    status: "READY",
  };
  if (search.value.trim()) params.search = search.value.trim();
  return params;
};

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
    const result = await reservationService.getReservations(buildQuery());
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
