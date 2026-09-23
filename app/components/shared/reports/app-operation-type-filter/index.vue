<template>
  <div class="w-full sm:w-72" :class="wrapperClass">
    <label class="mb-1 block text-xs text-slate-400">{{ label }}</label>
    <Select
      :model-value="modelValue"
      :options="resolvedOptions"
      option-label="label"
      option-value="value"
      :placeholder="placeholder"
      show-clear
      class="w-full"
      :disabled="disabled"
      @update:model-value="onUpdate"
    />
  </div>
</template>

<script setup>
import Select from "primevue/select";

defineOptions({ name: "AppOperationTypeFilter" });

const props = defineProps({
  modelValue: { type: String, default: null },
  /** Map of type code → Arabic label */
  labels: { type: Object, default: () => ({}) },
  /** Optional prebuilt [{ value, label }] — overrides labels when set */
  options: { type: Array, default: null },
  label: { type: String, default: "نوع العملية" },
  placeholder: { type: String, default: "كل الأنواع" },
  disabled: { type: Boolean, default: false },
  wrapperClass: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "change"]);

const resolvedOptions = computed(() => {
  if (Array.isArray(props.options) && props.options.length) {
    return props.options;
  }
  return Object.entries(props.labels || {}).map(([value, label]) => ({
    value,
    label,
  }));
});

const onUpdate = (value) => {
  const next = value || null;
  emit("update:modelValue", next);
  emit("change", next);
};
</script>
