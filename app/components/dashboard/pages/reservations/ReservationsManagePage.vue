<template>
  <div class="space-y-6 text-right" dir="rtl">
    <Card>
      <template #title>
        <span class="text-lg font-bold text-slate-900">الحجوزات</span>
      </template>
      <template #content>
        <div class="mb-5">
          <SearchInput placeholder="رقم الحجز / طالب / منتج" @search="onSearch" />
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

    <Dialog
      v-model:visible="cancelDetailVisible"
      modal
      dir="rtl"
      header="تفاصيل الحجز قبل الإلغاء"
      :style="{ width: '560px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @hide="closeCancelFlow"
    >
      <CancelReservationDetailContent
        v-if="cancelDetailVisible"
        :reservation="selectedReservation"
        :refund-method="cancelRefundMethod"
        :refund-image="cancelImage"
        :refund-proof-key="cancelProofKey"
        :refund-error="cancelRefundError"
        @update:refund-method="cancelRefundMethod = $event"
        @update:refund-image="cancelImage = $event"
        @update:refund-proof-key="cancelProofKey = $event"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد إلغاء الحجز"
            severity="danger"
            icon="pi pi-times"
            :disabled="!selectedReservation || busy"
            @click="requestCancelConfirm"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="closeCancelFlow"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="cancelConfirmVisible"
      modal
      dir="rtl"
      header="تأكيد الإلغاء"
      :closable="!busy"
      :dismissable-mask="!busy"
      :close-on-escape="!busy"
      :style="{ width: '420px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    >
      <CancelReservationConfirmContent
        v-if="cancelConfirmVisible"
        :reservation="selectedReservation"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="نعم، إلغاء الحجز"
            severity="danger"
            :loading="busy"
            :disabled="busy"
            @click="confirmCancel"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="cancelConfirmVisible = false"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="exchangeDetailVisible"
      modal
      dir="rtl"
      header="استبدال منتج الحجز"
      :style="{ width: '720px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
      @hide="closeExchangeFlow"
    >
      <ExchangeReservationDetailContent
        v-if="exchangeDetailVisible && selectedReservation"
        :reservation="selectedReservation"
        :new-product-id="newProductId"
        :selected-new-product="selectedNewProduct"
        :price-comparison="priceComparison"
        :exchange-error="exchangeError"
        :exchange-payment-error="exchangePaymentError"
        :exchange-refund-method="exchangeRefundMethod"
        :exchange-image="exchangeImage"
        :exchange-proof-key="exchangeProofKey"
        @update:new-product-id="newProductId = $event"
        @update:exchange-refund-method="exchangeRefundMethod = $event"
        @update:exchange-image="exchangeImage = $event"
        @update:exchange-proof-key="exchangeProofKey = $event"
        @products-loaded="onExchangeProductsLoaded"
        @products-loading="(value) => (loadingProducts = value)"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="تأكيد الاستبدال"
            severity="primary"
            icon="pi pi-sync"
            :disabled="!canConfirmExchange"
            @click="requestExchangeConfirm"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="closeExchangeFlow"
          />
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="exchangeConfirmVisible"
      modal
      dir="rtl"
      header="تأكيد استبدال المنتج"
      :closable="!busy"
      :dismissable-mask="!busy"
      :close-on-escape="!busy"
      :style="{ width: '520px', maxWidth: '95vw' }"
      :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    >
      <ExchangeReservationConfirmContent
        v-if="exchangeConfirmVisible"
        :reservation="selectedReservation"
        :selected-new-product="selectedNewProduct"
        :price-comparison="priceComparison"
      />

      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <Button
            label="نعم، تأكيد الاستبدال"
            severity="primary"
            :loading="busy"
            :disabled="busy"
            @click="confirmExchange"
          />
          <Button
            label="رجوع"
            text
            severity="secondary"
            :disabled="busy"
            @click="exchangeConfirmVisible = false"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import Dialog from "primevue/dialog";
import ReservationsTable from "~/components/dashboard/pages/reservations/ReservationsTable.vue";
import SearchInput from "~/components/shared/search-input/index.vue";
import { reservationService } from "~/services/reservationService";
import { useAppToast } from "~/composables/useAppToast";
import { PaymentMethod } from "~/utils/paymentMethods";
import { formatMoney } from "~/utils/format";
import { normalizeReservation } from "~/utils/normalizeReservation";
import { canSelectExchangeProduct } from "~/utils/productOptions";

defineOptions({ name: "ReservationsManagePage" });

const CancelReservationDetailContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reservations/manage/CancelReservationDetailContent.vue"),
);
const CancelReservationConfirmContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reservations/manage/CancelReservationConfirmContent.vue"),
);
const ExchangeReservationDetailContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reservations/manage/ExchangeReservationDetailContent.vue"),
);
const ExchangeReservationConfirmContent = defineAsyncComponent(() =>
  import("~/components/dashboard/pages/reservations/manage/ExchangeReservationConfirmContent.vue"),
);

const { showError, showSuccess } = useAppToast();

const loading = ref(true);
const busy = ref(false);
const loadingProducts = ref(false);
const selectedReservation = ref(null);
const reservations = ref([]);
const productOptions = ref([]);
const newProductId = ref(null);
const exchangeError = ref("");
const exchangePaymentError = ref("");
const exchangeRefundMethod = ref(PaymentMethod.CASH);
const exchangeImage = ref(null);
const exchangeProofKey = ref("");
const cancelRefundMethod = ref(PaymentMethod.CASH);
const cancelImage = ref(null);
const cancelProofKey = ref("");
const cancelRefundError = ref("");
const filters = reactive({
  search: "",
});
const pagination = reactive({
  page: 1,
  perPage: 20,
  total: 0,
  first: 0,
});

const cancelDetailVisible = ref(false);
const cancelConfirmVisible = ref(false);
const exchangeDetailVisible = ref(false);
const exchangeConfirmVisible = ref(false);

const roundMoney = (value) => Math.round(Number(value || 0) * 100) / 100;

const selectedNewProduct = computed(
  () =>
    productOptions.value.find((item) => item.value === newProductId.value) ||
    null,
);

const canConfirmExchange = computed(() => {
  if (!selectedReservation.value || busy.value || loadingProducts.value) {
    return false;
  }
  if (!newProductId.value || !selectedNewProduct.value) return false;
  if (
    String(newProductId.value) ===
    String(selectedReservation.value?.product?.id || "")
  ) {
    return false;
  }
  if (!canSelectExchangeProduct(selectedNewProduct.value)) return false;
  if (priceComparison.value?.kind === "less" && !exchangeRefundMethod.value) {
    return false;
  }
  return true;
});

const priceComparison = computed(() => {
  if (!selectedReservation.value || !selectedNewProduct.value) return null;

  const paidAmount = roundMoney(selectedReservation.value.payment?.paidAmount);
  const newPrice = roundMoney(selectedNewProduct.value.displayPrice);
  const difference = roundMoney(newPrice - paidAmount);

  if (difference >= 0) return null;

  return {
    kind: "less",
    oldTotal: paidAmount,
    newTotal: newPrice,
    difference,
    title: "سيتم رد فرق السعر للطالب",
    titleClass: "text-emerald-300",
    boxClass: "border-white/10 bg-slate-900",
    diffLabel: "المبلغ الذي سيُرد للطالب",
    diffClass: "text-emerald-300",
    confirmText: `سيتم رد فرق سعر قدره ${formatMoney(Math.abs(difference))} للطالب.`,
  };
});

const onExchangeProductsLoaded = (options) => {
  productOptions.value = options || [];
};

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
    const result = await reservationService.getReservations(buildQuery());
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
  cancelRefundMethod.value = PaymentMethod.CASH;
  cancelImage.value = null;
  cancelProofKey.value = "";
  cancelRefundError.value = "";
  cancelConfirmVisible.value = false;
  exchangeDetailVisible.value = false;
  exchangeConfirmVisible.value = false;
  cancelDetailVisible.value = true;
};

const closeCancelFlow = () => {
  if (busy.value) return;
  cancelDetailVisible.value = false;
  cancelConfirmVisible.value = false;
  cancelRefundMethod.value = PaymentMethod.CASH;
  cancelImage.value = null;
  cancelProofKey.value = "";
  cancelRefundError.value = "";
  if (!exchangeDetailVisible.value) selectedReservation.value = null;
};

const requestCancelConfirm = () => {
  cancelRefundError.value = "";
  if (
    selectedReservation.value?.payment?.paidAmount > 0 &&
    !cancelRefundMethod.value
  ) {
    cancelRefundError.value = "اختر طريقة رد المبلغ.";
    return;
  }
  cancelConfirmVisible.value = true;
};

const confirmCancel = async () => {
  if (!selectedReservation.value?.id) return;
  busy.value = true;
  try {
    const payload = {};
    if (selectedReservation.value.payment?.paidAmount > 0) {
      payload.refundMethod = cancelRefundMethod.value;
      if (cancelProofKey.value) {
        payload.proofReference = cancelProofKey.value;
      }
    }

    await reservationService.cancelReservation(
      selectedReservation.value.id,
      payload,
    );
    cancelConfirmVisible.value = false;
    cancelDetailVisible.value = false;
    selectedReservation.value = null;
    cancelRefundMethod.value = PaymentMethod.CASH;
    cancelImage.value = null;
    cancelProofKey.value = "";
    cancelRefundError.value = "";
    showSuccess("تم إلغاء الحجز بنجاح.");
    await loadData();
  } catch (error) {
    showError(error?.message || "تعذر إلغاء الحجز.");
  } finally {
    busy.value = false;
  }
};


const openExchangeDialog = (item) => {
  selectedReservation.value = item;
  newProductId.value = null;
  productOptions.value = [];
  exchangeError.value = "";
  exchangePaymentError.value = "";
  exchangeRefundMethod.value = PaymentMethod.CASH;
  exchangeImage.value = null;
  exchangeProofKey.value = "";
  cancelDetailVisible.value = false;
  cancelConfirmVisible.value = false;
  exchangeConfirmVisible.value = false;
  exchangeDetailVisible.value = true;
};

const closeExchangeFlow = () => {
  if (busy.value) return;
  exchangeDetailVisible.value = false;
  exchangeConfirmVisible.value = false;
  newProductId.value = null;
  exchangeError.value = "";
  exchangePaymentError.value = "";
  exchangeRefundMethod.value = PaymentMethod.CASH;
  exchangeImage.value = null;
  exchangeProofKey.value = "";
  if (!cancelDetailVisible.value) selectedReservation.value = null;
};

const requestExchangeConfirm = () => {
  exchangeError.value = "";
  exchangePaymentError.value = "";

  if (!newProductId.value) {
    exchangeError.value = "اختر المنتج الجديد قبل التأكيد.";
    return;
  }
  if (newProductId.value === selectedReservation.value?.product?.id) {
    exchangeError.value = "اختر منتجًا مختلفًا عن المنتج الحالي.";
    return;
  }
  if (!canSelectExchangeProduct(selectedNewProduct.value)) {
    exchangeError.value = "المنتج المختار غير متاح في مخزون الفرع وغير مسموح بالحجز.";
    return;
  }
  if (priceComparison.value?.kind === "less" && !exchangeRefundMethod.value) {
    exchangePaymentError.value = "اختر طريقة رد فرق السعر.";
    return;
  }

  exchangeConfirmVisible.value = true;
};

const confirmExchange = async () => {
  if (!selectedReservation.value?.id || !newProductId.value) return;
  busy.value = true;
  try {
    const payload = { newProductId: newProductId.value };

    if (priceComparison.value?.kind === "less") {
      payload.refundMethod = exchangeRefundMethod.value;
      if (exchangeProofKey.value) {
        payload.proofReference = exchangeProofKey.value;
      }
    }

    await reservationService.changeProduct(
      selectedReservation.value.id,
      payload,
    );
    exchangeConfirmVisible.value = false;
    exchangeDetailVisible.value = false;
    selectedReservation.value = null;
    newProductId.value = null;
    exchangeRefundMethod.value = PaymentMethod.CASH;
    exchangeImage.value = null;
    exchangeProofKey.value = "";
    showSuccess("تم استبدال منتج الحجز بنجاح.");
    await loadData();
  } catch (error) {
    showError(error?.message || "تعذر استبدال منتج الحجز.");
  } finally {
    busy.value = false;
  }
};

watch(newProductId, () => {
  if (exchangeError.value) exchangeError.value = "";
  if (exchangePaymentError.value) exchangePaymentError.value = "";
});

watch(exchangeRefundMethod, () => {
  if (exchangePaymentError.value) exchangePaymentError.value = "";
});

watch(cancelRefundMethod, () => {
  if (cancelRefundError.value) cancelRefundError.value = "";
});

watch(cancelProofKey, () => {
  if (cancelRefundError.value) cancelRefundError.value = "";
});

onMounted(loadData);
</script>
