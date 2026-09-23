<template>
  <div class="flex justify-end gap-2">
    <Button
      v-if="showCancel"
      type="button"
      label="إلغاء"
      severity="secondary"
      text
      @click="$emit('cancel')"
    />
    <FormSubmitButton
      label="تسليم المنتجات للفرع"
      :loading="loading"
      :valid="valid"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";

defineOptions({ name: "AddStockActions" });

defineProps({
  showCancel: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
  valid: { type: Boolean, default: false },
});

defineEmits(["cancel"]);
</script>
