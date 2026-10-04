<template>
  <InputNumber
    :model-value="modelValue"
    :mode="mode"
    :currency="currency"
    :min="min"
    :max="max"
    :min-fraction-digits="minFractionDigits"
    :max-fraction-digits="maxFractionDigits"
    :use-grouping="useGrouping"
    :disabled="disabled"
    :invalid="invalid"
    :placeholder="placeholder"
    locale="en-US"
    class="w-full"
    input-class="w-full"
    fluid
    dir="rtl"
    @update:model-value="emitValue"
    @input="onInput"
  />
</template>

<script setup>
import InputNumber from "primevue/inputnumber";

defineProps({
  modelValue: { default: null },
  mode: { type: String, default: "decimal" },
  currency: { type: String, default: "EGP" },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
  minFractionDigits: { type: Number, default: 0 },
  maxFractionDigits: { type: Number, default: 2 },
  useGrouping: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  placeholder: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const emitValue = (value) => {
  emit("update:modelValue", value ?? null);
};

const onInput = (event) => {
  emitValue(event?.value ?? null);
};
</script>
