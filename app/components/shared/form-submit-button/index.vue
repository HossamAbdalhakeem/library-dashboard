<template>
  <Button
    type="submit"
    :label="hasDefaultSlot ? undefined : label"
    :loading="loading"
    :severity="severity"
    :size="size"
    :disabled="loading"
    :class="[buttonClass, { 'form-submit-button--invalid': !valid && !loading }]"
  >
    <slot>{{ label }}</slot>
  </Button>
</template>

<script setup>
import Button from "primevue/button";

defineProps({
  label: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  valid: { type: Boolean, default: true },
  severity: { type: String, default: "primary" },
  size: { type: String, default: undefined },
  buttonClass: { type: String, default: "" },
});

const slots = useSlots();
const hasDefaultSlot = computed(() => Boolean(slots.default));
</script>

<style scoped>
.form-submit-button--invalid {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
