<template>
  <div class="flex flex-col gap-2 text-right" :class="wrapperClass">
    <label v-if="label" class="text-sm font-medium" :class="labelClass">{{ label }}</label>

    <IconField
      icon-position="right"
      :class="[
        'search-input-field',
        variant === 'dark' ? 'search-input-field--dark' : 'search-input-field--default',
      ]"
    >
      <InputIcon :class="['pi pi-search search-input-icon', iconClass]" />
      <InputText
        :model-value="inputValue"
        class="w-full search-input-text"
        :class="[variant === 'dark' ? 'search-input-text--dark' : '', inputClass]"
        :placeholder="placeholder"
        @update:model-value="onInput"
      />
    </IconField>
  </div>
</template>

<script setup>
import InputText from "primevue/inputtext";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { useDebouncedCallback } from "~/composables/useDebouncedCallback";

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "بحث" },
  placeholder: { type: String, default: "" },
  throttleMs: { type: Number, default: 400 },
  variant: {
    type: String,
    default: "default",
    validator: (value) => ["default", "dark"].includes(value),
  },
  wrapperClass: { type: String, default: "" },
  inputClass: { type: String, default: "" },
  iconClass: { type: String, default: "" },
  labelClass: { type: String, default: "text-slate-700" },
});

const emit = defineEmits(["update:modelValue", "search"]);

const inputValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (value) => {
    inputValue.value = value ?? "";
  },
);

const { run: emitSearch } = useDebouncedCallback((value) => {
  emit("search", value);
}, props.throttleMs);

const onInput = (value) => {
  const nextValue = value ?? "";
  inputValue.value = nextValue;
  emit("update:modelValue", nextValue);
  emitSearch(nextValue);
};
</script>

<style scoped>
.search-input-field :deep(.search-input-icon) {
  font-size: 1.125rem;
  font-weight: 600;
  pointer-events: none;
}

.search-input-field--default :deep(.search-input-icon) {
  color: rgb(71 85 105);
}

.search-input-field--dark :deep(.search-input-icon) {
  color: rgb(148 163 184);
}

.search-input-text--dark {
  border-radius: 0.75rem;
  border: 1px solid rgb(51 65 85);
  background-color: rgb(15 23 42);
  color: rgb(241 245 249);
}

.search-input-text--dark::placeholder {
  color: rgb(148 163 184);
}
</style>
