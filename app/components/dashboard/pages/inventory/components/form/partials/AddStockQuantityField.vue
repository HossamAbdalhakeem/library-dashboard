<template>
  <div class="flex flex-col gap-2 text-right">
    <label class="text-sm font-medium text-slate-700">الكمية</label>
    <AppInputNumber
      :model-value="quantity"
      :min="1"
      :max-fraction-digits="0"
      :invalid="!!error"
      @update:model-value="$emit('update:quantity', $event)"
    />
    <small v-if="error" class="text-xs text-red-500">{{ error }}</small>
  </div>
</template>

<script setup>
import AppInputNumber from "~/components/shared/inputs/app-input-number/index.vue";

defineOptions({ name: "AddStockQuantityField" });

defineProps({
  quantity: { type: [Number, null], default: null },
  error: { type: String, default: "" },
});

defineEmits(["update:quantity"]);
</script>
