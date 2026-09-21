<template>
  <div v-if="reservation" class="flex flex-col gap-4">
    <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
      <div class="grid gap-2 sm:grid-cols-2">
        <ExchangeReservationDetailRow
          v-for="row in headerRows"
          :key="row.key"
          :label="row.label"
          :value="row.value"
          :label-class="row.labelClass || 'text-slate-500'"
          :value-class="row.valueClass || 'font-medium'"
        />
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <ExchangeReservationProductCard
        title="المنتج الحالي"
        title-class="text-rose-300"
        :name="reservation.product?.name || reservation.productName"
        :teacher-name="reservation.product?.teacherName || reservation.teacherName"
        :rows="currentProductRows"
      />

      <ExchangeReservationProductCard
        title="المنتج الجديد"
        :title-class="
          selectedNewProduct ? 'text-emerald-300' : 'text-slate-400'
        "
        :card-class="
          selectedNewProduct
            ? 'border-white/10 bg-slate-900 text-slate-200'
            : 'border-dashed border-slate-600 bg-slate-900/70 text-slate-300'
        "
        :has-product="Boolean(selectedNewProduct)"
        :name="selectedNewProduct?.name"
        :teacher-name="selectedNewProduct?.teacherName"
        :rows="newProductRows"
        empty-message="اختر المنتج البديل من قائمة منتجات الفرع المتاحة للحجز"
      />
    </div>

    <div
      v-if="priceComparison?.kind === 'less'"
      class="rounded-xl border px-4 py-3 text-sm"
      :class="priceComparison.boxClass"
    >
      <p class="font-semibold" :class="priceComparison.titleClass">
        {{ priceComparison.title }}
      </p>
      <div class="mt-2 grid gap-1 text-slate-300">
        <ExchangeReservationDetailRow
          v-for="row in comparisonRows"
          :key="row.key"
          :label="row.label"
          :value="row.value"
          :bordered="row.bordered"
          :label-class="row.labelClass || 'text-slate-300'"
          :value-class="row.valueClass"
        />
      </div>
    </div>

    <div class="flex flex-col gap-2 text-right">
      <ProductSelect
        :model-value="newProductId"
        source="inventory"
        :branch-id="reservation.branchId"
        :inventory-query="{ forReservation: true }"
        :exclude-product-id="reservation.product?.id || reservation.productId"
        label="المنتج الجديد"
        placeholder="اختر المنتج البديل من نفس الفرع"
        :invalid="!!exchangeError"
        :hint="
          !reservation.branchId
            ? 'لا يمكن تحميل منتجات الفرع لأن الفرع غير معروف لهذا الحجز.'
            : ''
        "
        @update:model-value="$emit('update:newProductId', $event)"
        @loaded="$emit('products-loaded', $event)"
        @loading="$emit('products-loading', $event)"
      />
      <p v-if="exchangeError" class="text-xs text-red-500">{{ exchangeError }}</p>
      <p v-if="exchangePaymentError" class="text-xs text-red-500">
        {{ exchangePaymentError }}
      </p>
    </div>

    <PaymentFields
      v-if="priceComparison?.kind === 'less'"
      :method="exchangeRefundMethod"
      :image="exchangeImage"
      :image-data-url="exchangeProofKey"
      method-label="طريقة رد فرق السعر"
      image-label="صورة إثبات الاسترداد (اختياري)"
      show-image-when="non-cash"
      require-image-when="never"
      :method-invalid="!!exchangePaymentError"
      :method-error="exchangePaymentError"
      @update:method="$emit('update:exchangeRefundMethod', $event)"
      @update:image="$emit('update:exchangeImage', $event)"
      @update:image-data-url="$emit('update:exchangeProofKey', $event)"
    />
  </div>
</template>

<script setup>
import PaymentFields from "~/components/shared/payment-fields/index.vue";
import ProductSelect from "~/components/shared/product-select/index.vue";
import { PaymentMethod } from "~/utils/paymentMethods";
import { formatMoney } from "~/utils/format";

defineOptions({ name: "ExchangeReservationDetailContent" });

const ExchangeReservationDetailRow = defineAsyncComponent(() =>
  import("./partials/ExchangeReservationDetailRow.vue"),
);
const ExchangeReservationProductCard = defineAsyncComponent(() =>
  import("./partials/ExchangeReservationProductCard.vue"),
);

const props = defineProps({
  reservation: { type: Object, default: null },
  newProductId: { type: [String, Number], default: null },
  selectedNewProduct: { type: Object, default: null },
  priceComparison: { type: Object, default: null },
  exchangeError: { type: String, default: "" },
  exchangePaymentError: { type: String, default: "" },
  exchangeRefundMethod: { type: String, default: PaymentMethod.CASH },
  exchangeImage: { type: [Object, File], default: null },
  exchangeProofKey: { type: String, default: "" },
});

defineEmits([
  "update:newProductId",
  "update:exchangeRefundMethod",
  "update:exchangeImage",
  "update:exchangeProofKey",
  "products-loaded",
  "products-loading",
]);

const headerRows = computed(() => {
  const r = props.reservation;
  if (!r) return [];
  return [
    {
      key: "number",
      label: "رقم الحجز",
      value: r.reservationNumber,
      valueClass: "font-semibold text-slate-900",
    },
    { key: "student", label: "الطالب", value: r.student?.name || r.studentName },
    { key: "branch", label: "الفرع", value: r.branch?.name || r.branchName },
    { key: "status", label: "الحالة", value: r.statusLabel },
  ];
});

const currentProductRows = computed(() => {
  const r = props.reservation;
  if (!r) return [];
  return [
    {
      key: "price",
      label: "السعر",
      value: r.product?.unitPriceLabel || r.sellingPriceLabel,
    },
    {
      key: "paid",
      label: "المدفوع",
      value: r.payment?.paidAmountLabel || r.paidAmountLabel,
    },
    {
      key: "remaining",
      label: "المتبقي",
      value: r.payment?.remainingAmountLabel || r.remainingAmountLabel,
    },
  ];
});

const newProductRows = computed(() => {
  const p = props.selectedNewProduct;
  if (!p) return [];
  return [
    {
      key: "availability",
      label: "التوفر",
      value: p.availabilityLabel,
      slot: "availability",
      badgeClass: p.isAvailable
        ? "bg-emerald-500/20 text-emerald-300"
        : p.reservationAllowed
          ? "bg-orange-500/20 text-orange-300"
          : "bg-amber-500/20 text-amber-300",
    },
    {
      key: "price",
      label: "السعر",
      value: `${p.priceKindLabel} ${p.priceLabel || "—"}`,
    },
  ];
});

const comparisonRows = computed(() => {
  const c = props.priceComparison;
  if (!c) return [];
  return [
    {
      key: "old",
      label: "المدفوع على الحجز",
      value: formatMoney(c.oldTotal),
      valueClass: "font-medium text-slate-100",
    },
    {
      key: "new",
      label: "سعر المنتج الجديد",
      value: formatMoney(c.newTotal),
      valueClass: "font-medium text-slate-100",
    },
    {
      key: "diff",
      label: c.diffLabel,
      value: formatMoney(Math.abs(c.difference)),
      bordered: true,
      valueClass: `font-bold ${c.diffClass}`,
    },
  ];
});
</script>
