<template>
  <Field
    v-slot="{ errorMessage }"
    :model-value="categoryId"
    name="categoryId"
    label="التصنيف"
    rules="required"
    @update:model-value="$emit('update:categoryId', $event)"
  >
    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">التصنيف</label>
      <div class="flex gap-2">
        <Select
          :model-value="categoryId"
          :options="categoryOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="اختر التصنيف"
          filter
          class="flex-1"
          :class="{ 'p-invalid': errorMessage || fieldErrors?.categoryId }"
          @update:model-value="$emit('update:categoryId', $event)"
        />
        <Button
          type="button"
          icon="pi pi-plus"
          severity="primary"
          outlined
          aria-label="إضافة تصنيف"
          @click="$emit('add-category')"
        />
      </div>
      <ErrorMessage name="categoryId" class="text-xs text-red-500" />
    </div>
  </Field>
</template>

<script setup>
import Button from "primevue/button";
import Select from "primevue/select";
import { Field, ErrorMessage } from "vee-validate";

defineOptions({ name: "ExpenseCategoryField" });

defineProps({
  categoryId: { type: [String, Number, null], default: null },
  categoryOptions: { type: Array, default: () => [] },
  fieldErrors: { type: Object, default: () => ({}) },
});

defineEmits(["update:categoryId", "add-category"]);
</script>
