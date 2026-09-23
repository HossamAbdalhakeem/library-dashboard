<template>
  <div class="flex flex-col items-stretch gap-2">
    <template v-if="modifiableItems.length">
      <div
        v-for="item in modifiableItems"
        :key="item.saleItemId"
        class="flex flex-col gap-1 rounded-md border border-white/10 bg-slate-900/80 px-2 py-1.5"
      >
        <span
          class="truncate text-[11px] text-slate-300"
          :title="itemLabel(item)"
        >
          {{ itemLabel(item) }}
        </span>
        <div class="flex flex-wrap justify-center gap-1">
          <Button
            label="استبدال"
            icon="pi pi-sync"
            text
            size="small"
            severity="primary"
            @click="emitAction('exchange', item)"
          />
          <Button
            label="استرداد"
            icon="pi pi-replay"
            text
            size="small"
            severity="danger"
            @click="emitAction('refund', item)"
          />
        </div>
      </div>
    </template>
    <span v-else class="text-xs text-slate-500">—</span>
  </div>
</template>

<script setup>
import Button from "primevue/button";
import { toExchangeFlowSale } from "~/services/exchange";

defineOptions({ name: "SalesExchangeActionsCell" });

const props = defineProps({
  sale: { type: Object, required: true },
});

const emit = defineEmits(["exchange", "refund"]);

const modifiableItems = computed(() =>
  (props.sale?.items || []).filter((item) => item.canModify),
);

const itemLabel = (item) => item.product?.name || "—";

const toPayload = (item) => {
  const payload = toExchangeFlowSale(props.sale, item);
  if (!payload?.saleId || !payload?.saleItemId) return null;
  return payload;
};

const emitAction = (type, item) => {
  const payload = toPayload(item);
  if (!payload) return;
  emit(type, payload);
};
</script>
