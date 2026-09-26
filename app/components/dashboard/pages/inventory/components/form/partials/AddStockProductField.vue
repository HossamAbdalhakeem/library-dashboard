<template>
  <div class="flex flex-col gap-2 text-right">
    <AppGlobalSelectProduct
      :model-value="productId"
      source="catalog"
      variant="simple"
      name-only
      placeholder="اختار المنتج ▾"
      :disabled="disabled"
      :invalid="!!error"
      :hint="hint"
      :catalog-query="catalogQuery"
      :auto-load="canLoad"
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

const props = defineProps({
  productId: { type: [String, Number, null], default: null },
  error: { type: String, default: "" },
  studyYearId: { type: [String, Number, null], default: null },
  teacherId: { type: [String, Number, null], default: null },
  disabled: { type: Boolean, default: false },
  hint: { type: String, default: "" },
});

defineEmits(["update:productId", "select", "loaded"]);

const canLoad = computed(() => Boolean(props.studyYearId && props.teacherId));

const catalogQuery = computed(() => {
  if (!canLoad.value) return {};
  return {
    studyYearId: props.studyYearId,
    teacherId: props.teacherId,
  };
});
</script>
