<template>
  <Button
    type="submit"
    :label="hasDefaultSlot ? undefined : label"
    :loading="loading"
    :severity="severity"
    :size="size"
    :disabled="loading"
    :class="[
      buttonClass,
      { 'form-submit-button--invalid': !valid && !loading },
    ]"
  >
    <!--
      PrimeVue Button only shows its built-in spinner inside the default slot fallback.
      Passing any default slot content hides that spinner — so only forward a slot
      when the parent actually provides one, and render a spinner ourselves then.
    -->
    <template v-if="hasDefaultSlot">
      <i v-if="loading" class="pi pi-spin pi-spinner" aria-hidden="true" />
      <slot />
    </template>
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
console.log("test");
</script>

<style scoped>
.form-submit-button--invalid {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
