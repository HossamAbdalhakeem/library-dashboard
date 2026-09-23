<template>
  <div class="flex justify-end gap-2">
    <Button
      type="button"
      label="إلغاء"
      severity="secondary"
      text
      @click="$emit('cancel')"
    />
    <FormSubmitButton
      :label="isEdit ? 'حفظ التعديل' : 'إضافة'"
      :loading="loading"
      :valid="valid"
    />
  </div>
</template>

<script setup>
import Button from "primevue/button";
import FormSubmitButton from "~/components/shared/form-submit-button/index.vue";

defineOptions({ name: "ExpenseFormActions" });

defineProps({
  isEdit: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  valid: { type: Boolean, default: false },
});

defineEmits(["cancel"]);
</script>
