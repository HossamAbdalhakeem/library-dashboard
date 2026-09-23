<template>
  <div class="flex max-w-[420px] flex-col gap-2">
    <div
      v-if="unavailableMessages.length"
      class="flex items-center justify-between gap-2 rounded-lg bg-slate-950/50 px-2 py-1.5"
    >
      <div class="flex min-w-0 flex-col gap-1">
        <span
          v-for="(message, index) in unavailableMessages"
          :key="`${product.id}-msg-${index}`"
          class="text-xs font-medium"
          :class="message.tone"
        >
          {{ message.text }}
        </span>
      </div>
      <Button
        v-if="product.reservationAllowed && !hasBranches"
        label="حجز"
        size="small"
        severity="help"
        @click.stop="$emit('select', null)"
      />
    </div>

    <div
      v-for="branch in product.branches"
      :key="branch.id"
      class="flex items-center justify-between gap-2 rounded-lg bg-slate-950/50 px-2 py-1.5"
    >
      <div class="min-w-0 flex flex-col">
        <span class="truncate text-sm text-slate-100">{{ branch.name }}</span>
        <span
          class="text-xs font-semibold"
          :class="
            branch.availableQuantity > 0 ? 'text-emerald-300' : 'text-amber-300'
          "
        >
          المتاح: {{ branch.availableQuantity }}
        </span>
      </div>
      <Button
        v-if="product.reservationAllowed"
        label="حجز"
        size="small"
        severity="primary"
        @click.stop="$emit('select', branch)"
      />
    </div>
  </div>
</template>

<script setup>
import Button from "primevue/button";

defineOptions({ name: "BookSearchBranchesCell" });

const props = defineProps({
  product: { type: Object, required: true },
});

defineEmits(["select"]);

const hasBranches = computed(
  () =>
    Array.isArray(props.product?.branches) && props.product.branches.length > 0,
);

const unavailableMessages = computed(() => {
  const messages = [];
  const product = props.product;

  if (!hasBranches.value) {
    messages.push({
      text: "غير متاح في أي فرع",
      tone: "text-amber-300",
    });
  }

  if (!product?.reservationAllowed) {
    messages.push({
      text: "غير مسموح بالحجز",
      tone: "text-rose-300",
    });
  } else if (!hasBranches.value) {
    messages.push({
      text: "متاح للحجز",
      tone: "text-orange-300",
    });
  }

  return messages;
});
</script>
