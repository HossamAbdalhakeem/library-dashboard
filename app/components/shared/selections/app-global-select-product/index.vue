<template>
  <div class="flex flex-col gap-2 text-right" :class="wrapperClass" data-testid="select-product">
    <label v-if="label" class="text-sm font-medium" :class="labelClass">{{ label }}</label>

    <Select
      :model-value="modelValue"
      :options="resolvedOptions"
      :option-label="optionLabelKey"
      option-value="value"
      :placeholder="placeholder"
      filter
      :filter-fields="activeFilterFields"
      :loading="isLoading"
      :disabled="disabled || !canSelect"
      :show-clear="showClear"
      :invalid="invalid"
      class="w-full product-select"
      :class="{ 'p-invalid': invalid }"
      data-testid="select-product-trigger"
      @filter="onFilter"
      @update:model-value="onUpdate"
    >
      <template v-if="variant === 'rich'" #value="{ placeholder: valuePlaceholder }">
        <ProductSelectRichValue
          :option="selectedOption"
          :placeholder="valuePlaceholder"
        />
      </template>

      <template v-if="variant === 'rich'" #option="{ option }">
        <ProductSelectRichOption :option="option" />
      </template>
    </Select>

    <small v-if="hint" class="text-xs text-slate-400">{{ hint }}</small>
  </div>
</template>

<script setup>
import Select from "primevue/select";
import ProductSelectRichValue from "./partials/ProductSelectRichValue.vue";
import ProductSelectRichOption from "./partials/ProductSelectRichOption.vue";
import { useProductSelect } from "./composables/useProductSelect";

defineOptions({ name: "AppGlobalSelectProduct" });

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  options: { type: Array, default: null },
  label: { type: String, default: "المنتج" },
  placeholder: { type: String, default: "اختر المنتج" },
  hint: { type: String, default: "" },
  invalid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  showClear: { type: Boolean, default: false },
  variant: {
    type: String,
    default: "rich",
    validator: (value) => ["rich", "simple"].includes(value),
  },
  /** When true, dropdown shows product name only (no price / availability in label). */
  nameOnly: { type: Boolean, default: false },
  source: {
    type: String,
    default: "options",
    validator: (value) => ["options", "inventory", "catalog"].includes(value),
  },
  branchId: { type: [String, Number], default: null },
  inventoryQuery: { type: Object, default: () => ({}) },
  catalogQuery: { type: Object, default: () => ({}) },
  excludeProductId: { type: [String, Number], default: null },
  minAvailableQuantity: { type: Number, default: 0 },
  reservationOnly: { type: Boolean, default: false },
  autoLoad: { type: Boolean, default: true },
  filterFields: {
    type: Array,
    default: () => ["name", "teacherName", "label"],
  },
  throttleMs: { type: Number, default: 400 },
  perPage: { type: Number, default: 20 },
  wrapperClass: { type: String, default: "" },
  labelClass: { type: String, default: "text-slate-700" },
});

const emit = defineEmits([
  "update:modelValue",
  "select",
  "change",
  "loaded",
  "loading",
  "search",
]);

const {
  isLoading,
  optionLabelKey,
  canSelect,
  activeFilterFields,
  resolvedOptions,
  selectedOption,
  onUpdate,
  onFilter,
  reload,
  searchTerm,
} = useProductSelect(props, emit);

defineExpose({
  reload,
  selectedOption,
  options: resolvedOptions,
  searchTerm,
});
</script>
