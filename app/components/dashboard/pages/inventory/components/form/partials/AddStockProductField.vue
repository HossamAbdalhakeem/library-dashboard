<template>
  <div class="flex flex-col gap-2 text-right">
    <AppGlobalSelectProduct
      :model-value="productId"
      source="catalog"
      variant="simple"
      placeholder="اختار المنتج ▾"
      :invalid="!!error"
      @update:model-value="$emit('update:productId', $event)"
      @select="$emit('select', $event)"
      @loaded="$emit('loaded', $event)"
    />
    <small v-if="error" class="text-xs text-red-500">{{ error }}</small>
  </div>
</template>

<script setup>
import AppGlobalSelectProduct from "~/components/shared/selections/app-global-select-product/index.vue";

defineOptions({ name: "AddStockProductField" });

defineProps({
  productId: { type: [String, Number, null], default: null },
  error: { type: String, default: "" },
});

defineEmits(["update:productId", "select", "loaded"]);
</script>
