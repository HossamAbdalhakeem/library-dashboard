<template>
  <div v-if="sale" class="flex flex-col gap-4">
    <div
      class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
    >
      <AppDetailRows :items="summaryRows" :columns="2" />
    </div>

    <div class="flex flex-col gap-2 text-right">
      <div class="flex items-center justify-between gap-2">
        <label class="text-sm font-medium text-slate-700">
          كمية الاستبدال
        </label>
        <span class="text-xs text-slate-500">
          من 1 إلى {{ maxQuantity }}
        </span>
      </div>
      <AppInputNumber
        :model-value="exchangeQuantity"
        :min="1"
        :max="maxQuantity"
        :max-fraction-digits="0"
        :invalid="!!quantityError"
        @update:model-value="$emit('update:exchangeQuantity', $event)"
      />
      <p v-if="quantityError" class="text-xs text-red-500">{{ quantityError }}</p>
      <p v-else class="text-xs text-slate-500">
        سيتم استبدال {{ exchangeQuantity || 0 }} من المنتج الحالي بنفس الكمية من المنتج الجديد
      </p>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <div class="rounded-xl border border-white/10 bg-slate-900 p-4 text-sm text-slate-200">
        <p class="mb-3 text-xs font-semibold text-rose-300">المنتج الحالي</p>
        <p class="text-base font-bold text-white">
          {{ sale.product?.name || "—" }}
        </p>
        <p class="mt-1 text-xs text-slate-400">
          أ/ {{ sale.product?.teacher?.name || "—" }}
        </p>
        <AppDetailRows
          class="mt-3"
          :items="currentProductRows"
          label-class="text-slate-400"
          value-class="font-semibold text-slate-100"
        />
      </div>

      <div
        class="rounded-xl border p-4 text-sm"
        :class="
          selectedNewProduct
            ? 'border-white/10 bg-slate-900 text-slate-200'
            : 'border-dashed border-slate-600 bg-slate-900/70 text-slate-300'
        "
      >
        <p
          class="mb-3 text-xs font-semibold"
          :class="selectedNewProduct ? 'text-emerald-300' : 'text-slate-400'"
        >
          المنتج الجديد
        </p>
        <template v-if="selectedNewProduct">
          <p class="text-base font-bold text-white">
            {{ selectedNewProduct.name }}
          </p>
          <p class="mt-1 text-xs text-slate-400">
            أ/ {{ selectedNewProduct.teacher?.name || "—" }}
          </p>
          <AppDetailRows
            class="mt-3"
            :items="newProductRows"
            label-class="text-slate-400"
            value-class="font-semibold text-slate-100"
          >
            <template #availability="{ item }">
              <span
                class="rounded-full px-2 py-0.5 text-xs font-semibold"
                :class="
                  item.meta?.isAvailable
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : item.meta?.reservationAllowed
                      ? 'bg-orange-500/20 text-orange-300'
                      : 'bg-amber-500/20 text-amber-300'
                "
              >
                {{ item.value }}
              </span>
            </template>
          </AppDetailRows>
        </template>
        <p v-else class="text-sm text-slate-400">
          {{ previewLoading ? "جاري حساب فرق السعر..." : "اختر منتجًا متاحًا من نفس الفرع" }}
        </p>
      </div>
    </div>

    <div
      v-if="priceComparison"
      class="rounded-xl border px-4 py-3 text-sm"
      :class="priceComparison.boxClass"
    >
      <p class="font-semibold" :class="priceComparison.titleClass">
        {{ priceComparison.title }}
      </p>
      <AppDetailRows
        class="mt-2"
        :items="priceComparisonRows"
        label-class="text-slate-300"
        value-class="font-medium text-slate-100"
      />
    </div>

    <div class="flex flex-col gap-2 text-right">
      <AppGlobalSelectProduct
        :model-value="newProductId"
        source="inventory"
        :branch-id="sale.branch?.id"
        :exclude-product-id="sale.product?.id"
        :min-available-quantity="Number(exchangeQuantity || 1)"
        label="المنتج الجديد"
        placeholder="اختر المنتج البديل من نفس الفرع"
        :invalid="!!exchangeError"
        @update:model-value="$emit('update:newProductId', $event)"
      />
      <p v-if="exchangeError" class="text-xs text-red-500">{{ exchangeError }}</p>
    </div>

    <PaymentFields
      v-if="priceComparison?.kind === 'more'"
      :method="exchangePaymentMethod"
      :image="exchangeImage"
      :image-data-url="exchangeProofKey"
      method-label="طريقة تحصيل فرق السعر"
      :method-invalid="!!exchangePaymentError"
      :method-error="exchangePaymentError"
      @update:method="$emit('update:exchangePaymentMethod', $event)"
      @update:image="$emit('update:exchangeImage', $event)"
      @update:image-data-url="$emit('update:exchangeProofKey', $event)"
    />

    <PaymentFields
      v-else-if="priceComparison?.kind === 'less'"
      :method="exchangeRefundMethod"
      :image="exchangeImage"
      :image-data-url="exchangeProofKey"
      method-label="طريقة رد فرق السعر"
      :method-invalid="!!exchangePaymentError"
      :method-error="exchangePaymentError"
      @update:method="$emit('update:exchangeRefundMethod', $event)"
      @update:image="$emit('update:exchangeImage', $event)"
      @update:image-data-url="$emit('update:exchangeProofKey', $event)"
    />
  </div>
</template>

<script setup>
import AppInputNumber from "~/components/shared/inputs/app-input-number/index.vue";
import AppDetailRows from "~/components/shared/app-detail-rows/index.vue";
import PaymentFields from "~/components/shared/payment/payment-fields/index.vue";
import AppGlobalSelectProduct from "~/components/shared/selections/app-global-select-product/index.vue";
import { PaymentMethod } from "~/enums/paymentMethod";
import { formatMoney } from "~/utils/format/money";

const props = defineProps({
  sale: { type: Object, default: null },
  exchangeQuantity: { type: Number, default: 1 },
  quantityError: { type: String, default: "" },
  newProductId: { type: [String, Number], default: null },
  selectedNewProduct: { type: Object, default: null },
  priceComparison: { type: Object, default: null },
  previewLoading: { type: Boolean, default: false },
  exchangeError: { type: String, default: "" },
  exchangePaymentError: { type: String, default: "" },
  exchangePaymentMethod: { type: String, default: PaymentMethod.CASH },
  exchangeRefundMethod: { type: String, default: PaymentMethod.CASH },
  exchangeImage: { type: [Object, File], default: null },
  exchangeProofKey: { type: String, default: "" },
});

defineEmits([
  "update:exchangeQuantity",
  "update:newProductId",
  "update:exchangePaymentMethod",
  "update:exchangeRefundMethod",
  "update:exchangeImage",
  "update:exchangeProofKey",
]);

const maxQuantity = computed(() =>
  Math.max(1, Number(props.sale?.quantity?.remaining ?? 1)),
);

const summaryRows = computed(() => {
  const sale = props.sale || {};
  return [
    {
      key: "saleNumber",
      label: "رقم العملية",
      value: sale.saleNumber,
      valueClass: "font-semibold text-slate-900",
    },
    { key: "student", label: "الطالب", value: sale.student?.name },
    { key: "branch", label: "الفرع", value: sale.branch?.name },
    {
      key: "maxQuantity",
      label: "الكمية المتاحة للاستبدال",
      value: maxQuantity.value,
    },
  ];
});

const currentProductRows = computed(() => [
  {
    key: "unitPrice",
    label: "سعر الوحدة",
    value: props.sale?.product?.unitPriceLabel,
  },
  {
    key: "qty",
    label: "كمية الاستبدال",
    value: props.exchangeQuantity || 0,
    valueClass: "font-semibold text-rose-300",
  },
]);

const newProductRows = computed(() => {
  const product = props.selectedNewProduct;
  if (!product) return [];
  return [
    {
      key: "availability",
      label: "التوفر",
      value: product.availabilityLabel,
      slot: "availability",
      meta: {
        isAvailable: product.isAvailable,
        reservationAllowed: product.reservationAllowed,
      },
    },
    {
      key: "unitPrice",
      label: "سعر الوحدة",
      value: formatMoney(product.unitPrice),
    },
    {
      key: "qty",
      label: "كمية الاستبدال",
      value: props.exchangeQuantity || 0,
      valueClass: "font-semibold text-emerald-300",
    },
  ];
});

const priceComparisonRows = computed(() => {
  const comparison = props.priceComparison;
  if (!comparison) return [];
  const qty = props.exchangeQuantity || 0;
  return [
    {
      key: "oldTotal",
      label: `إجمالي المنتج الحالي (×${qty})`,
      value: formatMoney(comparison.oldTotal),
    },
    {
      key: "newTotal",
      label: `إجمالي المنتج الجديد (×${qty})`,
      value: formatMoney(comparison.newTotal),
    },
    {
      key: "diff",
      label: comparison.diffLabel,
      value: formatMoney(Math.abs(comparison.difference)),
      rowClass: "border-t border-white/10 pt-1",
      valueClass: `font-bold ${comparison.diffClass || ""}`.trim(),
    },
  ];
});
</script>
