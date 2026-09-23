<template>
  <Field
    v-slot="{ errorMessage }"
    :model-value="expenseDate"
    name="expenseDate"
    label="تاريخ المصروف"
    rules="required"
    @update:model-value="$emit('update:expenseDate', $event)"
  >
    <div class="flex flex-col gap-2 text-right">
      <label class="text-sm font-medium text-slate-700">تاريخ المصروف</label>
      <DatePicker
        :model-value="expenseDate"
        dateFormat="yy-mm-dd"
        showIcon
        class="w-full"
        :class="{ 'p-invalid': errorMessage || fieldErrors?.expenseDate }"
        @update:model-value="$emit('update:expenseDate', $event)"
      />
      <ErrorMessage name="expenseDate" class="text-xs text-red-500" />
    </div>
  </Field>
</template>

<script setup>
import DatePicker from "primevue/datepicker";
import { Field, ErrorMessage } from "vee-validate";

defineOptions({ name: "ExpenseDateField" });

defineProps({
  expenseDate: { type: [Date, String, null], default: null },
  fieldErrors: { type: Object, default: () => ({}) },
});

defineEmits(["update:expenseDate"]);
</script>
