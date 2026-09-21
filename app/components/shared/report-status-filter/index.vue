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

defineOptions({ name: "ReportStatusFilter" });

const props = defineProps({
  modelValue: { type: String, default: null },
  /** Required: [{ value, label }] */
  options: { type: Array, default: () => [] },
  label: { type: String, default: "الحالة" },
  placeholder: { type: String, default: "كل الحالات" },
  disabled: { type: Boolean, default: false },
  wrapperClass: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue", "change"]);

const resolvedOptions = computed(() =>
  Array.isArray(props.options) ? props.options : [],
);

const onUpdate = (value) => {
  const next = value || null;
  emit("update:modelValue", next);
  emit("change", next);
};
</script>
