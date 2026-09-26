<template>
  <div class="flex flex-col gap-2 text-right" :class="wrapperClass">
    <label v-if="label" class="text-sm font-medium" :class="labelClass">
      {{ label }}
    </label>

    <VueTelInput
      :model-value="modelValue || ''"
      :default-country="defaultCountry"
      :preferred-countries="preferredCountries"
      :mode="mode"
      :disabled="disabled"
      :auto-format="autoFormat"
      :valid-characters-only="validCharactersOnly"
      :input-options="resolvedInputOptions"
      :dropdown-options="resolvedDropdownOptions"
      :class="[
        'phone-input w-full',
        invalid ? 'phone-input--invalid' : '',
        inputClass,
      ]"
      dir="ltr"
      @update:model-value="onUpdate"
      @validate="onValidate"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
  </div>
</template>

<script setup>
import { VueTelInput } from "vue-tel-input";
import "vue-tel-input/vue-tel-input.css";

defineOptions({ name: "AppPhoneInput" });

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "" },
  labelClass: { type: String, default: "text-slate-700" },
  wrapperClass: { type: String, default: "" },
  inputClass: { type: String, default: "" },
  placeholder: { type: String, default: "رقم الهاتف" },
  disabled: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  /** ISO country code, e.g. EG */
  defaultCountry: { type: String, default: "EG" },
  preferredCountries: {
    type: Array,
    default: () => ["EG", "SA", "AE", "KW", "QA"],
  },
  /** international | national | auto */
  mode: {
    type: String,
    default: "international",
    validator: (value) => ["international", "national", "auto", ""].includes(value),
  },
  autoFormat: { type: Boolean, default: true },
  validCharactersOnly: { type: Boolean, default: true },
  inputOptions: { type: Object, default: () => ({}) },
  dropdownOptions: { type: Object, default: () => ({}) },
});

const emit = defineEmits([
  "update:modelValue",
  "validate",
  "blur",
  "focus",
  "change",
]);

const resolvedInputOptions = computed(() => ({
  placeholder: props.placeholder,
  autocomplete: "tel",
  styleClasses: "phone-input__field",
  ...props.inputOptions,
}));

const resolvedDropdownOptions = computed(() => ({
  showDialCodeInSelection: true,
  showFlags: true,
  showSearchBox: true,
  searchBoxPlaceholder: "بحث",
  ...props.dropdownOptions,
}));

const onUpdate = (value) => {
  const next = value || "";
  emit("update:modelValue", next);
  emit("change", next);
};

const onValidate = (payload) => {
  emit("validate", payload);
};
</script>

<style scoped>
.phone-input {
  direction: ltr;
  width: 100%;
  border: 1px solid var(--app-border-strong);
  border-radius: 0.375rem;
  background: var(--app-surface);
  overflow: visible;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.phone-input :deep(.vti__dropdown) {
  background: var(--app-surface);
  border-inline-end: 1px solid var(--app-border-strong);
  border-radius: 0.375rem 0 0 0.375rem;
  padding-inline: 0.5rem;
  color: var(--app-text-strong);
}

.phone-input :deep(.vti__dropdown:hover),
.phone-input :deep(.vti__dropdown.open) {
  background: var(--app-card);
}

.phone-input :deep(.vti__selection),
.phone-input :deep(.vti__country-code),
.phone-input :deep(.vti__dropdown-arrow) {
  color: var(--app-text-strong);
}

.phone-input :deep(.vti__dropdown-list) {
  z-index: 40;
  max-height: 16rem;
  text-align: left;
  background: var(--app-surface);
  border: 1px solid var(--app-border-strong);
  color: var(--app-text-strong);
}

.phone-input :deep(.vti__dropdown-item) {
  color: var(--app-text);
}

.phone-input :deep(.vti__dropdown-item:hover),
.phone-input :deep(.vti__dropdown-item.highlighted) {
  background: var(--app-elevated);
}

.phone-input :deep(.vti__search_box) {
  background: var(--app-card) !important;
  border: 1px solid var(--app-border-strong) !important;
  color: var(--app-text-strong) !important;
}

.phone-input :deep(.vti__input),
.phone-input :deep(.phone-input__field) {
  width: 100%;
  border: 0 !important;
  border-radius: 0 0.375rem 0.375rem 0 !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  color: var(--app-text-strong) !important;
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding: 0.625rem 0.75rem !important;
}

.phone-input :deep(.vti__input::placeholder),
.phone-input :deep(.phone-input__field::placeholder) {
  color: var(--app-muted) !important;
}

.phone-input:focus-within {
  border-color: #f5af52;
  box-shadow: 0 0 0 1px #f5af52;
}

.phone-input--invalid {
  border-color: #f87171;
}

.phone-input--invalid:focus-within {
  border-color: #ef4444;
  box-shadow: 0 0 0 1px #ef4444;
}
</style>
