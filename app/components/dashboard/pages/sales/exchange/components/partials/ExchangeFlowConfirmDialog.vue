<template>
  <Dialog
    :visible="visible"
    modal
    dir="rtl"
    header="تأكيد استبدال المنتج"
    :closable="!busy"
    :dismissable-mask="!busy"
    :close-on-escape="!busy"
    :style="{ width: '520px', maxWidth: '95vw' }"
    :pt="{ header: { class: 'text-right' }, content: { class: 'text-right' } }"
    @update:visible="emit('update:visible', $event)"
  >
    <ExchangeConfirmContent
      v-if="visible"
      :sale="sale"
      :selected-new-product="selectedNewProduct"
      :price-comparison="priceComparison"
      :exchange-quantity="exchangeQuantity"
    />

    <template #footer>
      <div class="flex w-full justify-start gap-2">
        <Button
          label="نعم، تأكيد الاستبدال"
          data-testid="sale-exchange-yes"
          severity="primary"
          :loading="busy"
          :disabled="busy"
          @click="emit('confirm')"
        />
        <Button
          label="رجوع"
          text
          severity="secondary"
          :disabled="busy"
          @click="emit('update:visible', false)"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup>
import Button from "primevue/button";
import Dialog from "primevue/dialog";

const ExchangeConfirmContent = defineAsyncComponent(() =>
  import(
    "~/components/dashboard/pages/sales/exchange/components/manage/ExchangeConfirmContent.vue"
  ),
);

defineOptions({ name: "ExchangeFlowConfirmDialog" });

defineProps({
  visible: { type: Boolean, default: false },
  busy: { type: Boolean, default: false },
  sale: { type: Object, default: null },
  selectedNewProduct: { type: Object, default: null },
  priceComparison: { type: Object, default: null },
  exchangeQuantity: { type: [Number, String], default: 1 },
});

const emit = defineEmits(["update:visible", "confirm"]);
</script>
