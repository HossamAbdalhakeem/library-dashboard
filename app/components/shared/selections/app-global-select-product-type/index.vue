<template>
  <div class="flex flex-col gap-2 text-right" :class="wrapperClass">
    <label v-if="label" class="text-sm font-medium" :class="labelClass">{{ label }}</label>

    <Select
      :model-value="modelValue"
      :options="resolvedOptions"
      option-label="label"
      option-value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :show-clear="showClear"
      :invalid="invalid"
      class="w-full"
      :class="[selectClass, { 'p-invalid': invalid }]"
      @update:model-value="onUpdate"
    />

    <small v-if="hint" class="text-xs text-slate-400">{{ hint }}</small>
  </div>
</template>

<script setup>
import Select from "primevue/select";
import { PRODUCT_TYPE_OPTIONS } from "~/enums/productType";

defineOptions({ name: "AppGlobalSelectProductType" });

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  /** Override options; defaults to global product type options */
  options: { type: Array, default: null },
  label: { type: String, default: "النوع" },
  labelClass: { type: String, default: "text-slate-700" },
  wrapperClass: { type: String, default: "" },
  selectClass: { type: String, default: "" },
  placeholder: { type: String, default: "اختر النوع" },
  hint: { type: String, default: "" },
  invalid: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  showClear: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "change"]);

const resolvedOptions = computed(() =>
  Array.isArray(props.options) ? props.options : [...PRODUCT_TYPE_OPTIONS],
);

const onUpdate = (value) => {
  emit("update:modelValue", value ?? null);
  emit("change", value ?? null);
};
</script>
